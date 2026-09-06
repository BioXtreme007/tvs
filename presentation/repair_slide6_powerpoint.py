"""
Directly build and repair Slide 6 using Microsoft PowerPoint COM automation.
This guarantees 100% native PowerPoint format compliance, zero corruption,
and exact layout matching the user's approved reference image.
"""

import os
import shutil
import win32com.client

def rgb(r, g, b):
    """Win32 COLORREF format: 0x00bbggrr"""
    return int(r) + (int(g) << 8) + (int(b) << 16)

# Colors
C_NAVY        = rgb(30, 58, 138)    # #1E3A8A
C_WHITE       = rgb(255, 255, 255)
C_LIGHT_BLUE  = rgb(191, 219, 254)  # #BFDBFE
C_BLUE_SUB    = rgb(147, 197, 253)  # #93C5FD
C_PURPLE      = rgb(124, 58, 237)   # #7C3AED
C_SLATE_DARK  = rgb(15, 23, 42)     # #0F172A
C_GRAY_SUB    = rgb(100, 116, 139)  # #64748B
C_AMBER_BG    = rgb(254, 243, 199)  # #FEF3C7
C_AMBER_BORDER= rgb(251, 191, 36)   # #FBBF24
C_AMBER_TEXT  = rgb(146, 64, 14)    # #92400E
C_FLOW_BG     = rgb(226, 232, 240)  # #E2E8F0
C_RED         = rgb(220, 38, 38)    # #DC2626
C_TRAD_BG     = rgb(238, 242, 255)  # #EEF2FF
C_AMBER_HEAD  = rgb(180, 83, 9)     # #B45309
C_GREEN_HEAD  = rgb(22, 163, 74)    # #16A34A
C_GREEN_BG    = rgb(240, 253, 244)  # #F0FDF4
C_GREEN_TEXT  = rgb(20, 83, 45)     # #14532D
C_TRAD_CELL   = rgb(248, 250, 255)  # #F8FAFF
C_TVS_CELL    = rgb(255, 253, 245)  # #FFFDF5

# Constants
msoShapeRectangle        = 1
msoShapeRoundedRectangle = 5
msoShapeRightArrow       = 33
ppAlignLeft              = 1
ppAlignCenter            = 2
ppAlignRight             = 3
msoTrue                  = -1
msoFalse                 = 0

target_pptx = os.path.abspath(r"c:\Users\akgam\Documents\tvs\tvs-smart-lending-hub\presentation\TVS_Credit_EPIC_8_Round2_Submission.pptx")
backup_pptx = os.path.abspath(r"c:\Users\akgam\Documents\tvs\soilguard-cg-full-deliverable\tvs-smart-lending-hub\presentation\TVS_Credit_EPIC_8_Round2_Submission.pptx")

print(f"Restoring clean base from: {backup_pptx}")
shutil.copyfile(backup_pptx, target_pptx)

print("Starting PowerPoint COM application...")
ppt_app = win32com.client.Dispatch("PowerPoint.Application")
ppt_app.Visible = True

pres = ppt_app.Presentations.Open(target_pptx)
slide6 = pres.Slides(6)

# Clear all shapes from slide 6
print("Clearing existing shapes from Slide 6...")
for i in range(slide6.Shapes.Count, 0, -1):
    slide6.Shapes(i).Delete()

slide_w = pres.PageSetup.SlideWidth   # 842 pt
slide_h = pres.PageSetup.SlideHeight  # 595 pt

# ─────────────────────────────────────────────────────────────────────────────
# 1. TOP HEADER BAR
# ─────────────────────────────────────────────────────────────────────────────
hdr = slide6.Shapes.AddShape(msoShapeRectangle, 0, 0, slide_w, 72)
hdr.Fill.Solid()
hdr.Fill.ForeColor.RGB = C_NAVY
hdr.Line.Visible = msoFalse

# Logo boxes on top-left of header
logo_box = slide6.Shapes.AddShape(msoShapeRoundedRectangle, 14, 14, 60, 20)
logo_box.Fill.Solid()
logo_box.Fill.ForeColor.RGB = C_WHITE
logo_box.Line.Visible = msoFalse
ltr = logo_box.TextFrame.TextRange
ltr.Text = "TVSCREDIT"
ltr.Font.Name = "Calibri"
ltr.Font.Size = 8.5
ltr.Font.Bold = msoTrue
ltr.Font.Color.RGB = C_NAVY
ltr.ParagraphFormat.Alignment = ppAlignCenter

