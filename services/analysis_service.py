import zipfile
import tempfile
import os
from analyzer.analyzer import analyze_code
from services.smell_service import detect_smells
from services.debt_service import calculate_debt_score, debt_label

def assign_risk(cc: float, mi: float) -> str:
    if cc < 5 and mi > 65:
        return "Low"
    elif cc > 15 or mi < 40:
        return "High"
    else:
        return "Medium"

def analyze_zip(zip_bytes: bytes, project_name: str) -> dict:
    file_results = []
    total_cc = 0
    total_loc = 0
    total_functions = 0
    total_volume = 0
    total_effort = 0
    mi_values = []

    with tempfile.TemporaryDirectory() as temp_dir:
        zip_path = os.path.join(temp_dir, "upload.zip")

        with open(zip_path, "wb") as f:
            f.write(zip_bytes)

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        for root, dirs, files in os.walk(temp_dir):
            for filename in files:
                if not filename.endswith(".py"):
                    continue
                try:
                    path = os.path.join(root, filename)
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        code = f.read()

                    result = analyze_code(code)

                    cc = result.get("complexity", {}).get("cyclomatic_complexity", 0)
                    mi = result.get("maintainability", {}).get("maintainability_index", 0)
                    loc = result.get("size", {}).get("loc", 0)
                    functions = result.get("structure", {}).get("functions", 0)
                    volume = result.get("halstead", {}).get("volume", 0)
                    effort = result.get("halstead", {}).get("effort", 0)
                    risk = assign_risk(cc, mi)
                    smells = detect_smells(code, int(cc),
                                           result.get("complexity", {}).get("max_nesting_depth", 0))

                    file_results.append({
                        "file_name": filename,
                        "cc": cc,
                        "mi": round(mi, 2),
                        "loc": loc,
                        "functions": functions,
                        "risk": risk,
                        "smells": smells
                    })

                    total_cc += cc
                    total_loc += loc
                    total_functions += functions
                    total_volume += volume
                    total_effort += effort
                    mi_values.append(mi)

                except Exception as e:
                    print(f"FILE ERROR: {filename} — {e}")

    if not file_results:
        return {"error": "No Python files found in ZIP"}

    avg_mi = sum(mi_values) / len(mi_values)
    overall_risk = assign_risk(total_cc / len(file_results), avg_mi)
    all_smells = [s for f in file_results for s in f.get("smells", [])]

    debt_score = calculate_debt_score(
        cc=total_cc / len(file_results),
        mi=avg_mi,
        halstead_volume=total_volume,
        smells=all_smells,
        loc=total_loc
    )

    return {
        "project_name": project_name,
        "files": file_results,
        "aggregate": {
            "cc": total_cc,
            "mi": round(avg_mi, 2),
            "loc": total_loc,
            "functions": total_functions,
            "halstead": {
                "volume": total_volume,
                "effort": total_effort
            }
        },
        "overall_risk": overall_risk,
        "debt_score": debt_score,
        "debt_label": debt_label(debt_score),
    }