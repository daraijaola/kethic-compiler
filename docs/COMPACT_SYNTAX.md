# Compact Kethic Syntax

Status: first implemented slice.

Compact Kethic is the AI-output mode of Kethic Native Web. It maps to the same Web AST as readable Kethic, but uses short regular aliases that are easier for AI models to emit correctly and cheaper in output tokens.

Readable Kethic remains valid. Compact Kethic does not replace the Namaru vocabulary; it is the compression layer.

## Why It Exists

The first real benchmark showed Kethic can reduce output tokens dramatically, but the model made syntax mistakes with long forms such as `Rinshev`, `Umkel`, `Selvathar`, and block closing.

Compact mode targets that directly:

- shorter keywords;
- regular argument order;
- fewer nested lines for buttons and simple fields;
- same compiler, AST, type checker, and generators.

## Implemented Aliases

| Compact | Readable Kethic | Meaning |
| --- | --- | --- |
| `end` | `Tor` | close block |
| `pg Name` | `Torvathar Name` | page root |
| `sec Name` | `Shevva Name` | section |
| `box Name` | `Vakar Name` | container |
| `nav Name` | `Rukshev Name` | navigation |
| `foot` | `Durkel` | footer |
| `link Target "Label"` | `Ovshev to:Target "Label"` | route link |
| `rt "#id" Target` | `Rinshev "#id" receives Target` | route declaration |
| `mount "#app" Page` | `Umvator "#app" receives Page` | mount page |
| `txt "Text"` | `Kelen "Text"` | text |
| `h1 "Text"` through `h6 "Text"` | `Keltor level:N "Text"` | heading |
| `btn "Label"` | `Umkar` with child `Kelen` | submit/button text |
| `btn action "Label"` | `Umkar action:action` with child `Kelen` | action button |
| `form Name` | `Selvathar Name` | form |
| `in name "Label" !` | `Enva name label:"Label" Torikh` | required input |
| `area name "Label" rows:5 !` | `Kelrinva name label:"Label" rows:5 Torikh` | required textarea |
| `msg field "Message"` | `Ikhen for:field "Message"` | validation/help message |
| `cmp Name receives a, b` | `Selthar Name receives a, b` | component declaration |
| `use Name "a", "b"` | `Umkel Name with "a", "b"` | component call |
| `slot name` | `Umva name` | component slot |
| `st name = value` | `Lumva name holds value` | reactive state |
| `act name` | `Umrin name` | action block |
| `set state = expr` | `state holds expr` | action state update |

## Example

```keth
st count = 0

act inc
  set count = count plus 1
end

rt "#hero" Hero

pg Home
  nav Main
    link Hero "Hero"
  end
  sec Hero
    h1 "Kethic"
    txt "AI-native websites with fewer tokens."
    btn inc "Count"
    txt "Count: {count}"
  end
end

mount "#app" Home
```

## Current Size Result

The first compact showcase is smaller than the readable showcase:

- readable source: 2,411 characters;
- compact source: 1,753 characters;
- reduction: 27.29 percent.

This is only alias compression. Larger savings will come from semantic macros such as `hero`, `signup`, `features`, `pricing`, and `shell`.

## Next Compression Layer

The next layer should add semantic macros. Example target:

```keth
pg Landing
  hero "Kethic" "AI-native websites with fewer tokens."
  signup name email submit:"Join"
  features "Fast" "Accessible" "Compiled"
end
```

The compiler should expand those macros into sections, headings, forms, cards, labels, validation text, layout, and accessibility defaults.
