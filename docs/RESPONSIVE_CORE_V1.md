# Kethic Responsive Core V1

Status: first responsive foundation.

Responsive Core V1 adds scoped responsive style blocks. It lets Kethic change style and layout at mobile, tablet, and desktop breakpoints without exposing raw CSS media queries to AI output.

## Syntax

```keth
when mobile Hero
  pad 4
  display block
end
```

This compiles to scoped CSS for the target class.

## Breakpoints

| Kethic | CSS |
| --- | --- |
| `mobile` | `(max-width: 720px)` |
| `tablet` | `(min-width: 721px) and (max-width: 1024px)` |
| `desktop` | `(min-width: 1025px)` |

## Example

```keth
style Hero
  pad 6
  maxWidth wide
end

when mobile Hero
  pad 4
  display block
end

when desktop Hero
  container wide
end
```

