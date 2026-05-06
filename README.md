# AI Code Complexity Analyzer

AI Code Complexity Analyzer is a static code analysis system designed to evaluate software complexity, maintainability, and defect risk using software engineering metrics and machine learning.

The system analyzes Python source code and generates a detailed report including code complexity metrics and risk predictions.

---

## Features

* Static code analysis using Python AST
* Cyclomatic Complexity calculation
* Halstead Metrics computation
* Maintainability Index evaluation
* Structural code metrics extraction
* Machine learning based defect risk prediction
* Web API built with FastAPI
* Simple frontend interface for uploading code

---

## Project Architecture

User Uploads Code
↓
FastAPI Backend
↓
AST Code Parser
↓
Metric Extraction Engine
↓
Complexity Calculations
↓
Machine Learning Prediction
↓
Analysis Report

---

## Metrics Calculated

### Size Metrics

* Lines of Code (LOC)
* Blank lines
* Comment lines

### Structural Metrics

* Number of functions
* Number of classes
* Loops
* Conditional statements
* Return statements
* Try blocks

### Complexity Metrics

* Cyclomatic Complexity
* Nesting Depth

### Halstead Metrics

* Vocabulary
* Length
* Volume
* Difficulty
* Effort

### Maintainability Metrics

* Maintainability Index
* Comment Ratio

---

## Project Structure

AI_code_complexity_analyzer

│
├── analyzer
│   ├── ast_parser.py
│   ├── structure_metrics.py
│   ├── size_metrics.py
│   ├── complexity_metrics.py
│   ├── halstead_metrics.py
│   ├── maintainability.py
│   └── analyzer.py
│

├── api
│   └── main.py
│

├── models
│   └── ml_model.py
│

├── samples
│   └── sample_code.py
│

├── tests
│   └── test_analyzer.py
│

├── data
│   └── dataset.csv
│

├── frontend
│   ├── index.html
│   ├── script.js
│   └── style.css
│

├── requirements.txt
└── README.md

---

## Installation

Clone the repository

git clone <repository_url>

Navigate to project directory

cd AI_code_complexity_analyzer

Install dependencies

pip install -r requirements.txt

Run the FastAPI server

uvicorn api.main:app --reload

---

## Example Output

Lines of Code: 45
Functions: 3
Loops: 2
If Statements: 4

Cyclomatic Complexity: 7

Halstead Volume: 210

Maintainability Index: 72

---

## Future Enhancements

* Multi-language support (Java, C++, JavaScript)
* IDE plugin integration
* GitHub repository analysis
* Visualization dashboard
* Deep learning models for defect prediction

---

## Author

AI Code Complexity Analyzer Project
Computer Science Engineering
