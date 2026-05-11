# Kethic Layout Core V1

Status: first layout foundation.

Layout Core V1 adds built-in layout vessels and layout style controls. This is the foundation Kethic needs before adding bigger website macros such as pricing, FAQ, dashboards, and the public `kethic.org` website.

## Why This Matters

Kethic should not be a pile of hardcoded website templates. It needs primitives that can compose real interfaces.

The layout layer gives AI a small vocabulary for structure:

- stack;
- row;
- grid;
- center;
- align;
- distribute;
- wrap;
- container width;
- aspect ratio.

## Built-In Layout Containers

Compact form:

```keth
stack Content
  h1 "Title"
  txt "Body"
end

row Actions
  btn "Start"
  btn "Docs"
end

grid Cards
  box First
    h2 "Fast"
  end
  box Second
    h2 "Small"
  end
end

center EmptyState
  txt "Nothing here yet."
end
```

Readable form:

| Compact | Readable | Meaning |
| --- | --- | --- |
| `stack Name` | `Rukdur Name` | vertical stack |
| `row Name` | `Rinruk Name` | horizontal row |
| `grid Name` | `Selrukkar Name` | responsive grid |
| `center Name` | `Torum Name` | centered layout |

These compile to normal HTML containers with layout classes:

```html
<div class="kethic-cards kethic-container kethic-layout-grid">
```

## Default CSS Output

```css
.kethic-layout-stack {
  display: flex;
  flex-direction: column;
  gap: var(--sa-4);
}

.kethic-layout-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--sa-4);
}

.kethic-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: var(--sa-4);
}

.kethic-layout-center {
  display: grid;
  place-items: center;
  text-align: center;
}
```

Rows automatically become vertical on small screens through the default mobile CSS.

## Layout Style Controls

Use these inside `style Name ... end` blocks.

| Compact | Readable | CSS Output |
| --- | --- | --- |
| `seltorkar` | `Seltorkar` | `align-items` |
| `rinshevsa` | `Rinshevsa` | `justify-content` |
| `naruk` | `Naruk` | `flex-wrap` |
| `vatornak` | `Vatornak` | max-width container with margin and padding |
| `karlu` | `Karlu` | `aspect-ratio` |

Example:

```keth
style Cards
  seltorkar stretch
  rinshevsa between
  naruk true
  vatornak wide
end
```

Compiles to:

```css
.kethic-cards {
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;
  max-inline-size: 72rem;
  margin-inline: auto;
  padding-inline: var(--sa-4);
}
```

## Supported Values

Alignment:

| Kethic | CSS |
| --- | --- |
| `start` | `flex-start` |
| `center` | `center` |
| `end` | `flex-end` |
| `stretch` | `stretch` |

Distribution:

| Kethic | CSS |
| --- | --- |
| `start` | `flex-start` |
| `center` | `center` |
| `end` | `flex-end` |
| `between` | `space-between` |
| `around` | `space-around` |
| `evenly` | `space-evenly` |

Wrap:

| Kethic | CSS |
| --- | --- |
| `true` | `wrap` |
| `false` | `nowrap` |

## What Is Not Done Yet

Layout Core V1 does not yet include:

- explicit grid column counts;
- named grid areas;
- responsive layout overrides;
- container query syntax;
- masonry or complex editorial layouts.

Those belong in later layout phases.
