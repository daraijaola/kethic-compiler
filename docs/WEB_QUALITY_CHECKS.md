# Kethic Web Quality Checks

Kethic's AI compression goal only matters if the compiler still produces usable, accessible web output.

This document records the first repeatable quality gate for Kethic Web output.

## Command

```text
npm run quality:web
```

By default, it compiles:

```text
examples/kethic-landing.macro.keth
```

A different file can be checked with:

```text
node scripts/check-web-quality.cjs path/to/file.keth
```

## Current Checks

The checker verifies that generated output includes:

- a mounted `main` page;
- labelled navigation;
- hero, features, and signup sections;
- one clear `h1`;
- a form;
- labels for name and email inputs;
- required fields wired to validation messages through `aria-describedby`;
- an action button;
- a submit button;
- focus-visible CSS;
- mobile responsive CSS;
- runtime click handling;
- no duplicate HTML ids.

## Why This Exists

The first run exposed a real compiler quality issue: the features section and the `Features` heading both emitted `id="features"`.

The HTML generator now reserves ids as it emits them. If an id is already used, later elements receive a stable suffix, such as `features-2`.

This is the kind of quality gate Kethic needs. The language should save AI output tokens, but the compiler must also protect the final website from common bugs that AI-generated HTML often misses.

## Next Quality Gates

The next layer should add browser-level verification:

- screenshot comparison at desktop and mobile widths;
- layout overflow checks;
- interactive button checks;
- form submit behavior checks;
- color contrast checks;
- keyboard focus order checks.