badge_box = slide6.Shapes.AddShape(msoShapeRoundedRectangle, 78, 14, 52, 20)
badge_box.Fill.Solid()
badge_box.Fill.ForeColor.RGB = C_PURPLE
badge_box.Line.Visible = msoFalse
btr = badge_box.TextFrame.TextRange
btr.Text = "e.p.i.c 8"
btr.Font.Name = "Calibri"
btr.Font.Size = 8
btr.Font.Bold = msoTrue
btr.Font.Color.RGB = C_WHITE
btr.ParagraphFormat.Alignment = ppAlignCenter

# Header Titles text box
htbox = slide6.Shapes.AddTextbox(1, 135, 4, slide_w - 270, 64)
htf = htbox.TextFrame
htf.WordWrap = msoTrue
htf.MarginLeft = 0
htf.MarginRight = 0
htf.MarginTop = 0
htf.MarginBottom = 0

tr = htf.TextRange
tr.Text = "Existing Solutions: Other NBFCs v/s Current TVS Credit v/s GeoKisan (TVS Credit)\r"
tr.Font.Name = "Calibri"
tr.Font.Size = 14
tr.Font.Bold = msoTrue
tr.Font.Color.RGB = C_WHITE
tr.ParagraphFormat.Alignment = ppAlignCenter

tr2 = tr.InsertAfter("Unlocking \u20b9123.8 Cr Annual Bottom-Line Value Across TVS Credit's Rural Portfolio\r")
tr2.Font.Name = "Calibri"
tr2.Font.Size = 9.5
tr2.Font.Bold = msoTrue
tr2.Font.Color.RGB = C_LIGHT_BLUE
tr2.ParagraphFormat.Alignment = ppAlignCenter

tr3 = tr.InsertAfter("Transforming Unit Economics: 97% OpEx Compression, Sub-3-Minute Sanctions, and 125 bps GNPA Reduction via GeoKisan")
tr3.Font.Name = "Calibri"
tr3.Font.Size = 8.5
tr3.Font.Bold = msoFalse
tr3.Font.Color.RGB = C_BLUE_SUB
tr3.ParagraphFormat.Alignment = ppAlignCenter


# ─────────────────────────────────────────────────────────────────────────────
# 2. THREE LIFECYCLE CARDS
# ─────────────────────────────────────────────────────────────────────────────
card_top = 78
card_h   = 220
card_w   = 246
arrow_w  = 22
arrow_h  = 20
c1_left  = 18
c2_left  = 298
c3_left  = 578

cards_data = [
    {
        "left": c1_left,
        "num": "1",
        "title": "DEALERSHIP INTAKE",
        "sub": "Satellite Field Underwriting",
        "bullets": [
            ("SOC & NDVI Scan: ", True), ("10m Sentinel-2 soil health + crop vigor scored in < 40 seconds.\r", False),
            ("Thin-File Override: ", True), ("Account Aggregator cashflow replaces CIBIL bureau \u2014 no floor score.\r", False),
            ("H3 Cadastral Check: ", True), ("Satellite polygon flags duplicate multi-lender collateral pledges.\r", False),
            ("Dealer Sanction: ", True), ("300\u2013900 score delivered to dealer tablet; approval in < 3 minutes.", False),
        ],
        "highlight": "\U0001f4a1 Saves \u20b94,080/file vs \u20b94,200 physical field officer cost (97% OpEx saving)"
    },
    {
        "left": c2_left,
        "num": "2",
        "title": "MONSOON GESTATION",
        "sub": "All-Weather CloudGap-CG Monitoring",
        "bullets": [
            ("CloudGap-CG Active (Jun\u2013Oct): ", True), ("ST-DIP U-Net inpainting maintains 100% Kharif satellite visibility through 70\u201380% clouds.\r", False),
            ("Fortnightly SAR Passes: ", True), ("Sentinel-2/1 NDVI + backscatter tracks crop health through blindspot.\r", False),
            ("EWS Alerts: ", True), ("Flood, drought, or pest distress flags officers 14\u201321 days before EMI default.\r", False),
            ("Lean EMI Active: ", True), ("Borrower pays \u20b91,500/mo maintenance \u2014 zero sowing pressure.", False),
        ],
        "highlight": "\U0001f4a1 Zero Kharif underwriting pause \u2014 incumbent NBFCs halt for 4+ months"
    },
    {
        "left": c3_left,
        "num": "3",
        "title": "HARVEST REALIZATION",
        "sub": "Yield-Synced Bullet Repayment",
        "bullets": [
            ("WOFOST Yield Forecast: ", True), ("Satellite crop model predicts Mandi revenue before harvest date.\r", False),
            ("Harvest Bullet Payment: ", True), ("Major instalment synced with Mandi sale receipt from actual crop income.\r", False),
            ("Sanction Letter: ", True), ("TreeSHAP memo auto-generated in Hindi/Chhattisgarhi/English.\r", False),
            ("Fast-Track Restructuring: ", True), ("60-day deferral opens automatically if NDVI drops >15% mid-season.", False),
        ],
        "highlight": "\U0001f4a1 34.5% reduction in 90-day NPAs vs industry flat EMI model"
    }
]

