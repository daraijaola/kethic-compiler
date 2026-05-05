# Kethic Production Language Architecture

This document defines the architecture for growing Kethic from its current compiler prototype into a production-capable programming language for CLI tools, backend APIs, and full-stack websites.

Current completed phases:

- Lexer
- Parser
- Type checker
- Code generator
- Obfuscator
- Rotating obfuscation engine

Current supported language surface:

- `Navā` variable declarations
- `Torūn` constant declarations
- `Kelthar` function declarations
- `Umkel` function calls
- `Duren` return statements
- `Ikhshev` basic conditionals
- `Rukhar` basic loops
- `Eshnak` basic error handling
- `Ovrin` basic imports and exports
- Basic expressions and operators

## Design Principles

Kethic should remain small enough for AI generation to target reliably, strict enough to catch mistakes before code generation, expressive enough to build real web software, and obfuscation-friendly enough that source-level structure does not leak into output.

Every new feature must have:

- A lexer representation
- A parser AST node
- A type checker rule
- A code generation rule
- An obfuscator policy
- Tests across valid and invalid cases

The most important next architectural change is a stronger internal type model. The compiler should avoid ad hoc string types such as `"Number[]"` and move toward structured `Type` objects before adding unions, optionals, generics, and function types.

## Feature Architecture

### 1. Data Structures

#### Arrays

Purpose: ordered lists of values.

Example:

```keth
Navā items = [1, 2, 3];
```

Lexer changes:

- Confirm `LeftBracket`, `RightBracket`, and `Comma` are complete.
- No new keyword required.

Parser changes:

- Add `ArrayLiteralNode`.
- Parse empty arrays and comma-separated expressions.
- Support nested arrays.

Type checker changes:

- Infer homogeneous array types such as `Array<Number>`.
- Decide mixed array policy:
  - reject mixed literals at first, or
  - infer union arrays after union types exist.
- Validate array indexing once indexing syntax is added.

Code generator changes:

- Emit JavaScript array literals.

Obfuscator changes:

- Encode string and number literals inside arrays.
- Preserve array structure.

Complexity: Medium

#### Objects

Purpose: structured records for API data, UI state, and configuration.

Example:

```keth
Navā user = { name: "Aru", age: 30 };
```

Lexer changes:

- Confirm braces, colon, comma, identifiers, and string keys are supported.

Parser changes:

- Add `ObjectLiteralNode`.
- Add `ObjectPropertyNode`.
- Parse identifier keys and string keys.
- Support nested object values.

Type checker changes:

- Infer anonymous object shapes.
- Connect object literals to `Selkar` definitions.
- Validate property access once member access exists.

Code generator changes:

- Emit JavaScript object literals.

Obfuscator changes:

- Do not blindly mangle object property keys.
- Preserve public API fields by default.
- Only mangle object keys when metadata marks them private/internal.

Complexity: High

#### Maps

Purpose: key-value collections.

Recommended initial design:

```keth
Navā cache = Std.Map();
```

Lexer changes:

- None initially.
- Optional future map-literal syntax would require new tokens or grammar.

Parser changes:

- Requires member access and call expressions.

Type checker changes:

- Requires generic types such as `Map<String, Number>`.
- Track key and value types.

Code generator changes:

- Emit JavaScript `Map`.

Obfuscator changes:

- Preserve global `Map`.
- Mangle local variable names only.

Complexity: Medium initially, High with map literals and generics.

#### Null Equivalent

Purpose: represent absence.

Recommended Kethic literal: `Umra`, based on the Unnamed Dark.

Lexer changes:

- Add `Umra` keyword/literal token.

Parser changes:

- Add `NullLiteralNode`.

Type checker changes:

- Add `Null` type.
- Support nullable/optional types.
- Prevent unsafe property access unless guarded.

Code generator changes:

- Emit JavaScript `null`.

Obfuscator changes:

- Preserve `null`.

Complexity: Medium

### 2. Extended Expressions

#### Member Access and Indexing

This is foundational and should be built before most standard library work.

Examples:

```keth
user.name
items[0]
Std.console.log("hello")
```

Lexer changes:

- Dot and brackets already exist.

Parser changes:

- Add `MemberExpressionNode`.
- Add `IndexExpressionNode`.
- Extend call parsing so calls compose with members and indexes.

Type checker changes:

- Validate object fields.
- Validate array indexes are `Number`.
- Validate standard library member calls.

Code generator changes:

- Emit JavaScript member and index syntax.

Obfuscator changes:

- Preserve public property names.
- Mangle only safe local identifiers.

Complexity: High

#### Ternary Expression

Example:

```keth
condition ? valueA : valueB
```

Lexer changes:

- Add `QuestionMark`.

Parser changes:

- Add `ConditionalExpressionNode`.
- Place precedence below logical OR and above assignment.

Type checker changes:

- Condition should be Boolean-compatible.
- Result type should be common type or union type.

Code generator changes:

- Emit JavaScript ternary expression.

Obfuscator changes:

- Preserve ternary structure while obfuscating nested literals and identifiers.

Complexity: Medium

#### Logical Not

Current lexer/parser likely partially support `!`.

Lexer changes:

- Confirm `Bang` token is stable.

Parser changes:

- Confirm unary expression support.

Type checker changes:

- Argument should be Boolean-compatible.
- Result is `Boolean`.

Code generator changes:

- Emit `!expression`.

Obfuscator changes:

- Preserve operator.

Complexity: Low

#### String Concatenation

Current support uses `+`.

Lexer changes:

- None.

Parser changes:

- Already covered by binary expressions.

Type checker changes:

- `String + String` returns `String`.
- `String + Number` should return `String` for practical web ergonomics.

Code generator changes:

- Emit `+`.

Obfuscator changes:

- Encode string literals.

Complexity: Low

#### Template Strings

Recommended syntax:

```keth
"Hello {name}"
```

Lexer changes:

- Either tokenize interpolated strings specially, or parse interpolation from string literal contents.
- Backtick syntax is possible but less culturally distinct.

Parser changes:

- Add `TemplateStringNode`.
- Add `TemplatePartNode`.
- Parse embedded expressions.

Type checker changes:

- Embedded expressions must be String-convertible.
- Result type is `String`.

Code generator changes:

- Emit JavaScript template literals.
- Escape backticks and interpolation safely.

Obfuscator changes:

- Encode static string segments.
- Preserve embedded expressions.

Complexity: High

### 3. Extended Control Flow

#### Else and Else-If Chains

Recommended Kethic syntax:

```keth
Ikhshev condition {
  ...
} Shev Ikhshev otherCondition {
  ...
} Shev {
  ...
}
```

Lexer changes:

- Add `Shev` keyword.

Parser changes:

- Extend `ConditionalStatementNode`.
- Add optional `elseBranch`.
- Else branch can be another conditional or a block.

Type checker changes:

- Check all branches.
- Maintain block scoping.
- Later: support type narrowing.

Code generator changes:

- Emit `if`, `else if`, and `else`.

Obfuscator changes:

- Preserve branch semantics during flattening.
- Avoid unsafe branch reordering.

Complexity: Medium

#### Break and Continue

Recommended Kethic terms:

- `Duruk` for break
- `Rukum` for continue

Lexer changes:

- Add `Duruk` and `Rukum` keywords.

Parser changes:

- Add `BreakStatementNode`.
- Add `ContinueStatementNode`.

Type checker changes:

- Validate only inside `Rukhar` or switch-equivalent statements.

Code generator changes:

- Emit `break;` and `continue;`.

Obfuscator changes:

- Control-flow flattening must preserve loop exit and continuation behavior.

Complexity: Medium

#### Nested Scopes

Lexer changes:

- None.

Parser changes:

- Blocks already exist.
- Formalize all block-producing constructs.

Type checker changes:

- Define lexical scope rules for:
  - functions
  - blocks
  - loops
  - catch/recovery blocks
  - switch cases
- Decide shadowing policy.

Code generator changes:

- Emit braces consistently.

Obfuscator changes:

- Name mangling must respect scope.
- Same source name in different scopes can map to different obfuscated names.

Complexity: Medium

#### Switch Equivalent

Recommended term: `Ikhkar`, meaning sign-shape.

Lexer changes:

