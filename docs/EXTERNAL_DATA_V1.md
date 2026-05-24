# External Data V1

External Data V1 lets Kethic load repeater rows from JSON.

The goal is to keep `.keth` source focused on structure while repeated content can live in reusable data files.

## Syntax

```kethic
data features from "data/features.json"

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

## JSON Shape

```json
{
  "items": [
    ["Compact source", "The page source stays short."],
    ["Compiler expansion", "The compiler renders a full component per row."]
  ]
}
```

The number of values in each row must match the component parameters.

## Why It Matters

Inline repeaters remove repeated interface structure. External data goes further: content rows can come from user files, CMS exports, product docs, or AI-generated data that is reused across pages.

That keeps the AI's per-page output closer to structure than full page content.
