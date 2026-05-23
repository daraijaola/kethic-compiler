# Kethic Layout Core V1

Status: first layout foundation.

Layout Core V1 adds built-in layout containers and layout style controls. Kethic should compose real interfaces from primitives, not hardcoded templates.

## Built-In Layout Containers

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
end

center EmptyState
  txt "Nothing here yet."
end
```

## Layout Style Controls

Use these inside `style Name ... end` blocks.

| Kethic | CSS Output |
| --- | --- |
| `align` | `align-items` |
| `justify` | `justify-content` |
| `wrap` | `flex-wrap` |
| `container` | max-width container with margin and padding |
| `ratio` | `aspect-ratio` |

Example:

```keth
style Cards
  align stretch
  justify between
  wrap true
  container wide
end
```

