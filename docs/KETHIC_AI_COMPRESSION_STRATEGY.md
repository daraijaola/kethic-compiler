# Kethic AI Compression Strategy

Status: research-backed strategy document.

This document records the new core direction for Kethic. It does not replace the compiler architecture. It changes the product goal, naming policy, documentation priorities, and build order.

## 1. New Core Idea

Kethic is an open-source, AI-native compression language.

Its purpose is to let AI generate production-grade websites and apps with fewer output tokens than JavaScript, TypeScript, React, Tailwind, HTML, CSS, Python, or ordinary backend frameworks.

Kethic source should be small. The compiler should expand it into correct, accessible, responsive, secure platform output.

The commercial product should not depend on hiding the language. The language should be open source so AI tools can learn it, document it, integrate it, and generate it reliably. The hosted Kethic platform can be commercial.

## 2. Research Basis

### 2.1 Token cost is a real economic problem

OpenAI pricing separates input, cached input, and output token costs. Current public pricing shows output tokens are often several times more expensive than input tokens for advanced coding-capable models.

Sources:

- OpenAI API pricing: https://openai.com/api/pricing/
- OpenAI platform pricing: https://platform.openai.com/docs/pricing/

OpenAI also documents prompt caching, which can reduce latency and input-token cost when repeated prompt prefixes are reused. This matters because Kethic's spec and examples should be cacheable prompt prefixes.

Source:

- OpenAI prompt caching: https://platform.openai.com/docs/guides/prompt-caching

Strategic conclusion:

- Kethic must reduce output tokens first.
- Kethic must make repeated input context cacheable.
- Kethic docs should be stable, short, and placed before variable user instructions in AI workflows.

### 2.2 Compact DSLs can reduce generated tokens

Research on domain-specific shorthand for structured generation shows that compact grammars can reduce generated token counts. The reported result was a 3x to 5x reduction for structured generation formats such as JSON, YAML, and XML.

Source:

- Domain-Specific Shorthand for Generation Based on Context-Free Grammar: https://www.catalyzex.com/paper/domain-specific-shorthand-for-generation

Research on Token Sugar argues that source-code verbosity increases LLM generation cost and latency. It proposes reversible shorthand for frequent verbose code patterns, reporting generation-token reductions while maintaining near-baseline correctness.

Sources:

- Token Sugar conference listing: https://conf.researchr.org/details/ase-2025/ase-2025-papers/92/Token-Sugar-Making-Source-Code-Sweeter-for-LLMs-through-Token-Efficient-Shorthand
- Token Sugar summary: https://www.sciencestack.ai/paper/2512.08266

Strategic conclusion:

- Kethic should not only rename JavaScript.
- Kethic must compress common semantic web/app patterns into short reversible forms.
- Compression should happen at the semantic level: page, form, route, card, data list, fetch, auth, CRUD, validation, layout, accessibility.

### 2.3 Domain-specific languages are harder for general LLMs

Research on LLMs and domain-specific or low-resource programming languages shows that general LLMs perform worse when a language has little public training data or unfamiliar syntax.

Sources:

- On the Effectiveness of Large Language Models in Domain-Specific Code Generation: https://huggingface.co/papers/2312.01639
- Survey on LLM-based Code Generation for Low-Resource and Domain-Specific Programming Languages: https://colab.ws/articles/10.1145%2F3770084

Strategic conclusion:

- Kethic must be open source.
- Kethic must ship an AI guide, examples, and a grammar.
- Kethic must have a compiler with clear errors.
- Kethic must provide a compact but regular syntax. Strange names alone hurt AI reliability.

## 3. Competitor Findings

### 3.1 GlyphLang

Positioning:

- AI-first backend language.
- Claims fewer tokens than FastAPI and Java.
- Uses compact symbols such as `@`, `$`, `%`, `>`, and `+`.
- Offers compact and expanded modes.

Source:

- https://glyphlang.dev/

Weakness for Kethic to exploit:

- Backend-first, not complete production website/frontend language.
- The visual web layer is not the core product.
- Kethic can win by being full-stack with native web, layout, forms, routing, state, and design quality.

Lesson:

- Kethic should copy the idea of dual syntax: compact AI mode and readable human mode.

### 3.2 C-slop

Positioning:

- Token-minimal web language.
- Claims 80 percent fewer tokens.
- Uses around 10 core symbols.

Source:

- https://c-slop.vercel.app/

Weakness for Kethic to exploit:

- Branding may not be enterprise-friendly.
- Symbol-heavy syntax can be hard to trust, teach, and debug.
- Kethic can be more serious, documented, typed, tested, and production-positioned.

Lesson:

- Token savings must be measurable and public.
- Kethic must avoid becoming too poetic or too verbose.

### 3.3 CodeSpeak

Positioning:

- AI language/spec system for maintaining specs instead of code.
- Claims 5x to 10x shrink factors on examples.

Source:

- https://codespeak.dev/

Weakness for Kethic to exploit:

- More spec-driven than compiler-language driven.
- Less focused on website primitives and token-light generated UI.
- Kethic can occupy the space between "spec" and "code": compact source that compiles deterministically.

Lesson:

- Kethic docs should show source-to-output shrink factors.

### 3.4 Wireweave

Positioning:

- Open-source DSL for AI-generated wireframes.
- Provides MCP/API, guide tools, parser, validator, and HTML rendering.

Source:

- https://www.wireweave.org/

Weakness for Kethic to exploit:

- Wireframe/prototype focus, not full production app language.
- Outputs visual mockups rather than full app architecture.
- Kethic can go beyond wireframes into production websites and backend.

Lesson:

- Kethic needs an AI guide, MCP integration, playground, and instant preview.

## 4. Strategic Position

Use this positioning:

> Kethic is an open-source AI-native compression language for generating production websites and apps with fewer output tokens.

Do not lead with:

- secret language;
- obfuscation;
- ancient civilization lore;
- proprietary syntax;
- JavaScript replacement.

Those can exist as secondary story or implementation details, but the main value is token compression plus compiler-enforced quality.

## 5. What Must Change In The Repo

### 5.1 README

The README must stop saying only "Private repository." It should state:

- Kethic is open-source directionally;
- Kethic is AI-native;
- Kethic compresses source for AI generation;
- the compiler expands compact intent into standard platform output.

This has been started.

### 5.2 Architecture documents

The existing architecture documents should be updated to add:

- AI compression as the primary language goal;
- dual syntax modes;
- token benchmark requirements;
- AI guide requirements;
- competitor differentiation;
- naming policy for long Namaru terms.

Do not rewrite everything at once. Add strategy overlays first.

### 5.3 Naming documents

The Namaru naming system is good for identity, but many terms are too long for AI output compression.

Needed change:

- keep long Namaru terms as readable names and documentation names;
- add compact canonical aliases for AI generation;
- make the compiler accept both.

Example:

| Concept | Readable Kethic | Compact AI Mode |
| --- | --- | --- |
| Page | `Torvathar` | `pg` |
| Section | `Shevva` | `sec` |
| Component | `Selthar` | `cmp` |
| Text | `Kelen` | `txt` |
| Heading | `Keltor` | `h` |
| Button | `Umkar` | `btn` |
| Form | `Selvathar` | `form` |
| Input | `Enva` | `in` |
| Route | `Rinshev` | `rt` |
| Navigation | `Rukshev` | `nav` |
| State | `Lumva` | `st` |
| Action | `Umrin` | `act` |

The exact aliases should be finalized with benchmarks, not taste.

### 5.4 Examples

Every new feature should have three examples:

1. readable Kethic;
2. compact Kethic;
3. generated output summary.

Examples must report approximate token/character counts against an equivalent React/HTML/CSS implementation.

### 5.5 Tests

Add compression tests:

- compile readable and compact syntax to equivalent AST;
- compare generated HTML/CSS/JS snapshots;
- measure source character count;
- later, measure tokens using a tokenizer tool.

### 5.6 Documentation structure

Add these docs over time:

```text
docs/
  AI_GUIDE.md
  COMPACT_SYNTAX.md
  TOKEN_BENCHMARKS.md
  COMPETITOR_ANALYSIS.md
  KETHIC_AI_COMPRESSION_STRATEGY.md
```

## 6. What Must Change In The Language

### 6.1 Stop making every feature a long word

Long words are good for mythology and branding. They are bad for output-token minimization.

Kethic needs:

- readable terms for humans;
- compact aliases for AI;
- reversible formatting between them.

GlyphLang already demonstrates this strategy with compact and expanded modes.

### 6.2 Add semantic macros

Token savings mostly come from semantic macros, not keyword shortening.

Bad compression:

```keth
Selvathar Signup
  Enva email label:"Email" Torikh
  Umkar
    Kelen "Join"
  Tor
Tor
```

Better compression target:

```keth
form Signup email! submit:"Join"
```

Compiler expands it into:

- form;
- label;
- input;
- required validation;
- submit button;
- accessible wiring.

### 6.3 Make quality implicit

The AI should not have to write:

- `aria-label`;
- focus styles;
- responsive defaults;
- form validation wiring;
- safe button types;
- reduced-motion fallback;
- container widths;
- semantic roles.

The compiler should infer and emit those.

### 6.4 Prefer pattern libraries over raw syntax

