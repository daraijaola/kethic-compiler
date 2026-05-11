# Kethic Responsive Core V1

Status: first responsive foundation.

Responsive Core V1 adds scoped responsive style blocks. It lets Kethic change style and layout at mobile, tablet, and desktop breakpoints without exposing raw CSS media query syntax to the AI.

## Syntax

Compact form:

```keth
when mobile Hero
  savarin 4
  karum block
end
```

Readable form:

```keth
Ikhna Navasa Hero
  Savarin 4
  Karum block
Tor
```

Both compile to scoped CSS for the target class:

```css
@media (max-width: 720px) {
  @layer kethic.components {
    .kethic-hero {
      padding: var(--sa-4);
      display: block;
    }
  }
}
```

## Breakpoints

| Compact | Readable | CSS |
| --- | --- | --- |
| `mobile` | `Navasa` | `(max-width: 720px)` |
| `tablet` | `Rinvasa` | `(min-width: 721px) and (max-width: 1024px)` |
| `desktop` | `Torvasa` | `(min-width: 1025px)` |

## Example

```keth
style Hero
  savarin 6
  tornak wide
end

when mobile Hero
  savarin 4
  karum block
end

when desktop Hero
  vatornak wide
end

pg Home
  sec Hero
    h1 "Kethic"
    txt "AI-native websites with fewer tokens."
  end
end

mount "#app" Home
```

## Design Rule

Responsive Core V1 only controls styles. It does not create different HTML per breakpoint. The compiler should keep the document semantic and change layout presentation through CSS.

## What Is Not Done Yet

Responsive Core V1 does not yet include:

- container queries;
- responsive values inline inside a single declaration;
- responsive conditionals in runtime state;
- hover/focus/active state blocks;
- reduced-motion media rules.

Those belong in later core phases.
