# Interaction Core V1

Interaction Core V1 gives Kethic Native web the first practical reactive surface layer. The goal is still compact AI output: small Kethic source should compile into accessible HTML, CSS, and browser runtime behavior.

## Added Surface

- `show stateName` creates a visibility gate that renders its children only when the referenced `Lumva` state is truthy.
- `Umralu stateName` is the readable Namaru form of the same visibility gate.
- `disabled:stateName` on `btn` or `Umkar` connects a button disabled state to `Lumva`.
- `bind:stateName` on `in`, `area`, `Enva`, or `Kelrinva` creates two-way form binding.

## Compiler Behavior

- Parser produces a formal `ConditionalNode` for visibility gates.
- Type checker rejects missing states used by `show`, `Umralu`, `disabled:`, or `bind:`.
- HTML generator emits `data-kethic-show`, `data-kethic-disabled`, and `data-kethic-field` hooks.
- Runtime generator updates visible text, conditional regions, disabled controls, and bound field values after actions or input events.
- CSS generator adds safe defaults for `[hidden]` and disabled buttons.

## Compact Example

```keth
st open = false
st email = ""

act toggle
  set open = not open
end

pg Home
  sec Hero
    btn toggle "Toggle"
    show open
      txt "Email: {email}"
      form Contact
        in email "Email" ! bind:email
        btn "Send"
      end
    end
  end
end

mount "#app" Home
```

This is the first native web interaction layer. It does not replace the larger runtime model we still need for components, async data, routing, and form submission, but it gives Kethic a working foundation for real interactive demos.
