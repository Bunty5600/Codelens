import ast
import math
from typing import Dict, Set


class HalsteadVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.operators: Set[str] = set()
        self.operands: Set[str] = set()

        self.total_operators = 0
        self.total_operands = 0

    # ---------- Operators ----------
    def visit_BinOp(self, node: ast.BinOp):
        self.operators.add(type(node.op).__name__)
        self.total_operators += 1
        self.generic_visit(node)

    def visit_UnaryOp(self, node: ast.UnaryOp):
        self.operators.add(type(node.op).__name__)
        self.total_operators += 1
        self.generic_visit(node)

    def visit_Compare(self, node: ast.Compare):
        for op in node.ops:
            self.operators.add(type(op).__name__)
            self.total_operators += 1
        self.generic_visit(node)

    def visit_BoolOp(self, node: ast.BoolOp):
        self.operators.add(type(node.op).__name__)
        self.total_operators += len(node.values) - 1
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign):
        self.operators.add("Assign")
        self.total_operators += 1
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        self.operators.add("Call")
        self.total_operators += 1
        self.generic_visit(node)

    # ---------- Operands ----------
    def visit_Name(self, node: ast.Name):
        self.operands.add(node.id)
        self.total_operands += 1

    def visit_Constant(self, node: ast.Constant):
        self.operands.add(str(node.value))
        self.total_operands += 1

    # ---------- Final Metrics ----------
    def get_metrics(self) -> Dict[str, float]:
        n1 = len(self.operators)
        n2 = len(self.operands)
        N1 = self.total_operators
        N2 = self.total_operands

        vocabulary = n1 + n2
        length = N1 + N2

        if vocabulary == 0:
            volume = 0
        else:
            volume = length * math.log2(vocabulary)

        if n2 == 0:
            difficulty = 0
        else:
            difficulty = (n1 / 2) * (N2 / n2)

        effort = difficulty * volume

        return {
            "vocabulary": vocabulary,
            "length": length,
            "volume": round(volume, 2),
            "difficulty": round(difficulty, 2),
            "effort": round(effort, 2),
        }


def get_halstead_metrics(tree: ast.AST) -> Dict[str, float]:
    visitor = HalsteadVisitor()
    visitor.visit(tree)
    return visitor.get_metrics()