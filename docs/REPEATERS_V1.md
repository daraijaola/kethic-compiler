# Repeaters V1

Repeaters let Kethic render repeated UI from short source.

The goal is simple: a longer page should not force the AI to rewrite the same card, FAQ, pricing, or testimonial structure again and again.

## Syntax

```kethic
data features
  item "Fast" "Generate longer pages with fewer output tokens."
  item "Branded" "Reuse a profile instead of repeating styling."
end

cmp FeatureCard receives title, body
  box MetricCard
    h3 title
    txt body
  end
end

grid FeatureGrid
  repeat FeatureCard from features
end
```

## Meaning

- `data` stores rows of reusable content.
- `item` stores one row.
- `repeat Component from data` renders the component once per row.
- The number of item values must match the component parameters.

## Why It Matters

Without repeaters, six cards require six repeated blocks. With repeaters, the interface pattern appears once and the compiler expands it.

This keeps Kethic a programming language: `repeat` is a real control primitive, not a one-off template shortcut.
