# Kethic Native Web Architecture

Status: planning document. No compiler behavior is defined as implemented until a later phase says so.

Strategic update: Kethic's primary product direction is now AI-native source compression. The web architecture still applies, but future syntax decisions must be measured against token reduction, AI generation reliability, and compiler-enforced output quality. See `docs/KETHIC_AI_COMPRESSION_STRATEGY.md`.

This document maps the Kethic web layer carefully before code is written. It merges three design inputs:

- the Kethic Web Lexicon of 90 Namaru web terms;
- the Kethic Quality Layer of 50 style-system primitives;
- the Kethic Visual Signature Layer of 50 visual-identity primitives.

The purpose is to make Kethic capable of building full production websites without becoming renamed HTML, CSS, or JavaScript.

## 1. Core Position

Kethic web source should describe interface intent.

The compiler may output:

- HTML;
- CSS;
- JavaScript;
- static assets;
- runtime helpers;
- obfuscated bundles.

But the Kethic source should describe:

- pages as fixed vessels;
- sections as branch-vessels;
- components as sealed patterns;
- style as sealed visual law;
- interaction as awakened signals;
- accessibility as a compiler obligation;
- visual identity as a declared system, not decoration added later.

The browser platform remains the target. Kethic is the authoring language above it.

## 2. What We Are Not Doing

Kethic will not rename every HTML tag or CSS property.

That path would create 1,000 or more words and make the language harder than the platform it replaces.

Kethic will also not expose raw HTML/CSS as the main authoring surface. Raw platform escape hatches may exist later, but they must be explicit and controlled.

The main web layer must use:

- a small number of real web keywords;
- a larger set of web primitives;
- scoped style attributes inside `Tharsel`;
- compiler-known quality rules;
- visual signature primitives that generate many CSS/JS details from one Kethic intent.

## 3. Classification Rules

Every web term belongs to exactly one primary class.

### 3.1 True Keywords

True keywords change grammar. They are rare.

Initial approved keyword candidates:

- `Torvathar` - page/document root;
- `Selthar` - reusable component;
- `Tharsel` - style block;
- `Rinshev` - route/path;
- `Ikhna` - responsive/container condition;
- `Umrin` - event handler;
- `Umvator` - mount/render target;
- `Lumva` - reactive UI state, a light-awakening vessel.

`Lumva` replaces the rejected `Nava` candidate for interface state. It means a light-awakening vessel whose change causes the visible interface to update.

### 3.2 Web Primitives

Web primitives are interface building blocks. They compile to semantic HTML plus accessibility defaults.

Examples:

- `Shevva` section/region;
- `Vakar` generic container;
- `Kelen` text;
- `Keltor` heading;
- `Ovshev` link;
- `Mirva` image/media;
- `Umkar` button/action trigger;
- `Selvathar` form;
- `Enva` input;
- `Ruksel` list;
- `Umtharva` dialog/modal;
- `Rukshev` navigation;
- `Durkel` footer.

They are not global language keywords unless the parser requires them in a specific block context.

### 3.3 Style Attributes

Style attributes are only meaningful inside style-bearing contexts such as `Tharsel`, component variants, or page constitution blocks.

Examples:

- `Savarin` internal spacing;
- `Ovsa` external spacing;
- `Shevsa` gap;
- `Vator` width;
- `Torkar` height;
- `Lusel` color;
- `Mirlu` background;
- `Kellu` text color;
- `Kelsa` font size;
- `Natorkar` radius;
- `Mireshel` shadow;
- `Torshev` layer;
- `Narin` transition.

These should not pollute the general expression grammar.

### 3.4 Compiler-Only Concepts

Compiler-only concepts do not need syntax at first. They are internal rules or generated metadata.

Examples:

- `Kelkar` style identity/class generation;
- component style scope IDs;
- accessibility wiring IDs;
- source maps from Kethic web nodes to generated HTML/CSS/JS;
- public/private style boundary metadata.

### 3.5 Runtime Features

Runtime features require browser JavaScript helpers.

Examples:

- event handling;
- state updates;
- mount/hydration;
- modal focus trap;
- route transitions;
- scroll memory;
- live regions;
- data binding.

Runtime features must be small, typed, and generated from explicit Kethic semantics.

### 3.6 Research/Future Features

Some research primitives are valuable but not safe for early implementation.

Examples:

