# Kethic Language Specification v1.0 Draft

Status: draft stabilization document.

This document freezes the implemented Kethic language surface before further security-type and runtime-authority work. New syntax should be added only by updating this document first.

## 1. Purpose

Kethic is a proprietary, ahead-of-time compiled programming language for web applications. Its current compiler emits JavaScript through these phases:

1. Lexer
2. Parser
3. Type checker
4. Code generator
5. Obfuscator
6. Rotating obfuscation engine

The long-term goal is not obfuscation alone. The goal is a language where authority, data trust, and unsafe flows become explicit compiler concepts.

## 2. File Extension

Kethic source files use:

```text
.keth
```

## 3. Implemented Keywords

| Keyword | Concept | JavaScript Output |
| --- | --- | --- |
| `Navā` | Mutable variable declaration | `let` |
| `Torūn` | Constant declaration | `const` |
| `Kelthar` | Named function declaration; expression-position anonymous function is currently also accepted | `function` |
| `Tharva` | Anonymous function expression | `function (...) { ... }` |
| `Rinthar` | Arrow function expression | `(...) => ...` |
| `Ovdurthar` | Async function marker | `async function` / `async (...) => ...` |
| `Torduren` | Await expression | `await` |
| `Umkel` | Function call invocation | `callee(...)` |
| `Duren` | Return statement | `return` |
| `Umra` | Null literal | `null` |
| `Ikhshev` | Conditional branch | `if` |
| `Shev` | Else / else-if branch | `else` / `else if` |
| `Ikhselthar` | Switch statement | `switch` |
| `Selikhshev` | Switch case branch | `case` |
| `Ovikhnak` | Switch default branch | `default` |
| `Rukhar` | While loop | `while` |
| `Duruk` | Break | `break` |
| `Rukum` | Continue | `continue` |
| `Selkar` | Type definition placeholder | JS typedef comment |
| `Rukva` | Array type annotation | compiles away |
| `Kelva` | Object / record type annotation | compiles away |
| `Shevkar` | Union type alias | JS typedef comment |
| `Umrava` | Optional type annotation | compiles away |
| `Tharkar` | Generic type alias | JS typedef comment |
| `Eshnak` | Error handling | `try/catch` |
| `Ovrin` | Import/export placeholder | `import` / `export` |
| `Selva` | Map / dictionary literal | computed-property lookup object |

## 4. Reserved Future Words

The following Second Archive terms are reserved and cannot be used as normal identifiers. They are not active syntax yet unless listed in section 3.

| Word | Planned Concept |
| --- | --- |
| `Ovesh` | Tainted value |
| `Seltor` | Trusted value |
| `Torkel` | Capability |
| `Torselthar` | Policy rule |
| `Selikh` | Validation |
| `Eshrin` | Sanitization / safe transformation |
| `Umresh` | Unsafe sink |
| `Selovva` | Query capsule |
| `Torumsel` | Authority kernel |

## 5. Literals

### 5.1 Number

```keth
Navā score = 95;
Navā tax = 0.2;
```

Numbers infer `Number`.

### 5.2 String

```keth
Navā name = "Aru";
```

Strings infer `String`.

### 5.3 Boolean

```keth
Navā visible = true;
Navā hidden = false;
```

Booleans infer `Boolean`.

### 5.4 Null

```keth
Navā empty = Umra;
```

`Umra` infers `Null`.

### 5.5 Template String

```keth
Navā message = `Hello {name}`;
```

Template strings emit JavaScript template literals and infer `String`.

## 6. Data Literals

### 6.1 Array Literal

```keth
Navā scores = [95, 87, 72];
Navā nested = [[1], [2]];
Navā empty = [];
```

Array literals infer homogeneous array types such as `Number[]` or `String[]`. Mixed arrays infer `Unknown[]`.

### 6.2 Object Literal

```keth
Navā user = { name: "Aru", age: 30 };
```

Object literals infer anonymous object shapes. Object property keys are preserved by code generation and obfuscation.

### 6.3 Map / Dictionary Literal

```keth
Navā labels = Selva { "active": "on", "paused": "off" };
Navā emptyLabels = Selva {};
Navā nested = Selva { "scores": [95, 87] };
```

`Selva` literals represent lookup archives. They infer a homogeneous key/value map type such as `Selva<String, Number>`. Mixed key or value types use `Unknown` for the mixed slot.

Generated JavaScript currently uses computed-property lookup objects so bracket access remains valid:

```js
let labels = ({ ["active"]: "on", ["paused"]: "off" });
```

## 7. Variables and Constants

```keth
Navā count = 0;
Torūn limit = 10;
```

`Navā` may be reassigned. `Torūn` cannot be assigned after its first value.

## 8. Functions

