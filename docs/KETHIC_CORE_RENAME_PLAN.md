# Kethic Core Rename Plan

Status: planning document before compiler rename work.

Decision: keep the name **Kethic**, keep the compiler, keep the benchmarks, but move the user-facing syntax away from obscure Namaru keywords.

The product should feel like a real AI-native programming language, not fantasy HTML.

## Why Change

Kethic's strongest value is not the ritual vocabulary.

The strongest value is:

- AI writes compact source;
- Kethic compiles to standard HTML, CSS, and JavaScript;
- output/source size can drop by 90%+ on benchmarked website tasks;
- compiler defaults handle accessibility, responsive layout, forms, state, and runtime wiring.

The Namaru words are useful as lore and early identity, but they increase adoption friction:

- investors understand the product slower;
- developers may treat it as weird;
- AI models can misspell long words;
- documentation becomes harder;
- syntax looks less credible for a serious programming language.

## New Language Direction

Kethic Core should be:

- short;
- readable;
- English-based;
- AI-friendly;
- compiler-oriented;
- still clearly different from HTML/CSS/JS.

Kethic should not become:

- a template-only website builder;
- a renamed copy of CSS;
- a fantasy vocabulary language;
- a no-code config file.

## Syntax Layers

### 1. Kethic Core

The main public syntax.

This is what users, AI tools, docs, benchmarks, and demos should use.

Example:

```keth
state joins = 0

action join
  set joins = joins plus 1
end

route "#hero" Hero

page Landing
  nav Main
    link Hero "Hero"
  end

  hero "Build more with fewer tokens" "AI-native source that compiles to real web apps." action:join "Join"
end

mount "#app" Landing
```

### 2. Kethic Compact

Ultra-short aliases for benchmark mode and low-token AI output.

This can remain valid:

```keth
st joins = 0
act join
  set joins = joins plus 1
end
rt "#hero" Hero
pg Landing
  hero "Build more" "With fewer tokens"
end
mount "#app" Landing
```

Compact mode is useful, but it should be presented as an optimization layer, not the main human-facing syntax.

### 3. Kethic Namaru Legacy

Old words remain temporarily supported for compatibility:

```keth
Torvathar Home
  Shevva Hero
    Kelen "Hello"
  Tor
Tor
```

Docs should mark this as legacy/experimental. It can still exist as the cultural layer, but not as the product surface.

## Current Web Keyword Inventory

### Structure

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Close block | `Tor` | `end` | `end` | Keep `end` |
| Page root | `Torvathar` | `pg` | `page` | Add `page`; keep `pg` compact |
| Section | `Shevva` | `sec` | `section` | Add `section`; keep `sec` compact |
| Container | `Vakar` | `box` | `box` | Keep `box`; optional future `group` |
| Navigation | `Rukshev` | `nav` | `nav` | Keep |
| Footer | `Durkel` | `foot` | `footer` | Add `footer`; keep `foot` compact |
| Link | `Ovshev` | `link` | `link` | Keep |
| Route | `Rinshev` | `rt` | `route` | Add `route`; keep `rt` compact |
| Mount/render target | `Umvator` | `mount` | `mount` | Keep |

### Content

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Heading | `Keltor` | `h1`-`h6` | `h1`-`h6` | Keep |
| Text | `Kelen` | `txt` | `text` | Add `text`; keep `txt` compact |
| Button | `Umkar` | `btn` | `button` | Add `button`; keep `btn` compact |

### Components

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Component declaration | `Selthar` | `cmp` | `component` | Add `component`; keep `cmp` compact |
| Component use | `Umkel` | `use` | `use` | Keep |
| Slot | `Umva` | `slot` | `slot` | Keep |

### Forms

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Form | `Selvathar` | `form` | `form` | Keep |
| Input | `Enva` | `in` | `input` | Add `input`; keep `in` compact |
| Textarea | `Kelrinva` | `area` | `textarea` | Add `textarea`; keep `area` compact |
| Validation/help message | `Ikhen` | `msg` | `message` | Add `message`; keep `msg` compact |
| Required marker | `Torikh` | `!` | `required` | Add `required`; keep `!` compact |
| Binding | `bind:state` | `bind:state` | `bind:state` | Keep |

### Runtime

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Reactive state | `Lumva` | `st` | `state` | Add `state`; keep `st` compact |
| Action/event handler | `Umrin` | `act` | `action` | Add `action`; keep `act` compact |
| State update | `holds` | `set` | `set` | Keep |
| Conditional visibility | `Umralu` | `show` | `show` | Keep |

### Layout

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Stack layout | `Rukdur` | `stack` | `stack` | Keep |
| Row layout | `Rinruk` | `row` | `row` | Keep |
| Grid layout | `Selrukkar` | `grid` | `grid` | Keep |
| Center layout | `Torum` | `center` | `center` | Keep |

### Styling Blocks

| Meaning | Current readable | Current compact | Proposed Core | Decision |
| --- | --- | --- | --- | --- |
| Style block | `Tharsel` | `style` | `style` | Keep |
| Responsive block | `Ikhna` | `when` | `when` | Keep |
| Mobile breakpoint | `Navasa` | `mobile` | `mobile` | Keep |
| Tablet breakpoint | `Rinvasa` | `tablet` | `tablet` | Keep |
| Desktop breakpoint | `Torvasa` | `desktop` | `desktop` | Keep |

## Current Style Attribute Inventory