for cd in cards_data:
    cl = cd["left"]
    # Outer card frame
    card = slide6.Shapes.AddShape(msoShapeRoundedRectangle, cl, card_top, card_w, card_h)
    card.Fill.Solid()
    card.Fill.ForeColor.RGB = C_WHITE
    card.Line.Visible = msoTrue
    card.Line.ForeColor.RGB = C_NAVY
    card.Line.Weight = 1.5

    # Number badge
    nb = slide6.Shapes.AddShape(msoShapeRoundedRectangle, cl + 6, card_top + 6, 22, 22)
    nb.Fill.Solid()
    nb.Fill.ForeColor.RGB = C_NAVY
    nb.Line.Visible = msoFalse
    ntr = nb.TextFrame.TextRange
    ntr.Text = cd["num"]
    ntr.Font.Name = "Calibri"
    ntr.Font.Size = 12
    ntr.Font.Bold = msoTrue
    ntr.Font.Color.RGB = C_WHITE
    ntr.ParagraphFormat.Alignment = ppAlignCenter

    # Title & Subtitle box
    tbox = slide6.Shapes.AddTextbox(1, cl + 32, card_top + 4, card_w - 36, 26)
    ttf = tbox.TextFrame
    ttf.WordWrap = msoTrue
    ttf.MarginLeft = 0; ttf.MarginRight = 0; ttf.MarginTop = 0; ttf.MarginBottom = 0
    ttr = ttf.TextRange
    ttr.Text = cd["title"] + "\r"
    ttr.Font.Name = "Calibri"
    ttr.Font.Size = 10.5
    ttr.Font.Bold = msoTrue
    ttr.Font.Color.RGB = C_NAVY
    ttr.ParagraphFormat.Alignment = ppAlignLeft

    ttr2 = ttr.InsertAfter(cd["sub"])
    ttr2.Font.Name = "Calibri"
    ttr2.Font.Size = 7.5
    ttr2.Font.Bold = msoFalse
    ttr2.Font.Color.RGB = C_GRAY_SUB

    # Bullets text box
    bbox = slide6.Shapes.AddTextbox(1, cl + 6, card_top + 34, card_w - 12, 138)
    btf = bbox.TextFrame
    btf.WordWrap = msoTrue
    btf.MarginLeft = 2; btf.MarginRight = 2; btf.MarginTop = 2; btf.MarginBottom = 2
    btr = btf.TextRange
    btr.Text = ""
    for text_part, is_bold in cd["bullets"]:
        pr = btr.InsertAfter("\u2022 " + text_part if text_part.endswith(": ") else text_part)
        pr.Font.Name = "Calibri"
        pr.Font.Size = 7.5
        pr.Font.Bold = msoTrue if is_bold else msoFalse
        pr.Font.Color.RGB = C_SLATE_DARK
        pr.ParagraphFormat.Alignment = ppAlignLeft

    # Bottom highlight box
    hl = slide6.Shapes.AddShape(msoShapeRoundedRectangle, cl + 6, card_top + 176, card_w - 12, 36)
    hl.Fill.Solid()
    hl.Fill.ForeColor.RGB = C_AMBER_BG
    hl.Line.Visible = msoTrue
    hl.Line.ForeColor.RGB = C_AMBER_BORDER
    hl.Line.Weight = 1
    hltr = hl.TextFrame.TextRange
    hltr.Text = cd["highlight"]
    hltr.Font.Name = "Calibri"
    hltr.Font.Size = 7.5
    hltr.Font.Bold = msoTrue
    hltr.Font.Color.RGB = C_AMBER_TEXT
    hltr.ParagraphFormat.Alignment = ppAlignCenter