- Add switch keyword.
- Add case/default keywords or syntax.

Parser changes:

- Add `SwitchStatementNode`.
- Add `SwitchCaseNode`.
- Add default case support.

Type checker changes:

- Check switch expression type.
- Check case expression compatibility.
- Validate `Duruk` behavior.

Code generator changes:

- Emit JavaScript `switch`.

Obfuscator changes:

- Avoid double-flattening unsafe switch control flow.

Complexity: High

### 4. Extended Functions

#### Parameter AST Refactor

This must happen before default parameters, rest parameters, and function types.

Lexer changes:

- None.

Parser changes:

- Replace raw parameter `Token[]` with `ParameterNode[]`.
- `ParameterNode` should support:
  - name
  - optional type annotation
  - optional default value
  - rest flag

Type checker changes:

- Store parameter symbols with full type metadata.

Code generator changes:

- Emit normal, default, and rest parameters.

Obfuscator changes:

- Mangle parameter names safely by scope.

Complexity: Medium

#### Default Parameters

Example:

```keth
Kelthar greet(name = "guest") {
  Duren name;
}
```

Lexer changes:

- None.

Parser changes:

- Add default expression to `ParameterNode`.

Type checker changes:

- Infer parameter type from default.
- Allow omitted arguments when default exists.

Code generator changes:

- Emit JavaScript default parameters.

Obfuscator changes:

- Mangle parameter name.
- Obfuscate default literal.

Complexity: Medium

#### Rest Parameters

Example:

```keth
Kelthar sum(...values) {
  ...
}
```

Lexer changes:

- Add `Ellipsis`.

Parser changes:

- Add `isRest` to `ParameterNode`.
- Require rest parameter to be last.

Type checker changes:

- Rest parameter type is array.
- Validate extra arguments.

Code generator changes:

- Emit JavaScript rest parameter.

Obfuscator changes:

- Preserve `...`.
- Mangle parameter name.

Complexity: Medium

#### Anonymous Functions

Lexer changes:

- No new keyword if reusing `Kelthar`.

Parser changes:

- Add `FunctionExpressionNode`.
- Differentiate declaration form from expression form.

Type checker changes:

- Infer function type.
- Track parameter and return types.

Code generator changes:

- Emit `function (...) { ... }`.

Obfuscator changes:

- Mangle parameters and locals.
- Preserve closure behavior.

Complexity: High

#### Arrow Functions

Example:

```keth
(x) -> x + 1
```

Lexer changes:

- Arrow already exists.

Parser changes:

- Add `ArrowFunctionExpressionNode`.
- Support expression body and block body.

Type checker changes:

- Infer function type.
- Support contextual callback typing.

Code generator changes:

- Emit JavaScript arrow functions.

Obfuscator changes:

- Preserve lexical `this` semantics.
- Mangle parameters.

Complexity: High

#### Function Types

Example:

```keth
(Number, Number) -> Number
```

Lexer changes:

- No new tokens beyond arrow and type punctuation.

Parser changes:

- Type grammar must support callable signatures.

Type checker changes:

- Add callable type representation.
- Check argument and return compatibility.

Code generator changes:

- Erase type-only information or emit JSDoc.

Obfuscator changes:

- No runtime effect.

Complexity: High

### 5. Extended Type System

#### Explicit Type Annotations

Example:

```keth
Navā price: Number = 100;
```

Lexer changes:

- Colon already exists.

Parser changes:

- Add optional type annotation to declarations and parameters.
- Add formal type grammar.

Type checker changes:

- Validate initializer assignability.
- Use annotations to resolve unknown parameter types.

Code generator changes:

- Erase annotations.

Obfuscator changes:

- No runtime effect.

Complexity: Medium

#### Union Types

Example:

```keth
Number | String
```

Lexer changes:

- Add single-pipe token if not distinct from `||`.

Parser changes:

- Add `UnionTypeNode`.

Type checker changes:

- Add assignability rules.
- Add common type calculation.
- Add narrowing later.

Code generator changes:

- Erase or emit JSDoc.

Obfuscator changes:

- No runtime effect.

Complexity: High

#### Optional Types

Example:

```keth
String?
```

Lexer changes:

- Add/reuse `QuestionMark`.

