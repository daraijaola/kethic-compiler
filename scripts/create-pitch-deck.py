from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


PAGE_W = 960
PAGE_H = 540
MARGIN = 56

INK = (0.09, 0.1, 0.12)
MUTED = (0.44, 0.46, 0.5)
PINK = (0.95, 0.08, 0.42)
TEAL = (0.02, 0.24, 0.3)
SAND = (0.985, 0.982, 0.965)
WHITE = (1.0, 1.0, 1.0)
LINE = (0.88, 0.88, 0.84)


@dataclass(frozen=True)
class Card:
    title: str
    body: str
    value: str = ""


@dataclass(frozen=True)
class Slide:
    kind: str
    eyebrow: str
    title: str
    subtitle: str = ""
    cards: tuple[Card, ...] = ()
    notes: tuple[str, ...] = ()


SLIDES: tuple[Slide, ...] = (
    Slide(
        "cover",
        "NIGERIA | PRE-SEED | RAISING $50K",
        "Kethic",
        "AI-native web language that cuts generated source by 90%+",
    ),
    Slide(
        "cards",
        "PROBLEM",
        "AI builders still output expensive web code",
        "The user asks for a page. The model pays to write thousands of tokens of HTML, CSS, JS, or React.",
        (
            Card("Cost", "Output tokens are the expensive part of generated software."),
            Card("Latency", "Verbose source slows generation and repair loops."),
            Card("Fragility", "More generated code gives the model more surface to break."),
        ),
    ),
    Slide(
        "flow",
        "SOLUTION",
        "Kethic compresses intent before it becomes web code",
        "AI writes compact Kethic. The compiler expands it into accessible HTML, responsive CSS, and runtime JavaScript.",
    ),
    Slide(
        "product",
        "PRODUCT",
        "A working compiler turns short Kethic into real websites",
        "The prototype already supports pages, components, responsive layouts, forms, state, events, and interactions.",
    ),
    Slide(
        "benchmark",
        "BENCHMARK",
        "Same website. Same model. 96%+ smaller generated source.",
        "Kethic compiled successfully on the first valid benchmark run.",
        (
            Card("Output tokens", "lower than React/Tailwind", "96.21%"),
            Card("Source size", "smaller than React/Tailwind", "96.35%"),
            Card("Total tokens", "lower total prompt + output", "91.60%"),
        ),
        (
            "React/Tailwind: 5,224 completion tokens, 21,449 source characters",
            "Kethic: 198 completion tokens, 782 source characters",
        ),
    ),
    Slide(
        "market",
        "MARKET",
        "Kethic starts with AI web generation, then expands into AI coding",
        "We begin where token waste is easiest to prove: generated websites and app frontends.",
        (
            Card("TAM", "global AI code assistants market in 2025", "$8.5B"),
            Card("SAM", "AI web builders, no-code tools, generated frontend workflows", "$1.2B"),
            Card("SOM", "first 24-month wedge from hosted builder and tooling", "$12M"),
        ),
        ("TAM source: Grand View Research AI Code Assistants Market, 2025-2033.", "SAM/SOM are founder estimates for the initial web-generation wedge."),
    ),
    Slide(
        "competition",
        "COMPETITION",
        "Most tools improve prompting. Kethic changes the generated language.",
        "",
        (
            Card("AI builders", "Great UX, but verbose platform code underneath."),
            Card("React/Tailwind", "Powerful, but expensive for models to generate repeatedly."),
            Card("Kethic", "Compact source plus compiler-enforced web output."),
        ),
    ),
    Slide(
        "gtm",
        "GO TO MARKET",
        "Open source the language. Monetize the hosted builder.",
        "",
        (
            Card("0-3 months", "Publish compiler, AI guide, benchmark page, and 10 demo templates."),
            Card("3-6 months", "Reach 1,000 developers/founders through AI builder communities and open-source demos."),
            Card("6-12 months", "Convert hosted users at $19-$49/month and pursue 3 platform integrations."),
        ),
    ),
    Slide(
        "team",
        "TEAM",
        "Founder building from compiler to product",
        "",
        (
            Card("Micheal Ijaola", "Founder and CEO. Built the compiler prototype, native web layer, benchmark harness, and investor demo."),
            Card("Current need", "Pre-seed capital to bring in design, compiler, and GTM support around the working prototype."),
        ),
    ),
    Slide(
        "ask",
        "THE ASK",
        "We are raising $50k pre-seed",
        "Funds go directly into finishing the language and launching the public builder.",
        (
            Card("Language", "Finish data, backend, and app primitives."),
            Card("Proof", "Public benchmark demos and side-by-side output comparisons."),
            Card("Launch", "Hosted Kethic builder and early user onboarding."),
        ),
    ),
    Slide(
        "back",
        "BUILD MORE WITH FEWER GENERATED TOKENS",
        "Kethic",
        "Micheal Ijaola | Founder, Kethic | micheal@kethic.org | calendly.com/daraijaola8/30min",
    ),
)


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap(text_value: str, max_chars: int) -> list[str]:
    words = text_value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if current == "" else f"{current} {word}"
        if len(candidate) > max_chars and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def text(x: int, y: int, value: str, size: int, bold: bool = False, color: tuple[float, float, float] = INK) -> str:
    font = "/F2" if bold else "/F1"
    r, g, b = color
    return f"BT {r:.3f} {g:.3f} {b:.3f} rg {font} {size} Tf {x} {y} Td ({esc(value)}) Tj ET\n"


