# Kethic Style Core V1

Status: first core style foundation.

Style Core V1 is the controlled Kethic layer that compiles into CSS. It is not a renamed copy of CSS. It gives AI a small set of validated style primitives that expand into standard CSS.

## Style Blocks

```keth
style Hero
  pad 6
  background "sand.50"
  color "ink.900"
  radius soft
  shadow raised
end
```

This targets the generated class for the named node:

```css
.kethic-hero { ... }
```

## Implemented Primitives

| Kethic | CSS Output |
| --- | --- |
| `pad` | `padding` |
| `margin` | `margin` |
| `gap` | `gap` |
| `width` | `inline-size` |
| `height` | `block-size` |
| `minWidth` | `min-inline-size` |
| `maxWidth` | `max-inline-size` |
| `background` | `background` |
| `color` | `color` |
| `font` | `font-size` |
| `weight` | `font-weight` |
| `line` | `line-height` |
| `alignText` | `text-align` |
| `border` | `border` |
| `borderColor` | `border-color` |
| `borderWidth` | `border-width` |
| `radius` | `border-radius` |
| `shadow` | `box-shadow` |
| `opacity` | `opacity` |
| `overflow` | `overflow` |
| `z` | `z-index` |
| `position` | `position` |
| `inset` | `inset` |
| `display` | `display` |

## Token Values

Numeric spacing values map to the Kethic spacing scale:

```keth
pad 6
gap 4
```

Compiles to:

```css
padding: var(--sa-6);
gap: var(--sa-4);
```

Color names map to design tokens:

```keth
background "sand.50"
color "ink.900"
```

Compiles to:

```css
background: var(--color-sand-50);
color: var(--color-ink-900);
```

## Example

```keth
style Hero
  pad 6
  gap 4
  maxWidth wide
  background "sand.50"
  color "ink.900"
  radius soft
  shadow raised
end

pg Home
  sec Hero
    h1 "Kethic"
    txt "AI-native websites with fewer tokens."
  end
end

mount "#app" Home
```