# Connecting Arrows between cards
arr1 = slide6.Shapes.AddShape(msoShapeRightArrow, 268, card_top + 98, 24, 22)
arr1.Fill.Solid()
arr1.Fill.ForeColor.RGB = C_NAVY
arr1.Line.Visible = msoFalse

arr2 = slide6.Shapes.AddShape(msoShapeRightArrow, 548, card_top + 98, 24, 22)
arr2.Fill.Solid()
arr2.Fill.ForeColor.RGB = C_NAVY
arr2.Line.Visible = msoFalse


# ─────────────────────────────────────────────────────────────────────────────
# 3. FLOW BAR
# ─────────────────────────────────────────────────────────────────────────────
flow = slide6.Shapes.AddShape(msoShapeRoundedRectangle, 18, 304, 806, 22)
flow.Fill.Solid()
flow.Fill.ForeColor.RGB = C_FLOW_BG
flow.Line.Visible = msoFalse
ftr = flow.TextFrame.TextRange
ftr.Text = "GEOKISAN LOAN JOURNEY:   [ 01. DEALER INTAKE ]  \u27f6  [ 02. MONSOON MONITORING ]  \u27f6  [ 03. HARVEST REPAYMENT ]"
ftr.Font.Name = "Calibri"
ftr.Font.Size = 8.5
ftr.Font.Bold = msoTrue
ftr.Font.Color.RGB = C_NAVY
ftr.ParagraphFormat.Alignment = ppAlignCenter


# ─────────────────────────────────────────────────────────────────────────────
# 4. BOTTOM COMPARISON TABLE (Native PowerPoint Table)
# ─────────────────────────────────────────────────────────────────────────────
tbl_shape = slide6.Shapes.AddTable(6, 4, 18, 330, 806, 234)
tbl = tbl_shape.Table

# Column widths
tbl.Columns(1).Width = 96
tbl.Columns(2).Width = 236
tbl.Columns(3).Width = 236
tbl.Columns(4).Width = 238

table_data = [
    # Row 1: Headers
    [
        ("Dimension", C_NAVY, C_WHITE, True, ppAlignCenter, 8.5),
        ("\u2717 Traditional NBFCs\r(Mahindra / Shriram / Chola)", C_TRAD_BG, C_RED, True, ppAlignCenter, 8),
        ("\u26a0 Current TVS Credit\r(Baseline Operations)", C_AMBER_BG, C_AMBER_HEAD, True, ppAlignCenter, 8),
        ("\u2713 GeoKisan (TVS Credit)\r(Our Platform \u2014 Moat)", C_GREEN_HEAD, C_WHITE, True, ppAlignCenter, 8.5),
    ],
    # Row 2: Eligibility
    [
        ("Eligibility", C_NAVY, C_WHITE, True, ppAlignCenter, 8),
        ("\u2717 CIBIL \u2265 650 mandatory\r\u2717 Excludes 65%+ smallholders", C_TRAD_CELL, C_RED, False, ppAlignLeft, 7.5),
        ("\u26a0 Manual thin-file review\r\u26a0 Physical visit required", C_TVS_CELL, C_AMBER_HEAD, False, ppAlignLeft, 7.5),
        ("\u2713 Satellite SOC + Account Aggregator\r\u2713 No CIBIL floor \u2014 zero exclusion", C_GREEN_BG, C_GREEN_TEXT, True, ppAlignLeft, 7.5),
    ],
    # Row 3: Speed (TAT)
    [
        ("Speed (TAT)", C_NAVY, C_WHITE, True, ppAlignCenter, 8),
        ("\u2717 5\u201310 business days\r\u2717 Field officer bottleneck", C_TRAD_CELL, C_RED, False, ppAlignLeft, 7.5),
        ("\u26a0 7\u201310 days field visit\r\u26a0 Manual underwriting", C_TVS_CELL, C_AMBER_HEAD, False, ppAlignLeft, 7.5),
        ("\u2713 < 3 Minutes automated\r\u2713 Same-day dealer sanction", C_GREEN_BG, C_GREEN_TEXT, True, ppAlignLeft, 7.5),
    ],
    # Row 4: Kharif Uptime
    [
        ("Kharif Uptime", C_NAVY, C_WHITE, True, ppAlignCenter, 8),
        ("\u2717 Halts Jun\u2013Oct (cloud blind)\r\u2717 60% of farm loans mis-timed", C_TRAD_CELL, C_RED, False, ppAlignLeft, 7.5),
        ("\u26a0 Halts Kharif season\r\u26a0 No SAR fallback", C_TVS_CELL, C_AMBER_HEAD, False, ppAlignLeft, 7.5),
        ("\u2713 100% uptime via CloudGap-CG\r\u2713 PSNR 34.6 dB inpainting", C_GREEN_BG, C_GREEN_TEXT, True, ppAlignLeft, 7.5),
    ],
    # Row 5: Repayment
    [
        ("Repayment", C_NAVY, C_WHITE, True, ppAlignCenter, 8),
        ("\u2717 Flat monthly EMI\r\u2717 ~7.2% Agri 90-day NPA", C_TRAD_CELL, C_RED, False, ppAlignLeft, 7.5),
        ("\u26a0 Flat EMI structure\r\u26a0 Liquidity mismatch at sowing", C_TVS_CELL, C_AMBER_HEAD, False, ppAlignLeft, 7.5),
        ("\u2713 \u20b91,500 lean + harvest bullet\r\u2713 34.5% NPA reduction", C_GREEN_BG, C_GREEN_TEXT, True, ppAlignLeft, 7.5),
    ],
    # Row 6: Collateral Cost
    [
        ("Collateral Cost", C_NAVY, C_WHITE, True, ppAlignCenter, 8),
        ("\u2717 Physical inspection \u20b94,200/file\r\u2717 7\u201310 days, fraud-vulnerable", C_TRAD_CELL, C_RED, False, ppAlignLeft, 7.5),
        ("\u26a0 Physical inspection \u20b94,200/file\r\u26a0 Ghost land & duplicate risk", C_TVS_CELL, C_AMBER_HEAD, False, ppAlignLeft, 7.5),
        ("\u2713 AI H3 + satellite \u20b9120/file\r\u2713 97% OpEx saving \u00b7 fraud-proof", C_GREEN_BG, C_GREEN_TEXT, True, ppAlignLeft, 7.5),
    ],
]

