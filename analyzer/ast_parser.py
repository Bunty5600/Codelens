import ast
from pathlib import Path


def parse_code(source_code: str):
    """
    Parse Python source code into an AST tree.

    Parameters
    ----------
    source_code : str
        Python source code

    Returns
    -------
    ast.AST or None
    """

    try:
        tree = ast.parse(source_code)
        return tree

    except SyntaxError as e:
        print(f"Syntax error recheck file: {e}")
        return None


def parse_file(file_path: str):
    """
    Parse a Python file into an AST tree.
    """

    try:
        code = Path(file_path).read_text(encoding="utf-8")
        return parse_code(code)

    except FileNotFoundError:
        print("File not found:", file_path)
        return None

    except Exception as e:
        print(f"Syntax error recheck file: {e}")
        return None