# CSS Capability Map for Kethic

Status: research map for Kethic visual-language design.

Last researched: 2026-05-14.

Purpose: understand the full CSS surface before adding new Kethic visual primitives. This is not an implementation plan yet. It is the reference map that keeps Kethic from becoming either too small to make premium websites or too bloated by copying CSS one property at a time.

## Primary Sources

- MDN CSS Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
- MDN CSS At-rules Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules
- MDN CSS Values and Units: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Values_and_units
- MDN CSS Selectors: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors
- MDN CSS Layout Cookbook: https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook
- W3C CSS Current Work: https://www.w3.org/Style/CSS/current-work
- MDN CSS Grid Basic Concepts: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts
- MDN CSS Pseudo-elements: https://developer.mozilla.org/docs/Web/CSS/Pseudo-elements
- MDN Media Object Pattern: https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Media_objects
- MDN Card Pattern: https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Card

## Key Finding

CSS does not have official "components" in the way frontend frameworks do.

CSS has:

- properties;
- selectors;
- pseudo-classes;
- pseudo-elements;
- at-rules;
- values and functions;
- layout systems;
- cascade and inheritance rules;
- reusable layout patterns made from HTML plus CSS.

MDN describes CSS reference as an index of standard properties, pseudo-classes, pseudo-elements, data types, functional notations, and at-rules. The MDN layout cookbook separately describes common layout recipes such as media objects, columns, centered elements, sticky footers, split navigation, breadcrumbs, list groups, pagination, cards, and grid wrappers.

For Kethic, this means:

> We should not copy every CSS property into a Kethic keyword. We need a visual programming layer that compiles to CSS.

## Research Boundary

The user's request was to understand "all CSS components." The accurate technical answer is:

- CSS has no official "component" primitive.
- CSS has a very large property/value/rule surface.
- UI components are authoring patterns built with HTML, CSS, and sometimes JavaScript.
- Kethic should cover CSS through a compact language model: semantic primitives, section macros, and a controlled escape hatch.

This file is therefore organized by capability and web-building pattern, not by raw alphabetical property list.

## CSS Surface Area

### 1. Rule Structure

CSS rule shape:

```css
selector {
  property: value;
}
```

What matters:

- selector chooses elements;
- properties define styles;
- values define the final visual behavior;
- invalid rules are ignored by the browser;
- the cascade decides which rule wins.

Kethic implication:

- Kethic should not force users or AI to write selectors for common UI.
- Kethic should generate stable classes and data attributes.
- Kethic needs an escape hatch for raw selector-level styling later.

### 2. Cascade, Inheritance, Specificity, Layers

Relevant CSS concepts:

- cascade;
- inheritance;
- specificity;
- shorthand properties;
- computed value;
- used value;
- `@layer`;
- custom properties.

Why it matters:

- Beautiful sites require predictable override rules.
- Bad CSS becomes fragile when specificity rises.
- Modern CSS uses layers and variables to manage design systems.

Kethic implication:

- Compiler-generated CSS should use layers.
- User styles should be scoped and layered.
- Themes should be expressed as tokens, not repeated raw values.

Kethic abstraction candidates:

```keth
skin nocturne
token accent = "coral"
layer component
```

### 3. Selectors

Selector families:

- type selectors: `button`
- class selectors: `.card`
- id selectors: `#app`
- attribute selectors: `[data-open]`
- pseudo-classes: `:hover`, `:focus-visible`, `:checked`, `:disabled`
- pseudo-elements: `::before`, `::after`, `::placeholder`, `::backdrop`
- combinators: child, descendant, sibling
- grouping selectors
- nesting selector `&`

Why it matters:

- States and visual details depend on selectors.
- Premium effects often use `::before` and `::after`.
- Forms need pseudo-elements and pseudo-classes.

Kethic implication:

- Kethic should expose states semantically:

```keth
state hover
state focus
state active
state disabled
```

- Kethic should generate pseudo-elements for surfaces/glows automatically.

### 4. At-rules

Important CSS at-rules:

- `@media`
- `@container`
- `@supports`
- `@keyframes`
- `@layer`
- `@font-face`
- `@property`
- `@scope`
- `@starting-style`
- `@view-transition`
- `@charset`
- `@color-profile`
- `@custom-media`
- `@import`
- `@namespace`
- `@page`
- `@counter-style`

Important media features:

