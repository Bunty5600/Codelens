# CodeLens AI

### AI-Powered Code Quality & Maintainability Analyzer

CodeLens AI is an AI-powered code quality analysis platform that evaluates software complexity, maintainability, defect risk, and technical debt using static analysis, machine learning, and large language models.

It provides developers with actionable insights, risk predictions, and AI-driven refactoring recommendations to improve software quality.

---

## ✨ Key Features

### Authentication & User Management

* Clerk-based authentication (session tokens, not custom JWT)
* Google / social sign-in via Clerk
* Protected API routes (`Depends(get_current_user)`)
* Local user record auto-provisioned on first authenticated request
* Analysis History Dashboard

### 📊 Static Code Analysis

* Python AST-based analysis
* Cyclomatic Complexity
* Halstead Metrics
* Maintainability Index
* Structural Metrics Extraction

### Machine Learning

* Defect Risk Prediction
* Risk Classification:

  * Low Risk
  * Medium Risk
  * High Risk
* Confidence Score Prediction

### 🧠 AI-Powered Insights

Powered by **Groq (Llama-family models via the Groq API)**

* Risk Assessment
* Root Cause Analysis
* Refactoring Suggestions
* Architecture Recommendations
* Quick AI tips (`/ai-tip`)

### 📈 Code Quality Features

* Code Smell Detection
* Technical Debt Scoring
* Complexity Heatmap
* Quality Gate Evaluation
* PDF Report Generation

### 📂 Project Analysis

* Source Code Analysis (paste)
* ZIP Project Upload
* GitHub Repository Analysis
* Per-analysis result retrieval by ID

---

## 🏗️ System Architecture

```text
User Code / ZIP Upload / GitHub Repository
                    │
                    ▼
          React + Vite Frontend
                    │
                    ▼
            FastAPI Backend API
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
    Clerk Auth  Database   AI Services
         │
         ▼
   AST Code Parsing Engine
         │
         ▼
  Metric Extraction Engine
         │
         ▼
  Code Smell Detection
         │
         ▼
 Technical Debt Analysis
         │
         ▼
 ML Defect Prediction
         │
         ▼
 Groq AI Recommendations
         │
         ▼
 Quality Gate Evaluation
         │
         ▼
 Dashboard + PDF Reports
```

---

## 📊 Metrics Evaluated

### Size Metrics

* Lines of Code (LOC)
* Blank Lines
* Comment Lines

### Structural Metrics

* Functions
* Classes
* Loops
* Conditionals
* Returns
* Exception Blocks

### Complexity Metrics

* Cyclomatic Complexity
* Maximum Nesting Depth

### Halstead Metrics

* Vocabulary
* Length
* Volume
* Difficulty
* Effort

### Maintainability Metrics

* Maintainability Index
* Code Quality Rating

---

## 🔍 Code Smells

| Smell               | Threshold  |
| -------------------- | ---------- |
| Long Function        | > 50 lines |
| Too Many Parameters   | > 5        |
| Deep Nesting          | > 3        |
| Large Class           | > 300 LOC  |
| High Complexity       | CC > 15    |

---

## 📉 Technical Debt

Score Range: **0 – 10**

* 0 – 3 → Low Debt
* 4 – 7 → Medium Debt
* 8 – 10 → High Debt

---

## 🚦 Quality Gate

| Condition           | Result  |
| -------------------- | ------- |
| CC > 20              | FAIL    |
| MI < 40               | FAIL    |
| Debt > 8               | FAIL    |
| Moderate thresholds  | WARNING |
| Healthy code          | PASS    |

---

## 🧠 Machine Learning Model

### Input Features

* Cyclomatic Complexity
* Maintainability Index
* LOC
* Halstead Metrics

### Output

* Risk Level
* Confidence Score

---

## 🤖 AI Recommendations

CodeLens uses **Groq** to generate:

* Risk Summary
* Root Cause Analysis
* Refactoring Suggestions
* Architecture Improvements

---

## 📁 Project Structure

```text
Codelens/
│
├── analyzer/          # AST parsing, complexity, Halstead, maintainability, structure, size metrics
├── api/               # FastAPI app, Clerk auth, DB session, SQLAlchemy models & Pydantic schemas
│   ├── models/
│   └── schemas/
├── services/          # Analysis orchestration, AI, debt, GitHub, quality-gate, report, smell services
├── ml/                # Defect-risk model, predictor, training script, dataset
│   ├── dataset/
│   └── models/        # Trained model.pkl, scaler.pkl, label_encoder.pkl
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── requirements.txt
├── Procfile
└── README.md
```

---

## ⚙️ Installation

### Backend

```bash
git clone https://github.com/Bunty5600/Codelens.git
cd Codelens

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn api.main:app --reload --port 9000
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`.env`)

```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost/codelens
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`ALLOWED_ORIGINS` is a comma-separated list — it drives both CORS and Clerk's `authorized_parties` check, so every frontend origin (local dev, production domain, and any Vercel preview URLs you test from) needs to be listed here.

### Frontend (`frontend/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://127.0.0.1:9000
```

---

## 📡 API Endpoints

All endpoints below (except `/`) require a valid Clerk session token in the `Authorization: Bearer <token>` header, unless noted otherwise.

| Method | Endpoint                     | Auth required | Description                          |
| ------ | ----------------------------- | :-----------: | ------------------------------------- |
| GET    | `/`                            | No            | Health/status check                   |
| POST   | `/analyze/code`                 | Yes           | Analyze pasted code                   |
| POST   | `/analyze/upload`               | Yes           | Analyze uploaded file or ZIP project  |
| POST   | `/analyze/smells`               | No            | Detect code smells                    |
| POST   | `/analyze/debt`                 | No            | Compute technical debt score          |
| POST   | `/analyze/github`               | Yes           | Analyze a GitHub repository           |
| GET    | `/analyze/history`               | Yes           | List current user's past analyses     |
| GET    | `/analyze/result/{analysis_id}`  | Yes           | Fetch a specific past analysis result |
| POST   | `/ai/refactor`                  | No            | AI refactoring suggestions            |
| POST   | `/ai-tip`                       | No            | Quick AI tip via Groq                 |
| POST   | `/report/generate`              | No            | Generate a PDF report                 |

---

## 🛠 Tech Stack

| Layer            | Technology                          |
| ----------------- | ------------------------------------ |
| Frontend          | React 19, Vite, Tailwind CSS, Recharts |
| Backend           | FastAPI, Python, Uvicorn              |
| Database          | PostgreSQL, SQLAlchemy                |
| Authentication    | Clerk                                 |
| Machine Learning  | Scikit-learn                          |
| AI                | Groq API                              |
| PDF Reports       | ReportLab                             |
| Deployment        | Render (backend), Vercel (frontend), Supabase (Postgres) |

---

## 👨‍💻 Author

**Bunty Bhainsa**
Computer Science Engineering Student
AI Full-Stack Developer

GitHub: [https://github.com/Bunty5600](https://github.com/Bunty5600)