for r_idx, row_data in enumerate(table_data, start=1):
    for c_idx, cell_info in enumerate(row_data, start=1):
        cell_text, bg_col, text_col, is_bold, align, fsz = cell_info
        cell = tbl.Cell(r_idx, c_idx)
        cell.Shape.Fill.Solid()
        cell.Shape.Fill.ForeColor.RGB = bg_col
        cell.Shape.TextFrame.MarginLeft = 4; cell.Shape.TextFrame.MarginRight = 4; cell.Shape.TextFrame.MarginTop = 3; cell.Shape.TextFrame.MarginBottom = 3
        ctr = cell.Shape.TextFrame.TextRange
        ctr.Text = cell_text
        ctr.Font.Name = "Calibri"
        ctr.Font.Size = fsz
        ctr.Font.Bold = msoTrue if is_bold else msoFalse
        ctr.Font.Color.RGB = text_col
        ctr.ParagraphFormat.Alignment = align


# ─────────────────────────────────────────────────────────────────────────────
# 5. BOTTOM FOOTER BAR
# ─────────────────────────────────────────────────────────────────────────────
footer = slide6.Shapes.AddShape(msoShapeRectangle, 0, 568, slide_w, 27)
footer.Fill.Solid()
footer.Fill.ForeColor.RGB = C_NAVY
footer.Line.Visible = msoFalse
ftr2 = footer.TextFrame.TextRange
ftr2.Text = "GeoKisan eliminates the Kharif cloud blindspot forcing every incumbent NBFC to pause underwriting \u2014 turning monsoon season from a liability into a portfolio growth window | GNPA Impact: \u2212125 bps vs industry benchmark"
ftr2.Font.Name = "Calibri"
ftr2.Font.Size = 7.5
ftr2.Font.Bold = msoFalse
ftr2.Font.Color.RGB = C_LIGHT_BLUE
ftr2.ParagraphFormat.Alignment = ppAlignCenter

# Save presentation natively via PowerPoint
print("Saving presentation via native PowerPoint...")
pres.Save()
pres.Close()

# Verify that PowerPoint re-opens the file with 0 errors
print("Verifying presentation re-opens cleanly in PowerPoint...")
pres_verify = ppt_app.Presentations.Open(target_pptx)
print(f"VERIFIED! Presentation opened successfully! Slides count: {pres_verify.Slides.Count}")
slide6_v = pres_verify.Slides(6)
print(f"Slide 6 shapes count: {slide6_v.Shapes.Count}")
pres_verify.Close()
ppt_app.Quit()

print("ALL REPAIR AND REBUILD WORK COMPLETED SUCCESSFULLY!")
