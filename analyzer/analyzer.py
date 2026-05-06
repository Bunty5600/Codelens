
from analyzer.ast_parser import parse_code
from analyzer.structure_metrics import get_structure_metrics
from analyzer.size_metrics import get_size_metrics
from analyzer.complexity_metrics import get_complexity_metrics
from analyzer.halstead_metrics import get_halstead_metrics
from analyzer.maintainability import get_maintainability_index

def analyze_code(source_code: str) -> dict:
    try:
        print("STEP 0: parsing")
        tree = parse_code(source_code)

        if tree is None:
            return {"error": "Invalid Python code"}

        print("STEP 1: size")
        size = get_size_metrics(source_code) or {}

        print("STEP 2: structure")
        structure = get_structure_metrics(tree) or {}

        print("STEP 3: complexity")
        complexity = get_complexity_metrics(tree) or {}

        print("STEP 4: halstead")
        halstead = get_halstead_metrics(tree) or {}

        print("STEP 5: maintainability")
        maintainability = get_maintainability_index(
            halstead or {},
            complexity or {},
            size or {}
        )

        print("STEP 6: done")

        return {
            "size": size,
            "structure": structure,
            "complexity": complexity,
            "halstead": halstead,
            "maintainability": maintainability,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}