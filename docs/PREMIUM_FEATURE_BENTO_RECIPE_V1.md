# Premium Feature Bento Recipe V1

Status: Micheal-owned recipe spec.

Purpose: define the third premium compiler recipe Kethic needs after hero and benchmark.

The current feature sections are too close to repeated cards. That is the exact pattern Kethic should avoid. If the AI has to write every card layout, every spacing decision, every responsive wrapper, and every visual treatment, the source grows and the page still looks generic.

This recipe makes the compiler own capability-section composition.

## Goal

Turn compact feature intent into a premium capability section.

```text
compact feature items
        ->
compiler-owned bento recipe
        ->
responsive feature section with hierarchy, rhythm, and visual variety
```

The model should only emit the section title and the feature meaning. The compiler decides card hierarchy, asymmetric layout, visual markers, spacing, and mobile behavior.

## Target Source

```kethic
featureGrid CoreBenefits
  title "The compiler carries the repeated web work"
  layout "bento"
  item "Compact source" "The model writes page intent instead of frontend repetition." span "large"
  item "Compiler expansion" "Kethic expands compact source into standard web files."
  item "Reusable identity" "Brand profiles keep visual decisions outside every page."
  item "Quality gates" "Kethic checks responsive structure, accessibility, and non-generic output."
end
```

## Why This Recipe Exists

Premium websites do not usually present every capability as equal. They use hierarchy:

- one primary idea gets more space;
- supporting ideas are smaller;
- layout changes between desktop and mobile;
- visual density is controlled;
- repeated cards still feel composed, not copied.

Kethic needs this because the language must stay compact while the output becomes richer.

## Required Fields

- `title`: required. Section headline.
- `item`: required. At least three items.

## Optional Fields

- `layout`: optional. Defaults to the brand profile's preferred feature layout.
- `span`: optional per item. Supports `large`, `wide`, `tall`, and `normal`.
- `proof`: optional per item. Short metric, status, or evidence line.
- `visual`: optional per item. Chooses icon/diagram family.

## Layout Families

The first implementation should support five layout families.

### `bento`

Best default for premium SaaS and developer-tool pages.

Shows:

- one large anchor tile;
- two to five supporting tiles;
- varied tile sizes;
- subtle separators instead of heavy card chrome.

### `tiles`

Best for simpler landing pages.

Shows:

- equal cards;
- consistent spacing;
- optional icons.

### `split`

Best when one capability needs explanation.

Shows:

- explanation on one side;
- capability list or visual stack on the other.

### `list`

Best for documentation-style pages.

Shows:

- compact rows;
- clear headings;
- dense but readable text.

### `proof-grid`

Best when features include metrics.

Shows:

- feature name;
- proof value;
- short explanation;
- comparison-friendly layout.

## Kethic Default Feature Section

Kethic's own website should use:

```kethic
layout "bento"
```

The first item should usually be the anchor tile:

```kethic
item "Compact source" "The model writes page intent instead of frontend repetition." span "large"
```

This makes the feature section visually say the same thing as the product: the compiler expands a small source into a larger result.

## Desktop Layout

Desktop should compile to:

- section title with strong hierarchy;
- asymmetric grid, not four identical cards by default;
- one large anchor tile;
- supporting cards that feel related but not cloned;
- enough whitespace to feel premium;
- accent color used only for state, proof, or active detail;
- no nested card-in-card styling.

## Mobile Layout

Mobile should compile to:

- stacked cards;
- anchor tile first;
- no horizontal overflow;
- readable text sizes;
- optional visuals reduced or hidden if they crowd the content;
- consistent spacing between items.

## Brand Profile Inputs

Brand Profile V2 should influence:

- layout preference: `bento`, `split`, `tiles`, `list`, `proof-grid`;
- card style: `outlined`, `paper`, `minimal`, `chrome`;
- corner radius;
- separator weight;
- accent color;
- icon/marker style;
- density: `quiet`, `balanced`, `dense`;
- motion: `none`, `calm`, `active`.

The source should not specify CSS grid columns, breakpoints, border radius, shadows, classes, or media queries.

## Generated Output Requirements

The compiler should emit:

- semantic section markup;
- one heading for the section;
- accessible feature cards or list items;
- stable IDs/classes;
- responsive CSS;
- no horizontal overflow;
- no dependency on React, Tailwind, or shadcn;
- `prefers-reduced-motion` fallback if motion exists.

## Token Reduction Logic

A handwritten React/Tailwind feature section usually repeats:

- card wrappers;
- grid wrappers;
- responsive classes;
- heading classes;
- paragraph classes;
- gap and spacing classes;
- icon wrappers;
- border/background classes;
- mobile variants.

Kethic should replace that with a compact `featureGrid` block. The generated HTML/CSS may be verbose, but the model output stays short.

## Failure Conditions

This recipe fails if:

- every feature card looks identical in premium mode;
- source has to describe grid columns or Tailwind-style classes;
- the section feels like generic SaaS cards;
- mobile layout has horizontal scroll;
- text density makes the section hard to scan;
- the accent color becomes decorative noise instead of signal.

## Acceptance Criteria

Premium Feature Bento Recipe V1 is done when:

- `featureGrid` can describe a premium capability section in under 18 lines;
- one feature can be emphasized without writing CSS;
- compiler output can create a non-identical bento layout;
- mobile output stacks cleanly;
- Brand Profile V2 changes visual treatment without changing source;
- Kethic's AI-builder showcase stops looking like repeated generic cards.
