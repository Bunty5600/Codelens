from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class NumberedCanvas(canvas.Canvas):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 20 * mm, 12 * mm, footer_text)
        self.drawString(
            20 * mm,
            12 * mm,
            "CodeLens AI — Confidential Code Quality Report",
        )

        # Header rule & title for pages after page 1
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(20 * mm, A4[1] - 15 * mm, A4[0] - 20 * mm, A4[1] - 15 * mm)
            self.drawString(
                20 * mm, A4[1] - 12 * mm, "CodeLens AI | Code Quality Analysis"
            )

        self.restoreState()


def get_risk_badge(
    risk_level: str, base_style: ParagraphStyle
) -> ParagraphStyle:
    """Returns a styled Paragraph for risk levels with background badges."""
    badge_colors = {
        "Low": ("#dcfce7", "#166534"),
        "Medium": ("#fef3c7", "#92400e"),
        "High": ("#fee2e2", "#991b1b"),
    }
    bg, fg = badge_colors.get(risk_level, ("#f1f5f9", "#475569"))

    return ParagraphStyle(
        f"Badge_{risk_level}",
        parent=base_style,
        fontSize=8,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor(fg),
        backColor=colors.HexColor(bg),
        borderPadding=(3, 6, 3, 6),
        alignment=TA_CENTER,
    )


