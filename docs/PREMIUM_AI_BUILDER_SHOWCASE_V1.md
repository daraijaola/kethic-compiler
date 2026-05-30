# Premium AI Builder Showcase V1

Status: Micheal-owned first showcase target.

Purpose: define the exact first website Kethic must be able to generate before we claim premium output.

This is not a new feature family. This document turns the existing Premium Macros V1, Brand Profile V2, and Premium Showcase Targets V1 into one strict page target.

## End Goal

Kethic should generate one AI-builder landing page that is clean, premium, mobile-safe, and meaningfully shorter than a React/Tailwind baseline.

This page is the proof path for Clovoc:

> Clovoc is the AI builder. Kethic is the compact source/compiler layer that makes generation cheaper and more consistent.

## Page Narrative

The page should explain one idea:

> AI builders should not pay models to repeatedly write verbose frontend code.

Kethic solves that by letting the AI write compact page intent while the compiler expands it into standard HTML, CSS, and JavaScript.

## Required Sections

### 1. Navbar

Purpose: make the page feel like a real product, not a demo.

Items:

- Kethic mark/name
- Product
- Benchmark
- How it works
- Contact

Visual target:

- minimal
- floating or fixed top bar
- off-white surface
- black text
- lime accent used sparingly

### 2. Hero

Purpose: state the category and value immediately.

Headline:

```text
The compact source language for AI-built websites.
```

Supporting copy:

```text
Kethic lets AI write shorter web source, then compiles it into standard HTML, CSS, and JavaScript.
```

Primary action:

```text
View benchmark
```

Secondary action:

```text
How it works
```

Visual target:

- not text-only
- left/right composition on desktop
- visual panel or compiler object on the right
- stacked visual above text on mobile
- no oversized heading on mobile

### 3. Feature Grid

Purpose: explain what Kethic owns.

Items:

- Compact source
- Compiler expansion
- Reusable identity
- Quality gates

Visual target:

- not identical generic cards
- should feel like product capability tiles
- enough spacing to scan quickly

### 4. Showcase

Purpose: visually explain the source-to-output pipeline.

Content:

```text
AI prompt -> Kethic source -> Compiler -> Web output
```

Visual target:

- the most important non-text section after the hero
- should look like a product/technical system panel
- must not be just paragraph text

### 5. Metrics

Purpose: prove why the source layer matters.

Items:

- React/Tailwind completion tokens
- Kethic completion tokens
- target reduction

Public wording:

```text
Around 90% lower generated output on recorded website tasks.
```

Visual target:

- clear comparison
- benchmark-like, not marketing-only
- exact values allowed only when tied to a recorded benchmark

### 6. How It Works

Purpose: explain the architecture simply.

Steps:

1. AI writes compact source.
2. Brand profile supplies reusable identity.
3. Compiler expands into web files.
4. Clovoc ships pages with lower generation cost.

Visual target:

- process row or timeline
- each step should be short
- no dense paragraphs

### 7. CTA

Purpose: convert interested builders/investors.

Headline:

```text
Building an AI builder? Talk to the founder.
```

Body:

```text
Kethic is preparing its next compiler sprint and benchmark suite.
```

Primary action:

```text
Email Micheal
```

Target:

```text
mailto:Michealijaola@outlook.com
```

## Brand Direction

Use Kethic's default Brand Profile V2:

- off-white background
- black text
- lime accent
- technical grid or light linework background
- sharp but not harsh edges
- subtle motion only
- no loud gradients
- no generic blue SaaS look
- no OpenVC-style pink

## Failure Conditions

The page fails if:

- it looks like plain cards stacked under a hero;
- mobile hero text clips or becomes huge;
- every section uses the same layout;
- there is no strong product/system visual;
- benchmark proof is vague;
- source becomes almost as verbose as HTML/CSS/Tailwind;
- generated output is not standard HTML/CSS/JS.

## Source Target

The final premium source should stay close to:

```kethic
hero ProductHero
featureGrid CoreBenefits
showcase CompilerFlow
metrics Benchmark
workflow HowItWorks
cta FounderCall
```

Details can live inside each block, but the page structure must remain compact.

## Acceptance Criteria

This showcase is done when:

- it compiles from Kethic source;
- it has desktop and mobile screenshots;
- it has benchmark numbers recorded;
- the page is visually stronger than the current `premium-current-kethic.keth` preview;
- it can be shown as the first proof that Kethic is moving toward Lovable-level output.
