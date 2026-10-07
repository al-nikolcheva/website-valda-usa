#!/usr/bin/env python3
"""Build the VALDA master brand folder (VALDA-Master/).

Generates every logo variant (SVG, EPS, PDF, PNG), the colours & fonts sheet,
and the brand guidelines PDF, then copies in the catalogues and films from
public/. Re-run any time the logo or palette changes:

    pip install cairosvg reportlab pillow
    python3 scripts/build-master-folder.py          # build the folder
    python3 scripts/build-master-folder.py --zip    # also write VALDA-Master.zip

Logo artwork sources:
  icon      -> src/components/logo.tsx (the <Logo> paths)
  wordmark  -> scripts/brand/valda-wordmark.svg
"""

import io
import re
import shutil
import sys
import zipfile
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "VALDA-Master"
FONTS = OUT / "02-Colours-and-Fonts" / "Fonts"

# ---------------------------------------------------------------- palette
# Pantone / CMYK are nearest matches for briefing printers; confirm against
# a physical swatch book before a print run.
PALETTE = [
    # name, hex, role, pantone, cmyk
    ("VALDA Ink", "#222224", "Primary. Logo, headlines, body text, dark panels", "Neutral Black C", "0 0 0 95"),
    ("VALDA Blue", "#1F4E8C", "Accent. Links, highlights, the icon in the colour logo", "7686 C", "100 70 10 5"),
    ("Blue Bright", "#3A6DBA", "Accent on dark backgrounds, hover states", "7683 C", "80 50 0 0"),
    ("Champagne", "#A6A182", "Secondary accent, used sparingly", "7536 C", "15 15 35 25"),
    ("Slate", "#6F6F72", "Secondary text, captions", "Cool Gray 9 C", "0 0 0 65"),
    ("Mute", "#A3A3A5", "Labels, markers, inactive states", "Cool Gray 6 C", "0 0 0 40"),
    ("Mist", "#E3E3E3", "Hairlines, borders, dividers", "Cool Gray 1 C", "0 0 0 12"),
    ("Paper", "#F4F4F4", "Light section backgrounds", "-- (tint, not a spot colour)", "0 0 0 4"),
    ("White", "#FFFFFF", "Page background, logo on dark", "--", "0 0 0 0"),
]
INK, BLUE = "#222224", "#1F4E8C"

# Logo colourways: (icon colour, wordmark colour)
COLOURWAYS = {
    "colour": (BLUE, INK),
    "black": ("#000000", "#000000"),
    "white": ("#FFFFFF", "#FFFFFF"),
}


# ---------------------------------------------------------------- artwork
def icon_paths():
    src = (ROOT / "src/components/logo.tsx").read_text()
    block = src.split("export function Logo")[1].split("</svg>")[0]
    return re.findall(r'<path d="([^"]+)"', block)


def wordmark():
    svg = (ROOT / "scripts/brand/valda-wordmark.svg").read_text()
    w, h = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups())
    return re.search(r'<path d="([^"]+)"', svg).group(1), w, h


def bbox(paths, view=(0, 0, 200, 200), scale=10):
    """Tight bounding box of filled paths, measured by rasterising."""
    x, y, w, h = view
    body = "".join(f'<path d="{d}"/>' for d in paths)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}">{body}</svg>'
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=int(w * scale))
    l, t, r, b = Image.open(io.BytesIO(png)).getchannel("A").getbbox()
    return x + l / scale, y + t / scale, (r - l) / scale, (b - t) / scale


ICON = icon_paths()
IX, IY, IW, IH = bbox(ICON)
WM, WW, WH = wordmark()


def group(paths, colour, x, y, s):
    body = "".join(f'<path d="{d}"/>' for d in paths)
    return f'<g fill="{colour}" transform="translate({x:.3f} {y:.3f}) scale({s:.6f})">{body}</g>'