### 8.1 Named Function

```keth
Kelthar add(a, b) {
  Duren a + b;
}
```

### 8.2 Anonymous Function

```keth
Navā double = Tharva(x) {
  Duren x * 2;
};
```

### 8.3 Arrow Function

```keth
Navā triple = Rinthar (x) -> x * 3;
Navā block = Rinthar (x) -> {
  Duren x * 3;
};
```

### 8.4 Default and Rest Parameters

```keth
Kelthar greet(name = "stranger") {
  Duren `Hello {name}`;
}

Kelthar collect(...items) {
  Duren items;
}
```

Rest parameters must be final and cannot have default values.

### 8.5 Async and Await

```keth
Ovdurthar Kelthar load(value: Number) {
  Navā result = Torduren value;
  Duren result;
}

Navā compact = Ovdurthar Rinthar (value: Number) -> Torduren value;
```

`Ovdurthar` marks a named, anonymous, or arrow function as async. Calling an `Ovdurthar` function produces an internal `Promise<T>` far-return type, where `T` is the function body's returned value. `Torduren` pauses for a returning answer, is valid only inside an `Ovdurthar` function, and unwraps only `Promise<T>` values.

## 9. Control Flow

### 9.1 Conditional

```keth
Ikhshev score > 50 {
  Duren "pass";
} Shev {
  Duren "fail";
}
```

### 9.2 Loop

```keth
Rukhar count < 10 {
  count = count + 1;
}
```

### 9.3 Break and Continue

```keth
Duruk;
Rukum;
```

`Duruk` is valid inside loops and switch cases. `Rukum` is valid only inside loops.

### 9.4 Switch

```keth
Ikhselthar status {
  Selikhshev "active" {
    Duren "running";
  }
  Ovikhnak {
    Duren "unknown";
  }
}
```

Only one `Ovikhnak` is allowed per `Ikhselthar`.

## 10. Error Handling

```keth
Eshnak {
  Navā result = Umkel calculate(100);
} Ikhshev {
  Duren "error";
}
```

Emits JavaScript `try/catch`.

## 11. Module Boundaries

`Ovrin` controls named values crossing file boundaries.

```keth
Navā local = 10;
Kelthar add(a, b) {
  Duren a + b;
}

Ovrin local;
Ovrin { local, add };
Ovrin remoteValue from "./remote.js";
Ovrin { remoteValue, remoteAdd } from "./remote.js";
```

When `Ovrin` has a source string, it is an import and declares each incoming name as `Unknown` until multi-file type checking exists.

When `Ovrin` has no source string, it is an export and every exported name must already be declared in the current file.

During module graph compilation, Kethic follows local `.keth` imports, type-checks dependencies first, and injects the real exported symbol types into importing files. External non-Kethic imports remain `Unknown` until a package declaration system exists.

Generated JavaScript:

```js
export { local };
export { local, add };
import { remoteValue } from "./remote.js";
import { remoteValue, remoteAdd } from "./remote.js";
```

When a Kethic source imports another Kethic source, generated JavaScript rewrites the extension:

```keth
Ovrin { add } from "./math.keth";
```

```js
import { add } from "./math.js";
```

## 12. Standard Library

Kethic predeclares a small standard library. These functions require no `Ovrin` import and are type-checked like normal `Kelthar` calls.

| Kethic Function | Type Rule | JavaScript Output |
| --- | --- | --- |
| `Print(...values)` | accepts any values, returns `Void` | `console.log(...)` |
| `MathMax(...values: Number)` | one or more numbers, returns `Number` | `Math.max(...)` |
| `MathMin(...values: Number)` | one or more numbers, returns `Number` | `Math.min(...)` |
| `MathRound(value: Number)` | returns `Number` | `Math.round(...)` |
| `MathFloor(value: Number)` | returns `Number` | `Math.floor(...)` |
| `MathCeil(value: Number)` | returns `Number` | `Math.ceil(...)` |
| `StringLength(value: String)` | returns `Number` | `value.length` |
| `StringConcat(...values: String)` | returns `String` | string `+` chain |
| `StringUpper(value: String)` | returns `String` | `value.toUpperCase()` |
| `StringLower(value: String)` | returns `String` | `value.toLowerCase()` |
| `StringTrim(value: String)` | returns `String` | `value.trim()` |
| `StringIncludes(value: String, search: String)` | returns `Boolean` | `value.includes(search)` |
| `StringStartsWith(value: String, search: String)` | returns `Boolean` | `value.startsWith(search)` |
| `StringSlice(value: String, start: Number, end?: Number)` | returns `String` | `value.slice(...)` |
| `ArrayLength(value: Rukva Unknown)` | returns `Number` | `value.length` |
| `ArrayAt(value: Rukva Unknown, index: Number)` | returns `Unknown` | `value.at(index)` |
| `ArrayPush(value: Rukva Unknown, item: Unknown)` | returns `Number` | `value.push(item)` |
| `ArrayJoin(value: Rukva Unknown, separator: String)` | returns `String` | `value.join(separator)` |
| `ArrayIncludes(value: Rukva Unknown, item: Unknown)` | returns `Boolean` | `value.includes(item)` |
| `HttpGet(url: String)` | returns `Promise<String>` | `fetch(url).then(response => response.text())` |
| `JsonParse(text: String)` | returns `Unknown` | `JSON.parse(text)` |
| `JsonStringify(value: Unknown)` | returns `String` | `JSON.stringify(value)` |

