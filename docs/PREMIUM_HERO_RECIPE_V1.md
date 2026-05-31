# Premium Hero Recipe V1

Status: Micheal-owned recipe spec.

Purpose: define the first premium compiler recipe Kethic needs.

The current Kethic preview fails hardest at the hero. It is readable, but it is too close to text plus cards. A premium AI-built website needs a first screen with composition, proof, and a visual object. The AI should not hand-write that object; Kethic should compile it from compact intent.

## Goal

Turn a small hero block into a complete premium first screen.

```text
compact hero intent
        ↓
compiler-owned visual recipe
        ↓
responsive premium hero HTML/CSS/JS
```

This keeps AI output low because the model only emits the hero intent. The compiler expands layout, spacing, product visual, buttons, responsive behavior, and motion.

## Target Source

```kethic
hero ProductHero
  title "The compact source language for AI-built websites"
  body "Kethic lets AI write shorter web source, then compiles it into standard HTML, CSS, and JavaScript."
  visual "compiler-panel"
  proof "90% lower generated output"
  primary "View benchmark" "#benchmark"
  secondary "How it works" "#how"
end
```

## Required Fields

- `title`: required. Becomes the page `h1`.
- `body`: required. One short supporting paragraph.
- `visual`: required for premium mode. Chooses the visual object family.
- `proof`: optional but recommended. Short proof badge or benchmark line.
- `primary`: required. Main CTA label and target.
- `secondary`: optional. Secondary CTA label and target.

## Visual Families

The first implementation should support four visual families.

### `compiler-panel`

Best for Kethic and Clovoc.

Shows:

- compact source lines;
- compiler step;
- output files;
- token/proof badge.

Why it matters:

- explains Kethic visually;
- proves the product is not just copy;
- directly supports the token-reduction story.

### `code-compare`

Best for developer-tool pages.

Shows:

- baseline code/source side;
- compact Kethic side;
- reduction badge.

### `product-window`

Best for SaaS/product pages.

Shows:

- app/browser frame;
- generated page preview;
- dashboard or website UI surface.

### `benchmark-panel`

Best for proof-heavy pages.

Shows:

- baseline number;
- Kethic number;
- reduction percentage;
- small bar comparison.

## Kethic Default Hero

Kethic's own website should use:

```kethic
visual "compiler-panel"
proof "around 90% lower generated output"
```

It should not use a generic abstract graphic.

## Desktop Layout

Desktop should compile to:

- floating/fixed navbar above the hero;
- two-column hero;
- left column: title, body, proof, CTA pair;
- right column: compiler visual panel;
- background: off-white with subtle technical grid or linework;
- lime accent used only for proof/active lines;
- max text width around 10-14 words per line;
- hero should fit first viewport without feeling cramped.

## Mobile Layout

Mobile should compile to:

- navbar remains usable and compact;
- visual stacks above or below text depending on profile;
- `h1` must not be oversized;
- CTA pair stacks cleanly;
- visual object scales inside viewport;
- no horizontal overflow;
- no clipped text.

## Brand Profile Inputs

Brand Profile V2 should influence:

- hero composition: `split-visual`, `centered-proof`, `code-compare`, `dashboard-preview`;
- background: `technical-grid`, `plain`, `paper-lines`, `dark-room`;
- card style: `outlined`, `chrome`, `paper`, `glass`;
- motion: `none`, `calm`, `active`;
- accent color and proof color.

The hero source should not need to specify spacing, font sizes, CSS classes, breakpoints, or animation timing.

## Generated Output Requirements

The compiler should emit:

- semantic `section`;
- exactly one `h1`;
- accessible links/buttons;
- stable IDs/classes;
- responsive CSS;
- `prefers-reduced-motion` fallback if visual motion exists;
- no horizontal overflow;
- no dependency on React, Tailwind, or shadcn.

## Token Reduction Logic

A handwritten React/Tailwind hero usually repeats:

- layout wrappers;
- responsive classes;
- typography classes;
- button classes;
- visual panel markup;
- card/surface classes;
- animation classes;
- accessibility attributes.

Kethic should replace that with one compact block. The generated HTML/CSS may be verbose, but model output remains short.

## Failure Conditions

The hero fails if:

- it is text-only;
- it looks like a generic card grid;
- mobile h1 becomes too large;
- the visual object is decorative but not explanatory;
- the CTA is not obvious;
- proof is vague or fake;
- source requires CSS-like details to look good.

## Acceptance Criteria

Premium Hero Recipe V1 is done when:

- `hero` source can describe the first screen in under 10 lines;
- compiler output includes a real visual object;
- desktop and mobile screenshots are clean;
- visual style changes with Brand Profile V2;
- no low-level CSS needs to be emitted by the AI;
- Kethic's AI-builder showcase hero is visibly stronger than the current preview.