def layout(kind, icon_c, word_c):
    """Return (svg_body, width, height) for a lockup, in a 1000-unit space."""
    if kind == "icon":
        s = 1000 / IW
        return group(ICON, icon_c, -IX * s, -IY * s, s), 1000, IH * s
    if kind == "wordmark":
        s = 1000 / WW
        return group([WM], word_c, 0, 0, s), 1000, WH * s
    if kind == "stacked":
        # Proportions measured from the master stacked logo (valda-logo-dark.png):
        # wordmark as wide as the icon, gap = 14.4% of icon height.
        si = 1000 / IW
        ih = IH * si
        gap = ih * 0.144
        sw = 1000 / WW
        body = group(ICON, icon_c, -IX * si, -IY * si, si) + group([WM], word_c, 0, ih + gap, sw)
        return body, 1000, ih + gap + WH * sw
    if kind == "horizontal":
        ih = 1000
        si = ih / IH
        iw = IW * si
        wh = ih * 0.40
        sw = wh / WH
        gap = ih * 0.28
        body = group(ICON, icon_c, -IX * si, -IY * si, si) + group([WM], word_c, iw + gap, (ih - wh) / 2, sw)
        return body, iw + gap + WW * sw, ih
    raise ValueError(kind)


def svg_doc(body, w, h, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
        f'width="{w:.2f}" height="{h:.2f}">\n  <title>{title}</title>\n  {body}\n</svg>\n'
    )


# ---------------------------------------------------------------- logos
LOCKUPS = {
    "stacked": "Primary logo. Icon above wordmark",
    "horizontal": "Horizontal lockup. Headers, footers, letterheads",
    "icon": "Icon only. Favicons, social avatars, small spaces",
    "wordmark": "Wordmark only. When the icon is already present",
}


def build_logos():
    base = OUT / "01-Logo"
    for fmt in ("SVG", "EPS", "PDF", "PNG"):
        (base / fmt).mkdir(parents=True, exist_ok=True)
    for kind in LOCKUPS:
        for cw, (ic, wc) in COLOURWAYS.items():
            body, w, h = layout(kind, ic, wc)
            name = f"VALDA-logo-{kind}-{cw}"
            svg = svg_doc(body, w, h, f"VALDA logo, {kind}, {cw}").encode()
            (base / "SVG" / f"{name}.svg").write_bytes(svg)
            # Vector print formats sized to ~100 mm wide (scales losslessly).
            pt = 283.46 / w
            cairosvg.svg2eps(bytestring=svg, write_to=str(base / "EPS" / f"{name}.eps"), scale=pt)
            cairosvg.svg2pdf(bytestring=svg, write_to=str(base / "PDF" / f"{name}.pdf"), scale=pt)
            # Transparent PNGs at two sizes.
            for px in (2000, 500):
                width = px if w >= h else round(px * w / h)
                cairosvg.svg2png(
                    bytestring=svg, write_to=str(base / "PNG" / f"{name}-{px}px.png"), output_width=width
                )
    # Favicon / app icon set (ink icon on white, square).
    fav = base / "Favicon"
    fav.mkdir(exist_ok=True)
    body, w, h = layout("icon", INK, INK)
    pad, side = 140, 1000 + 280
    sq = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}">'
        f'<rect width="{side}" height="{side}" fill="#FFFFFF"/>'
        f'<g transform="translate({pad} {(side - h) / 2:.2f})">{body}</g></svg>'
    ).encode()
    (fav / "VALDA-app-icon.svg").write_bytes(sq)
    for px in (512, 192, 180, 32):
        cairosvg.svg2png(bytestring=sq, write_to=str(fav / f"VALDA-app-icon-{px}.png"), output_width=px)
    ico_src = Image.open(fav / "VALDA-app-icon-512.png")
    ico_src.save(fav / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])


# ---------------------------------------------------------------- fonts & PDFs
def register_fonts():
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    for name in ("Thin", "Light", "LightItalic", "Regular", "Medium", "SemiBold", "Bold"):
        pdfmetrics.registerFont(TTFont(f"Inter-{name}", str(FONTS / "Inter" / f"Inter-{name}.ttf")))


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def logo_png(kind, cw, width_px):
    body, w, h = layout(kind, *COLOURWAYS[cw])
    svg = svg_doc(body, w, h, "").encode()
    from reportlab.lib.utils import ImageReader

    return ImageReader(io.BytesIO(cairosvg.svg2png(bytestring=svg, output_width=width_px))), w / h