Kethic should have first-class app patterns:

- landing page;
- signup form;
- pricing section;
- feature grid;
- dashboard shell;
- auth flow;
- CRUD resource;
- API endpoint;
- database model;
- fetch and render list;
- contact form.

These are where token savings become large.

## 7. Smart Fast Build Plan

Do not try to finish every language feature first. Build the proof loop.

### Phase C0 - Strategy Lock

Done when:

- README reflects the new mission;
- this strategy doc exists;
- old "secret proprietary language" framing is demoted;
- docs mention open-source language plus commercial platform.

### Phase C1 - Compression Benchmark Harness

Build a local benchmark script that compares:

- React/HTML/CSS baseline source length;
- readable Kethic source length;
- compact Kethic source length;
- generated output file sizes.

Start with character counts. Add real tokenizer counts later.

Why first:

- It proves whether the idea is working.
- It prevents us from adding features that do not reduce tokens.

### Phase C2 - Compact Syntax Parser

Add compact syntax that compiles to the same Web AST.

Initial compact features:

- `pg`;
- `sec`;
- `h`;
- `txt`;
- `btn`;
- `form`;
- `in`;
- `area`;
- `nav`;
- `rt`;
- `st`;
- `act`;
- `cmp`.

Readable Kethic and compact Kethic must produce the same AST shape.

### Phase C3 - Semantic Web Macros

Add high-compression primitives:

- `hero`;
- `signup`;
- `features`;
- `pricing`;
- `contact`;
- `card`;
- `grid`;
- `stack`;
- `row`;
- `shell`.

These should expand into many nodes.

### Phase C4 - AI Guide

Create `docs/AI_GUIDE.md`.

It should tell any AI model:

- when to use readable mode;
- when to use compact mode;
- common patterns;
- forbidden mistakes;
- how to keep output short;
- how to let the compiler handle accessibility and layout.

### Phase C5 - Public Proof Page

Create a page showing:

- prompt;
- React/HTML/CSS output length;
- Kethic output length;
- generated final website;
- savings percentage;
- source available on GitHub.

This is more important for adoption than more language theory.

## 8. Cutting-Edge Differentiators

### 8.1 Dual syntax

Human-readable Kethic plus compact AI mode.

This avoids the tradeoff between brand identity and token efficiency.

### 8.2 Token benchmarks as first-class tests

Every major Kethic feature should prove it reduces source size or improves generated quality.

### 8.3 Quality compiler

Kethic should generate:

- accessible forms;
- semantic HTML;
- responsive CSS;
- safe runtime;
- route shell;
- state wiring;
- style tokens.

This makes it better than raw compact DSLs.

### 8.4 AI guide as product surface

The AI guide should be treated like an API. If Claude, ChatGPT, Gemini, Cursor, or Windsurf can read one short guide and output valid Kethic, adoption becomes realistic.

### 8.5 MCP/compiler tool

Kethic should eventually expose tools:

- parse;
- validate;
- compile;
- benchmark;
- preview;
- explain errors;
- compact;
- expand.

Wireweave is already using this strategy. Kethic should do it for production apps, not only wireframes.

## 9. Risks

### 9.1 Unknown language penalty

If Kethic is not public, models will not know it.

Mitigation:

- open-source;
- docs;
- examples;
- AI guide;
- MCP;
- compact grammar.

### 9.2 Long-word token penalty

Namaru names may tokenize poorly.

Mitigation:

- compact aliases;
- benchmark aliases before finalizing;
- keep long names as expanded human mode.

### 9.3 Quality gap

If compact Kethic outputs ugly or inaccessible websites, token savings will not matter.

Mitigation:

- quality compiler rules;
- visual system defaults;
- snapshot demos;
- accessibility checks.

### 9.4 Too much syntax too soon

Adding many features without benchmarks creates bloat.

Mitigation:

- build benchmark harness first;
- only add features that improve compression or quality.

## 10. Immediate Repo Actions

Priority order:

1. Keep this document.
2. Update README mission.
3. Add `docs/COMPACT_SYNTAX.md`.
4. Add `docs/TOKEN_BENCHMARKS.md`.
5. Add a benchmark script.
6. Add compact parser support for a small web subset.
7. Convert the current showcase into readable and compact versions.
8. Publish benchmark numbers.

## 11. Final Strategic Brief

Kethic should be explained in one sentence:

> Kethic is an open-source AI-native compression language that lets AI generate production websites and apps with fewer tokens by compiling compact intent into accessible, responsive, secure platform code.

Every future feature should pass this test:

> Does this reduce AI output tokens, improve generated quality, or make AI generation more reliable?

If the answer is no, it should wait.
