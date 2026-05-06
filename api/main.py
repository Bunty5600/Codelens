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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    db_user = db.query(user.User).filter(user.User.email == data.email).first()
    if not db_user or not verify_password(data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": str(db_user.id), "email": db_user.email})
    return {"token": token, "name": db_user.name, "email": db_user.email}


@app.post("/analyze/code")
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db)):

    code = data.code
    filename = data.filename or "test.py"

    result = analyze_code(code)
    print(result)  # Keep this so you can verify keys in terminal

    db_user = db.query(user.User).first()
    if not db_user:
        db_user = user.User(email="test@test.com", name="Test User")
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    db_analysis = analysis.Analysis(
        filename=filename,
        language="python",
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
        }
    }

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB dependency working"}