class Deck:
    """Landscape A4 pages in the catalogue's style: paper ground, Inter, wide margins."""

    def __init__(self, path, title):
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.pdfgen import canvas

        path.parent.mkdir(parents=True, exist_ok=True)
        self.W, self.H = landscape(A4)
        self.c = canvas.Canvas(str(path), pagesize=(self.W, self.H))
        self.c.setTitle(title)
        self.c.setAuthor("VALDA")
        self.title = title
        self.page = 0
        self.M = 48

    def colour(self, hx, fill=True):
        r, g, b = (v / 255 for v in hex_rgb(hx))
        (self.c.setFillColorRGB if fill else self.c.setStrokeColorRGB)(r, g, b)

    def new(self, bg="#F2F1EC", footer=True):
        if self.page:
            self.c.showPage()
        self.page += 1
        self.colour(bg)
        self.c.rect(0, 0, self.W, self.H, stroke=0, fill=1)
        if footer:
            self.colour("#E3E3E3", fill=False)
            self.c.setLineWidth(0.5)
            self.c.line(self.M, 34, self.W - self.M, 34)
            self.text(self.M, 22, self.title.upper(), 6.5, "Inter-Medium", "#6F6F72", spacing=2)
            self.text(self.W - self.M, 22, f"{self.page:02d}", 6.5, "Inter-Medium", BLUE, align="right")

    def text(self, x, y, s, size, font="Inter-Regular", colour=INK, align="left", spacing=0):
        from reportlab.pdfbase.pdfmetrics import stringWidth

        self.colour(colour)
        width = stringWidth(s, font, size) + spacing * max(len(s) - 1, 0)
        x -= {"left": 0, "right": width, "center": width / 2}[align]
        # Text objects keep character spacing local, so it never leaks into later text.
        t = self.c.beginText(x, y)
        t.setFont(font, size)
        t.setCharSpace(spacing)
        t.textOut(s)
        self.c.drawText(t)

    def para(self, x, y, s, width, size=9.5, leading=14, font="Inter-Regular", colour="#6F6F72"):
        from reportlab.pdfbase.pdfmetrics import stringWidth

        for block in s.split("\n"):
            line = ""
            for word in block.split():
                trial = f"{line} {word}".strip()
                if stringWidth(trial, font, size) > width:
                    self.text(x, y, line, size, font, colour)
                    y -= leading
                    line = word
                else:
                    line = trial
            if line:
                self.text(x, y, line, size, font, colour)
                y -= leading
        return y

    def eyebrow(self, x, y, s, colour=BLUE):
        self.text(x, y, s.upper(), 7.5, "Inter-SemiBold", colour, spacing=2.4)

    def heading(self, x, y, s, size=34, colour=INK):
        for i, line in enumerate(s.split("\n")):
            self.text(x, y - i * size * 1.08, line, size, "Inter-Light", colour)

    def logo(self, kind, cw, x, y, width):
        img, ratio = logo_png(kind, cw, int(width * 6))
        self.c.drawImage(img, x, y, width, width / ratio, mask="auto")
        return width / ratio

    def save(self):
        self.c.save()