Parser changes:

- Add `OptionalTypeNode`.

Type checker changes:

- Treat optional as `Type | Null`.
- Enforce null checks before unsafe access.

Code generator changes:

- Erase type info.

Obfuscator changes:

- No runtime effect.

Complexity: Medium

#### Array Types

Example:

```keth
Number[]
```

Lexer changes:

- Brackets already exist.

Parser changes:

- Add `ArrayTypeNode`.

Type checker changes:

- Validate array literals, indexing, and array method return types.

Code generator changes:

- Erase type info.

Obfuscator changes:

- No runtime effect.

Complexity: Medium

#### Generic Types

Example:

```keth
Map<String, Number>
```

Lexer changes:

- Reuse `<`, `>`, and comma.
- Parser must distinguish generic delimiters from comparisons by context.

Parser changes:

- Add `GenericTypeNode`.

Type checker changes:

- Bind type parameters.
- Support generic standard library declarations.
- Later: infer generic function calls.

Code generator changes:

- Erase type info.

Obfuscator changes:

- No runtime effect.

Complexity: High

#### Expanded Selkar

Purpose: production structural types.

Lexer changes:

- Reuse `Selkar`.
- Add punctuation support for optional fields and generics.

Parser changes:

- Support:
  - fields
  - optional fields
  - method signatures
  - generic parameters
  - nested object shapes

Type checker changes:

- Structural compatibility.
- Duplicate field checking.
- Property access validation.

Code generator changes:

- Emit JSDoc typedef or erase.

Obfuscator changes:

- Preserve public field names.

Complexity: High

### 6. Standard Library

The standard library should have two layers:

1. Compile-time declarations known to the type checker.
2. Runtime bindings emitted or referenced by codegen.

#### Console Output

Recommended API:

```keth
Std.console.log(value);
```

Lexer changes:

- None after member access exists.

Parser changes:

- Requires member expressions and call expressions.

Type checker changes:

- Add standard symbol registry.
- `log(...Unknown[]) -> Void`.

Code generator changes:

- Emit `console.log`.

Obfuscator changes:

- Preserve global `console` and method `log`.

Complexity: Low after member access.

#### Math

Recommended API:

```keth
Std.math.max(a, b);
```

Lexer changes:

- None.

Parser changes:

- Requires member calls.

Type checker changes:

- Add math declarations.

Code generator changes:

- Emit `Math.max`, `Math.floor`, `Math.random`, etc.

Obfuscator changes:

- Preserve `Math` and method names.

Complexity: Medium

#### String Methods

Needed:

- length
- includes
- split
- trim
- replace

Lexer changes:

- None.

Parser changes:

- Requires member access or standard library calls.

Type checker changes:

- Add string method signatures.

Code generator changes:

- Emit JavaScript string methods or helpers.

Obfuscator changes:

- Preserve method names.

Complexity: Medium

#### Array Methods

Needed:

- push
- pop
- map
- filter
- reduce
- length
- includes
- join

Lexer changes:

- None.

Parser changes:

- Requires member access and callback functions.

Type checker changes:

- Requires arrays, generics, and function types.

Code generator changes:

- Emit JavaScript array methods.

Obfuscator changes:

- Preserve public method names.
- Obfuscate callback internals.

Complexity: High

#### Fetch and HTTP

Recommended API:

```keth
Std.http.get(url)
Std.http.post(url, body)
```

Lexer changes:

- None.

Parser changes:

- Requires member calls.
- Async support should be added for real usage.

Type checker changes:

- Add `Promise<T>`.
- Add typed response helpers.
- Add JSON type support.

Code generator changes:

- Emit `fetch` or runtime helper calls.

Obfuscator changes:

- Preserve `fetch`, response methods, and public JSON field names.

Complexity: High

#### Async and Await

Required for production HTTP.

Recommended terms:

- `Nesh` for async
- `Umren` for await

Lexer changes:

- Add async and await keywords.

Parser changes:

- Add async function declarations.
- Add await expressions.

Type checker changes:

- Add `Promise<T>`.
- Await unwraps promise type.
- Async functions return promises.

Code generator changes:

- Emit JavaScript `async` and `await`.