- `River Flow Layout`;
- `Page Topography`;
- `Asymmetric Balance`;
- `Visual Motif Engine`;
- `Hero Continuity`;
- `Living Theme`;
- `Magnetic Cursor`.

These must wait until the quality layer, token system, accessibility fallback, and performance budgets exist.

## 4. Approved Web Vocabulary Map

This table records the first web lexicon in implementation categories.

| Category | Terms |
| --- | --- |
| True keyword candidates | `Torvathar`, `Selthar`, `Tharsel`, `Rinshev`, `Ikhna`, `Umrin`, `Umvator`, `Lumva` |
| Needs rename before use | `Umdur-na` should become `Umdurna` if used |
| Page and structure primitives | `Shevva`, `Vakar`, `Umva`, `Rukshev`, `Durkel` |
| Content primitives | `Kelen`, `Keltor`, `Ovshev`, `Mirva`, `Ruksel`, `Selkarva` |
| Interaction primitives | `Umkar`, `Umtharva`, `Enva`, `Kelrinva`, `Shevsel`, `Selvathar` |
| Style system | `Selen`, `Kelkar`, `Sarin`, `Savarin`, `Ovsa`, `Shevsa`, `Vator`, `Torkar`, `Naktor`, `Tornak` |
| Color and typography | `Lusel`, `Mirlu`, `Kellu`, `Kelkarin`, `Kelsa`, `Keltorva`, `Kelruksa`, `Kelshev` |
| Surface and shape | `Torkarva`, `Torlu`, `Torsa`, `Natorkar`, `Mireshel`, `Luna`, `Vashev`, `Torshev`, `Torrin`, `Rintor`, `Karum` |
| Layout primitives | `Rukdur`, `Rinruk`, `Torruk`, `Selrukkar`, `Torum`, `Seltorkar`, `Rinshevsa`, `Naruk`, `Vatornak`, `Karlu` |
| Responsive and state | `Ikhna`, `Navasa`, `Rinvasa`, `Torvasa`, `Ikhum`, `Seltorum`, `Umna`, `Torumra`, `Umralu`, `Luumra` |
| Motion | `Narin`, `Rukna`, `Dursa`, `Nashev`, `Nakar`, `Vana`, `Ruknator`, `Rinna`, `Ludur`, `Umdurna` |
| Accessibility and data | `Kelsetor`, `Selkarum`, `Ikhsel`, `Torikh`, `Ikhen`, `Ovmirva`, `Rinva`, `Umrin` |

## 5. Quality Layer Map

The Quality Layer makes Kethic sites correct by construction. Most of these are not visible as syntax at first. They should be compiler rules, token rules, generated CSS, or runtime helpers.

### 5.1 Foundation Quality

Build early:

- Token Discipline - no raw hex, raw px, or raw breakpoints in strict mode;
- Defaults Treaty - accessible browser reset emitted once;
- Type Scale Lock - type sizes come from a finite scale;
- Breakpoint Vocabulary - named breakpoints, not magic numbers;
- Brand Coherence - one brand token source;
- Layer Treaty - semantic z-index layers;
- Component Sandbox - style isolation;
- RTL Mirror - logical properties by default.

These are foundational because every visual primitive depends on stable tokens, scopes, and layers.

### 5.2 Accessibility Floor

Build before public demos are treated as serious:

- Contrast Oath - text/background contrast checked;
- Focus Covenant - visible focus by default;
- Touch Target Pact - minimum interactive target sizes;
- Touch Honesty - no critical hover-only actions;
- Hover Honesty - hover rules only apply to capable pointers;
- Motion Mercy - reduced-motion support by default;
- Live Voice - ARIA live regions as a primitive;
- Press Memory - keyboard/pointer/touch active state parity;
- Form Dignity - accessible normalized forms;
- Modal Hush - focus trap, inert background, escape behavior;
- Validation Echo - visual and screen-reader validation feedback;
- Button Truth - double-submit protection for async actions.

### 5.3 Daily Layout Quality

Build after the basic web compiler works:

- Container Intelligence;
- Density Mode;
- Reading Vow;
- Section Cadence;
- Card Equilibrium;
- Aspect Box;
- Sticky Grace;
- Scroll Snap Treaty;
- Truncate Ritual;
- Mobile Safe;
- Locale Stretch.

### 5.4 Theming and Performance Quality

Build as production hardening:

- Theme Inheritance;
- Color Mode Pact;
- Surface Hierarchy;
- Light Source Pact;
- Gradient Discipline;
- Semantic Color Gate;
- Whitespace Ledger;
- Rhythm Lock;
- Image Discipline;
- Layout Shift Vow;
- Animation Budget;
- Scroll Memory;
- Data Saver Mode.

## 6. Visual Signature Layer Map

The Visual Signature Layer is what makes Kethic sites feel like they came from a different design civilization.

### 6.1 Keep For Core Identity

Highest-value primitives:

- Brand DNA;
- Motion Signature;
- Brand Motion Dialect;
- Card Dethroning;
- Visual Gravity;
- Content Constellation;
- Surface Weathering;
- Grain Identity;
- Depth Oath;
- Material Lexicon;
- Light Source Pact;
- Page Constitution;
- Section Personality;
- Anti-Hero;
- Hero Constellation;
- Hero Continuity;
- Boundary Voice;
- Button Authorship;
- Visual Motif Engine;
- Type Persona;
- Heading Drama;
- Section Threshold;
- Transition Vocabulary.

These define the visible Kethic difference.

### 6.2 Keep Later

Good but expensive or risky:

- Asymmetric Balance;
- River Flow Layout;
- Page Topography;
- Layout Memory;
- Attention Current;
- Magnetic Cursor;
- Gesture Dialect;
- Parallax Choreography;
- Living Theme;
- Ritual Spotlight;
- Page Acts;
- Scroll Rite.

### 6.3 Gimmick Risk

Must default to subtle and be gated by performance/accessibility:

- Breath Layer;
- Pulse Authority;
- Magnetic Cursor;
- Time Tinting;
- Surface Memory;
- Patina Layer;
- Parallax Choreography.

No visual signature primitive may override:

- reduced motion;
- contrast requirements;
- focus visibility;
- touch target safety;
- layout shift budgets.

## 7. Web Compiler Architecture

The web layer should be a parallel output pipeline, not a hack inside the JavaScript code generator.

Recommended folder plan:

```text
src/
  web/
    ast.ts
    webParser.ts
    webTypes.ts
    webTypeChecker.ts
    htmlGenerator.ts
    cssGenerator.ts
    runtimeGenerator.ts
    webCompiler.ts
    tokens.ts
    diagnostics.ts
```

### 7.1 Web AST

The Web AST should be separate from the current program AST.

Reason:

- a page is not a JavaScript statement;
- a style block is not an expression;
- a component has slots, props, style scope, accessibility obligations, and render output;
- codegen must emit HTML, CSS, and JS, not only JS.

Initial node families:

- `WebProgramNode`;
- `PageNode`;
- `ComponentNode`;
- `SectionNode`;
- `ContainerNode`;
- `TextNode`;
- `HeadingNode`;
- `ButtonNode`;
- `StyleBlockNode`;
- `MountNode`;
- `EventBindingNode`;
- `StyleDeclarationNode`;
- `BrandDnaNode`;
- `TokenDeclarationNode`.

### 7.2 Web Parser

The parser should support Native block syntax:

```keth
Torvathar Home
  Shevva Hero
    Keltor level:1 "Build with Kethic"
    Kelen "Ritual architecture for living interfaces"
    Umkar action:begin
      Kelen "Begin"
    Tor
  Tor
Tor

Umvator "#app" receives Home
```

Block closure remains `Tor`.

Do not introduce braces or HTML-style closing tags.

### 7.3 Web Type Checker

The web checker validates:

- component names are unique;
- referenced components exist;
- style tokens exist;
- no off-token values in strict mode;
- headings follow semantic hierarchy where possible;
- images have `alt` or explicit decorative status;
- buttons have text or accessibility labels;
- forms have labels;
- dialogs have names and valid close paths;
- event handlers reference existing Kethic functions;
- style attributes are valid only in their allowed contexts.

### 7.4 HTML Generator

HTML generation emits semantic markup.

Examples:

- `Torvathar` -> document shell or root page template;
- `Shevva` -> `section` or named landmark;
- `Vakar` -> `div` with generated class and optional role;
- `Kelen` -> text node or `p` depending on context;
- `Keltor` -> `h1` through `h6`;
- `Umkar` -> `button`;
- `Ovshev` -> `a`;
- `Mirva` -> `img` or `picture`;
- `Umtharva` -> `dialog` plus runtime support.