def build_colours_sheet():
    d = Deck(OUT / "02-Colours-and-Fonts" / "VALDA-Colours-and-Fonts.pdf", "VALDA - Colours and fonts")
    d.new()
    M = d.M
    d.eyebrow(M, d.H - 70, "Brand colours")
    d.heading(M, d.H - 110, "Colour palette", 30)
    cols, sw_w, sw_h, gap = 5, (d.W - 2 * M - 4 * 14) / 5, 70, 14
    for i, (name, hx, role, pms, cmyk) in enumerate(PALETTE):
        col, row = i % cols, i // cols
        x = M + col * (sw_w + gap)
        y = d.H - 220 - row * 185
        d.colour(hx)
        d.colour("#E3E3E3", fill=False)
        d.c.setLineWidth(0.5)
        d.c.rect(x, y, sw_w, sw_h, stroke=1 if hx in ("#FFFFFF", "#F4F4F4") else 0, fill=1)
        r, g, b = hex_rgb(hx)
        d.text(x, y - 16, name, 10, "Inter-Medium")
        d.text(x, y - 30, f"HEX  {hx}", 7.5, "Inter-Regular", "#6F6F72")
        d.text(x, y - 41, f"RGB  {r} {g} {b}", 7.5, "Inter-Regular", "#6F6F72")
        d.text(x, y - 52, f"CMYK  {cmyk}", 7.5, "Inter-Regular", "#6F6F72")
        d.text(x, y - 63, f"Pantone  {pms}", 7.5, "Inter-Regular", "#6F6F72")
        d.para(x, y - 78, role, sw_w - 4, 7, 9.5, "Inter-Regular", "#A3A3A5")
    d.para(
        M, 52,
        "Pantone and CMYK values are the nearest matches to the screen colours. Confirm against a printed "
        "swatch book before a print run.",
        d.W - 2 * M, 7, 9, "Inter-LightItalic", "#6F6F72",
    )

    d.new()
    d.eyebrow(M, d.H - 70, "Brand fonts")
    d.heading(M, d.H - 110, "Typography", 30)
    rows = [
        ("Inter Tight", "Website. Every heading and body style on valdausa.com.",
         "Weights: Regular 400, Medium 500, SemiBold 600, Bold 700", "Inter-Medium"),
        ("Inter", "Print. Catalogues, datasheets, presentations, documents.",
         "Weights: Thin, Light (headlines), Regular (body), Medium / SemiBold (labels)", "Inter-Light"),
        ("Logo wordmark", "Custom drawn artwork. Never retype VALDA in a font, always use the logo files.",
         "Supplied as outlines in 01-Logo", "Inter-Bold"),
    ]
    y = d.H - 175
    for name, use, weights, font in rows:
        d.text(M, y, name, 30, font)
        d.text(M + 330, y + 16, use, 9.5, "Inter-Regular", INK)
        d.text(M + 330, y + 2, weights, 8.5, "Inter-Regular", "#6F6F72")
        d.colour("#E3E3E3", fill=False)
        d.c.line(M, y - 22, d.W - M, y - 22)
        y -= 78
    d.para(
        M, y - 6,
        "Both families are free and open source (SIL Open Font License), so they can be installed on any computer "
        "and shared with printers and agencies. Font files are in the Fonts folder, or download them from "
        "fonts.google.com/specimen/Inter and fonts.google.com/specimen/Inter+Tight.\n"
        "Fallback when the fonts are not available (Word, email): Arial or Helvetica.",
        d.W - 2 * M, 9.5, 14,
    )
    d.save()