- `width`
- `height`
- `orientation`
- `hover`
- `pointer`
- `prefers-color-scheme`
- `prefers-reduced-motion`
- `prefers-contrast`
- `prefers-reduced-data`
- `dynamic-range`
- `color-gamut`

Kethic implication:

- Kethic needs first-class responsive and preference-aware rules, not only viewport breakpoints.

Kethic abstraction candidates:

```keth
when mobile
when container > 42rem
when motion safe
when dark
when pointer coarse
```

### 5. Values and Functions

Important CSS value/function families:

- numeric values: numbers, percentages, lengths, angles, times;
- colors: named colors, hex, rgb, hsl, lab, lch, oklab, oklch, color-mix;
- sizing functions: `min()`, `max()`, `clamp()`, `calc()`;
- layout functions: `minmax()`, `fit-content()`, `repeat()`;
- image functions: `linear-gradient()`, `radial-gradient()`, `conic-gradient()`;
- filter functions: `blur()`, `brightness()`, `contrast()`, `drop-shadow()`;
- transform functions: `translate()`, `scale()`, `rotate()`, `skew()`, `matrix()`;
- variable function: `var()`;
- URL function: `url()`;
- shape functions: `circle()`, `ellipse()`, `polygon()`, `path()`, `inset()`.

CSS-wide values every Kethic primitive must understand:

- `inherit`
- `initial`
- `unset`
- `revert`
- `revert-layer`

Kethic implication:

- Kethic values need typed token categories.
- Kethic should prefer named tokens for common use.
- Advanced values should be allowed as raw strings where needed.

Kethic abstraction candidates:

```keth
space 4
size wide
color accent
gradient aurora
radius soft
blur 18
```

## CSS Property Groups

This section groups CSS properties by what they do. It is more useful for Kethic than an alphabetical list.

### 1. Display and Formatting

Core CSS:

- `display`
- `box-sizing`
- `visibility`
- `content`
- `contain`
- `container`
- `container-name`
- `container-type`

Design role:

- controls whether an element exists visually;
- controls block, inline, flex, grid, contents, none;
- controls containment and query behavior.

Kethic layer:

```keth
show
hide
flow block
flow inline
flow contents
contain layout
```

### 2. Box Model and Spacing

Core CSS:

- `margin`, `margin-*`
- `padding`, `padding-*`
- logical margins and padding;
- `border`, `border-*`
- `outline`, `outline-*`
- `box-sizing`

Design role:

- spacing rhythm;
- internal/external breathing room;
- edge and focus treatment.

Kethic layer:

```keth
space 4
pad 5
gap 3
edge soft
focus ring
```

### 3. Sizing

Core CSS:

- `width`
- `height`
- `min-width`
- `max-width`
- `min-height`
- `max-height`
- `inline-size`
- `block-size`
- `min-inline-size`
- `max-inline-size`
- `aspect-ratio`

Design role:

- stable layout;
- responsive constraints;
- media proportions.

Kethic layer:

```keth
size full
size reading
size wide
ratio 16/9
safe-size card
```

### 4. Flexbox

Core CSS:

- `display: flex`
- `flex`
- `flex-basis`
- `flex-direction`
- `flex-flow`
- `flex-grow`
- `flex-shrink`
- `flex-wrap`
- `order`

Design role:

- rows;
- stacks;
- nav bars;
- button groups;
- alignment of variable-sized content.

Kethic layer:

```keth
flow row
flow stack
wrap true
grow
order 2
```

### 5. Grid

Core CSS:

- `display: grid`
- `grid`
- `grid-template`
- `grid-template-columns`
- `grid-template-rows`
- `grid-template-areas`
- `grid-column`
- `grid-row`
- `grid-area`
- `grid-auto-flow`
- `grid-auto-columns`
- `grid-auto-rows`
- `gap`
- `row-gap`
- `column-gap`

Design role:

- page composition;
- bento layouts;
- card grids;
- dashboards;
- editorial layouts;
- responsive sections.

Kethic layer:

```keth
flow grid cols:3
flow bento
span 2
area hero
```

### 6. Box Alignment

Core CSS:

- `align-content`
- `align-items`
- `align-self`
- `justify-content`
- `justify-items`
- `justify-self`
- `place-content`
- `place-items`
- `place-self`

Design role:

- centering;
- distribution;
- item alignment in flex/grid.

Kethic layer:

```keth
align center
align start
place center
distribute between
```

### 7. Positioning and Stacking

Core CSS:

