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
    allow_origin_regex=r"https://codelens-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {"message": "API Working"}

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
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-oss-120b",
                "messages": [{"role": "user", "content": payload.get("prompt")}],
                "temperature": 0.3,
                "max_tokens": 120
            }
        )

    body = response.json()
    if response.status_code != 200 or "choices" not in body:
        print("Groq /ai-tip error:", body)
        raise HTTPException(status_code=502, detail="AI tip generation failed")

    return body


@app.post("/analyze/smells")
def get_smells(data: AnalyzeRequest):
    from analyzer.ast_parser import parse_code
    from analyzer.complexity_metrics import get_complexity_metrics

    tree = parse_code(data.code)
    if not tree:
        raise HTTPException(status_code=400, detail="Invalid Python code")

    complexity = get_complexity_metrics(tree)
    cc = complexity.get("cyclomatic_complexity", 0)
    max_nesting = complexity.get("max_nesting_depth", 0)

    smells = detect_smells(data.code, cc, max_nesting)
    return {"smells": smells}
@app.post("/ai/refactor")
async def ai_refactor(payload: dict):
    result = await get_refactor_recommendations(
        cc=payload.get("cc", 0),
        mi=payload.get("mi", 0),
        loc=payload.get("loc", 0),
        functions=payload.get("functions", 0),
        halstead=payload.get("halstead", {}),
        smells=payload.get("smells", [])
    )
    return result
@app.post("/report/generate")
async def generate_report(payload: dict):
    pdf_bytes = generate_pdf_report(
        project_name=payload.get("project_name", "Project"),
        aggregate=payload.get("aggregate", {}),
        files=payload.get("files", []),
        smells=payload.get("smells", []),
        ai_insights=payload.get("ai_insights", {}),
        ml_prediction=payload.get("ml_prediction", {}),
        debt_score=payload.get("debt_score", None)
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=codelens_report.pdf"}
    )
@app.post("/analyze/debt")
def get_debt(payload: dict):
    score = calculate_debt_score(
        cc=payload.get("cc", 0),
        mi=payload.get("mi", 0),
        halstead_volume=payload.get("halstead_volume", 0),
        smells=payload.get("smells", []),
        loc=payload.get("loc", 0)
    )
    return {
        "technical_debt": score,
        "label": debt_label(score)
    }
@app.get("/analyze/history")
def get_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_user = current_user
    if not db_user:
        return []
    analyses = db.query(analysis.Analysis)\
        .filter(analysis.Analysis.user_id == db_user.id)\
        .order_by(analysis.Analysis.created_at.desc())\
        .limit(20)\
        .all()
    return [
        {
            "id":           a.id,
            "filename":     a.filename,
            "project_name": a.project_name,
            "risk_level":   a.risk_level,
            "created_at":   a.created_at,
            "source": a.source,
            "repo_url": a.repo_url
        }
        for a in analyses
    ]
@app.post("/analyze/github")
async def analyze_github(payload: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo_url = payload.get("repo_url", "").strip()
    if not repo_url:
        raise HTTPException(status_code=400, detail="repo_url is required")

    result = analyze_github_repo(repo_url)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Save to DB
    db_user = current_user
    db_analysis = analysis.Analysis(
        filename=result["repository"],
        language="python",
        project_name=result["repository"],
        risk_level=result["overall_risk"],
        repo_url=repo_url,
        source="github",
        analysis_data=result,
        user_id=db_user.id
    )
    db.add(db_analysis)
    db.commit()

    return result
@app.get("/analyze/result/{analysis_id}")
def get_result_by_id(analysis_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_user = current_user
    if not db_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    a = db.query(analysis.Analysis).filter(
        analysis.Analysis.id == analysis_id,
        analysis.Analysis.user_id == db_user.id
    ).first()

    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if a.source == "github" and a.analysis_data:
        return a.analysis_data

    # Fetch per-file records (for ZIP uploads)
    project_file_rows = db.query(ProjectFile).filter(
        ProjectFile.analysis_id == analysis_id
    ).all()

    # Fetch aggregate metrics
    db_metrics = db.query(metrics.Metrics).filter(
        metrics.Metrics.analysis_id == analysis_id
    ).first()

    # Build files list (ZIP) or empty (single file / paste)
    files = [
        {
            "file_name":  pf.file_name,
            "cc":         pf.cc,
            "mi":         pf.mi,
            "loc":        pf.loc,
            "functions":  pf.functions,
            "risk":       pf.risk,
            "smells":     []
        }
        for pf in project_file_rows
    ]

    # Aggregate — prefer per-file aggregation for ZIP, fallback to metrics table
    if files:
        total_cc  = sum(f["cc"]  for f in files)
        total_loc = sum(f["loc"] for f in files)
        total_fns = sum(f["functions"] for f in files)
        avg_mi    = sum(f["mi"] for f in files) / len(files)
        aggregate = {
            "cc":        total_cc,
            "mi":        round(avg_mi, 2),
            "loc":       total_loc,
            "functions": total_fns,
            "halstead":  {
                "volume": db_metrics.halstead_volume if db_metrics else 0,
                "effort": db_metrics.halstead_effort if db_metrics else 0,
            }
        }
    elif db_metrics:
        aggregate = {
            "cc":        db_metrics.cyclomatic_complexity,
            "mi":        db_metrics.maintainability_index,
            "loc":       db_metrics.loc,
            "functions": 0,
            "halstead":  {
                "volume": db_metrics.halstead_volume,
                "effort": db_metrics.halstead_effort,
            }
        }
    else:
        aggregate = {"cc": 0, "mi": 0, "loc": 0, "functions": 0, "halstead": {"volume": 0, "effort": 0}}

    # ml_prediction stub — re-run if needed
    ml_prediction = predict_defect_risk({
        "cc":       aggregate["cc"],
        "mi":       aggregate["mi"],
        "loc":      aggregate["loc"],
        "halstead": aggregate["halstead"]
    })

    # Single-file paste/upload uses "metrics" key; ZIP uses "aggregate" + "files"
    if files:
        return {
            "analysis_id":  a.id,
            "project_name": a.project_name,
            "overall_risk": a.risk_level,
            "files":        files,
            "aggregate":    aggregate,
            "ml_prediction": ml_prediction,
        }
    else:
        return {
            "analysis_id":  a.id,
            "project_name": a.project_name,
            "metrics":      aggregate,
            "ml_prediction": ml_prediction,
        }