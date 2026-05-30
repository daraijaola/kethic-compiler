# Brand Profile V2

Status: Micheal-owned product/design spec.

Purpose: make Kethic output visually consistent and premium without making AI repeat design decisions on every page.

Brand Profile V1 proves the idea. V2 turns the profile into a reusable design system.

## Core Idea

The AI should generate a brand profile once. Every page after that should use compact Kethic source plus the stored profile.

```text
Brand Profile V2 + Kethic Page Source
        ↓
Compiler
        ↓
Premium HTML/CSS/JS
```

This is important because beautiful websites require many repeated visual decisions: type scale, spacing, surfaces, buttons, cards, shadows, backgrounds, and motion. AI should not re-emit all of that per page.

## Required Fields

```json
{
  "name": "Kethic",
  "palette": "mono-lime",
  "type": "neo-grotesk",
  "density": "spacious",
  "radius": "sharp-soft",
  "surface": "paper",
  "shadow": "quiet",
  "button": "boxed",
  "card": "outlined",
  "nav": "floating-bar",
  "hero": "split-visual",
  "background": "technical-grid",
  "motion": "calm",
  "ornament": "compiler-lines",
  "voice": "precise"
}
```

## Field Meaning

### `palette`

Controls page background, text, accent, muted text, borders, and semantic colors.

Initial profiles:

- `mono-lime`
- `soft-black`
- `lumen`
- `forge`
- `nocturne`

### `type`

Controls type mood and scale.

Initial options:

- `neo-grotesk`
- `technical`
- `editorial`
- `mono`

### `density`

Controls spacing rhythm.

Initial options:

- `compact`
- `balanced`
- `spacious`

### `surface`

Controls container feel.

Initial options:

- `paper`
- `outlined`
- `glass`
- `chrome`
- `plain`

### `button`

Controls CTA style.

Initial options:

- `boxed`
- `pill`
- `mono`
- `accent-fill`

### `card`

Controls feature and proof cards.

Initial options:

- `outlined`
- `elevated`
- `bento`
- `flat`
- `glass`

### `nav`

Controls navigation style.

Initial options:

- `floating-bar`
- `minimal`
- `split`
- `sidebar`

### `hero`

Controls default hero composition.

Initial options:

- `split-visual`
- `editorial`
- `centered-proof`
- `code-compare`
- `dashboard-preview`

### `background`

Controls lightweight page atmosphere.

Initial options:

- `technical-grid`
- `soft-orbits`
- `plain`
- `paper-lines`
- `dark-room`

### `motion`

Controls animation intensity.

Initial options:

- `none`
- `calm`
- `active`

All generated motion must respect `prefers-reduced-motion`.

### `ornament`

Controls small decorative identity.

Initial options:

- `none`
- `compiler-lines`
- `orbits`
- `code-traces`
- `panels`

## Kethic Default Profile

Kethic's own website should use:

```json
{
  "name": "Kethic",
  "palette": "mono-lime",
  "type": "neo-grotesk",
  "density": "spacious",
  "radius": "sharp-soft",
  "surface": "paper",
  "shadow": "quiet",
  "button": "boxed",
  "card": "outlined",
  "nav": "floating-bar",
  "hero": "split-visual",
  "background": "technical-grid",
  "motion": "calm",
  "ornament": "compiler-lines",
  "voice": "precise"
}
```

## Acceptance Criteria

Brand Profile V2 is successful if:

- the same Kethic source can render as visibly different websites;
- the brand remains consistent across multiple pages;
- the AI does not need to repeat low-level style decisions;
- generated CSS uses reusable tokens;
- mobile output remains stable;
- public demos look intentionally designed, not generic.