- `position`
- `top`, `right`, `bottom`, `left`
- logical inset properties;
- `inset`
- `z-index`
- `float`
- `clear`
- anchor positioning properties;
- `isolation`

Design role:

- sticky navs;
- overlays;
- badges;
- art-direction layers;
- popovers;
- hero decorations.

Kethic layer:

```keth
pin top
layer dialog
float none
overlay
anchor trigger
```

### 8. Overflow, Scroll, and Scroll Behavior

Core CSS:

- `overflow`
- `overflow-x`
- `overflow-y`
- `overflow-block`
- `overflow-inline`
- `scroll-behavior`
- `scroll-margin`
- `scroll-padding`
- `scroll-snap-*`
- `overscroll-behavior`
- `scrollbar-*`

Design role:

- scroll sections;
- carousels;
- sticky/anchor navigation;
- snap panels;
- internal panes.

Kethic layer:

```keth
scroll smooth
snap x
overflow clip
overflow scroll
```

### 9. Typography and Text

Core CSS:

- `font`
- `font-family`
- `font-size`
- `font-weight`
- `font-style`
- `font-stretch`
- `font-variant`
- `font-feature-settings`
- `font-variation-settings`
- `line-height`
- `letter-spacing`
- `word-spacing`
- `text-align`
- `text-decoration`
- `text-transform`
- `text-wrap`
- `white-space`
- `word-break`
- `overflow-wrap`
- `hyphens`
- `line-clamp`

Design role:

- brand voice;
- readability;
- responsive heading scale;
- editorial polish.

Kethic layer:

```keth
type display
type body
weight strong
track normal
line reading
clamp 3
```

### 10. Color and Color Systems

Core CSS:

- `color`
- `accent-color`
- `color-scheme`
- `color-interpolation`
- color functions: `rgb`, `hsl`, `lab`, `lch`, `oklab`, `oklch`, `color-mix`, `light-dark`

Design role:

- themes;
- dark/light modes;
- accessibility contrast;
- brand mood.

Kethic layer:

```keth
skin nocturne
tone electric
color accent
contrast safe
```

### 11. Backgrounds

Core CSS:

- `background`
- `background-color`
- `background-image`
- `background-position`
- `background-size`
- `background-repeat`
- `background-attachment`
- `background-clip`
- `background-origin`
- `background-blend-mode`

Design role:

- page atmosphere;
- gradients;
- image hero backgrounds;
- layered visual identity.

Kethic layer:

```keth
back gradient:nocturne
back image:hero
back blend:soft
```

### 12. Borders, Radius, and Edges

Core CSS:

- `border`
- `border-width`
- `border-style`
- `border-color`
- `border-radius`
- logical border properties;
- `border-image`

Design role:

- cards;
- buttons;
- chips;
- inputs;
- glass surfaces.

Kethic layer:

```keth
edge soft
edge glass
radius pill
radius card
```

### 13. Shadows, Filters, and Effects

Core CSS:

- `box-shadow`
- `text-shadow`
- `filter`
- `backdrop-filter`
- `opacity`
- `mix-blend-mode`
- `background-blend-mode`
- `isolation`

Design role:

- depth;
- glassmorphism;
- glow;
- elevation;
- image treatment.

Kethic layer:

```keth
depth high
glow cyan
glass blur:18
blend screen
```

### 14. Clipping, Masking, and Shapes

Core CSS:

- `clip-path`
- `mask`
- `mask-image`
- `mask-size`
- `mask-position`
- `shape-outside`
- `shape-margin`
- `object-view-box`

Design role:

- non-rectangular images;
- cinematic crops;
- reveal effects;
- irregular layouts.

Kethic layer:

```keth
clip circle
clip angled
mask fade
shape editorial
```

### 15. Transforms and 3D

Core CSS:

- `transform`
- `transform-origin`
- `transform-style`
- `translate`
- `scale`
- `rotate`
- `skew`
- `perspective`
- `perspective-origin`
- `backface-visibility`

Design role:

- hover effects;
- cards;
- parallax;
- 3D panels;
- playful interactions.

Kethic layer:

```keth
move y:-2
scale 1.04
tilt soft
perspective stage
```

### 16. Transitions and Animations

Core CSS:

- `transition`
- `transition-property`
- `transition-duration`
- `transition-timing-function`
- `transition-delay`
- `animation`
- `animation-name`
- `animation-duration`
- `animation-delay`
- `animation-timing-function`
- `animation-fill-mode`
- `animation-iteration-count`
- `animation-direction`
- `animation-play-state`
- `animation-timeline`
- `view-timeline-*`
- `scroll-timeline-*`
- `@keyframes`
- `@starting-style`
- `@view-transition`