def generate_pdf_report(
    project_name: str,
    aggregate: dict,
    files: list,
    smells: list,
    ai_insights: dict,
    ml_prediction: dict,
    debt_score: float = None,
) -> bytes:

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # ── Custom Typography Styles ───────────────────────
    style_title = ParagraphStyle(
        "DocTitle",
        fontSize=22,
        leading=26,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0f172a"),
    )
    style_subtitle = ParagraphStyle(
        "DocSubtitle",
        fontSize=10,
        leading=14,
        fontName="Helvetica",
        textColor=colors.HexColor("#64748b"),
    )
    style_meta_right = ParagraphStyle(
        "MetaRight",
        fontSize=9,
        leading=13,
        fontName="Helvetica",
        textColor=colors.HexColor("#475569"),
        alignment=TA_RIGHT,
    )
    style_section = ParagraphStyle(
        "SectionHeader",
        fontSize=12,
        leading=16,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )
    style_body = ParagraphStyle(
        "BodyTextCustom",
        fontSize=9.5,
        leading=14,
        fontName="Helvetica",
        textColor=colors.HexColor("#334155"),
    )
    style_th = ParagraphStyle(
        "TableHeader",
        fontSize=8.5,
        leading=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0f172a"),
    )
    style_td = ParagraphStyle(
        "TableCell",
        fontSize=8.5,
        leading=12,
        fontName="Helvetica",
        textColor=colors.HexColor("#334155"),
    )
    style_td_bold = ParagraphStyle(
        "TableCellBold", parent=style_td, fontName="Helvetica-Bold"
    )

    elements = []

    # ── Header Banner ──────────────────────────────────
    header_left = [
        Paragraph("CodeLens AI", style_title),
        Spacer(1, 2 * mm),
        Paragraph("Code Quality Analysis Report", style_subtitle),
    ]

    time_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    header_right = [
        Paragraph(f"<b>Project:</b> {project_name}", style_meta_right),
        Paragraph(f"<b>Generated:</b> {time_str}", style_meta_right),
    ]

    header_table = Table([[header_left, header_right]], colWidths=[100 * mm, 70 * mm])
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    elements.append(header_table)
    elements.append(Spacer(1, 4 * mm))
    elements.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=colors.HexColor("#4f46e5"),
            spaceBefore=0,
            spaceAfter=6 * mm,
        )
    )

    # ── Executive Summary Metrics (Card Layout) ────────
    elements.append(Paragraph("Executive Summary", style_section))

    metrics_list = [
        ("Maintainability Index", f"{aggregate.get('mi', 0)}/100"),
        ("Cyclomatic Complexity", str(aggregate.get("cc", 0))),
        ("Lines of Code", f"{aggregate.get('loc', 0):,}"),
        ("Total Functions", f"{aggregate.get('functions', 0):,}"),
        (
            "Halstead Volume",
            f"{aggregate.get('halstead', {}).get('volume', 0):,.0f}",
        ),
    ]
    if debt_score is not None:
        metrics_list.append(("Tech Debt Score", f"{debt_score}/10"))

    # Render metrics in 2 side-by-side columns
    cards_data = []
    for i in range(0, len(metrics_list), 2):
        row = []
        # Metric 1
        m1_title, m1_val = metrics_list[i]
        c1 = [
            Paragraph(
                m1_title.upper(),
                ParagraphStyle(
                    "CardTitle",
                    fontSize=7.5,
                    textColor=colors.HexColor("#64748b"),
                    fontName="Helvetica-Bold",
                ),
            ),
            Spacer(1, 1 * mm),
            Paragraph(
                m1_val,
                ParagraphStyle(
                    "CardVal",
                    fontSize=13,
                    textColor=colors.HexColor("#0f172a"),
                    fontName="Helvetica-Bold",
                ),
            ),
        ]
        row.append(c1)

        # Metric 2 (if exists)
        if i + 1 < len(metrics_list):
            m2_title, m2_val = metrics_list[i + 1]
            c2 = [
                Paragraph(
                    m2_title.upper(),
                    ParagraphStyle(
                        "CardTitle",
                        fontSize=7.5,
                        textColor=colors.HexColor("#64748b"),
                        fontName="Helvetica-Bold",
                    ),
                ),
                Spacer(1, 1 * mm),
                Paragraph(
                    m2_val,
                    ParagraphStyle(
                        "CardVal",
                        fontSize=13,
                        textColor=colors.HexColor("#0f172a"),
                        fontName="Helvetica-Bold",
                    ),
                ),
            ]
            row.append(c2)
        else:
            row.append("")

        cards_data.append(row)

    metrics_table = Table(cards_data, colWidths=[82 * mm, 82 * mm])
    metrics_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    elements.append(metrics_table)
    elements.append(Spacer(1, 4 * mm))

    # ── ML Defect Prediction Banner ────────────────────
    if ml_prediction:
        risk = ml_prediction.get("risk_level", "Unknown")
        conf = ml_prediction.get("confidence", 0)

        badge_style = get_risk_badge(risk, style_td)

        ml_box_content = [
            [
                Paragraph("<b>ML Defect Risk Assessment:</b>", style_body),
                Paragraph(f"{risk}", badge_style),
                Paragraph(
                    f"Confidence: <b>{conf}%</b>", style_body
                ),
            ]
        ]
        ml_table = Table(ml_box_content, colWidths=[65 * mm, 30 * mm, 69 * mm])
        ml_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor("#f1f5f9"),
                    ),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        elements.append(ml_table)
        elements.append(Spacer(1, 4 * mm))

    # ── File Complexity Ranking ────────────────────────
    if files:
        elements.append(Paragraph("File Complexity Ranking", style_section))
        file_headers = [
            Paragraph("File Path", style_th),
            Paragraph("CC", style_th),
            Paragraph("MI", style_th),
            Paragraph("LOC", style_th),
            Paragraph("Risk", style_th),
        ]
        file_data = [file_headers]

        sorted_files = sorted(
            files, key=lambda x: x.get("cc", 0), reverse=True
        )
        for f in sorted_files:
            risk_val = f.get("risk", "Low")
            file_data.append(
                [
                    Paragraph(f.get("file_name", ""), style_td_bold),
                    Paragraph(str(f.get("cc", 0)), style_td),
                    Paragraph(str(f.get("mi", 0)), style_td),
                    Paragraph(str(f.get("loc", 0)), style_td),
                    Paragraph(risk_val, get_risk_badge(risk_val, style_td)),
                ]
            )

        file_table = Table(
            file_data, colWidths=[70 * mm, 20 * mm, 20 * mm, 22 * mm, 32 * mm]
        )
        file_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
                    (
                        "LINEBELOW",
                        (0, 0),
                        (-1, 0),
                        1,
                        colors.HexColor("#cbd5e1"),
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#fcfcfd")],
                    ),
                    (
                        "LINEBELOW",
                        (0, 1),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#f1f5f9"),
                    ),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        elements.append(file_table)
        elements.append(Spacer(1, 4 * mm))

    # ── Code Smells ────────────────────────────────────
    if smells:
        elements.append(Paragraph("Code Smells Detected", style_section))
        smell_headers = [
            Paragraph("Type", style_th),
            Paragraph("Severity", style_th),
            Paragraph("Message", style_th),
        ]
        smell_data = [smell_headers]

        for s in smells:
            sev = s.get("severity", "Low")
            smell_data.append(
                [
                    Paragraph(s.get("type", ""), style_td_bold),
                    Paragraph(sev, get_risk_badge(sev, style_td)),
                    Paragraph(s.get("message", ""), style_td),
                ]
            )

        smell_table = Table(
            smell_data, colWidths=[40 * mm, 30 * mm, 94 * mm]
        )
        smell_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
                    (
                        "LINEBELOW",
                        (0, 0),
                        (-1, 0),
                        1,
                        colors.HexColor("#cbd5e1"),
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#fcfcfd")],
                    ),
                    (
                        "LINEBELOW",
                        (0, 1),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#f1f5f9"),
                    ),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        elements.append(smell_table)
        elements.append(Spacer(1, 4 * mm))

    # ── AI Insights ────────────────────────────────────
    if ai_insights:
        elements.append(
            Paragraph("AI Refactor Recommendations", style_section)
        )

        insights_content = []
        risk_lvl = ai_insights.get("risk_level", "N/A")
        insights_content.append(
            Paragraph(f"<b>Overall Risk Level:</b> {risk_lvl}", style_body)
        )
        insights_content.append(
            Paragraph(
                f"<b>Root Cause:</b> {ai_insights.get('root_cause', 'N/A')}",
                style_body,
            )
        )

        refactoring = ai_insights.get("refactoring", [])
        if refactoring:
            insights_content.append(Spacer(1, 2 * mm))
            insights_content.append(
                Paragraph(
                    "<b>Refactoring Suggestions:</b>", style_td_bold
                )
            )
            for r in refactoring:
                insights_content.append(
                    Paragraph(f"• {r}", style_body)
                )

        architecture = ai_insights.get("architecture", [])
        if architecture:
            insights_content.append(Spacer(1, 2 * mm))
            insights_content.append(
                Paragraph(
                    "<b>Architecture Suggestions:</b>", style_td_bold
                )
            )
            for a in architecture:
                insights_content.append(
                    Paragraph(f"• {a}", style_body)
                )

        box_table = Table([[insights_content]], colWidths=[164 * mm])
        box_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor("#faf5ff"),
                    ),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e9d5ff")),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )
        elements.append(box_table)

    doc.build(elements, canvasmaker=NumberedCanvas)
    return buffer.getvalue()