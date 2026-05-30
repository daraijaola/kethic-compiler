# Premium Macros V1

Status: Micheal-owned language and product spec.

Purpose: define the compact section language Kethic needs before Ayush implements compiler support.

The goal is not to add many CSS-like keywords. The goal is to let AI describe a premium website with short, semantic blocks while the compiler expands those blocks into standard HTML, CSS, and JavaScript.

## Design Rule

Every macro must pass three tests:

1. It must save model output compared with handwritten HTML/CSS/Tailwind.
2. It must give the compiler enough intent to create a polished layout.
3. It must remain readable enough for humans and AI agents to edit.

## First Slice

Implement these first:

- `hero`
- `featureGrid`
- `showcase`
- `metrics`
- `cta`

These five sections are enough to prove a full premium landing page.

## Macro Shape

Macros use block syntax because it is readable, stable, and extensible:

```kethic
hero ProductHero
  title "The compact source language for AI-built websites"
  body "Kethic lets AI write shorter web source, then compiles it into standard HTML, CSS, and JavaScript."
  primary "View benchmark" "#benchmark"
  secondary "Read about Kethic" "/about"
end
```

Compiler intent:

- `hero` means first-screen composition.
- `title` becomes the main heading.
- `body` becomes supporting copy.
- `primary` and `secondary` become CTA links/buttons.
- Brand Profile V2 chooses exact visual treatment.

## Hero

Use for the first major page section.

Target syntax:

```kethic
hero ProductHero
  title "Build the same website with less model output"
  body "Kethic gives AI a compact source layer and lets the compiler expand it into normal web files."
  primary "See benchmark" "#benchmark"
  secondary "How it works" "#how"
end
```

Compiler should support these hero variants:

- `splitProduct`
- `editorial`
- `fullBleedVisual`
- `codeCompare`
- `dashboardPreview`

The source does not pick the exact visual variant by default. Brand profile and deterministic seed choose it.

## Feature Grid

Use for product benefits.

Target syntax:

```kethic
featureGrid CoreBenefits
  item "Compact source" "The AI writes structure and intent instead of verbose frontend code."
  item "Compiler expansion" "Kethic expands that source into standard HTML, CSS, and JavaScript."
  item "Reusable identity" "Brand profiles keep visual direction consistent across pages."
end
```

Compiler should support:

- 3-card grid
- bento grid
- horizontal feature list
- split feature panel

## Showcase

Use when a page needs a product visual, code comparison, dashboard, or generated website preview.

Target syntax:

```kethic
showcase ProductFlow
  title "The model writes less. The compiler builds more."
  before "React/Tailwind output repeats layout, classes, and style decisions."
  after "Kethic source captures the page intent, then expands deterministically."
end
```

Compiler should support:

- code comparison
- product window
- dashboard preview
- website preview rail
- compiler pipeline visual

## Metrics

Use for benchmarks and proof.

Target syntax:

```kethic
metrics Benchmark
  label "Recorded benchmark"
  item "5,224" "React/Tailwind completion tokens"
  item "198" "Kethic completion tokens"
  item "90%" "Target lower generated output"
end
```

Compiler should support:

- number strip
- benchmark chart
- comparison panel
- proof cards

Public language should default to `90%` unless a specific benchmark is being shown with exact raw data.

## CTA

Use for conversion or next action.

Target syntax:

```kethic
cta FounderCall
  title "Building an AI builder? Talk to the founder."
  body "Kethic is preparing its next compiler sprint and benchmark suite."
  primary "Email Micheal" "mailto:Michealijaola@outlook.com"
end
```

Compiler should support:

- centered CTA
- split CTA
- panel CTA
- footer CTA

## Later Macros

After the first slice works, add:

- `navbar`
- `workflow`
- `pricing`
- `faq`
- `testimonial`
- `footer`

These matter, but they should not block the first proof page.

## Acceptance Criteria

The first Premium Macros V1 page is successful only if:

- one compact `.keth` page creates a full landing page;
- the page looks credible beside Lovable/v0-style output;
- mobile layout does not break;
- source remains clearly shorter than React/Tailwind;
- output remains standard HTML/CSS/JS;
- the compiler, not the AI, owns the heavy design details.
