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
| `Eshnak` | Error handling | `try/catch` |
| `Ovrin` | Import/export placeholder | `import` / `export` |

## 4. Reserved Future Words

The following Second Archive terms are reserved and cannot be used as normal identifiers. They are not active syntax yet unless listed in section 3.

| Word | Planned Concept |
| --- | --- |
| `Rukva` | Array type / collection form |
| `Kelva` | Object or record type |
| `Selva` | Map / dictionary |
| `Shevkar` | Union type |
| `Umrava` | Optional type |
| `Tharkar` | Generic type |
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

## 11. Expressions

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

## 12. Type Checking

The type checker currently supports:

- primitive types: `Number`, `String`, `Boolean`, `Void`, `Null`
- function types
- array types
- anonymous object shapes
- lexical scope tracking
- duplicate declaration diagnostics
- undeclared variable diagnostics
- function arity diagnostics
- return type consistency diagnostics
- switch case type matching

Unknown values use `Unknown` to avoid cascaded errors.

## 13. Obfuscation

The obfuscator currently performs:

- identifier mangling
- string encoding
- number encoding
- control-flow flattening
- dead-code injection
- source-map remapping

Object property keys are intentionally preserved while property values are obfuscated.

## 14. Not Yet Implemented

The following are planned but not active syntax:

- `Selva` maps / dictionaries
- `Shevkar` union types
- `Umrava` optional types
- `Tharkar` generic types
- `Ovesh` tainted values
- `Seltor` trusted values
- `Torkel` capabilities
- `Torselthar` policy rules
- `Selikh` validation
- `Eshrin` sanitization
- `Umresh` unsafe sink enforcement
- `Selovva` query capsules
- `Torumsel` authority kernel runtime
- `Ovdurthar` async
- `Torduren` await

## 15. Stabilization Rule

Before adding any new syntax, update this spec with:

1. the Kethic word;
2. the grammar shape;
3. AST node shape;
4. type-checking rule;
5. code-generation rule;
6. obfuscation rule;
7. at least one example.