These are the most important rename targets because they still look strange even in compact mode.

| Meaning | Current | Proposed Core |
| --- | --- | --- |
| Padding | `Sarin`, `Savarin`, `sarin`, `savarin` | `pad` |
| Margin | `Ovsa`, `ovsa` | `margin` |
| Gap | `Shevsa`, `shevsa` | `gap` |
| Width / inline size | `Vator`, `vator` | `width` |
| Height / block size | `Torkar`, `torkar` | `height` |
| Min width | `Naktor`, `naktor` | `minWidth` |
| Max width | `Tornak`, `tornak` | `maxWidth` |
| Text color | `Lusel`, `Kellu`, `lusel`, `kellu` | `color` |
| Background | `Mirlu`, `mirlu` | `background` |
| Font size | `Kelsa`, `kelsa` | `font` |
| Font weight | `Keltorva`, `keltorva` | `weight` |
| Line height | `Kelruksa`, `kelruksa` | `line` |
| Text align | `Kelshev`, `kelshev` | `alignText` |
| Border | `Torkarva`, `torkarva` | `border` |
| Border color | `Torlu`, `torlu` | `borderColor` |
| Border width | `Torsa`, `torsa` | `borderWidth` |
| Border radius | `Natorkar`, `natorkar` | `radius` |
| Shadow | `Mireshel`, `mireshel` | `shadow` |
| Opacity | `Luna`, `luna` | `opacity` |
| Overflow | `Vashev`, `vashev` | `overflow` |
| Z-index | `Torshev`, `torshev` | `z` |
| Position | `Torrin`, `torrin` | `position` |
| Inset | `Rintor`, `rintor` | `inset` |
| Display | `Karum`, `karum` | `display` |
| Align items | `Seltorkar`, `seltorkar` | `align` |
| Justify content | `Rinshevsa`, `rinshevsa` | `justify` |
| Flex wrap | `Naruk`, `naruk` | `wrap` |
| Container width | `Vatornak`, `vatornak` | `container` |
| Aspect ratio | `Karlu`, `karlu` | `ratio` |

Style syntax should stay compact and declarative:

```keth
style Hero
  pad 6
  background "night.950"
  color "white"
  radius "soft"
  shadow "raised"
end
```

## Naming Rules

1. Prefer common programming words.
2. Prefer short full words over cryptic abbreviations for public Core syntax.
3. Keep compact aliases only where they clearly save tokens.
4. Avoid long fantasy words in the default docs.
5. Keep the compiler AST names semantic: `Page`, `Section`, `State`, `Action`.
6. Do not rename internal AST types unless needed.
7. Do not break existing examples immediately; add aliases first, migrate docs, then deprecate.

## Migration Strategy

### Phase 1: Add Core Aliases

Parser accepts both old and new:

- `page` and `pg`;
- `section` and `sec`;
- `text` and `txt`;
- `button` and `btn`;
- `component` and `cmp`;
- `state` and `st`;
- `action` and `act`;
- `route` and `rt`;
- `footer` and `foot`;
- `input` and `in`;
- `textarea` and `area`;
- `message` and `msg`.

Style parser accepts new style names while keeping old ones.

### Phase 2: Update Docs and Examples

Make Kethic Core the default in:

- `README.md`;
- `docs/AI_GUIDE.md`;
- `docs/AI_PROMPT_CAPSULE.md`;
- `docs/COMPACT_SYNTAX.md`;
- examples used in demos and benchmarks.

Keep a short section called "Compact aliases" and "Legacy Namaru aliases."

### Phase 3: Tests

Add tests proving:

- Core aliases parse;
- Compact aliases still parse;
- legacy Namaru syntax still parses;
- style aliases compile to the same CSS;
- benchmark examples still compile.

### Phase 4: Public Positioning

Pitch syntax as:

> Kethic Core is an AI-native programming language for compact web/app generation. It uses readable commands and compiler-level primitives to replace verbose generated frontend code.

Do not pitch:

> Kethic is a ritual web language with alien keywords.

The lore can exist behind the product, not in front of the product.

## Example Before and After

### Current Namaru

```keth
Lumva joins holds 0

Umrin join
  joins holds joins plus 1
Tor

Torvathar Landing
  Shevva Hero
    Keltor level:1 "Build more with fewer tokens"
    Kelen "AI-native source that compiles to real web apps."
    Umkar action:join
      Kelen "Join"
    Tor
  Tor
Tor
```

### Current Compact

```keth
st joins = 0

act join
  set joins = joins plus 1
end

pg Landing
  sec Hero
    h1 "Build more with fewer tokens"
    txt "AI-native source that compiles to real web apps."
    btn join "Join"
  end
end
```

### Proposed Kethic Core

```keth
state joins = 0

action join
  set joins = joins plus 1
end

page Landing
  section Hero
    h1 "Build more with fewer tokens"
    text "AI-native source that compiles to real web apps."
    button join "Join"
  end
end
```

This keeps Kethic as a programming language while making it easier to adopt.

## What To Change First

Start with web syntax only. Do not rename the older general-purpose language yet.

Reason:

- the investor/product thesis is currently web/app generation;
- web syntax is where the token benchmark proof is;
- changing general Kethic Classic too early will create unnecessary risk.

First implementation target:

1. Add Core parser aliases.
2. Add Core style aliases.
3. Update docs to call this "Kethic Core."
4. Convert one example to Core syntax.
5. Run tests.