def rect(x: int, y: int, w: int, h: int, color: tuple[float, float, float], stroke: bool = False) -> str:
    r, g, b = color
    op = "B" if stroke else "f"
    return f"{r:.3f} {g:.3f} {b:.3f} rg {x} {y} {w} {h} re {op}\n"


def line(x1: int, y1: int, x2: int, y2: int, color: tuple[float, float, float] = TEAL, width: int = 2) -> str:
    r, g, b = color
    return f"{r:.3f} {g:.3f} {b:.3f} RG {width} w {x1} {y1} m {x2} {y2} l S\n"


def arrow(x1: int, y1: int, x2: int, y2: int) -> str:
    out = line(x1, y1, x2, y2, TEAL, 3)
    out += line(x2, y2, x2 - 12, y2 + 8, TEAL, 3)
    out += line(x2, y2, x2 - 12, y2 - 8, TEAL, 3)
    return out


def base(slide: Slide, number: int) -> str:
    out = rect(0, 0, PAGE_W, PAGE_H, SAND)
    out += rect(0, PAGE_H - 10, PAGE_W, 10, TEAL)
    out += rect(0, PAGE_H - 10, 260, 10, PINK)
    out += text(MARGIN, PAGE_H - 55, slide.eyebrow.upper(), 13, True, PINK)
    title_y = PAGE_H - 98
    for title_line in wrap(slide.title, 48):
        out += text(MARGIN, title_y, title_line, 30, True)
        title_y -= 36
    if slide.subtitle:
        sub_y = title_y - 8
        for sub_line in wrap(slide.subtitle, 78):
            out += text(MARGIN, sub_y, sub_line, 16, False, MUTED)
            sub_y -= 23
    out += text(MARGIN, 25, "Kethic", 11, True, MUTED)
    out += text(PAGE_W - 88, 25, str(number), 11, False, MUTED)
    return out


def draw_card(x: int, y: int, w: int, h: int, card: Card, accent: bool = True) -> str:
    out = rect(x, y, w, h, WHITE)
    out += rect(x, y + h - 5, w, 5, PINK if accent else TEAL)
    if card.value:
        out += text(x + 22, y + h - 54, card.value, 32, True, TEAL)
        out += text(x + 22, y + h - 84, card.title, 15, True)
        body_y = y + h - 112
    else:
        out += text(x + 22, y + h - 36, card.title, 18, True, TEAL)
        body_y = y + h - 68
    for body_line in wrap(card.body, max(24, int(w / 9))):
        out += text(x + 22, body_y, body_line, 13, False, INK)
        body_y -= 18
    return out


def render_cover(slide: Slide, number: int) -> str:
    out = base(slide, number)
    out += rect(560, 95, 300, 300, WHITE)
    out += rect(585, 310, 250, 52, (0.96, 0.97, 0.95))
    out += text(610, 328, "AI prompt", 17, True, TEAL)
    out += arrow(710, 306, 710, 278)
    out += rect(585, 225, 250, 52, (0.96, 0.97, 0.95))
    out += text(608, 243, "Kethic source", 17, True, TEAL)
    out += arrow(710, 221, 710, 193)
    out += rect(585, 140, 250, 52, (0.96, 0.97, 0.95))
    out += text(608, 158, "HTML + CSS + JS", 17, True, TEAL)
    out += rect(560, 392, 300, 8, PINK)
    return out


def render_cards(slide: Slide, number: int) -> str:
    out = base(slide, number)
    x = MARGIN
    for card in slide.cards:
        out += draw_card(x, 90, 260, 180, card)
        x += 290
    return out


def render_flow(slide: Slide, number: int) -> str:
    out = base(slide, number)
    labels = [("User request", "Build a landing page"), ("Kethic", "786 chars"), ("Compiler", "checks + expands"), ("Website", "real web output")]
    x = 52
    y = 150
    for index, (title, body) in enumerate(labels):
        out += rect(x, y, 180, 115, WHITE)
        out += rect(x, y + 110, 180, 5, PINK if index == 1 else TEAL)
        out += text(x + 18, y + 72, title, 17, True, TEAL)
        out += text(x + 18, y + 42, body, 13, False, INK)
        if index < len(labels) - 1:
            out += arrow(x + 190, y + 58, x + 238, y + 58)
        x += 235
    return out


