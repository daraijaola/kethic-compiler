# Premium Showcase and Benchmark Recipe V1

Status: Micheal-owned recipe spec.

Purpose: define the second premium compiler recipe Kethic needs after the hero.

The hero makes the page feel real. The showcase/benchmark section proves why Kethic exists.

The current Kethic preview says the right things, but it does not visually prove them. It needs a compiler-owned comparison panel that shows the model writes much less source while the browser still receives standard web output.

## Goal

Turn a compact proof block into a premium source-to-output comparison.

```text
compact benchmark intent
        ↓
compiler-owned comparison recipe
        ↓
responsive proof section with numbers, bars, and source/output framing
```

This keeps AI output low because the model emits only the values and labels. The compiler owns the visual chart, panel layout, bars, source cards, and responsive behavior.

## Target Source

```kethic
showcase CompilerFlow
  title "The model writes less. The compiler builds more."
  before "React/Tailwind repeats layout, classes, breakpoints, and style decisions."
  after "Kethic captures the page intent once and expands it deterministically."
  visual "source-compare"
end

metrics Benchmark
  label "Recorded React/Tailwind comparison"
  model "gpt-5.2"
  baseline "5,224" "React/Tailwind completion tokens"
  kethic "198" "Kethic completion tokens"
  reduction "90%" "public target lower generated output"
end
```

## Why This Recipe Exists

Kethic's business story depends on proof:

> AI builders spend money because models emit verbose frontend code. Kethic makes the model emit compact source and lets the compiler expand it.

That cannot be explained with text alone. It needs a visual comparison.

## Showcase Recipe

The `showcase` macro explains source-to-output transformation.

Required fields:

- `title`: required.
- `before`: required. Describes the verbose baseline.
- `after`: required. Describes Kethic's compact path.
- `visual`: required for premium mode.

Supported visual values:

- `source-compare`
- `compiler-pipeline`
- `output-preview`

### `source-compare`

Shows:

- left side: verbose frontend generation;
- right side: compact Kethic source;
- center or bottom: compiler expansion into web files;
- proof badge: around 90% lower generated output.

### `compiler-pipeline`

Shows:

```text
Prompt → Kethic source → Compiler → HTML/CSS/JS
```

### `output-preview`

Shows:

- compact source snippet;
- generated browser/page preview;
- output file labels.

## Metrics Recipe

The `metrics` macro proves the claim with recorded numbers.

Required fields:

- `label`: required.
- `baseline`: required.
- `kethic`: required.
- `reduction`: required.

Optional fields:

- `model`
- `scenario`
- `date`
- `source`

## Kethic Default Benchmark

For the public Kethic/Clovoc story, default to conservative wording:

```text
around 90% lower generated output
```

When showing a recorded benchmark, exact supporting numbers can appear:

- React/Tailwind completion tokens: `5,224`
- Kethic completion tokens: `198`
- source characters: `21,449` vs `782`

Do not lead public pages with `96%` unless the section clearly says it is one recorded benchmark. Use `90%` as the broad claim.

## Desktop Layout

Desktop should compile to:

- section title on the left or top;
- large comparison panel;
- baseline and Kethic rows/bars;
- clear model label;
- numbers labeled as tokens, not naked numbers;
- concise explanation below or beside the chart;
- enough whitespace to avoid looking like a spreadsheet.

## Mobile Layout

Mobile should compile to:

- stacked comparison cards;
- bars scale to viewport;
- no table overflow;
- labels remain visible;
- exact numbers stay readable;
- explanatory copy stays short.

## Brand Profile Inputs

Brand Profile V2 should influence:

- chart style: `bars`, `ledger`, `cards`, `terminal`;
- surface: `paper`, `outlined`, `chrome`, `glass`;
- accent color for Kethic row;
- baseline color should stay neutral or muted;
- density controls panel spacing.

The source should not contain CSS classes, widths, chart SVG, or responsive logic.

## Generated Output Requirements

The compiler should emit:

- semantic section markup;
- clear headings;
- labeled values;
- accessible text equivalents for visual bars;
- responsive CSS;
- no horizontal overflow;
- no JavaScript requirement for static charts;
- optional lightweight motion only if `motion` is enabled in Brand Profile.

## Token Reduction Logic

A handwritten React/Tailwind benchmark section usually repeats:

- grid wrappers;
- chart bars;
- labels;
- value rows;
- responsive classes;
- card surfaces;
- typography classes;
- explanatory panels.

Kethic should replace that with one `showcase` block and one `metrics` block. The compiler can generate the heavy markup and CSS.

## Failure Conditions

This recipe fails if:

- the benchmark section looks like ordinary text cards;
- numbers are not labeled as tokens/source characters;
- public copy implies exact broad savings without context;
- mobile layout scrolls horizontally;
- visual comparison is too decorative to explain the product;
- source requires hand-authored chart markup.

## Acceptance Criteria

Premium Showcase/Benchmark Recipe V1 is done when:

- `showcase` plus `metrics` can describe the proof section in under 20 lines;
- compiler output creates a visual comparison panel;
- values are clearly labeled;
- mobile layout remains readable;
- public claim uses around `90%` unless showing exact benchmark detail;
- Kethic's AI-builder showcase has a stronger proof section than the current preview.