Design role:

- microinteractions;
- entrance motion;
- scroll effects;
- view transitions;
- loading states.

Kethic layer:

```keth
motion rise
motion fade
motion drift
motion stagger
motion none
```

Compiler rule:

- Always respect `prefers-reduced-motion`.

### 17. Images, Video, and Replaced Elements

Core CSS:

- `object-fit`
- `object-position`
- `aspect-ratio`
- image rendering;
- `vertical-align`

Design role:

- hero imagery;
- thumbnails;
- media cards;
- avatar rows;
- responsive images.

Kethic layer:

```keth
media cover
media contain
crop center
ratio portrait
```

### 18. Forms and UI Controls

Core CSS:

- `accent-color`
- `appearance`
- `caret-color`
- `field-sizing`
- `resize`
- `user-select`
- `pointer-events`
- form pseudo-classes: `:valid`, `:invalid`, `:required`, `:optional`, `:checked`, `:disabled`, `:focus-visible`, `:placeholder-shown`
- form pseudo-elements: `::placeholder`, `::file-selector-button`

Design role:

- polished forms;
- validation;
- accessibility;
- product onboarding.

Kethic layer:

```keth
field premium
validate email
input pill
control focus:ring
```

### 19. Tables, Lists, and Counters

Core CSS:

- `table-layout`
- `border-collapse`
- `border-spacing`
- `caption-side`
- `empty-cells`
- `list-style`
- `list-style-type`
- `list-style-position`
- `counter-reset`
- `counter-increment`
- `counter-set`
- `@counter-style`

Design role:

- dashboards;
- pricing comparisons;
- docs;
- ordered workflows.

Kethic layer:

```keth
table ledger
list steps
counter auto
```

### 20. Internationalization and Writing Modes

Core CSS:

- `direction`
- `unicode-bidi`
- `writing-mode`
- `text-orientation`
- logical properties;
- `ruby-*`

Design role:

- right-to-left languages;
- vertical writing;
- global products.

Kethic layer:

```keth
lang ar
direction rtl
writing vertical
logical true
```

### 21. Printing and Paged Media

Core CSS:

- `@page`
- `page`
- `break-before`
- `break-after`
- `break-inside`
- `orphans`
- `widows`

Design role:

- PDFs;
- invoices;
- reports;
- printable documents.

Kethic layer:

```keth
print report
page A4
break avoid
```

### 22. Custom Properties and CSS Houdini

Core CSS:

- custom properties `--name`;
- `var()`;
- `@property`;
- paint worklets through `paint()`;
- future custom functions/mixins.

Design role:

- design systems;
- theme tokens;
- runtime theming;
- advanced rendering.

Kethic layer:

```keth
token color accent = "#ff5d73"
token space 4 = "1rem"
```

## Common HTML/CSS Website Patterns

These are not CSS properties. They are reusable interface patterns built from HTML, CSS, and sometimes JS.

### Layout Patterns

- stack;
- row;
- columns;
- split layout;
- centered layout;
- grid wrapper;
- card grid;
- bento grid;
- sidebar shell;
- dashboard shell;
- sticky footer;
- sticky header;
- media object;
- masonry-like layout;
- scroll snap panels;
- full-bleed sections;
- container-constrained sections.

Kethic section primitives should generate these without making the AI write low-level grid/flex details repeatedly.

### Navigation Patterns

- top nav;
- split nav;
- breadcrumb;
- sidebar nav;
- tabs;
- pagination;
- mobile menu;
- command palette;
- skip link;
- footer nav.

### Content Patterns

- hero;
- cinematic hero;
- split hero;
- centered hero;
- product-led hero;
- app screenshot hero;
- waitlist hero;
- launch announcement;
- feature grid;
- feature list;
- benefit row;
- icon grid;
- metric strip;
- benchmark panel;
- proof bar;
- testimonial wall;
- logo cloud;
- product showcase;
- screenshot rail;
- code comparison;
- before/after comparison;
- architecture diagram;
- timeline;
- steps/workflow;
- FAQ;
- pricing table;
- comparison table;
- blog/card index;
- case study section;
- CTA band;
- newsletter/signup section.

### Product/App Patterns

