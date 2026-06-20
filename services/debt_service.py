def calculate_debt_score(
    cc: float,
    mi: float,
    halstead_volume: float,
    smells: list,
    loc: int
) -> float:
    """
    Technical Debt Score: 0 (clean) → 10 (critical)

    Components:
    - CC score:     high complexity = high debt
    - MI score:     low maintainability = high debt
    - Volume score: high halstead volume = high debt
    - Smell score:  more smells = higher debt
    - LOC score:    very large codebase = higher debt
    """

    # CC: normalize to 0-10 (CC > 30 = max debt)
    cc_score = min(cc / 30, 1.0) * 10

    # MI: invert (MI=100 → 0 debt, MI=0 → 10 debt)
    mi_score = max(0, (100 - mi) / 100) * 10

    # Halstead Volume: normalize (volume > 10000 = max)
    vol_score = min(halstead_volume / 10000, 1.0) * 10

    # Smell score: each smell adds weight
    smell_weight = {"Low": 0.5, "Medium": 1.0, "High": 2.0}
    raw_smell = sum(smell_weight.get(s.get("severity", "Low"), 0.5) for s in smells)
    smell_score = min(raw_smell / 5, 1.0) * 10

    # LOC score: normalize (LOC > 2000 = max)
    loc_score = min(loc / 2000, 1.0) * 10

    # Weighted average
    debt = (
        cc_score    * 0.30 +
        mi_score    * 0.25 +
        vol_score   * 0.15 +
        smell_score * 0.20 +
        loc_score   * 0.10
    )

    return round(debt, 1)


def debt_label(score: float) -> str:
    if score <= 3.5:
        return "Low Debt"
    elif score <= 6.5:
        return "Medium Debt"
    else:
        return "High Debt"