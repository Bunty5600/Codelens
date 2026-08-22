from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from api.models import user, analysis, metrics, project_files
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from api.database import get_db, Base, engine
from api.schemas.analysis_schema import AnalyzeRequest
#tables
Base.metadata.create_all(bind=engine)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from analyzer.analyzer import analyze_code
from fastapi import HTTPException
from ml.predictor import predict_defect_risk
from fastapi import UploadFile,File
import httpx
from services.analysis_service import analyze_zip
from api.models.project_files import ProjectFile
from api.models import project_files  # so SQLAlchemy registers the table
from services.smell_service import detect_smells
from services.ai_service import get_refactor_recommendations
from services.report_service import generate_pdf_report
from fastapi.responses import Response
from services.debt_service import calculate_debt_score, debt_label
from services.github_service import analyze_github_repo
from api.models.random_file import generate_filename
from api.clerk_auth import get_current_user
app = FastAPI()


ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API Working"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze/code")
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    code = data.code
    filename = data.filename or str(generate_filename(code))

    result = analyze_code(code)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    ml_prediction = predict_defect_risk({
        "cc": result.get("complexity", {}).get(
            "cyclomatic_complexity", 0
        ),

        "mi": result.get("maintainability", {}).get(
            "maintainability_index", 0
        ),

        "loc": result.get("size", {}).get(
            "loc", 0
        ),

        "halstead": result.get("halstead", {})
    })
    print(result)

    db_user = current_user
    if not db_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_analysis = analysis.Analysis(
        filename=filename,
        language="python",
        project_name= filename,
        risk_level=str(ml_prediction.get("risk_level", "Low")),
        source='paste',
        user_id=db_user.id
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    db_metrics = metrics.Metrics(
        loc=result.get("size", {}).get("loc", 0),

        cyclomatic_complexity=result.get(
            "complexity", {}
        ).get("cyclomatic_complexity", 0),

        halstead_volume=result.get(
            "halstead", {}
        ).get("volume", 0),

        halstead_effort=result.get(
            "halstead", {}
        ).get("effort", 0),

        maintainability_index=result.get(
            "maintainability", {}
        ).get("maintainability_index", 0),

        analysis_id=db_analysis.id
    )

    db.add(db_metrics)
    db.commit()


    return {
        "analysis_id": db_analysis.id,
        "metrics": {

            "cc": result.get("complexity", {}).get("cyclomatic_complexity", 0),


            "mi": result.get("maintainability", {}).get("maintainability_index", 0),

            "loc": result.get("size", {}).get("loc", 0),

            "functions": result.get("structure", {}).get("functions", 0),

            "halstead": result.get("halstead", {})
        },
        "ml_prediction": ml_prediction
    }
@app.post("/analyze/upload")
async def analyze_upload(file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    print("FILE RECEIVED:", file.filename)
    try:
        content = await file.read()

        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file has no filename")

        if file.filename.endswith(".zip"):
            project_name = file.filename.replace(".zip", "")
            result = analyze_zip(content, project_name)

            if "error" in result:
                raise HTTPException(status_code=400, detail=result["error"])

            # Save Analysis record
            db_user = current_user
            db_analysis = analysis.Analysis(
                filename=file.filename,
                language="python",
                project_name=result["project_name"],
                risk_level=result["overall_risk"],
                source='upload',
                user_id=db_user.id
            )
            db.add(db_analysis)
            db.commit()
            db.refresh(db_analysis)

            # Save per-file records
            for f in result["files"]:
                pf = ProjectFile(
                    analysis_id=db_analysis.id,
                    file_name=f["file_name"],
                    cc=f["cc"],
                    mi=f["mi"],
                    loc=f["loc"],
                    functions=f["functions"],
                    risk=f["risk"]
                )
                db.add(pf)
            db.commit()

            agg = result["aggregate"]
            ml_prediction = predict_defect_risk({
                "cc": agg["cc"],
                "mi": agg["mi"],
                "loc": agg["loc"],
                "halstead": agg["halstead"]
            })

            return {
                "analysis_id": db_analysis.id,
                "project_name": result["project_name"],
                "overall_risk": result["overall_risk"],
                "files": result["files"],
                "aggregate": agg,
                "ml_prediction": ml_prediction
            }

        # Single file fallback
        code = content.decode("utf-8", errors="ignore")
        result = analyze_code(code)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        ml_prediction = predict_defect_risk({
            "cc": result.get("complexity", {}).get("cyclomatic_complexity", 0),
            "mi": result.get("maintainability", {}).get("maintainability_index", 0),
            "loc": result.get("size", {}).get("loc", 0),
            "halstead": result.get("halstead", {})
        })
        db_user = current_user
        if db_user:
            db_analysis = analysis.Analysis(
                filename=file.filename,
                language="python",
                project_name=file.filename,
                risk_level=str(ml_prediction.get("risk_level", "Low")),
                source='upload',
                user_id=db_user.id
            )
            db.add(db_analysis)
            db.commit()
        return {
            "metrics": {
                "cc": result.get("complexity", {}).get("cyclomatic_complexity", 0),
                "mi": result.get("maintainability", {}).get("maintainability_index", 0),
                "loc": result.get("size", {}).get("loc", 0),
                "functions": result.get("structure", {}).get("functions", 0),
                "halstead": result.get("halstead", {})
            },
            "ml_prediction": ml_prediction
        }

    except HTTPException:
        raise
    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/ai-tip")
async def get_ai_tip(payload: dict):
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on the server")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/c