- dashboard;
- stat cards;
- activity feed;
- notification feed;
- kanban board;
- settings page;
- billing page;
- onboarding checklist;
- profile page;
- data table;
- sortable table;
- filterable table;
- search results;
- empty state;
- loading state;
- error state;
- success state;
- toast;
- modal/dialog;
- drawer;
- popover;
- tooltip.

### Form Patterns

- login;
- signup;
- waitlist;
- checkout;
- contact;
- multi-step form;
- inline validation;
- file upload;
- search box;
- filter panel.

### Commerce and Marketplace Patterns

- product grid;
- product detail;
- cart drawer;
- checkout form;
- order summary;
- plan selector;
- marketplace listing;
- creator profile;
- review cards.

### Documentation and Developer Tool Patterns

- docs shell;
- left navigation;
- table of contents;
- code block;
- code tabs;
- API reference table;
- changelog;
- release notes;
- quickstart panel;
- install command panel;
- playground/editor split;
- terminal output panel.

### Marketing Proof Patterns

- benchmark cards;
- customer quote;
- case study card;
- logo wall;
- security/compliance strip;
- investor proof;
- "why now" section;
- market map;
- competitor comparison;
- roadmap preview.

## Kethic Coverage Matrix

This matrix turns the CSS research into language-design decisions.

| Web need | Raw CSS surface | Kethic should expose | Why |
| --- | --- | --- | --- |
| Page rhythm | margin, padding, gap, line-height, max-width | `space`, `pad`, `gap`, `rhythm`, `width` | High token savings and consistent design |
| Premium surfaces | background, border, shadow, blur, opacity, blend | `surface`, `glass`, `depth`, `glow`, `back` | Complex CSS compressed into intent |
| Responsive layout | flex, grid, media queries, container queries | `flow`, `cols`, `split`, `bento`, `when` | Common source of verbose generated code |
| Typography | font, size, weight, line-height, wrap | `type`, `weight`, `line`, `clamp` | Keeps pages from looking generic |
| Color systems | color, backgrounds, gradients, color-scheme | `skin`, `tone`, `color`, `gradient` | Lets Kethic create distinct visual styles |
| Motion | transition, animation, keyframes, reduced motion | `motion`, `enter`, `hover`, `stagger` | High design value with accessibility safety |
| Forms | appearance, pseudo-classes, validation states | `field`, `validate`, `control`, `required` | Needed for real product pages |
| Data UI | tables, grids, overflow, sticky headers | `table`, `ledger`, `feed`, `panel` | Needed for dashboards and apps |
| Complex art direction | clip, mask, transform, pseudo-elements | `mask`, `clip`, `tilt`, `ornament` | Makes pages non-generic |
| Rare edge cases | any raw declaration | `rawstyle` | Prevents language dead ends |

## What "Beautiful Like HTML/CSS" Requires

Kethic can get close to hand-written HTML/CSS quality only if it solves these layers:

1. Composition: section-level macros for real pages, not just boxes.
2. Theme: named skins that control type, colors, surfaces, and default contrast.
3. Layout: compact primitives for grid, split, bento, stack, dashboard, and full-bleed sections.
4. Detail: surfaces, shadows, gradients, masks, media crops, hover states, and focus states.
5. Responsiveness: viewport and container-aware rules generated by default.
6. Accessibility: semantic HTML, focus rings, reduced motion, labels, and contrast checks.
7. Escape hatch: raw CSS for cases the compiler does not understand yet.

If any of these are missing, Kethic pages will become generic no matter how good the syntax is.

## Dangerous Direction

Do not try to define "the 100 CSS components" as one-word aliases for existing CSS properties.

That would create:

- a huge language surface;
- weak token savings;
- more memorization work for AI;
- less portability;
- a bad clone of CSS with different names.

The correct move is to define around 20 to 35 strong primitives that compile to many CSS declarations, then add section macros that compress common product and marketing patterns.

## What Kethic Should Not Do

Kethic should not create one keyword per CSS property.

Bad direction:

```keth
backgroundColor "#10101c"
borderRadius 24
boxShadow "0 24px 80px ..."
gridTemplateColumns "repeat(3, 1fr)"
```

That becomes alien CSS. It increases language size without solving token output or design quality.

## What Kethic Should Do

Kethic needs three layers.

### Layer 1: Core Visual Primitives

These are programmable and composable:

```keth
skin nocturne
surface glass depth:high glow:cyan
flow bento cols:3 gap:4
tone electric
motion rise stagger
```

