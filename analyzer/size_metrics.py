from typing import Dict


def get_size_metrics(source_code: str) -> Dict[str, int]:
    """
    Calculate size-based metrics from source code.

    Metrics:
    - Lines of Code (LOC)
    - Blank lines
    - Comment lines

    Parameters
    ----------
    source_code : str

    Returns
    -------
    Dict[str, int]
    """

    loc = 0
    blank_lines = 0
    comment_lines = 0

    in_multiline_comment = False

    for line in source_code.splitlines():

        stripped = line.strip()

        # Blank line
        if not stripped:
            blank_lines += 1
            continue

        loc += 1

        # Multi-line comment handling (""" or ''')
        if stripped.startswith(('"""', "'''")):
            if in_multiline_comment:
                in_multiline_comment = False
            else:
                in_multiline_comment = True
            comment_lines += 1
            continue

        if in_multiline_comment:
            comment_lines += 1
            continue

        # Single-line comment
        if stripped.startswith("#"):
            comment_lines += 1

    return {
        "loc": loc,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
    }