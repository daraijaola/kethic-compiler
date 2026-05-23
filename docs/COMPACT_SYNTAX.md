# Compact Kethic Syntax

Status: compact aliases plus Semantic Macros V1 are implemented.

Compact Kethic is the low-token alias mode of Kethic Core Web. It maps to the same Web AST as readable Kethic Core, but uses short regular aliases that are cheaper in output tokens.

Kethic Core is now the public readable syntax. Compact Kethic does not replace Core; it is the compression layer. Namaru vocabulary remains a legacy compatibility layer.

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
| `pg Name` | `page Name` | page root |
| `sec Name` | `section Name` | section |
| `box Name` | `Vakar Name` | container |
| `nav Name` | `Rukshev Name` | navigation |
| `foot` | `footer` | footer |
| `link Target "Label"` | `Ovshev to:Target "Label"` | route link |
| `rt "#id" Target` | `route "#id" Target` | route declaration |
| `mount "#app" Page` | `Umvator "#app" receives Page` | mount page |
| `txt "Text"` | `text "Text"` | text |
| `h1 "Text"` through `h6 "Text"` | `Keltor level:N "Text"` | heading |
| `btn "Label"` | `button "Label"` | submit/button text |
| `btn action "Label"` | `button action "Label"` | action button |
| `form Name` | `Selvathar Name` | form |
| `in name "Label" !` | `input name "Label" required` | required input |
| `area name "Label" rows:5 !` | `textarea name "Label" rows:5 required` | required textarea |
| `msg field "Message"` | `message field "Message"` | validation/help message |
| `cmp Name receives a, b` | `component Name receives a, b` | component declaration |
| `use Name "a", "b"` | `Umkel Name with "a", "b"` | component call |
| `slot name` | `Umva name` | component slot |
| `st name = value` | `state name = value` | reactive state |
| `act name` | `action name` | action block |
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

## Semantic Macros V1

Semantic macros expand one short line or block into multiple normal Web AST nodes. They are the main path toward large AI output-token savings.

```keth
pg Landing
  hero "Kethic" "AI-native websites with fewer tokens."
  signup name email submit:"Join"
  features
    "Fast"
    "Accessible"
    "Compiled"
  end
end
```

Implemented macros:

| Macro | Expands To |
| --- | --- |
| `hero "Title" "Subtitle"` | `sec Hero` with `h1` and text |
| `hero "Title" "Subtitle" btn:action "Label"` | hero section plus action button |
| `signup name email submit:"Join"` | `sec Signup` with form, required inputs, validation messages, submit button |
| `features ... end` | `sec Features` with repeated feature containers |

The compiler expands those macros into sections, headings, forms, labels, validation text, containers, and buttons.

## Macro Example

```keth
st joins = 0

act join
  set joins = joins plus 1
end

rt "#hero" Hero
rt "#features" Features
rt "#signup" Signup

pg Landing
  nav Main
    link Hero "Hero"
    link Features "Features"
    link Signup "Signup"
  end
  hero "Kethic" "AI-native websites with fewer tokens." btn:join "Join waitlist"
  features
    "Fast generation"
    "Accessible by default"
    "Compiled to real web code"
  end
  signup name email submit:"Join waitlist"
end

mount "#app" Landing
```

Next macro candidates:

- `pricing`;
- `faq`;
- `testimonial`;
- `shell`;
- `dashboard`;
- `crud`;
- `api`.
