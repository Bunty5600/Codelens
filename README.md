# CodeLens AI — Code Complexity Analyzer

CodeLens AI is a full-stack code quality analysis platform that evaluates software complexity, maintainability, and defect risk using static code analysis, machine learning, and AI-powered insights.

---

## What's New

- JWT-based authentication (Signup & Login)
- ML defect risk prediction with confidence scores
- Google Gemini AI-powered code quality tips
- PostgreSQL database integration
- React + Vite frontend with dark mode

---

## Features

- Static code analysis using Python AST
- Cyclomatic Complexity calculation
- Halstead Metrics computation
- Maintainability Index evaluation
- Structural code metrics extraction
- **ML-based defect risk prediction** (Low / Medium / High Risk with confidence %)
- **Google Gemini AI tips** — actionable suggestions based on real metrics
- JWT authentication — Signup, Login, protected routes
- FastAPI backend with PostgreSQL
- React + Vite frontend with interactive charts

---

## Project Architecture

```
User Uploads Code / Pastes Code
        ↓
  React Frontend (Vite)
        ↓
  FastAPI Backend (Port 9000)
        ↓
  JWT Auth Middleware
        ↓
  AST Code Parser
        ↓
  Metric Extraction Engine
        ↓
  ML Defect Risk Prediction
        ↓
  Gemini AI Tip Generation
        ↓
  Analysis Results Dashboard
```

---

## Metrics Calculated

### Size Metrics
- Lines of Code (LOC)
- Blank lines
- Comment lines

### Structural Metrics
- Number of functions
- Number of classes
- Loops
- Conditional statements
- Return statements
- Try blocks

### Complexity Metrics
- Cyclomatic Complexity
- Max Nesting Depth

### Halstead Metrics
- Vocabulary
- Length
- Volume
- Difficulty
- Effort

### Maintainability Metrics
- Maintainability Index (0–100)
- Rating (Excellent / Moderate / Poor)

---

## ML Integration

The system uses a trained machine learning model (`ml/predictor.py`) to predict defect risk based on code metrics.

**Input features:**
- Cyclomatic Complexity
- Maintainability Index
- Lines of Code
- Halstead metrics

**Output:**
- Risk Level: `Low` / `Medium` / `High`
- Confidence score (%)

---

## AI Tips (Google Gemini)

After each analysis, the frontend calls the **Google Gemini 2.5 Flash API** to generate a real, context-aware tip based on the actual metrics of the analyzed code.

**Example tip:**
> "Your Maintainability Index is poor, likely due to excessive fragmentation. Consolidate very small, tightly coupled functions to improve code flow and reduce cognitive load."

---

## Project Structure

```
Codelens/
│
├── analyzer/
│   ├── ast_parser.py
│   ├── structure_metrics.py
│   ├── size_metrics.py
│   ├── complexity_metrics.py
│   ├── halstead_metrics.py
│   ├── maintainability.py
│   └── analyzer.py
│
├── api/
│   ├── models/
│   │   ├── user.py
│   │   ├── analysis.py
│   │   └── metrics.py
│   ├── schemas/
│   │   └── analysis_schema.py
│   ├── auth.py
│   ├── database.py
│   └── main.py
│
├── ml/
│   └── predictor.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   │       └── api.js
│   └── .env
│
├── data/
│   └── dataset.csv
│
├── .env
├── requirements.txt
└── README.md
```

---

## Installation

### Backend

```bash
# Clone the repository
git clone https://github.com/Bunty5600/Codelens.git
cd Codelens

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file (use Notepad on Windows)
# Add: SECRET_KEY=your_secret_key_here

# Run FastAPI server
uvicorn api.main:app --port 9000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```
SECRET_KEY=your_secret_key_here
```

**Frontend `.env`:**
```
VITE_API_URL=http://127.0.0.1:9000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Authentication

The system uses **JWT (JSON Web Tokens)** for authentication.

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT token
- Token is stored in `localStorage` and sent with every protected request

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/analyze/code` | Analyze pasted code |
| POST | `/analyze/upload` | Analyze uploaded file |
| GET | `/` | Health check |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Python |
| Database | PostgreSQL, SQLAlchemy |
| Auth | JWT (python-jose), bcrypt |
| ML | scikit-learn |
| AI Tips | Google Gemini 2.5 Flash API |

---

## Future Enhancements

- Multi-language support (Java, C++, JavaScript, TypeScript)
- IDE plugin integration (VS Code extension)
- GitHub repository analysis — analyze entire repos via URL
- Deep learning models for more accurate defect prediction
- Code diff analysis — compare before and after refactoring
- Team dashboard — track code quality across projects
- Export reports as PDF
- Email notifications for critical complexity alerts

---

## Author

Bunty Bhainsa
Computer Science Engineering ,Ai full-stack
