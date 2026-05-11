# Kethic AI Guide

This guide is the short model-facing contract for generating Kethic Web Macro source.

Use it when an AI model is asked to build a website in Kethic. The goal is to output small valid Kethic that the compiler expands into accessible HTML, responsive CSS, and JavaScript runtime behavior.

## Core Rule

Output Kethic source only.

Do not output Markdown fences, explanations, comments, HTML, CSS, JSX, JavaScript, React, Tailwind, or file names unless the user explicitly asks for them.

## Preferred Mode

Use compact Kethic Web Macro mode for website generation.

Readable Namaru keywords are valid, but compact mode is preferred because it reduces AI output tokens and avoids spelling mistakes in long terms.

## Minimal Page Shape

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
  foot
    txt "Built with Kethic."
  end
end

mount "#app" Landing
```

## Valid Compact Syntax

### State

```keth
st count = 0
```

Use `st` for reactive UI state.

### Action

```keth
act increment
  set count = count plus 1
end
```

Use `act` for click actions. Use `set` to update state.

### Routes

```keth
rt "#hero" Hero
rt "#signup" Signup
```

Every `link Target "Label"` should have a matching `rt "#id" Target`.

### Page

```keth
pg Home
  ...
end
```

Every website needs one `pg` block.

### Navigation

```keth
nav Main
  link Hero "Hero"
  link Signup "Signup"
end
```

Use navigation when the page has sections.

### Section

```keth
sec Hero
  h1 "Title"
  txt "Supporting text."
end
```

Use `sec` for ordinary sections.

### Hero Macro

```keth
hero "Title" "Subtitle"
hero "Title" "Subtitle" btn:join "Button label"
```

Use this instead of manually writing hero sections.

### Features Macro

```keth
features
  "Fast"
  "Accessible"
  "Compiled"
end
```

Use three to six feature items.

### Signup Macro

```keth
signup name email submit:"Join waitlist"
```

This expands into a labelled accessible form with required fields and validation messages.

### Text

```keth
txt "Plain text."
txt "Count: {count}"
```

Use `{stateName}` interpolation for reactive text.

### Button

```keth
btn "Submit"
btn join "Join waitlist"
```

Use `btn actionName "Label"` for action buttons.

### Footer

```keth
foot
  txt "Footer text."
end
```

### Mount

```keth
mount "#app" Home
```

Every page should end with `mount`.

## Output Rules

1. Use `end` to close every block.
2. Do not use `Tor` in compact mode.
3. Use double quotes for all text.
4. Keep names simple: `Hero`, `Features`, `Signup`, `Contact`, `Pricing`.
5. Use action names in lower camel case: `join`, `submitForm`, `openMenu`.
6. Use state names in lower camel case: `count`, `open`, `joins`, `email`.
7. Do not invent unsupported syntax.
8. Prefer semantic macros over manual sections when a macro exists.
9. Keep Kethic source short. The compiler handles accessibility, labels, responsive defaults, focus styles, and runtime wiring.
10. If unsure, output a smaller valid page instead of a larger invalid one.

## Common Mistakes To Avoid

Do not output:

```text
```keth
pg Home
end
```
```

Return the source directly, without fences.

Do not forget `mount`:

```keth
mount "#app" Home
```

Do not create a link without a matching route:

```keth
rt "#contact" Contact
link Contact "Contact"
```

Do not put `features` items on one line. Use a block:

```keth
features
  "Fast"
  "Accessible"
  "Compiled"
end
```

Do not write raw HTML:

```html
<section>...</section>
```

Write Kethic instead.

## Quality Defaults The Compiler Provides

The AI does not need to manually write these:

- semantic HTML structure;
- route links;
- accessible form labels;
- required field wiring;
- validation message ids;
- focus-visible CSS;
- mobile responsive CSS;
- button types;
- click event runtime;
- unique HTML ids.

## Best Short Prompt For Users

Use this prompt when asking an AI to generate Kethic:

```text
Use Kethic Web Macro mode. Output source only, no Markdown. Build a landing page with hero, features, signup form, navigation, footer, and mount.
```

## Best Repair Prompt

If compilation fails, use this prompt:

```text
Repair this Kethic source using only the syntax from the Kethic AI Guide. Output corrected source only, no Markdown.
```
