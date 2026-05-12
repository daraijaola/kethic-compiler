from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


PAGE_W = 960
PAGE_H = 540
MARGIN = 62


@dataclass(frozen=True)
class TextRun:
    text: str
    size: int = 24
    bold: bool = False
    color: tuple[float, float, float] = (0.09, 0.1, 0.12)


@dataclass(frozen=True)
class Slide:
    title: str
    subtitle: str
    body: tuple[str, ...]
    accent: str = ""
    metrics: tuple[tuple[str, str], ...] = ()


SLIDES: tuple[Slide, ...] = (
    Slide(
        "Kethic",
        "AI-native web language that cuts generated source by 90%+",
        ("Nigeria | Pre-seed | Raising $50k",),
        "Build more with fewer generated tokens.",
    ),
    Slide(
        "AI builders are becoming the new way software is made",
        "Why now",
        (
            "Every generated page still comes out as verbose HTML, CSS, JavaScript, React, or Tailwind.",
            "Output tokens are the expensive part of AI code generation.",
            "As AI builders scale, code verbosity becomes a direct cost problem.",
        ),
    ),
    Slide(
        "AI website builders waste tokens on code users never asked to see",
        "Problem",
        (
            "A simple landing page can require thousands of generated tokens.",
            "Long generated code increases cost, latency, and repair loops.",
            "Emerging-market builders are hit harder because compute cost matters more.",
        ),
    ),
    Slide(
        "Kethic lets AI write compact intent, then compiles it into real web code",
        "Solution",
        (
            "AI writes compact Kethic source.",
            "The compiler outputs accessible HTML, responsive CSS, and runtime JavaScript.",
            "Quality moves from prompt luck into compiler rules.",
        ),
    ),
    Slide(
        "The prototype is already working",
        "Product proof",
        (
            "Compiler pipeline: lexer, parser, type checker, code generator, runtime.",
            "Web layer: pages, components, navigation, forms, responsive layouts, state, events, interactions.",
            "Build, tests, and web quality validation pass locally.",
        ),
    ),
    Slide(
        "Kethic generated the same website with 96%+ less source",
        "Benchmark",
        (
            "Same website task. Same model. Kethic compiled successfully.",
            "React/Tailwind baseline: 5,224 completion tokens and 21,449 source characters.",
            "Kethic macro output: 198 completion tokens and 782 source characters.",
        ),
        metrics=(("96.21%", "lower output tokens"), ("96.35%", "smaller source"), ("91.60%", "lower total tokens")),
    ),
    Slide(
        "Kethic is a language layer, not another website builder UI",
        "What makes it different",
        (
            "AI generates less source code.",
            "The compiler expands compact patterns into production web output.",
            "The same language can be used by ChatGPT, Claude, Gemini, Cursor, and hosted builders.",
        ),
    ),
    Slide(
        "AI software generation needs a cheaper source layer",
        "Market",
        (
            "AI builder platforms.",
            "No-code and low-code tools.",
            "Solo founders, SMEs, and developer tooling teams.",
            "Global South builders where AI compute cost is a bigger barrier.",
        ),
    ),
    Slide(
        "Current tools generate verbose platform code; Kethic compresses the source layer",
        "Competition",
        (
            "Lovable/Bolt-style builders: strong UX, verbose generated code underneath.",
            "React/Tailwind/HTML: powerful but token-heavy.",
            "Token DSL experiments: compact, but not focused on production-quality full websites.",
            "Kethic combines compression, compiler validation, and real web output.",
        ),
    ),
    Slide(
        "Start open source; monetize the hosted builder",
        "Go to market",
        (
            "Release the compiler, AI guide, benchmarks, examples, and public demos.",
            "Show side-by-side token savings against React, Tailwind, and HTML.",
            "Grow through AI builder communities, developer tool users, and Global South founders.",
            "Hosted Kethic builder becomes the paid product after language adoption.",
        ),
    ),
    Slide(
        "We are raising $50k pre-seed",
        "Funding",
        (
            "Finish the language core.",
            "Build fetch/data and backend primitives.",
            "Publish public docs and benchmark demos.",
            "Launch the hosted Kethic builder.",
            "Onboard early users and contributors.",
        ),
    ),
    Slide(
        "Kethic",
        "Build more with fewer generated tokens.",
        (
            "Michael",
            "Founder, Kethic",
            "Michealijaola@outlook.com",
            "https://calendly.com/daraijaola8/30min",
        ),
    ),
)


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap(text: str, max_chars: int) -> list[str]:
    words = text.split()
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


