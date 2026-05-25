# Clean Visual Baseline V1

Clean Visual Baseline V1 makes Kethic output more credible without increasing source verbosity.

This is not the final premium design engine. It is the minimum serious visual layer: readable type scale, calmer spacing, cleaner cards, and section-aware defaults.

## Section Roles

Sections can now include a short role:

```kethic
sec Hero hero
sec Features features
sec Proof proof
sec Join cta
```

Supported roles:

- `hero`
- `features`
- `proof`
- `pricing`
- `faq`
- `cta`
- `content`

The role becomes a generated class such as `kethic-section-hero`. The compiler uses that class for layout and rhythm.

## Why It Matters

Before roles, every section relied mostly on the same generic defaults. That made generated sites feel repetitive.

With roles, the AI emits one small extra word, and the compiler gains design context.

The trade is good:

- tiny source cost;
- better visual hierarchy;
- same standard HTML/CSS output.

## Compile

```powershell
npm run build
node dist/src/cli.js web examples/clean-roles-demo.keth --out-dir dist-clean-roles --brand examples/brands/nocturne.json
```