def build_guidelines():
    d = Deck(OUT / "04-Brand-Guidelines" / "VALDA-Brand-Guidelines.pdf", "VALDA - Brand guidelines 2026")
    M, W, H = d.M, d.W, d.H

    # Cover
    d.new(bg="#0A1123", footer=False)
    d.logo("stacked", "white", M + 10, H - 170, 95)
    d.eyebrow(M + 10, 175, "VALDA Group · Engineered in Europe", "#A3A3A5")
    d.heading(M + 10, 130, "Brand guidelines", 46, "#FFFFFF")
    d.text(M + 10, 60, "LOGO · COLOUR · TYPOGRAPHY · IMAGERY · VOICE   ·   2026", 7.5, "Inter-Medium", "#A3A3A5", spacing=1.6)

    # Contents
    d.new()
    d.eyebrow(M, H - 70, "Contents")
    d.heading(M, H - 110, "One brand, used the same way\neverywhere.", 30)
    items = ["The logo", "Logo versions", "Clear space and minimum size", "Logo on backgrounds",
             "Logo don'ts", "Colour", "Typography", "Imagery", "Tone of voice", "Files in this folder"]
    for i, it in enumerate(items):
        x = M + (i // 5) * 260
        y = H - 230 - (i % 5) * 34
        d.text(x, y, f"{i + 1:02d}", 8, "Inter-Medium", BLUE)
        d.text(x + 26, y, it, 13, "Inter-Light")

    # 01 The logo
    d.new()
    d.eyebrow(M, H - 70, "01 The logo")
    d.heading(M, H - 110, "Protect, provide,\nsee through.", 30)
    d.para(
        M, H - 200,
        "The VALDA mark is two open hands sheltering a four-pane window. It says what we do in one picture: we "
        "make the windows, doors and facades that protect a building and the people inside it.\n"
        "The logo is a single piece of artwork. Always use the supplied files. Never redraw it, retype the "
        "wordmark, or rebuild it from parts.",
        300,
    )
    d.colour("#FFFFFF")
    d.c.rect(W / 2, 70, W / 2 - M, H - 140, stroke=0, fill=1)
    d.logo("stacked", "colour", W * 0.75 - 90, H / 2 - 95, 180)

    # 02 Versions
    d.new()
    d.eyebrow(M, H - 70, "02 Logo versions")
    d.heading(M, H - 110, "Four lockups, three colourways", 30)
    cells = [("stacked", "Primary", 90), ("horizontal", "Horizontal", 200), ("icon", "Icon", 90), ("wordmark", "Wordmark", 170)]
    cw = (W - 2 * M - 3 * 14) / 4
    for i, (kind, label, lw) in enumerate(cells):
        x = M + i * (cw + 14)
        d.colour("#FFFFFF")
        d.c.rect(x, 150, cw, 220, stroke=0, fill=1)
        lw = min(lw, cw - 40)
        _, ratio = logo_png(kind, "colour", 50)
        d.logo(kind, "colour", x + (cw - lw) / 2, 260 - lw / ratio / 2, lw)
        d.text(x, 130, label, 11, "Inter-Medium")
        d.para(x, 115, LOCKUPS[kind].split(". ", 1)[-1], cw, 8, 11)
    d.para(
        M, 70,
        "Each lockup comes in Colour (blue icon, ink wordmark), Black and White. Use Colour on white or light "
        "backgrounds, White on photography and dark backgrounds, Black for single-colour print, stamping and fax.",
        W - 2 * M, 9, 13,
    )

    # 03 Clear space
    d.new()
    d.eyebrow(M, H - 70, "03 Clear space and minimum size")
    d.heading(M, H - 110, "Give it room.", 30)
    d.para(
        M, H - 160,
        "Keep a clear zone around the logo equal to the height of one window pane in the icon (x). No text, "
        "edges or other graphics inside it.\n\nMinimum sizes\nStacked logo: 20 mm / 80 px wide\nHorizontal "
        "lockup: 30 mm / 120 px wide\nIcon: 6 mm / 24 px wide (16 px for favicons)",
        280,
    )
    lw = 170
    _, ratio = logo_png("stacked", "colour", 50)
    lh = lw / ratio
    x0, y0 = W * 0.62 - lw / 2, H / 2 - lh / 2 - 10
    pane = lw * (10.05 / IW)  # one window pane, in logo units
    d.colour("#DCE3EE")
    d.c.rect(x0 - pane, y0 - pane, lw + 2 * pane, lh + 2 * pane, stroke=0, fill=1)
    d.colour("#F2F1EC")
    d.c.rect(x0, y0, lw, lh, stroke=0, fill=1)
    d.logo("stacked", "colour", x0, y0, lw)
    d.text(x0 - pane / 2, y0 + lh / 2, "x", 9, "Inter-Medium", BLUE, align="center")
    d.text(x0 + lw / 2, y0 + lh + pane / 2 - 3, "x", 9, "Inter-Medium", BLUE, align="center")

    # 04 Backgrounds
    d.new()
    d.eyebrow(M, H - 70, "04 Logo on backgrounds")
    d.heading(M, H - 110, "Always enough contrast.", 30)
    bgs = [("#FFFFFF", "colour", "Colour on white"), ("#F4F4F4", "black", "Black on paper"),
           ("#222224", "white", "White on ink"), ("#1F4E8C", "white", "White on blue")]
    for i, (bg, cw_, label) in enumerate(bgs):
        x = M + i * (cw + 14)
        d.colour(bg)
        d.c.rect(x, 150, cw, 220, stroke=0, fill=1)
        d.logo("stacked", cw_, x + cw / 2 - 45, 260 - 48, 90)
        d.text(x, 130, label, 11, "Inter-Medium")
    d.para(
        M, 95,
        "On photography, place the white logo over a calm, dark area of the image (sky, shadow, glass), or add "
        "a subtle dark gradient behind it, as on the 2026 catalogue cover.",
        W - 2 * M, 9, 13,
    )

    # 05 Don'ts
    d.new()
    d.eyebrow(M, H - 70, "05 Logo don'ts")
    d.heading(M, H - 110, "Don't change the logo.", 30)
    donts = ["Stretch or squash it", "Recolour it outside the palette", "Rotate it",
             "Add shadows, outlines or effects", "Place it on busy images", "Retype or rearrange the wordmark"]
    for i, it in enumerate(donts):
        x = M + (i % 3) * ((W - 2 * M) / 3)
        y = H - 200 - (i // 3) * 46
        d.text(x, y, "x", 11, "Inter-SemiBold", "#B3261E")
        d.text(x + 18, y, it, 12, "Inter-Light")
    d.para(M, 150, "If a layout seems to need one of these, use a different lockup or colourway instead.",
           W - 2 * M, 9.5, 14)

    # 06 Colour
    d.new()
    d.eyebrow(M, H - 70, "06 Colour")
    d.heading(M, H - 110, "Ink, paper and a little blue.", 30)
    d.para(
        M, H - 160,
        "VALDA is mostly monochrome: ink on white or warm paper, with generous white space. Blue is an accent "
        "for links and small highlights, never a large background on the website.",
        W - 2 * M, 9.5, 14,
    )
    sw = (W - 2 * M - 8 * 6) / 9
    for i, (name, hx, *_rest) in enumerate(PALETTE):
        x = M + i * (sw + 6)
        d.colour(hx)
        d.colour("#E3E3E3", fill=False)
        d.c.rect(x, 170, sw, 150, stroke=1 if hx in ("#FFFFFF", "#F4F4F4") else 0, fill=1)
        d.text(x, 152, name, 8, "Inter-Medium")
        d.text(x, 140, hx, 7.5, "Inter-Regular", "#6F6F72")
    d.text(M, 95, "Full values (RGB, CMYK, Pantone): 02-Colours-and-Fonts/VALDA-Colours-and-Fonts.pdf", 8.5,
           "Inter-Regular", "#6F6F72")

    # 07 Typography
    d.new()
    d.eyebrow(M, H - 70, "07 Typography")
    d.heading(M, H - 110, "Light headlines, quiet body.", 30)
    d.text(M, H - 200, "See through our eyes.", 32, "Inter-Light")
    d.text(M, H - 230, "HEADLINE · INTER LIGHT · SENTENCE CASE", 7, "Inter-Medium", "#A3A3A5", spacing=1.5)
    d.text(M, H - 275, "ENGINEERED IN EUROPE", 8, "Inter-SemiBold", BLUE, spacing=2.6)
    d.text(M, H - 295, "EYEBROW · INTER SEMIBOLD · CAPS, WIDE TRACKING · BLUE", 7, "Inter-Medium", "#A3A3A5", spacing=1.5)
    d.para(M, H - 330,
           "Two decades of craftsmanship meet cutting-edge engineering to deliver windows, doors and facade "
           "systems that are precise, certified and built to perform.", 380, 10.5, 15)
    d.text(M, H - 380, "BODY · INTER REGULAR · SLATE GREY", 7, "Inter-Medium", "#A3A3A5", spacing=1.5)
    d.para(W * 0.62, H - 180,
           "Website: Inter Tight.\nPrint and documents: Inter.\nOffice fallback: Arial.\n\nHeadlines are large "
           "and light, never bold. Use sentence case. Keep lines short and leave space around them.",
           W * 0.38 - M, 9.5, 14)

    # 08 Imagery
    d.new()
    d.eyebrow(M, H - 70, "08 Imagery")
    d.heading(M, H - 110, "Real buildings, real light.", 30)
    pics = ["public/images/hero-villa.jpg", "public/images/manufacturing.webp", "public/images/proj-ny.jpg"]
    pw = (W - 2 * M - 28) / 3
    from reportlab.lib.utils import ImageReader

    for i, p in enumerate(pics):
        f = ROOT / p
        if not f.exists():
            continue
        im = Image.open(f).convert("RGB")
        # centre-crop to 4:3
        tw, th = im.size
        tr = 4 / 3
        if tw / th > tr:
            nw = int(th * tr)
            im = im.crop(((tw - nw) // 2, 0, (tw + nw) // 2, th))
        else:
            nh = int(tw / tr)
            im = im.crop((0, (th - nh) // 2, tw, (th + nh) // 2))
        im.thumbnail((1200, 900))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=85)
        d.c.drawImage(ImageReader(buf), M + i * (pw + 14), 170, pw, pw * 0.75)
    d.para(M, 150,
           "Architecture photographed in natural light, with clean lines and calm skies. Show finished buildings, "
           "profile details and our factories and people. Avoid busy stock photos, heavy filters and staged "
           "smiles.", W - 2 * M, 9.5, 14)

    # 09 Voice
    d.new()
    d.eyebrow(M, H - 70, "09 Tone of voice")
    d.heading(M, H - 110, "Plain, precise, confident.", 30)
    voice = [
        ("Plain", "Short sentences. Say what we make, where we make it, and what it is certified for."),
        ("Precise", "Real numbers: U-values, FL approval numbers, lead times. No vague superlatives."),
        ("Confident", "A family manufacturer since 1998 with three factories. We state it, we don't shout it."),
        ("Client first", "Start from the client's project: you send a drawing, we engineer, manufacture, certify, ship."),
    ]
    for i, (k, v) in enumerate(voice):
        y = H - 180 - i * 60
        d.text(M, y, k, 16, "Inter-Light")
        d.para(M + 200, y + 2, v, W - 2 * M - 200, 10, 14)
        d.colour("#E3E3E3", fill=False)
        d.c.line(M, y - 22, W - M, y - 22)

    # 10 Files
    d.new()
    d.eyebrow(M, H - 70, "10 Files in this folder")
    d.heading(M, H - 110, "Which file do I send?", 30)
    files = [
        ("01-Logo / SVG", "Website, digital, Figma, Canva"),
        ("01-Logo / EPS, PDF", "Printers, sign makers, Illustrator (open the PDF or EPS in Illustrator)"),
        ("01-Logo / PNG", "Word, PowerPoint, email, social media (transparent background)"),
        ("01-Logo / Favicon", "Browser tab icon and app icons"),
        ("02-Colours-and-Fonts", "Colour codes (HEX, RGB, CMYK, Pantone) and the font files"),
        ("03-Catalogue", "2026 product catalogue and technical catalogue (PDF)"),
        ("04-Brand-Guidelines", "This document"),
        ("05-Video", "Factory film (1080p and 720p) and the short website loop (MP4)"),
    ]
    for i, (k, v) in enumerate(files):
        y = H - 170 - i * 32
        d.text(M, y, k, 11, "Inter-Medium")
        d.text(M + 230, y, v, 10, "Inter-Regular", "#6F6F72")
    d.save()


# ---------------------------------------------------------------- media
MEDIA = [
    ("public/downloads/valda-catalogue-2026.pdf", "03-Catalogue/VALDA-Catalogue-2026.pdf"),
    ("public/downloads/valda-technical-catalogue-2026.pdf", "03-Catalogue/VALDA-Technical-Catalogue-2026.pdf"),
    ("public/media/valda-film.mp4", "05-Video/VALDA-Factory-Film-1080p.mp4"),
    ("public/media/valda-film-720.mp4", "05-Video/VALDA-Factory-Film-720p.mp4"),
    ("public/media/hero-loop.mp4", "05-Video/VALDA-Website-Loop.mp4"),
]


def copy_media():
    for src, dst in MEDIA:
        s, t = ROOT / src, OUT / dst
        t.parent.mkdir(parents=True, exist_ok=True)
        if s.exists():
            shutil.copy2(s, t)
        else:
            print(f"  missing: {src}")


def make_zip():
    target = ROOT / "VALDA-Master.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(OUT.rglob("*")):
            if f.is_file() and f.name != ".gitignore":
                z.write(f, Path("VALDA-Master") / f.relative_to(OUT),
                        compress_type=zipfile.ZIP_STORED if f.suffix in (".mp4", ".pdf") else zipfile.ZIP_DEFLATED)
    print(f"wrote {target.relative_to(ROOT)} ({target.stat().st_size / 1e6:.0f} MB)")


if __name__ == "__main__":
    print("logos...")
    build_logos()
    register_fonts()
    print("colours & fonts sheet...")
    build_colours_sheet()
    print("brand guidelines...")
    build_guidelines()
    print("catalogue & video...")
    copy_media()
    if "--zip" in sys.argv:
        make_zip()
    print("done ->", OUT.relative_to(ROOT))
