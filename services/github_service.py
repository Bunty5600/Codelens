import tempfile
import os
from analyzer.analyzer import analyze_code
from services.smell_service import detect_smells
from services.debt_service import calculate_debt_score, debt_label
from services.analysis_service import assign_risk
from services.quality_gate_service import evaluate_quality_gate
import git

IGNORE_DIRS = {"node_modules", ".git", "venv", "__pycache__", "build", "dist", ".venv", ".next", "coverage"}

SUPPORTED_EXTENSIONS = ('.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.java', '.go')

def get_language(filename: str) -> str:
    if filename.endswith('.py'):
        return 'python'
    elif filename.endswith(('.js', '.jsx')):
        return 'javascript'
    elif filename.endswith(('.ts', '.tsx')):
        return 'typescript'
    elif filename.endswith('.java'):
        return 'java'
    elif filename.endswith('.go'):
        return 'go'
    elif filename.endswith('.html'):
        return 'html'
    elif filename.endswith('.css'):
        return 'css'
    return 'other'

def basic_metrics(code: str, lang: str) -> dict:
    lines = code.splitlines()
    loc = len([l for l in lines if l.strip() and not l.strip().startswith(('//', '#', '/*', '*', '<!--'))])

    # Count functions based on language
    if lang in ('javascript', 'typescript'):
        func_count = (
            code.count('function ') +
            code.count('=> {') +
            code.count('=>\n') +
            code.count('const ') +
            code.count('async ')
        )
        func_count = min(func_count, loc // 5)  # rough cap
    elif lang == 'java':
        func_count = code.count('public ') + code.count('private ') + code.count('protected ')
    elif lang == 'go':
        func_count = code.count('func ')
    else:
        func_count = 0

    return {
        "cc": 1,
        "mi": 70,
        "loc": loc,
        "functions": max(func_count, 0),
        "volume": 0,
        "effort": 0,
    }

def validate_github_url(url: str) -> bool:
    clean = url.replace(".git", "")
    parts = clean.rstrip("/").split("/")
    return url.startswith("https://github.com/") and len(parts) >= 5

def clone_repo(url: str, target_dir: str) -> bool:
    try:
        git.Repo.clone_from(url, target_dir, depth=1, no_checkout=False)
        return os.path.exists(target_dir) and len(os.listdir(target_dir)) > 1
    except git.exc.GitCommandError as e:
        print(f"GitPython error: {e}")
        return os.path.exists(target_dir) and len(os.listdir(target_dir)) > 1
    except Exception as e:
        print(f"Clone error: {e}")
        return False

def analyze_github_repo(repo_url: str) -> dict:
    print("URL RECEIVED:", repr(repo_url))
    print("VALID:", validate_github_url(repo_url))

    if not validate_github_url(repo_url):
        return {"error": "Invalid GitHub URL"}

    repo_name = repo_url.rstrip("/").replace(".git", "").split("/")[-1]

    file_results = []
    total_cc = 0
    total_loc = 0
    total_functions = 0
    total_volume = 0
    total_effort = 0
    mi_values = []

    with tempfile.TemporaryDirectory() as temp_dir:
        clone_path = os.path.join(temp_dir, repo_name)
        print("CLONING TO:", clone_path)
        success = clone_repo(repo_url, clone_path)
        print("CLONE SUCCESS:", success)

        if not success:
            return {"error": "Failed to clone repository. Make sure git is installed and the repository is public."}
        all_files = []
        for root, dirs, files in os.walk(clone_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for f in files:
                all_files.append(os.path.join(root, f))
        print("TOTAL FILES FOUND:", len(all_files))
        print("SAMPLE:", all_files[:5])

        for root, dirs, files in os.walk(clone_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for filename in files:
                if not filename.endswith(SUPPORTED_EXTENSIONS):
                    continue
                print(f"ANALYZING: {filename} — lang: {get_language(filename)}")
                try:
                    path = os.path.join(root, filename)
                    rel_path = os.path.relpath(path, clone_path).replace("\\", "/")
                    lang = get_language(filename)

                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        code = f.read()

                    if not code.strip():
                        continue

                    if lang == 'python':
                        result = analyze_code(code)
                        cc = result.get("complexity", {}).get("cyclomatic_complexity", 0)
                        mi = result.get("maintainability", {}).get("maintainability_index", 0)
                        loc = result.get("size", {}).get("loc", 0)
                        functions = result.get("structure", {}).get("functions", 0)
                        volume = result.get("halstead", {}).get("volume", 0)
                        effort = result.get("halstead", {}).get("effort", 0)
                        smells = detect_smells(code, int(cc),
                            result.get("complexity", {}).get("max_nesting_depth", 0))
                    else:
                        bm = basic_metrics(code, lang)
                        cc = bm["cc"]
                        mi = bm["mi"]
                        loc = bm["loc"]
                        functions = bm["functions"]
                        volume = bm["volume"]
                        effort = bm["effort"]
                        smells = []

                    if loc == 0:
                        continue

                    risk = assign_risk(cc, mi)

                    file_results.append({
                        "file_name": rel_path,
                        "language": lang,
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
        return {"error": "No supported files found in repository"}

    avg_mi = sum(mi_values) / len(mi_values)
    avg_cc = total_cc / len(file_results)
    overall_risk = assign_risk(avg_cc, avg_mi)
    all_smells = [s for f in file_results for s in f.get("smells", [])]

    debt_score = calculate_debt_score(
        cc=avg_cc,
        mi=avg_mi,
        halstead_volume=total_volume,
        smells=all_smells,
        loc=total_loc
    )

    highest_risk_file = max(file_results, key=lambda x: x["cc"])
    quality_gate = evaluate_quality_gate(avg_cc, avg_mi, debt_score)

    # Language breakdown
    lang_counts = {}
    for f in file_results:
        l = f.get("language", "other")
        lang_counts[l] = lang_counts.get(l, 0) + 1

    return {
        "repository": repo_name,
        "repo_url": repo_url,
        "files": file_results,
        "aggregate": {
            "cc": round(avg_cc, 2),
            "mi": round(avg_mi, 2),
            "loc": total_loc,
            "functions": total_functions,
            "halstead": {"volume": total_volume, "effort": total_effort}
        },
        "overall_risk": overall_risk,
        "debt_score": debt_score,
        "debt_label": debt_label(debt_score),
        "highest_risk_file": highest_risk_file["file_name"],
        "quality_gate": quality_gate,
        "total_files": len(file_results),
        "languages": lang_counts,
    }