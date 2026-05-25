# Visual Variants V1

Visual Variants V1 lets the compiler render the same section role in multiple clean ways.

The source does not change:

```kethic
sec Hero hero
sec Features features
sec Proof proof
sec Join cta
```

The compiler adds deterministic variant classes from the active brand profile seed:

```html
kethic-variant-hero-split
kethic-variant-features-tiles
kethic-variant-proof-band
kethic-variant-cta-centered
```

## Supported Variant Families

- `hero`: `centered`, `split`, `editorial`
- `features`: `grid`, `list`, `tiles`
- `proof`: `band`, `cards`, `numbers`
- `cta`: `centered`, `panel`, `split`
- `pricing`: `cards`, `table`, `spotlight`
- `faq`: `list`, `columns`, `boxed`
- `content`: `plain`, `narrow`, `split`

## Why It Matters

Brand Profile gives identity. Section roles give context. Visual variants give design variety.

This moves Kethic closer to premium output without making AI emit more source.

## Proof

The same `examples/clean-roles-demo.keth` source compiled under three brand profiles produces different variant sets:

- Nocturne: `hero-editorial`, `features-grid`, `proof-cards`, `cta-panel`
- Lumen: `hero-centered`, `features-list`, `proof-numbers`, `cta-split`
- Forge: `hero-split`, `features-tiles`, `proof-band`, `cta-centered`
