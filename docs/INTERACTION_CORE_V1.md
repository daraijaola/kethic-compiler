# Interaction Core V1

Interaction Core V1 gives Kethic Web a practical reactive surface layer. Small Kethic source compiles into accessible HTML, CSS, and browser runtime behavior.

## Added Surface

- `show stateName` renders children only when state is truthy.
- `disabled:stateName` on `btn` or `button` connects button disabled state to reactive state.
- `bind:stateName` on `in`, `input`, `area`, or `textarea` creates two-way form binding.

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