def render_product(slide: Slide, number: int) -> str:
    out = base(slide, number)
    out += rect(55, 80, 390, 260, (0.06, 0.07, 0.08))
    code_lines = [
        "st joins = 0",
        "act join",
        "  set joins = joins plus 1",
        "end",
        "pg Landing",
        "  hero \"Kethic\" \"AI-native sites\"",
        "  signup name email submit:\"Join\"",
        "end",
    ]
    y = 302
    for code in code_lines:
        out += text(78, y, code, 13, False, (0.93, 0.94, 0.9))
        y -= 26
    out += arrow(465, 210, 520, 210)
    out += rect(545, 80, 360, 260, WHITE)
    out += rect(570, 275, 220, 22, PINK)
    out += text(570, 235, "Kethic landing page", 22, True)
    out += text(570, 204, "Hero, signup form, responsive layout", 14, False, MUTED)
    out += rect(570, 150, 110, 40, TEAL)
    out += text(592, 164, "Join", 15, True, WHITE)
    out += rect(700, 150, 150, 40, (0.94, 0.94, 0.91))
    out += text(720, 164, "Email field", 14, False, MUTED)
    return out


def render_benchmark(slide: Slide, number: int) -> str:
    out = base(slide, number)
    x = MARGIN
    for card in slide.cards:
        out += draw_card(x, 95, 260, 145, card)
        x += 290
    note_y = 60
    for note in slide.notes:
        out += text(MARGIN, note_y, note, 12, False, MUTED)
        note_y -= 17
    return out


def render_team(slide: Slide, number: int) -> str:
    out = base(slide, number)
    out += rect(65, 105, 225, 225, WHITE)
    out += rect(110, 188, 135, 135, TEAL)
    out += text(143, 238, "MI", 42, True, WHITE)
    out += text(100, 155, "Micheal Ijaola", 22, True)
    out += text(100, 126, "Founder and CEO", 15, False, MUTED)
    out += draw_card(335, 190, 255, 140, slide.cards[0])
    out += draw_card(620, 190, 255, 140, slide.cards[1], accent=False)
    out += rect(335, 105, 540, 55, (0.96, 0.97, 0.95))
    out += text(360, 125, "Next hire focus: design, compiler engineering, and GTM support.", 15, False, TEAL)
    return out


def render_back(slide: Slide, number: int) -> str:
    out = base(slide, number)
    out += rect(MARGIN, 125, 835, 160, WHITE)
    parts = slide.subtitle.split(" | ")
    y = 240
    for part in parts:
        out += text(MARGIN + 32, y, part, 19, False, INK)
        y -= 35
    return out


def render_slide(slide: Slide, number: int) -> str:
    if slide.kind == "cover":
        return render_cover(slide, number)
    if slide.kind == "flow":
        return render_flow(slide, number)
    if slide.kind == "product":
        return render_product(slide, number)
    if slide.kind == "benchmark":
        return render_benchmark(slide, number)
    if slide.kind == "team":
        return render_team(slide, number)
    if slide.kind == "back":
        return render_back(slide, number)
    return render_cards(slide, number)


def build_pdf(slides: tuple[Slide, ...], target: Path) -> None:
    streams = [render_slide(slide, index + 1).encode("latin-1", "replace") for index, slide in enumerate(slides)]
    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    page_refs = " ".join(f"{5 + index * 2} 0 R" for index in range(len(streams)))
    objects.append(f"<< /Type /Pages /Kids [{page_refs}] /Count {len(streams)} >>".encode())
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    for index, stream in enumerate(streams):
        page_obj = 5 + index * 2
        content_obj = page_obj + 1
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_obj} 0 R >>"
            ).encode()
        )
        objects.append(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream")
    content = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(content))
        content.extend(f"{index} 0 obj\n".encode())
        content.extend(obj)
        content.extend(b"\nendobj\n")
    xref_offset = len(content)
    content.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    content.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        content.extend(f"{offset:010d} 00000 n \n".encode())
    content.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode())
    target.write_bytes(content)


if __name__ == "__main__":
    out_dir = Path("investor")
    out_dir.mkdir(exist_ok=True)
    v2 = out_dir / "Kethic_PreSeed_Deck_V2.pdf"
    build_pdf(SLIDES, v2)
    build_pdf(SLIDES, out_dir / "Kethic_PreSeed_Deck.pdf")
    print(v2.resolve())
