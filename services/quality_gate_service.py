def evaluate_quality_gate(cc: float, mi: float, debt: float) -> dict:
    rules = []
    status = "PASS"

    # CC Rule
    if cc > 20:
        rules.append({"rule": "Cyclomatic Complexity", "value": cc, "threshold": 20, "status": "FAIL"})
        status = "FAIL"
    elif cc > 15:
        rules.append({"rule": "Cyclomatic Complexity", "value": cc, "threshold": 20, "status": "WARNING"})
        if status != "FAIL":
            status = "WARNING"
    else:
        rules.append({"rule": "Cyclomatic Complexity", "value": cc, "threshold": 20, "status": "PASS"})

    # MI Rule
    if mi < 40:
        rules.append({"rule": "Maintainability Index", "value": mi, "threshold": 40, "status": "FAIL"})
        status = "FAIL"
    elif mi < 55:
        rules.append({"rule": "Maintainability Index", "value": mi, "threshold": 40, "status": "WARNING"})
        if status != "FAIL":
            status = "WARNING"
    else:
        rules.append({"rule": "Maintainability Index", "value": mi, "threshold": 40, "status": "PASS"})

    # Debt Rule
    if debt > 8:
        rules.append({"rule": "Technical Debt", "value": debt, "threshold": 8, "status": "FAIL"})
        status = "FAIL"
    elif debt > 6:
        rules.append({"rule": "Technical Debt", "value": debt, "threshold": 8, "status": "WARNING"})
        if status != "FAIL":
            status = "WARNING"
    else:
        rules.append({"rule": "Technical Debt", "value": debt, "threshold": 8, "status": "PASS"})

    return {"overall": status, "rules": rules}