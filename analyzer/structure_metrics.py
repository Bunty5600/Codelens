import ast
from typing import Dict


class StructureMetricsVisitor(ast.NodeVisitor):
    """
    AST Visitor to collect structural metrics from Python code.
    """

    def __init__(self) -> None:
        self.metrics: Dict[str, int] = {
            "functions": 0,
            "classes": 0,
            "loops": 0,
            "if_statements": 0,
            "return_statements": 0,
            "try_blocks": 0,
        }

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.metrics["functions"] += 1
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self.metrics["classes"] += 1
        self.generic_visit(node)

    def visit_For(self, node: ast.For) -> None:
        self.metrics["loops"] += 1
        self.generic_visit(node)

    def visit_While(self, node: ast.While) -> None:
        self.metrics["loops"] += 1
        self.generic_visit(node)

    def visit_If(self, node: ast.If) -> None:
        self.metrics["if_statements"] += 1
        self.generic_visit(node)

    def visit_Return(self, node: ast.Return) -> None:
        self.metrics["return_statements"] += 1
        self.generic_visit(node)

    def visit_Try(self, node: ast.Try) -> None:
        self.metrics["try_blocks"] += 1
        self.generic_visit(node)


def get_structure_metrics(tree: ast.AST) -> Dict[str, int]:
    """
    Extract structural metrics from AST.

    Parameters
    ----------
    tree : ast.AST
        Parsed AST tree

    Returns
    -------
    Dict[str, int]
        Dictionary containing structural metrics
    """
    visitor = StructureMetricsVisitor()
    visitor.visit(tree)
    return visitor.metrics