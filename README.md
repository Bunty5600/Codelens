# CodeLens AI

### Enterprise Code Quality & Maintainability Analyzer

CodeLens AI is an AI-powered code quality analysis platform that evaluates software complexity, maintainability, defect risk, and technical debt using static analysis, machine learning, and large language models.

It provides developers with actionable insights, risk predictions, and AI-driven refactoring recommendations to improve software quality.

---

## ✨ Key Features

### Authentication & User Management

* JWT Authentication
* User Registration & Login
* Protected API Routes
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

Powered by **Groq Llama 3.3 70B**

* Risk Assessment
* Root Cause Analysis
* Refactoring Suggestions
* Architecture Recommendations

### 📈 Code Quality Features

* Code Smell Detection
* Technical Debt Scoring
* Complexity Heatmap
* Quality Gate Evaluation
* PDF Report Generation

### 📂 Project Analysis

* Source Code Analysis
* ZIP Project Upload
* GitHub Repository Analysis

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
     JWT Auth   Database   AI Services
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
| ------------------- | ---------- |
| Long Function       | > 50 lines |
| Too Many Parameters | > 5        |
| Deep Nesting        | > 3        |
| Large Class         | > 300 LOC  |
| High Complexity     | CC > 15    |

---

## 📉 Technical Debt

Score Range: **0 – 10**

* 0 – 3 → Low Debt
* 4 – 7 → Medium Debt
* 8 – 10 → High Debt

---

## 🚦 Quality Gate

| Condition           | Result  |
| ------------------- | ------- |
| CC > 20             | FAIL    |
| MI < 40             | FAIL    |
| Debt > 8            | FAIL    |
| Moderate thresholds | WARNING |
| Healthy code        | PASS    |

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

CodeLens uses **Groq Llama 3.3 70B** to generate:

* Risk Summary
* Root Cause Analysis
* Refactoring Suggestions
* Architecture Improvements

---

## 📁 Project Structure

```text
CodeLens/
│
├── analyzer/
├── api/
├── services/
├── ml/
├── frontend/
├── data/
├── requirements.txt
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

### Backend

```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost/codelens
GROQ_API_KEY=your_groq_api_key
```

### Frontend

```env
VITE_API_URL=http://127.0.0.1:9000
```

---

## 📡 API Endpoints

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| POST   | /auth/signup     | Register User      |
| POST   | /auth/login      | Login User         |
| POST   | /analyze/code    | Analyze Code       |
| POST   | /analyze/upload  | Analyze ZIP/File   |
| POST   | /analyze/github  | Analyze Repository |
| POST   | /analyze/smells  | Detect Smells      |
| POST   | /analyze/debt    | Technical Debt     |
| POST   | /ai/refactor     | AI Suggestions     |
| POST   | /report/generate | Generate PDF       |
| GET    | /analyze/history | User History       |

---

## 🛠 Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Frontend         | React, Vite, Tailwind CSS |
| Backend          | FastAPI, Python           |
| Database         | PostgreSQL, SQLAlchemy    |
| Authentication   | JWT, bcrypt               |
| Machine Learning | Scikit-learn              |
| AI               | Groq Llama 3.3 70B        |
| PDF Reports      | ReportLab                 |
| Charts           | Recharts                  |
| Animation        | Framer Motion             |

---

## 👨‍💻 Author

**Bunty Bhainsa**
Computer Science Engineering Student
AI Full-Stack Developer

GitHub: https://github.com/Bunty5600
