# The Second Archive of Keth-Vey

## Advanced Kethic Terms for the Namaru Programming Tradition

The Second Archive records later Kethic terms from the Namaru Age of Sealed Channels, when the language expanded from basic ritual engineering into data structure, type safety, authority, and trust.

The central question of this era was:

> How does a civilization remain open without becoming corrupted?

## Accepted Terms

| Concept | Kethic Word | Literal Meaning | Intended Compiler Role |
| --- | --- | --- | --- |
| Array | `Rukva` | wheel-vessel | Active array type annotation |
| Object / record | `Kelva` | named vessel | Active object/record type annotation |
| Map / dictionary | `Selva` | sealed vessel | Future map/dictionary type |
| Union type | `Shevkar` | forked shape | Active union type syntax |
| Optional type | `Umrava` | vessel of the unnamed dark | Active optional type annotation |
| Generic type | `Tharkar` | pattern-shape | Active generic type alias |
| Tainted value | `Ovesh` | foreign crack | Future security type |
| Trusted value | `Seltor` | sealed stone | Future security type |
| Capability | `Torkel` | oath-name | Future authority type |
| Policy rule | `Torselthar` | sealed oath-pattern | Future policy declaration |
| Validation | `Selikh` | seal-testing | Future validation construct |
| Sanitization | `Eshrin` | carrying away the crack | Future safe transform construct/library |
| Unsafe sink | `Umresh` | dark crack | Compiler diagnostic/internal forbidden sink term |
| Query capsule | `Selovva` | sealed foreign vessel | Future database authority object |
| Authority kernel | `Torumsel` | sealed stone-caller | Runtime architecture component |

## Cultural Notes

### `Rukva` — Array

From `ruk`, wheel or cycle, and `va`, vessel. A `rukva` was an ordered counting tray used in temple rites and archives. Its meaning depended on ordered passage through stones, shells, seals, or marked tokens.

Programming mapping: ordered collections where position and traversal matter.

Teaching: "A vessel of many stones is useless unless the order survives the hand."

### `Kelva` — Object / Record

From `kel`, named declaration, and `va`, vessel. A `kelva` was a compartmented administrative vessel whose contents were organized by declared names.

Programming mapping: named fields inside a value.

Teaching: "An unnamed compartment invites the wrong offering."

### `Selva` — Map / Dictionary

From `sel`, seal, and `va`, vessel. A `selva` was a lookup archive where stored records were found by seal, not by sequence.

Programming mapping: key-value retrieval.

Teaching: "The wise archive remembers by seal, not by shelf."

### `Shevkar` — Union Type

From `shev`, branching path, and `kar`, shape. A `shevkar` was a lawful form that could take several recognized shapes.

Programming mapping: a value that may be one of several allowed types.

Teaching: "The river has many channels, yet all belong to the flood."

### `Umrava` — Optional Type

From `Umra`, the unnamed dark, and `va`, vessel. An `umrava` was a vessel permitted to hold emptiness.

Programming mapping: a value that may be present or absent.

Teaching: "An empty bowl is still a bowl."

### `Tharkar` — Generic Type

From `thar`, pattern, and `kar`, shape. A `tharkar` was a reusable structural mold that could accept different lawful materials.

Programming mapping: reusable type patterns parameterized by another type.

Teaching: "A mold survives many pourings."

### `Ovesh` — Tainted Value

From `ov`, foreign, and `esh`, crack or fault. `Ovesh` described outside material not yet examined for corruption.

Programming mapping: data from untrusted sources.

Teaching: "Do not pour foreign water into the city cistern untested."

### `Seltor` — Trusted Value

From `sel`, seal, and `tor`, stone or oath. `Seltor` was truth validated, sealed, and made stable.

Programming mapping: data that has passed validation and may enter trusted flows.

Teaching: "Trust is not spoken. It is sealed."

### `Torkel` — Capability

From `tor`, oath or authority, and `kel`, declared name. A `torkel` was an authority token granting a specific permitted action.

Programming mapping: authority-bearing capability values.

Teaching: "The gate obeys the seal, not the voice."

### `Torselthar` — Policy Rule

From `tor`, oath, `sel`, seal, and `thar`, pattern. A `torselthar` was a sealed behavioral law.

Programming mapping: declared authority policy.

Teaching: "A city survives because its permissions outlive its rulers."

### `Selikh` — Validation

From `sel`, seal, and `ikh`, test or sign. `Selikh` was the examination of seals, shapes, weights, and witnesses.

Programming mapping: checking values against rules or expected shapes.

Teaching: "The false seal fears the examiner."

### `Eshrin` — Sanitization

From `esh`, fault, and `rin`, carrying away. `Eshrin` was purification that removed danger before an object entered sacred space.

Programming mapping: safe transformation of unsafe input.

Teaching: "Wisdom removes the poison before the cup reaches the lips."

### `Umresh` — Unsafe Sink

From `Umra`, unnamed dark, and `esh`, crack. `Umresh` described a forbidden direct channel into sacred systems.

Programming mapping: raw SQL, raw HTML, shell execution, and other direct unsafe sinks.

Teaching: "The deepest gate must never drink from the open river."

### `Selovva` — Query Capsule

From `sel`, seal, `ov`, external, and `va`, vessel. A `selovva` was a sealed diplomatic container whose contents could not be altered without breaking the seal.

Programming mapping: compiler-generated safe query objects for external databases.

Teaching: "The sealed message arrives unchanged."

### `Torumsel` — Authority Kernel

From `tor`, oath, `um`, awaken, and `sel`, seal. The `Torumsel` was the inner authority priesthood that minted and verified permission seals.

Programming mapping: the small trusted runtime that mints and verifies capabilities.

Teaching: "If the seal-maker falls, every gate becomes a wound."

## Compiler Status

Most terms are reserved as of this document and must not be used as ordinary identifiers. `Rukva`, `Kelva`, `Selva`, `Shevkar`, `Umrava`, and `Tharkar` are now active syntax because their compiler phases are implemented and tested. Any remaining term should only become active syntax when its compiler phase is implemented and tested.
