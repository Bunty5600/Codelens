from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from api.models import user, analysis, metrics
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from api.database import get_db, Base, engine
from api.schemas.analysis_schema import AnalyzeRequest
#tables
Base.metadata.create_all(bind=engine)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from analyzer.analyzer import analyze_code
from fastapi import HTTPException
from api.auth import hash_password, verify_password, create_token
from api.schemas.analysis_schema import SignupRequest, LoginRequest
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
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
from api.auth import decode_token
from api.models.random_file import generate_filename
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    if not credentials:
        return db.query(user.User).first()
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload.get("sub"))
        return db.query(user.User).filter(user.User.id == user_id).first()
    except:
        return db.query(user.User).first()

@app.get("/")
def root():
    return {"message": "API Working"}
# ── Signup ───
@app.post("/auth/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(user.User).filter(user.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = user.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token({"sub": str(new_user.id), "email": new_user.email})
    return {"token": token, "name": new_user.name, "email": new_user.email}
# ── Login ────
@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        db_user = db.query(user.User).filter(user.User.email == data.email).first()
        print("USER FOUND:", db_user)
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        print("HASHED IN DB:", db_user.hashed_password)
        result = verify_password(data.password, db_user.hashed_password)
        print("VERIFY RESULT:", result)
        if not result:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_token({"sub": str(db_user.id), "email": db_user.email})
        return {"token": token, "name": db_user.name, "email": db_user.email}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise

@app.post("/analyze/code")
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    code = data.code
    filename = data.filename or str(generate_filename(code))

    result = analyze_code(code)
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

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/ai-tip")
async def get_ai_tip(payload: dict):
    groq_key = os.getenv("GROQ_API_KEY")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": payload.get("prompt")}],
                "temperature": 0.3,
                "max_tokens": 120
            }
        )
        return response.json()


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
        source='github',
        user_id=db_user.id
    )
    db.add(db_analysis)
    db.commit()

    return result
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB dependency working"}
