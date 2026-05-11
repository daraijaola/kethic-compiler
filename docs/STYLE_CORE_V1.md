# Kethic Style Core V1

Status: first core style foundation.

Style Core V1 is the controlled Kethic layer that compiles into CSS. It is not meant to expose every CSS property one by one. It gives Kethic a small, stable set of design primitives that AI can generate reliably and the compiler can validate.

## Why This Comes Before More Macros

Macros such as `pricing`, `faq`, and `dashboard` should sit on top of a real style foundation. Without Style Core, macros become hardcoded templates and every website starts looking the same.

The build order is:

1. core web elements;
2. core style primitives;
3. core layout primitives;
4. responsive and interaction rules;
5. higher-level semantic macros;
6. the public Kethic website built with Kethic itself.

## Style Blocks

Readable form:

```keth
Tharsel Hero
  Savarin 6
  Mirlu "sand.50"
Tor
```

Compact form:

```keth
style Hero
  savarin 6
  mirlu "sand.50"
end
```

Both target the generated class for the named node:

```css
.kethic-hero { ... }
```

## Implemented Primitives

| Compact | Readable | CSS Output |
| --- | --- | --- |
| `sarin` | `Sarin` | `padding` |
| `savarin` | `Savarin` | `padding` |
| `ovsa` | `Ovsa` | `margin` |
| `shevsa` | `Shevsa` | `gap` |
| `vator` | `Vator` | `inline-size` |
| `torkar` | `Torkar` | `block-size` |
| `naktor` | `Naktor` | `min-inline-size` |
| `tornak` | `Tornak` | `max-inline-size` |
| `lusel` | `Lusel` | `color` |
| `mirlu` | `Mirlu` | `background` |
| `kellu` | `Kellu` | `color` |
| `kelsa` | `Kelsa` | `font-size` |
| `keltorva` | `Keltorva` | `font-weight` |
| `kelruksa` | `Kelruksa` | `line-height` |
| `kelshev` | `Kelshev` | `text-align` |
| `torkarva` | `Torkarva` | `border` |
| `torlu` | `Torlu` | `border-color` |
| `torsa` | `Torsa` | `border-width` |
| `natorkar` | `Natorkar` | `border-radius` |
| `mireshel` | `Mireshel` | `box-shadow` |
| `luna` | `Luna` | `opacity` |
| `vashev` | `Vashev` | `overflow` |
| `torshev` | `Torshev` | `z-index` |
| `torrin` | `Torrin` | `position` |
| `rintor` | `Rintor` | `inset` |
| `karum` | `Karum` | `display` |

## Token Values

Numeric spacing values map to the Kethic spacing scale:

```keth
savarin 6
shevsa 4
```

Compiles to:

```css
padding: var(--sa-6);
gap: var(--sa-4);
```

Color names map to design tokens:

```keth
mirlu "sand.50"
kellu "ink.900"
```

Compiles to:

```css
background: var(--color-sand-50);
color: var(--color-ink-900);
```

Named sizes are supported for common layout needs:

| Value | CSS |
| --- | --- |
| `full` | `100%` |
| `screen` | `100vh` |
| `prose` | `65ch` |
| `reading` | `72ch` |
| `wide` | `72rem` |

Named layers are supported:

| Value | CSS |
| --- | --- |
| `base` | `0` |
| `raised` | `10` |
| `popover` | `30` |
| `dialog` | `50` |
| `toast` | `60` |

## Example

```keth
style Hero
  savarin 6
  shevsa 4
  tornak wide
  mirlu "sand.50"
  kellu "ink.900"
  natorkar soft
  mireshel raised
end

pg Home
  sec Hero
    h1 "Kethic"
    txt "AI-native websites with fewer tokens."
  end
end

mount "#app" Home
```

## What Is Not Done Yet

Style Core V1 does not yet include:

- responsive style blocks;
- hover/focus/active state style blocks;
- grid column templates;
- full transform and animation primitives;
- theme declarations;
- style conflict diagnostics.

Those belong in the next style phases.