Generated HTML should be boring and standard. Kethic source is where the alien design lives.

### 7.5 CSS Generator

CSS generation uses:

- scoped component classes;
- CSS custom properties for tokens;
- cascade layers controlled by compiler;
- logical properties by default;
- container queries before viewport queries;
- reduced-motion fallbacks;
- semantic layer tokens instead of raw z-index.

### 7.6 Runtime Generator

Runtime generation should be minimal and opt-in by feature.

Runtime modules:

- mount/hydrate;
- event dispatch;
- state/binding;
- dialog behavior;
- live voice announcements;
- route transitions;
- visual signature motion engine later.

The runtime must not become a huge framework before the language proves itself.

## 8. Syntax Direction

### 8.1 Initial Page Example

```keth
Torvathar Home
  Tharsel
    BrandDna calm-river
    Selen surface holds "sand.50"
    Selen ink holds "ink.900"
  Tor

  Shevva Hero
    Keltor level:1 "Kethic"
    Kelen "A language for ritual architecture."
    Umkar action:begin
      Kelen "Enter"
    Tor
  Tor
Tor

Umvator "#app" receives Home
```

`BrandDna` is a working English placeholder. It needs a Namaru name before implementation as syntax.

### 8.2 Initial Style Example

```keth
Tharsel Hero
  Savarin 6
  Mirlu "surface"
  Kellu "ink"
  Natorkar "soft"
  Mireshel "low"
Tor
```

Style attributes are token references, not raw CSS values.

### 8.3 Initial Component Example

```keth
Selthar ActionCard receives title, body
  Vakar
    Keltor level:3 title
    Kelen body
    Umva actions
  Tor
Tor
```

Slots should be explicit vessels, not invisible children.

## 9. Build Phases

### Web Phase 0 - Architecture and Naming

Done when:

- this document exists;
- web terms are classified;
- true keywords are separated from primitives;
- risky visual primitives are marked as later;
- unresolved names are recorded.

No compiler changes.

### Web Phase 1 - Static Page Slice

Goal: compile one static Kethic Native page to HTML and CSS.

Include:

- `Torvathar`;
- `Shevva`;
- `Vakar`;
- `Kelen`;
- `Keltor`;
- `Umkar` without live event behavior;
- `Tharsel`;
- `Umvator`;
- first token table;
- generated static HTML file;
- generated CSS file.

Do not include:

- reactive state;
- routing;
- forms;
- real event runtime;
- advanced visual signature.

Success demo:

- a Kethic file builds a visible landing page shell;
- CSS uses generated classes and tokens;
- the page has accessible headings, button text, and focus defaults.

### Web Phase 2 - Component and Style Scope

Goal: reusable UI patterns without style leakage.

Include:

- `Selthar`;
- component props;
- `Umva` slots;
- scoped generated class names;
- Component Sandbox basic version;
- Layer Treaty;
- Type Scale Lock;
- Token Discipline strict mode.

Success demo:

- a component is reused twice with no style collision;
- off-token values are rejected or reported.

### Web Phase 3 - Interaction Floor

Goal: basic interactive web output.

Include:

- event bindings through `Umrin`;
- `Lumva` reactive UI state;
- generated runtime for click events;
- Button Truth basic version;
- Focus Covenant;
- Motion Mercy;
- Press Memory.

Success demo:

- a button changes visible state;
- keyboard and pointer activation both work;
- reduced-motion fallback exists.

### Web Phase 4 - Forms and Accessibility

Goal: production-safe forms.

Include:

- `Selvathar`;
- `Enva`;
- `Kelrinva`;
- `Shevsel`;
- `Torikh`;
- `Ikhen`;
- Validation Echo;
- Live Voice;
- Form Dignity.

Success demo:

- a form validates;
- errors are visible and announced;
- labels are enforced.

### Web Phase 5 - Routing and App Shell

Goal: multi-page frontend.

Include:

- `Rinshev`;
- `Rukshev`;
- `Durkel`;
- route-level output;
- mount/hydration targets;
- scroll memory basic version;
- route transition hooks without advanced choreography.

Success demo:

- two pages compile;
- navigation works;
- generated output remains static-friendly where possible.

### Web Phase 6 - Quality Layer Hardening

Goal: Kethic websites become safer than ordinary CSS sites.

Include:

- Contrast Oath;
- Touch Target Pact;
- Hover Honesty;
- RTL Mirror;
- Container Intelligence;
- Mobile Safe;
- Layout Shift Vow basic analyzer;
- Image Discipline;
- Animation Budget.

Success demo:

- compiler catches missing alt text;
- compiler catches unsafe hover-only critical action;
- compiler reserves image space;
- animation budget report is emitted.

### Web Phase 7 - Visual Signature V0

Goal: websites start looking recognizably Kethic.

Include:

- approved Namaru name for Brand DNA;
- Motion Signature;
- Depth Oath;
- Surface Weathering;
- Grain Identity;
- Light Source Pact;
- Boundary Voice;
- Button Authorship;
- Anti-Hero basic version;
- Card Dethroning basic recommendations.

Success demo:

- same source with two brand DNA presets produces visibly different pages;
- output remains accessible and low-motion safe.

### Web Phase 8 - Visual Signature V1

Goal: distinctive layout and composition.

Include:

- Visual Gravity;
- Content Constellation;
- Section Personality;
- Hero Constellation;
- Type Persona;
- Heading Drama;
- Transition Vocabulary;
- Section Threshold.

Success demo:

- a landing page avoids the default card-grid/hero-template look;
- motion and layout follow brand-level rules.

### Web Phase 9 - Heavy Research Primitives

Only after the system is stable:

- Asymmetric Balance;
- River Flow Layout;
- Page Topography;
- Hero Continuity;
- Visual Motif Engine;
- Living Theme;
- Ritual Spotlight;
- Scroll Rite;
- Parallax Choreography.

These are not MVP features.

## 10. Unresolved Naming

Before implementation, get approved Namaru names for:

- Brand DNA;
- Page Constitution;
- Motion Signature;
- Brand Motion Dialect;
- Card Dethroning;
- Visual Gravity;
- Anti-Hero;
- Depth Oath;
- Surface Weathering;
- Token Discipline;
- Contrast Oath;
- Focus Covenant.

Do not invent these names directly in compiler code. Send a naming prompt when needed.

## 11. Obfuscation Policy

Generated web output must respect public browser contracts.

Can obfuscate:

- internal JS variables;
- internal event handler names;
- generated private class names when source maps are updated;
- runtime helper internals.

Must not break:

- public HTML semantics;
- ARIA attributes;
- form field names intended for submission;
- route paths;
- imported asset paths;
- CSS custom properties intended as public theme API;
- generated source maps.

Future obfuscation should use AST/IR metadata, not raw string replacement.

## 12. Risks

### 12.1 Keyword Bloat

Risk: turning every primitive into a keyword makes Kethic hard to learn.

Mitigation: keep true keywords under roughly 10 for the first web phase. Treat the rest as contextual primitives or style attributes.

### 12.2 Alien But Not Useful

Risk: source becomes poetic but slower than HTML/CSS.

Mitigation: each primitive must compile to multiple useful platform details or enforce a quality rule. A one-to-one alias is not enough.

### 12.3 Visual Gimmicks

Risk: visual signature primitives become distracting or inaccessible.

Mitigation: all visual primitives default to subtle, obey reduced motion, and pass contrast/focus/target-size checks.

### 12.4 Runtime Bloat

Risk: the web runtime becomes a framework too early.

Mitigation: generate runtime modules only for used features. Static pages should emit little or no runtime JavaScript.

### 12.5 CSS Escape Hatch Abuse

Risk: raw CSS escape hatches undermine the system.

Mitigation: no escape hatch in early phases. Later escape hatches must be explicit, audited, and excluded from safety guarantees unless wrapped.

### 12.6 AI Output Drift

Risk: AI writes generic Kethic that recreates generic web templates.

Mitigation: provide Kethic-native primitives like Anti-Hero, Card Dethroning, Section Personality, and Brand DNA presets as the easiest authoring path.

## 13. Immediate Next Step

The next implementation should be Web Phase 1 only.

Do not implement the full 90-term lexicon.
Do not implement the 50 quality primitives.
Do not implement the 50 visual signature primitives.

Start with one static page slice:

- parse `Torvathar`, `Shevva`, `Vakar`, `Kelen`, `Keltor`, `Umkar`, `Tharsel`, `Umvator`;
- create a small Web AST;
- emit `index.html` and `styles.css`;
- include accessible defaults;
- write one example page.

Only after that works should Kethic move into components, state, events, routing, forms, and visual signature.
