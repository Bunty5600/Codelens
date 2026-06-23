import ast
import random

def generate_filename(code):
    try:
        tree = ast.parse(code)

        for node in tree.body:
            if isinstance(node, ast.ClassDef):
                return f"{node.name}_{random.randint(100,999)}.py"

            if isinstance(node, ast.FunctionDef):
                return f"{node.name}_{random.randint(100,999)}.py"

    except:
        pass

    return f"snippet_{random.randint(1000,9999)}.py"