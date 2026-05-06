import ast
from typing import Dict


class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.cyclomatic_complexity = 1  # base = 1
        self.current_depth = 0
        self.max_depth = 0

    # ---------- Utility ----------
    def _increase_depth(self):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)

    def _decrease_depth(self):
        self.current_depth -= 1

    # ---------- Decision Points ----------
    def visit_If(self, node: ast.If):
        self.cyclomatic_complexity += 1
        self._increase_depth()

        self.generic_visit(node)

        self._decrease_depth()

    def visit_For(self, node: ast.For):
        self.cyclomatic_complexity += 1
        self._increase_depth()

        self.generic_visit(node)

        self._decrease_depth()

    def visit_While(self, node: ast.While):
        self.cyclomatic_complexity += 1
        self._increase_depth()

        self.generic_visit(node)

        self._decrease_depth()

    def visit_Try(self, node: ast.Try):
        # each except increases complexity
        self.cyclomatic_complexity += len(node.handlers)

        self._increase_depth()
        self.generic_visit(node)
        self._decrease_depth()

    def visit_BoolOp(self, node: ast.BoolOp):
        # and/or increase complexity
        self.cyclomatic_complexity += len(node.values) - 1
        self.generic_visit(node)

    # ---------- Entry ----------
    def get_metrics(self) -> Dict[str, int]:
        return {
            "cyclomatic_complexity": self.cyclomatic_complexity,
            "max_nesting_depth": self.max_depth,
        }


def get_complexity_metrics(tree: ast.AST) -> Dict[str, int]:
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    return visitor.get_metrics()