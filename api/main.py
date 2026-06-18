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
import zipfile
import tempfile
from fastapi import UploadFile,File
import httpx


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
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db)):

    code = data.code
    filename = data.filename or "test.py"

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
        },
        "ml_prediction": ml_prediction
    }
@app.post("/analyze/upload")
async def analyze_upload(file: UploadFile = File(...)):

    print("FILE RECEIVED:", file.filename)

    try:

        # ==========================
        # ZIP PROJECT ANALYSIS
        # ==========================
        if file.filename.endswith(".zip"):

            with tempfile.TemporaryDirectory() as temp_dir:

                zip_path = os.path.join(temp_dir, file.filename)

                with open(zip_path, "wb") as buffer:
                    buffer.write(await file.read())

                with zipfile.ZipFile(zip_path, "r") as zip_ref:
                    zip_ref.extractall(temp_dir)

                total_cc = 0
                total_loc = 0
                total_functions = 0
                total_volume = 0
                total_effort = 0
                mi_values = []

                files_analyzed = 0

                for root, dirs, files in os.walk(temp_dir):

                    for filename in files:

                        # Python only for now
                        if filename.endswith(".py"):

                            try:

                                path = os.path.join(root, filename)

                                with open(
                                    path,
                                    "r",
                                    encoding="utf-8",
                                    errors="ignore"
                                ) as f:

                                    code = f.read()

                                result = analyze_code(code)

                                total_cc += result.get(
                                    "complexity",
                                    {}
                                ).get(
                                    "cyclomatic_complexity",
                                    0
                                )

                                total_loc += result.get(
                                    "size",
                                    {}
                                ).get(
                                    "loc",
                                    0
                                )

                                total_functions += result.get(
                                    "structure",
                                    {}
                                ).get(
                                    "functions",
                                    0
                                )

                                total_volume += result.get(
                                    "halstead",
                                    {}
                                ).get(
                                    "volume",
                                    0
                                )

                                total_effort += result.get(
                                    "halstead",
                                    {}
                                ).get(
                                    "effort",
                                    0
                                )

                                mi_values.append(
                                    result.get(
                                        "maintainability",
                                        {}
                                    ).get(
                                        "maintainability_index",
                                        0
                                    )
                                )

                                files_analyzed += 1

                            except Exception as e:
                                print(
                                    f"FILE ERROR: {filename}",
                                    str(e)
                                )

                if files_analyzed == 0:
                    return {
                        "error": "No Python files found in ZIP."
                    }

                avg_mi = (
                    sum(mi_values) / len(mi_values)
                )

                ml_prediction = predict_defect_risk({
                    "cc": total_cc,
                    "mi": avg_mi,
                    "loc": total_loc,
                    "halstead": {
                        "volume": total_volume,
                        "effort": total_effort
                    }
                })

                return {
                    "metrics": {
                        "cc": total_cc,
                        "mi": round(avg_mi, 2),
                        "loc": total_loc,
                        "functions": total_functions,
                        "halstead": {
                            "volume": total_volume,
                            "effort": total_effort
                        }
                    },
                    "ml_prediction": ml_prediction
                }

        # ==========================
        # SINGLE PYTHON FILE
        # ==========================
        content = await file.read()

        code = content.decode(
            "utf-8",
            errors="ignore"
        )

        result = analyze_code(code)

        ml_prediction = predict_defect_risk({
            "cc": result.get(
                "complexity",
                {}
            ).get(
                "cyclomatic_complexity",
                0
            ),

            "mi": result.get(
                "maintainability",
                {}
            ).get(
                "maintainability_index",
                0
            ),

            "loc": result.get(
                "size",
                {}
            ).get(
                "loc",
                0
            ),

            "halstead": result.get(
                "halstead",
                {}
            )
        })

        return {
            "metrics": {

                "cc": result.get(
                    "complexity",
                    {}
                ).get(
                    "cyclomatic_complexity",
                    0
                ),

                "mi": result.get(
                    "maintainability",
                    {}
                ).get(
                    "maintainability_index",
                    0
                ),

                "loc": result.get(
                    "size",
                    {}
                ).get(
                    "loc",
                    0
                ),

                "functions": result.get(
                    "structure",
                    {}
                ).get(
                    "functions",
                    0
                ),

                "halstead": result.get(
                    "halstead",
                    {}
                )
            },

            "ml_prediction": ml_prediction
        }

    except Exception as e:

        print("UPLOAD ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


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
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB dependency working"}