Obfuscator changes:

- Preserve async/await syntax.

Complexity: High

### 7. Module System

#### Named Exports

Lexer changes:

- Add contextual `from` and `as` if needed.

Parser changes:

- Formalize:
  - `Ovrin name;`
  - `Ovrin { a, b };`
  - `Ovrin name as alias;`

Type checker changes:

- Track module export table.
- Validate exported names exist.

Code generator changes:

- Emit JavaScript named exports.

Obfuscator changes:

- Preserve public export API.
- Mangle internals only when export aliases remain correct.

Complexity: Medium

#### Default Exports

Recommended syntax:

```keth
Ovrin default app;
```

Lexer changes:

- Add contextual `default`.

Parser changes:

- Add `DefaultExportNode`.

Type checker changes:

- Enforce one default export per module.

Code generator changes:

- Emit `export default app;`.

Obfuscator changes:

- Can emit `export default _0x123` if internal binding is safely mapped.

Complexity: Medium

#### Wildcard Imports

Recommended syntax:

```keth
Ovrin * as tools from "tools";
```

Lexer changes:

- Star already exists.
- Add contextual `as` and `from`.

Parser changes:

- Add `WildcardImportNode`.

Type checker changes:

- Bind namespace symbol.
- Resolve namespace member access.

Code generator changes:

- Emit `import * as tools from "tools";`.

Obfuscator changes:

- Preserve namespace import boundaries.

Complexity: Medium

#### Multi-File Module Resolution

Lexer changes:

- None.

Parser changes:

- None per file.

Type checker changes:

- Build dependency graph.
- Detect circular imports.
- Validate import/export compatibility.

Code generator changes:

- Emit multiple JS files or bundled output.
- Decide browser/server target mode.

Obfuscator changes:

- Cross-module mangling must preserve imports and exports.
- Rotating engine must rotate all modules consistently.

Complexity: High

## Build Order

### Phase A: Core Internal Stabilization

1. Refactor AST and type model.
2. Replace raw parameter tokens with `ParameterNode`.
3. Add formal type grammar.
4. Add member access and indexing.

Reason: most future features depend on richer AST nodes and a real type model.

### Phase B: Core Data and Types

5. Add null equivalent.
6. Add arrays.
7. Add objects.
8. Add explicit type annotations.
9. Add array and object type checking.

Reason: real programs need structured values before advanced standard library work.

### Phase C: Control Flow and Expressions

10. Add else/else-if chains.
11. Add break and continue.
12. Add ternary expressions.
13. Add template strings.
14. Add switch equivalent.

Reason: this makes CLI and backend logic practical.

### Phase D: Function System

15. Add default parameters.
16. Add rest parameters.
17. Add function types.
18. Add anonymous functions.
19. Add arrow functions.

Reason: callbacks and higher-order APIs require a stronger function model.

### Phase E: Advanced Type System

20. Add union types.
21. Add optional types.
22. Add generic types.
23. Expand `Selkar`.

Reason: backend APIs and frontend data contracts need precise structural types.

### Phase F: Standard Library

24. Add standard library registry.
25. Add console.
26. Add math.
27. Add string methods.
28. Add array methods.
29. Add async/await.
30. Add fetch/HTTP.

Reason: standard library should build on member access, functions, arrays, generics, and promises.

### Phase G: Modules and Production Build

31. Expand named/default/wildcard module syntax.
32. Add multi-file compiler.
33. Add bundling.
34. Add cross-module obfuscation.
35. Integrate rotating engine with bundled output.

Reason: production websites require multi-file structure and stable public boundaries.

## Milestones

### Milestone 1: Kethic Can Build a Basic CLI Program

Required features:

- Arrays
- Objects
- Null equivalent
- Else/else-if
- Break/continue
- Explicit type annotations
- Console output
- Basic math
- Basic string methods
- Basic named imports/exports

Success criteria:

- A Kethic program can declare data, loop through arrays, branch, call functions, log output, and split code across simple modules.

### Milestone 2: Kethic Can Build a Full Backend API

Required features:

- All Milestone 1 features
- Expanded `Selkar`
- Union types
- Optional types
- Generic types
- Maps
- Async/await
- Fetch/HTTP or Node HTTP bindings
- JSON helpers
- Multi-file module resolution
- Default exports
- Wildcard imports
- Typed error handling

Success criteria:

- A Kethic backend can define request handlers, response objects, validation logic, async calls, shared modules, and structured failures.

### Milestone 3: Kethic Can Build a Complete Production Website Frontend and Backend

Required features:

- All Milestone 2 features
- Template strings
- Anonymous functions
- Arrow functions
- Array methods with callbacks
- DOM/browser standard library bindings
- Typed fetch and JSON
- Frontend bundling
- Backend bundling
- Shared frontend/backend types
- Source maps through obfuscation and rotation
- Stable rotating browser bundle delivery

Success criteria:

- Kethic can build frontend UI logic, API client code, backend APIs, shared type modules, obfuscated browser bundles, and server-side generated output.

## Complexity Summary

Low:

- Logical not
- String concatenation
- Console output after member access exists

Medium:

- Arrays
- Null equivalent
- Else/else-if
- Break/continue
- Explicit type annotations
- Default parameters
- Rest parameters
- Optional types
- Array types
- Named exports
- Default exports
- Wildcard imports

High:

- Objects
- Member access and indexing
- Template strings
- Switch equivalent
- Anonymous functions
- Arrow functions
- Function types
- Union types
- Generic types
- Expanded `Selkar`
- Array methods with callbacks
- Fetch/HTTP
- Async/await
- Multi-file module resolution
- Cross-module obfuscation

## Risk Areas

### Parser Ambiguity

Risk:

- `{}` can mean block or object literal.
- `< >` can mean comparison or generic type parameters.
- `Kelthar` can mean declaration or anonymous function expression.

Mitigation:

- Separate expression grammar from type grammar.
- Use context-sensitive parsing only where necessary.
- Add focused parser tests for precedence and ambiguity.

### Type System Growth

Risk:

- Union, optional, generic, object, and function types will outgrow the current simple checker.

Mitigation:

- Introduce a structured internal `Type` model before adding advanced types.
- Centralize assignability and compatibility rules.
- Keep inference conservative.

### JavaScript Semantic Leaks

Risk:

- JS truthiness, `null`/`undefined`, mutation, and promise behavior may leak into Kethic.

Mitigation:

- Define Kethic semantics explicitly.
- Emit runtime helpers where Kethic differs from JavaScript.
- Reject unsafe ambiguity in the type checker.

### Obfuscator Correctness

Risk:

- String-level obfuscation is fragile around object keys, exports, imports, callbacks, closures, async functions, and public APIs.

Mitigation:

- Move toward AST-aware obfuscation.
- Add public/private symbol metadata.
- Never mangle public exports or external API field names unless explicitly configured.

### Control Flow Flattening

Risk:

- Flattening code with `break`, `continue`, `return`, `try/catch`, `async/await`, and `switch` can change behavior.

Mitigation:

- Make flattening optional per construct.
- Skip unsafe constructs until safe transforms exist.
- Add runtime equivalence tests.

### Source Maps Through Rotation

Risk:

- Line-only maps will become inaccurate after advanced obfuscation.

Mitigation:

- Track source ranges, not only lines.
- Preserve mapping through each transform stage.
- Validate source maps in tests.

### Module Boundary Obfuscation

Risk:

- Export/import names can break if mangled incorrectly.
- API object fields can break network contracts if renamed.

Mitigation:

- Add symbol visibility metadata:
  - local
  - exported
  - imported
  - external
  - public object field
  - private object field
- Obfuscate only safe local symbols.

### Standard Library Design

Risk:

- A messy standard library will make AI-generated Kethic unreliable.

Mitigation:

- Keep APIs small and regular.
- Prefer explicit namespace APIs such as `Std.console.log`, `Std.math.max`, and `Std.http.get`.
- Add type declarations before runtime implementations.

## Recommended Next Step

Do not start by adding surface syntax. Start with internal compiler stabilization:

1. Structured `Type` model
2. `ParameterNode`
3. Type grammar
4. Member access and indexing
5. Public/private symbol metadata for future obfuscation safety

This gives Kethic a stable foundation for the rest of the production language.