```keth
Navā high = MathMax(10, 20, 5);
Navā size = StringLength("Aru");
Navā upper = StringUpper("aru");
Navā first = ArrayAt([1, 2, 3], 0);
Umkel Print("high", high, size);

Ovdurthar Kelthar load(url: String) {
  Navā raw = Torduren HttpGet(url);
  Duren JsonParse(raw);
}
```

## 13. Expressions

Kethic currently supports:

- arithmetic: `+`, `-`, `*`, `/`, `%`
- comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
- logical: `&&`, `||`, `!`
- ternary: `condition ? whenTrue : whenFalse`
- assignment
- function calls
- member access: `user.name`
- indexing: `items[0]`
- grouping with parentheses

## 14. Type Checking

The type checker currently supports:

- primitive types: `Number`, `String`, `Boolean`, `Void`, `Null`
- function types
- internal `Promise<T>` far-return types for `Ovdurthar` calls
- array types
- map types
- anonymous object shapes
- array annotations with `Rukva`
- object annotations with `Kelva`
- named union aliases with `Shevkar`
- optional annotations with `Umrava`
- generic aliases with `Tharkar`
- predeclared standard library function symbols
- variable, constant, and parameter type annotations
- lexical scope tracking
- duplicate declaration diagnostics
- undeclared variable diagnostics
- function arity diagnostics
- return type consistency diagnostics
- `Torduren` placement inside `Ovdurthar` functions
- `Torduren` await-target diagnostics for non-promise values
- switch case type matching
- module graph import/export validation for local `.keth` files

Unknown values use `Unknown` to avoid cascaded errors.

### 14.1 Union Types

```keth
Shevkar Label = String | Number;
Navā status: Label = "active";
Navā count: Label = 3;
Navā maybe: String | Umra = Umra;

Kelthar echo(value: Label) {
  Duren value;
}
```

`Shevkar` declares a named forked shape. A value annotated with a union may receive any member type in that union. Inline unions are also valid in annotations.

### 14.2 Optional Types

```keth
Navā name: Umrava String = "Aru";
Navā emptyName: Umrava String = Umra;

Kelthar greet(value: Umrava String) {
  Duren value;
}
```

`Umrava Type` means the value may be either `Type` or `Null`. It is equivalent to `Type | Umra`, but reads as an intentional optional vessel.

### 14.3 Array and Object Types

```keth
Navā scores: Rukva Number = [95, 87, 72];
Navā nested: Rukva Rukva Number = [[1], [2]];
Navā user: Kelva { name: String, age: Number } = { name: "Aru", age: 30 };
```

`Rukva Type` declares an array whose elements must match `Type`.

`Kelva { field: Type }` declares an object shape whose fields must match the declared property names and types.

### 14.4 Generic Types

```keth
Tharkar Box<T> = Kelva { value: T };
Tharkar Pair<T, U> = Kelva { first: T, second: U };

Navā numberBox: Box<Number> = { value: 10 };
Navā pair: Pair<String, Number> = { first: "age", second: 30 };
```

`Tharkar` declares a reusable pattern-shape. Each type parameter must be supplied when the generic alias is used, and the checker substitutes concrete types into the alias body.

## 15. Obfuscation

The obfuscator currently performs:

- identifier mangling
- string encoding
- number encoding
- control-flow flattening
- dead-code injection
- source-map remapping

Object property keys are intentionally preserved while property values are obfuscated.

## 16. Not Yet Implemented

The following are planned but not active syntax:

- `Ovesh` tainted values
- `Seltor` trusted values
- `Torkel` capabilities
- `Torselthar` policy rules
- `Selikh` validation
- `Eshrin` sanitization
- `Umresh` unsafe sink enforcement
- `Selovva` query capsules
- `Torumsel` authority kernel runtime

## 17. Stabilization Rule

Before adding any new syntax, update this spec with:

1. the Kethic word;
2. the grammar shape;
3. AST node shape;
4. type-checking rule;
5. code-generation rule;
6. obfuscation rule;
7. at least one example.
