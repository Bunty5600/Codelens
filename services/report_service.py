from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime


RISK_COLORS = {
    "Low":    colors.HexColor("#22c55e"),
    "Medium": colors.HexColor("#eab308"),
    "High":   colors.HexColor("#ef4444"),
}


def generate_pdf_report(
    project_name: str,
    aggregate: dict,
    files: list,
    smells: list,
    ai_insights: dict,
    ml_prediction: dict,
    debt_score: float = None
) -> bytes:

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Title ──────────────────────────────────────────
    title_style = ParagraphStyle(
        "Title",
        fontSize=24,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0f172a"),
        alignment=TA_CENTER,
        spaceAfter=4
    )
    sub_style = ParagraphStyle(
        "Sub",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#64748b"),
        alignment=TA_CENTER,
        spaceAfter=2
    )
    section_style = ParagraphStyle(
        "Section",
        fontSize=13,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#334155"),
        spaceAfter=4,
        leading=16
    )

    elements.append(Paragraph("CodeLens AI", title_style))
    elements.append(Paragraph("Code Quality Analysis Report", sub_style))
    elements.append(Paragraph(f"Project: {project_name}", sub_style))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", sub_style))
    elements.append(Spacer(1, 6*mm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    elements.append(Spacer(1, 4*mm))

    # ── Aggregate Metrics ──────────────────────────────
    elements.append(Paragraph("Aggregate Metrics", section_style))
    agg_data = [
        ["Metric", "Value"],
        ["Cyclomatic Complexity", str(aggregate.get("cc", 0))],
        ["Maintainability Index", f"{aggregate.get('mi', 0)}/100"],
        ["Lines of Code", str(aggregate.get("loc", 0))],
        ["Total Functions", str(aggregate.get("functions", 0))],
        ["Halstead Volume", f"{aggregate.get('halstead', {}).get('volume', 0):.0f}"],
    ]
    if debt_score is not None:
        agg_data.append(["Technical Debt Score", f"{debt_score}/10"])

    agg_table = Table(agg_data, colWidths=[90*mm, 80*mm])
    agg_table.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
        ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
    ]))
    elements.append(agg_table)
    elements.append(Spacer(1, 4*mm))

    # ── ML Prediction ──────────────────────────────────
    if ml_prediction:
        elements.append(Paragraph("ML Defect Prediction", section_style))
        risk = ml_prediction.get("risk_level", "Unknown")
        conf = ml_prediction.get("confidence", 0)
        elements.append(Paragraph(
            f"Risk Level: <b>{risk}</b> — Confidence: {conf}%",
            body_style
        ))
        elements.append(Spacer(1, 3*mm))

    # ── File Complexity Ranking ────────────────────────
    if files:
        elements.append(Paragraph("File Complexity Ranking", section_style))
        file_data = [["File", "CC", "MI", "LOC", "Risk"]]
        sorted_files = sorted(files, key=lambda x: x.get("cc", 0), reverse=True)
        for f in sorted_files:
            file_data.append([
                f.get("file_name", ""),
                str(f.get("cc", 0)),
                str(f.get("mi", 0)),
                str(f.get("loc", 0)),
                f.get("risk", "Low"),
            ])
        file_table = Table(file_data, colWidths=[65*mm, 25*mm, 25*mm, 25*mm, 30*mm])
        file_table.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ]))
        elements.append(file_table)
        elements.append(Spacer(1, 4*mm))

    # ── Code Smells ────────────────────────────────────
    if smells:
        elements.append(Paragraph("Code Smells Detected", section_style))
        smell_data = [["Type", "Severity", "Message"]]
        for s in smells:
            smell_data.append([
                s.get("type", ""),
                s.get("severity", ""),
                s.get("message", ""),
            ])
        smell_table = Table(smell_data, colWidths=[45*mm, 30*mm, 95*mm])
        smell_table.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#fff7ed"), colors.white]),
            ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
            ("WORDWRAP",    (2, 1), (2, -1), True),
        ]))
        elements.append(smell_table)
        elements.append(Spacer(1, 4*mm))

    # ── AI Insights ────────────────────────────────────
    if ai_insights:
        elements.append(Paragraph("AI Refactor Recommendations", section_style))
        elements.append(Paragraph(
            f"<b>Risk Level:</b> {ai_insights.get('risk_level', 'N/A')}",
            body_style
        ))
        elements.append(Paragraph(
            f"<b>Root Cause:</b> {ai_insights.get('root_cause', 'N/A')}",
            body_style
        ))
        refactoring = ai_insights.get("refactoring", [])
        if refactoring:
            elements.append(Paragraph("<b>Refactoring Suggestions:</b>", body_style))
            for r in refactoring:
                elements.append(Paragraph(f"• {r}", body_style))
        architecture = ai_insights.get("architecture", [])
        if architecture:
            elements.append(Paragraph("<b>Architecture Suggestions:</b>", body_style))
            for a in architecture:
                elements.append(Paragraph(f"• {a}", body_style))

    # ── Footer ─────────────────────────────────────────
    elements.append(Spacer(1, 8*mm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    elements.append(Paragraph(
        "Generated by CodeLens AI — Enterprise Code Quality Analyzer",
        ParagraphStyle("Footer", fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER)
    ))

    doc.build(elements)
    return buffer.getvalue()