These compile to many CSS declarations.

### Layer 2: Section Pattern Macros

These compress common website sections:

```keth
cinema Hero title:"..." body:"..." cta:book "Reserve"
metrics Proof
  "96%" "lower output tokens"
  "73%" "complex-page reduction"
end
steps Workflow
  "Prompt" "User asks"
  "Kethic" "AI writes compact source"
  "Output" "Compiler emits web files"
end
```

This is where 90%+ token savings becomes realistic for complex pages.

### Layer 3: Escape Hatch

For advanced cases, Kethic should allow raw style declarations inside a controlled block:

```keth
rawstyle Hero
  "clip-path" "polygon(0 0, 100% 0, 90% 100%, 0 100%)"
end
```

This should be available but not the default path.

## Kethic Visual Primitive Candidates

### Skins

Global visual systems:

- `nocturne`: dark, neon, cinematic;
- `glassriver`: black water, glass, cyan, copper;
- `aurora`: luminous gradients, soft blur;
- `editorial`: magazine layout, serif/display contrast;
- `fintech`: sharp, clean, trust-heavy;
- `luxury`: black, gold, spacious;
- `clay`: warm, human, earthy;
- `mono`: grayscale, developer/docs;
- `solar`: bright, optimistic, yellow/orange;
- `terminal`: code-native, green/black.

### Surfaces

Container feel:

- `plain`;
- `card`;
- `glass`;
- `paper`;
- `chrome`;
- `elevated`;
- `inset`;
- `outline`;
- `glow`;
- `media`.

### Flows

Layout intent:

- `stack`;
- `row`;
- `grid`;
- `bento`;
- `split`;
- `sidebar`;
- `center`;
- `cluster`;
- `reel`;
- `masonry`;
- `timeline`;
- `dashboard`.

### Tones

Semantic color/mood:

- `neutral`;
- `electric`;
- `warm`;
- `cool`;
- `danger`;
- `success`;
- `premium`;
- `quiet`;
- `loud`;
- `brand`;
- `night`;
- `sun`.

### Motion

Behavior:

- `none`;
- `fade`;
- `rise`;
- `slide`;
- `drift`;
- `pulse`;
- `scale`;
- `stagger`;
- `snap`;
- `reveal`.

## Implementation Priority Recommendation

Do not implement all CSS capabilities now.

Build in this order:

1. `skin` global theme primitive.
2. `surface` container primitive.
3. `flow` layout primitive.
4. `tone` color/mood primitive.
5. `motion` primitive with reduced-motion safety.
6. `cinema`, `metrics`, `steps`, `bento`, `pricing`, `faq`, `testimonials`, `showcase`, `cta` section macros.
7. Controlled `rawstyle` escape hatch.

## First Build Slice

This is the concrete next slice after research:

1. Visual token table:
   - colors;
   - gradients;
   - shadows;
   - radii;
   - spacing;
   - type scales.
2. `skin` primitive:
   - selects a complete design system;
   - emits CSS variables;
   - controls body, text, surfaces, links, buttons, and focus.
3. `surface` primitive:
   - `plain`, `card`, `glass`, `chrome`, `paper`, `media`, `glow`.
4. `flow` primitive:
   - `stack`, `row`, `grid`, `bento`, `split`, `cluster`, `reel`.
5. `motion` primitive:
   - `none`, `fade`, `rise`, `slide`, `pulse`, `stagger`;
   - auto-wraps with `prefers-reduced-motion`.
6. Five section macros:
   - `cinema`;
   - `metrics`;
   - `steps`;
   - `showcase`;
   - `waitlist`.

This is enough to test whether Kethic can generate beautiful pages while preserving 90%+ output-token reduction.

Reason:

- This covers the largest visual quality gap first.
- It keeps Kethic a programming language.
- It avoids copying 1,000 CSS details into keywords.
- It improves token reduction because macros compress repeated design structures.

## Current Kethic Gap

The flashy Nocturne Atlas test produced about 73% estimated output-token reduction against the compiled HTML/CSS/JS bundle. That is good, but below the 90%+ macro benchmark.

Why:

- Complex pages require repeated card, section, grid, and visual style blocks.
- Current Kethic has basic layout primitives but not high-level visual composition primitives.
- The compiler default theme has to carry too much design work.

Conclusion:

> To reach 90%+ on beautiful complex websites, Kethic must add semantic visual primitives and section macros, not hundreds of direct CSS aliases.
