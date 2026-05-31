# Premium Workflow Recipe V1

Status: Micheal-owned recipe spec.

Purpose: define the fourth premium compiler recipe Kethic needs.

Kethic needs a section that explains the product without sounding like generic marketing. The visitor should understand the system quickly:

```text
AI writes compact source -> Kethic compiles it -> browser gets normal web files
```

The AI should not hand-design that process section. It should emit a few compact steps. The compiler should turn those steps into a premium workflow: source panel, compiler stage, output preview, and proof labels.

## Goal

Turn compact process intent into a premium workflow section.

```text
compact workflow steps
        ->
compiler-owned process recipe
        ->
responsive source-to-output explanation
```

This keeps AI output low because the model only emits the steps and short labels. The compiler owns the panels, connectors, motion, spacing, and responsive behavior.

## Target Source

```kethic
workflow BuildFlow
  title "From compact source to real web output"
  mode "source-to-output"
  step "Write" "The model emits short Kethic source for structure, content, and intent."
  step "Compile" "Kethic expands that source through reusable layout and brand recipes."
  step "Ship" "The result is normal HTML, CSS, and JavaScript the browser can inspect."
end
```

## Why This Recipe Exists

The workflow section carries the product explanation. Without it, Kethic can sound abstract:

- not another website builder;
- not just a prompt trick;
- not a closed visual editor;
- not a framework replacement.

It is a compact source layer plus compiler. A premium workflow section should make that obvious in seconds.

## Required Fields

- `title`: required. Section headline.
- `step`: required. At least three steps.

## Optional Fields

- `mode`: optional. Defaults to Brand Profile V2 workflow preference.
- `proof`: optional. Short proof line or benchmark summary.
- `input`: optional. Compact source snippet label.
- `output`: optional. Output artifact label.

## Workflow Modes

The first implementation should support four workflow modes.

### `source-to-output`

Best default for Kethic.

Shows:

- compact source panel;
- compiler stage;
- generated output preview;
- file labels such as `HTML`, `CSS`, `JS`;
- optional token reduction proof.

### `timeline`

Best for simpler SaaS pages.

Shows:

- horizontal step sequence on desktop;
- vertical stack on mobile.

### `pipeline`

Best for technical pages.

Shows:

- connected stages;
- labels;
- small source/output artifacts.

### `stack`

Best for mobile-heavy pages or documentation.

Shows:

- clean ordered list;
- one highlighted active step;
- optional inline visual.

## Kethic Default Workflow

Kethic's own website should use:

```kethic
mode "source-to-output"
```

The visual should show three realities:

- the model writes less;
- the compiler does the repeated frontend work;
- the browser receives standard web output.

## Desktop Layout

Desktop should compile to:

- headline on one side or above the visual;
- source panel on the left;
- compiler stage in the middle;
- output panel on the right;
- subtle connector lines;
- one active accent line or marker;
- enough whitespace to avoid a dashboard look;
- no dense paragraph blocks.

## Mobile Layout

Mobile should compile to:

- stacked steps;
- source, compiler, output panels in order;
- connectors become short vertical rules or are removed;
- no horizontal overflow;
- no tiny code text;
- animation disabled or simplified if space is tight.

## Brand Profile Inputs

Brand Profile V2 should influence:

- workflow mode;
- panel style: `paper`, `outlined`, `terminal`, `chrome`;
- connector style: `line`, `pulse`, `dots`, `none`;
- accent color;
- motion speed;
- density;
- whether code snippets are visible or abstracted.

The source should not specify CSS grids, SVG connector paths, animation keyframes, breakpoint behavior, or detailed panel markup.

## Generated Output Requirements

The compiler should emit:

- semantic section markup;
- ordered workflow content;
- accessible labels for each stage;
- stable IDs/classes;
- responsive CSS;
- `prefers-reduced-motion` fallback;
- no dependency on React, Tailwind, or shadcn.

## Token Reduction Logic

A handwritten React/Tailwind workflow section usually repeats:

- stage cards;
- connector markup;
- source panels;
- output panels;
- responsive layout classes;
- icon wrappers;
- animation classes;
- typography and spacing classes.

Kethic should replace that with one compact `workflow` block. The compiler can generate the full visual system while the model emits only the process meaning.

## Failure Conditions

This recipe fails if:

- it becomes a generic three-card "how it works" section;
- it does not show source, compiler, and output clearly;
- it requires low-level layout instructions in source;
- mobile layout clips or overflows;
- animation distracts from the explanation;
- the output looks like a template rather than a product-specific process.

## Acceptance Criteria

Premium Workflow Recipe V1 is done when:

- `workflow` can describe the process in under 12 lines;
- compiler output can show source -> compiler -> output visually;
- desktop layout feels composed, not card-repeated;
- mobile layout is clean and readable;
- Brand Profile V2 can change panel/connector treatment without source changes;
- Kethic's AI-builder showcase explains the product faster than the current preview.
