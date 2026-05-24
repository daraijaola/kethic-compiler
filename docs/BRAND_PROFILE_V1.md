# Brand Profile V1

Kethic Brand Profile V1 keeps repeated design identity outside page source.

The goal is not to turn Kethic into a design tool. The goal is to let AI emit less source per page while the compiler still produces richer websites.

## Layers

1. Brand Profile JSON: generated once per product or user.
2. Kethic Source: compact page structure, copy, state, forms, and actions.
3. Compiler: merges both into standard HTML, CSS, and JavaScript.

## V1 Fields

```json
{
  "name": "Nocturne Atlas",
  "palette": "nocturne",
  "type": "modern",
  "surface": "glass",
  "radius": "round",
  "motion": "calm",
  "density": "airy"
}
```

## Compile

```powershell
npm run build
node dist/src/cli.js web examples/brand-profile-demo.keth --out-dir dist-brand/nocturne --brand examples/brands/nocturne.json
node dist/src/cli.js web examples/brand-profile-demo.keth --out-dir dist-brand/lumen --brand examples/brands/lumen.json
node dist/src/cli.js web examples/brand-profile-demo.keth --out-dir dist-brand/forge --brand examples/brands/forge.json
```

The Kethic source stays the same. Only the profile changes.

## Why This Matters

Without this layer, an AI has to repeat visual choices in every page it generates. With Brand Profile V1, the AI can generate a brand once, then emit short content-focused Kethic source for each page.
