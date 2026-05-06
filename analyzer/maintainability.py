import math
from typing import Dict


def get_maintainability_index(
    halstead: Dict[str, float],
    complexity: Dict[str, int],
    size: Dict[str, int],
) -> Dict[str, float]:
    """
    Calculate Maintainability Index (MI)

    Parameters
    ----------
    halstead : dict
    complexity : dict
    size : dict

    Returns
    -------
    dict
    """

    volume = halstead.get("volume", 0)
    cc = complexity.get("cyclomatic_complexity", 0)
    loc = size.get("loc", 0)

    # Avoid log(0)
    if volume <= 0:
        volume = 1
    if loc <= 0:
        loc = 1

    mi = 171 - (5.2 * math.log(volume)) - (0.23 * cc) - (16.2 * math.log(loc))

    # Normalize
    mi = (mi * 100) / 171

    mi = max(0, min(100, mi))

    # Rating
    if mi >= 85:
        rating = "Excellent"
    elif mi >= 65:
        rating = "Moderate"
    else:
        rating = "Poor"

    return {
        "maintainability_index": round(mi, 2),
        "rating": rating,
    }