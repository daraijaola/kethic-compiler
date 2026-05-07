# Kethic Native Syntax

Status: founding design document.

This document defines the new direction for Kethic. It exists so future compiler work does not drift back into JavaScript, Python, Rust, C++, or ordinary web syntax.

## 1. Identity

Kethic is a ritual engineering language from the Namaru civilization.

Kethic source should not feel like JavaScript with renamed keywords. It should feel like a calm, alien, readable system for declaring vessels, naming patterns, reading signs, catching cracks, and carrying answers across gates.

The compiler may still output JavaScript, WASM, HTML, CSS, or other platform targets. Those are target formats, not the identity of the language.

The source language must be Kethic.

## 2. Core Theme

A Kethic program is a sealed ritual system.

It declares:

- what may change;
- what must remain fixed;
- what patterns may be awakened;
- what signs divide action;
- what every path returns;
- what cracks are caught;
- what may cross a boundary.

The guiding sentence:

> Reality is performed correctly.

In compiler terms:

> Software should be named, bounded, typed, recoverable, and explicit at its gates.

## 3. Kethic Classic vs Kethic Native

The current implemented syntax is now called **Kethic Classic**.

Example Classic:

```keth
Navā price = 100;
Torūn tax = 0.2;

Kelthar calculate(price, tax) {
  Duren price + tax;
}
```

Classic exists because it was fast to build and easy to compile to JavaScript. It remains useful as an internal compatibility layer and for regression tests.

The future user-facing syntax is **Kethic Native**.

Example Native:

```keth
Navā price holds 100
Torūn tax oath 0.2

Kelthar calculate receives price, tax
  Duren price plus tax
Tor
```

Native syntax must become the primary language surface.

## 4. Non-Negotiable Native Rules

1. Kethic Native does not use semicolons.
2. Kethic Native does not use braces for ordinary blocks.
3. Blocks close with a ritual closing word, currently `Tor`.
4. Prefer readable operator words over symbolic operators.
5. Prefer declarations that read like Namaru ritual instructions.
6. Function calls should not look like JavaScript calls as the primary syntax.
7. Imports and exports are gates, not casual includes.
8. Website syntax must not look like HTML or CSS.
9. Unsafe data must eventually be visible to the compiler.
10. Error handling must be a first-class design feature, not an afterthought.

## 5. Native Block Rule

Most block forms open with a keyword and close with `Tor`.

```keth
Kelthar name receives input
  Duren input
Tor
```

Nested blocks use the same rule:

```keth
Ikhshev score above 50
  Duren "pass"
Shev
  Duren "fail"
Tor
```

The parser should treat indentation as readability, not as the only source of truth. The closing word is the structural boundary.

## 6. Native Declarations

### 6.1 Mutable Vessel

Classic:

```keth
Navā price = 100;
```

Native:

```keth
Navā price holds 100
```

Meaning: create a change-vessel named `price` holding `100`.

### 6.2 Stone Oath

Classic:

```keth
Torūn tax = 0.2;
```

Native:

```keth
Torūn tax oath 0.2
```

Meaning: create a fixed stone-oath named `tax`.

### 6.3 Named Pattern

Classic:

```keth
Kelthar add(a, b) {
  Duren a + b;
}
```

Native:

```keth
Kelthar add receives a, b
  Duren a plus b
Tor
```

Meaning: declare a sleeping pattern named `add` with two received vessels.

## 7. Native Calls

Classic:

```keth
Navā total = Umkel add(1, 2);
```

Native:

```keth
Navā total holds Umkel add with 1, 2
```

Function calls should read as awakening a named pattern with offerings.

## 8. Native Operators

Native Kethic should prefer word operators.

| Concept | Classic | Native |
| --- | --- | --- |
| Add | `a + b` | `a plus b` |
| Subtract | `a - b` | `a minus b` |
| Multiply | `a * b` | `a times b` |
| Divide | `a / b` | `a over b` |
| Remainder | `a % b` | `a remains b` |
| Equal | `a == b` | `a same b` |
| Not equal | `a != b` | `a unlike b` |
| Greater | `a > b` | `a above b` |
| Less | `a < b` | `a below b` |
| Greater/equal | `a >= b` | `a atleast b` |
| Less/equal | `a <= b` | `a atmost b` |
| Logical and | `a && b` | `a and b` |
| Logical or | `a || b` | `a or b` |
| Logical not | `!a` | `not a` |

These words are working design names. They may be replaced by deeper Namaru terms later, but the design rule remains: Native syntax should not depend on punctuation-heavy JavaScript operators.

## 9. Native Control Flow

### 9.1 Conditional

```keth
Ikhshev score above 50
  Duren "pass"
Shev
  Duren "fail"
Tor
```

### 9.2 Loop

```keth
Rukhar count below 10
  count holds count plus 1
Tor
```

### 9.3 Switch

```keth
Ikhselthar status
  Selikhshev "active"
    Duren "running"
  Selikhshev "paused"
    Duren "paused"
  Ovikhnak
    Duren "unknown"
Tor
```

### 9.4 Error Handling

```keth
Eshnak
  Navā data holds Torduren HttpGet with url
Nak
  Duren "failed"
Tor
```

