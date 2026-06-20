import ast
from typing import List, Dict

def detect_smells(source_code: str, cc: int, max_nesting: int) -> List[Dict]:
    smells = []

    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        return smells

    for node in ast.walk(tree):

        # 1. Long Function (> 50 lines)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            func_lines = getattr(node, 'end_lineno', node.lineno) - node.lineno
            if func_lines > 50:
                smells.append({
                    "type": "Long Function",
                    "severity": "Medium",
                    "message": f"Function '{node.name}' is {func_lines} lines. Split into smaller functions."
                })

            # 2. Too Many Parameters (> 5)
            param_count = len(node.args.args)
            if param_count > 5:
                smells.append({
                    "type": "Too Many Parameters",
                    "severity": "Medium",
                    "message": f"Function '{node.name}' has {param_count} parameters. Use a config object or dataclass."
                })

        # 3. Large Class (> 300 lines)
        if isinstance(node, ast.ClassDef):
            class_lines = getattr(node, 'end_lineno', node.lineno) - node.lineno
            if class_lines > 300:
                smells.append({
                    "type": "Large Class",
                    "severity": "High",
                    "message": f"Class '{node.name}' is {class_lines} lines. Apply Single Responsibility Principle."
                })

    # 4. Deep Nesting (> 3)
    if max_nesting > 3:
        smells.append({
            "type": "Deep Nesting",
            "severity": "High",
            "message": f"Max nesting depth is {max_nesting}. Flatten with early returns or extract functions."
        })

    # 5. Too Many Branches (CC > 15)
    if cc > 15:
        smells.append({
            "type": "Too Many Branches",
            "severity": "High",
            "message": f"Cyclomatic Complexity is {cc}. Reduce branching logic."
        })

    return smells