def text(x: int, y: int, value: str, size: int, bold: bool = False, color: tuple[float, float, float] = (0.09, 0.1, 0.12)) -> str:
    font = "/F2" if bold else "/F1"
    r, g, b = color
    return f"BT {r:.3f} {g:.3f} {b:.3f} rg {font} {size} Tf {x} {y} Td ({esc(value)}) Tj ET\n"


def rect(x: int, y: int, w: int, h: int, color: tuple[float, float, float], stroke: bool = False) -> str:
    r, g, b = color
    op = "B" if stroke else "f"
    return f"{r:.3f} {g:.3f} {b:.3f} rg {x} {y} {w} {h} re {op}\n"


def render_slide(slide: Slide, number: int) -> str:
    out = ""
    out += rect(0, 0, PAGE_W, PAGE_H, (0.985, 0.985, 0.975))
    out += rect(0, PAGE_H - 12, PAGE_W, 12, (0.03, 0.22, 0.29))
    out += rect(0, PAGE_H - 12, 230, 12, (0.95, 0.08, 0.42))
    out += text(MARGIN, PAGE_H - 72, slide.subtitle.upper(), 14, True, (0.95, 0.08, 0.42))
    title_lines = wrap(slide.title, 46)
    y = PAGE_H - 122
    for line in title_lines:
        out += text(MARGIN, y, line, 30, True)
        y -= 38
    if slide.accent:
        y -= 8
        out += text(MARGIN, y, slide.accent, 20, False, (0.03, 0.22, 0.29))
        y -= 38
    if slide.metrics:
        box_y = 48
        box_w = 250
        gap = 28
        start_x = MARGIN
        for index, (value, label) in enumerate(slide.metrics):
            x = start_x + index * (box_w + gap)
            out += rect(x, box_y, box_w, 118, (1.0, 1.0, 1.0))
            out += rect(x, box_y + 113, box_w, 5, (0.95, 0.08, 0.42))
            out += text(x + 24, box_y + 66, value, 34, True, (0.03, 0.22, 0.29))
            out += text(x + 24, box_y + 34, label, 16)
    body_y = min(y, 335)
    for item in slide.body:
        lines = wrap(item, 72)
        bullet_prefix = "- "
        first = True
        for line in lines:
            prefix = bullet_prefix if first and len(slide.body) > 1 else "  "
            out += text(MARGIN, body_y, f"{prefix}{line}", 18, False)
            body_y -= 28
            first = False
        body_y -= 6
    out += text(MARGIN, 28, "Kethic", 12, True, (0.45, 0.46, 0.48))
    out += text(PAGE_W - 95, 28, str(number), 12, False, (0.45, 0.46, 0.48))
    return out


def build_pdf(slides: Iterable[Slide], target: Path) -> None:
    streams = [render_slide(slide, index + 1).encode("latin-1", "replace") for index, slide in enumerate(slides)]
    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    page_refs = " ".join(f"{5 + index * 2} 0 R" for index in range(len(streams)))
    objects.append(f"<< /Type /Pages /Kids [{page_refs}] /Count {len(streams)} >>".encode())
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    for index, stream in enumerate(streams):
        page_obj_num = 5 + index * 2
        content_obj_num = page_obj_num + 1
        page = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_obj_num} 0 R >>"
        )
        objects.append(page.encode())
        objects.append(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream")
    content = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets: list[int] = [0]
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
    content.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode()
    )
    target.write_bytes(content)


if __name__ == "__main__":
    output = Path("investor") / "Kethic_PreSeed_Deck.pdf"
    build_pdf(SLIDES, output)
    print(output.resolve())