`Nak` is the recovery boundary inside an `Eshnak` block. It means the safety net catches the crack.

## 10. Native Data Structures

### 10.1 Array / Rukva

Classic:

```keth
Navā scores = [95, 87, 72];
```

Native:

```keth
Rukva scores holds 95, 87, 72
```

### 10.2 Object / Kelva

Classic:

```keth
Navā user = { name: "Aru", age: 30 };
```

Native:

```keth
Kelva user holds
  name: "Aru"
  age: 30
Tor
```

### 10.3 Map / Selva

Native:

```keth
Selva labels holds
  "active" => "on"
  "paused" => "off"
Tor
```

The `=>` marker is temporary. A later Namaru-native pair marker may replace it.

## 11. Native Modules

Classic:

```keth
Ovrin { add } from "./math.keth";
Ovrin { calculate };
```

Native:

```keth
Ovrin receive add from "./math.keth"
Ovrin send calculate
Ovrin send price, tax
```

Module boundaries are city gates. `receive` carries named values inward. `send` places named values at the gate for other modules.

## 12. Website Direction

Kethic must not become HTML and CSS with renamed tags.

A Kethic website should describe interface vessels, not raw browser markup.

Working example shape:

```keth
Veyra Home
  Karva main
    Tekel "Welcome"
    Umbar "Start" awakens begin
  Tor
Tor
```

These website words are placeholders until final Namaru terms are approved:

- `Veyra` page/document
- `Karva` container/layout vessel
- `Tekel` text element
- `Umbar` button/action control
- `awakens` event binding

The compiler may emit HTML, CSS, and JavaScript, but Kethic users should write Kethic-native interface declarations.

## 13. Quality Promise

Kethic should deliver better quality than ordinary JavaScript or Python by making good architecture the default.

The language should push developers toward:

- explicit module boundaries;
- predictable types;
- clear return paths;
- safe error handling;
- compiler-visible unsafe data;
- scoped UI components;
- generated platform output;
- obfuscation after correctness, not before correctness.

Kethic should be easier to write because the source reads like structured intent, not platform machinery.

Kethic should be stronger because the compiler has more semantic knowledge than ordinary JavaScript.

## 14. Implementation Strategy

Do not throw away the existing compiler.

Instead:

1. Keep the existing AST.
2. Keep the current type checker.
3. Keep the current code generator.
4. Keep the current obfuscator.
5. Add a Kethic Native parser that produces the same AST.
6. Keep Kethic Classic parser for compatibility and regression tests.
7. Make all new user-facing features use Native syntax first.

This approach changes the front door without destroying the compiler foundation.

## 15. Revised Phases

### Phase 0 — Constitution

Create and maintain this document.

Done when:

- Kethic identity is documented;
- Classic vs Native is documented;
- syntax rules are documented;
- future work references this document before adding syntax.

### Phase 1 — Native Core Parser

Implement Native parsing for:

- `Navā name holds value`
- `Torūn name oath value`
- `Kelthar name receives params ... Tor`
- `Duren value`
- `Umkel name with args`

The parser should produce the existing AST nodes.

### Phase 2 — Native Expressions

Implement word operators:

- `plus`
- `minus`
- `times`
- `over`
- `remains`
- `same`
- `unlike`
- `above`
- `below`
- `atleast`
- `atmost`
- `and`
- `or`
- `not`

### Phase 3 — Native Control Flow

Implement Native forms for:

- `Ikhshev ... Shev ... Tor`
- `Rukhar ... Tor`
- `Ikhselthar ... Selikhshev ... Ovikhnak ... Tor`
- `Eshnak ... Nak ... Tor`
- `Duruk`
- `Rukum`

### Phase 4 — Native Data

Implement Native forms for:

- `Rukva name holds ...`
- `Kelva name holds ... Tor`
- `Selva name holds ... Tor`
- `Umra`

### Phase 5 — Native Modules

Implement:

- `Ovrin receive name from "..."`
- `Ovrin receive name, other from "..."`
- `Ovrin send name`
- `Ovrin send name, other`

Reuse the existing module graph.

### Phase 6 — Native Website Layer

After final website terms are approved, implement:

- page declarations;
- containers;
- text;
- images/media;
- buttons;
- inputs;
- forms;
- style rules;
- events;
- state;
- components;
- routes.

This phase must not copy HTML/CSS syntax as the main user surface.

### Phase 7 — Safety System

Implement Second Archive safety terms:

- `Ovesh` tainted values;
- `Seltor` trusted values;
- `Selikh` validation;
- `Eshrin` sanitization;
- `Umresh` unsafe sinks;
- `Torkel` capabilities;
- `Torselthar` policy rules.

### Phase 8 — Production App Build

Make Kethic build complete applications:

- backend routes;
- typed request/response;
- frontend bundle;
- generated HTML/CSS/JS;
- module graph output;
- obfuscated release output.

### Phase 9 — Self-Hosting Path

Begin rewriting compiler components in Kethic Native.

Kethic proves itself when Kethic can build Kethic.

## 16. Design Warning

Every new feature must be checked against this question:

> Does this make Kethic more like ritual engineering, or does it pull Kethic back toward JavaScript with different words?

If it pulls Kethic back toward JavaScript, redesign it before implementation.
