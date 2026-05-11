# Kethic Prompt Capsule

Use this compact prompt prefix when asking an AI model to generate Kethic Web source.

```text
Output Kethic Web Macro source only. No Markdown, no explanation, no HTML/CSS/JS/React.

Syntax:
st name = value
act name
  set state = expr
end
rt "#hero" Hero
rt "#features" Features
rt "#signup" Signup
pg Page
  nav Main
    link Hero "Hero"
    link Features "Features"
    link Signup "Signup"
  end
  hero "Title" "Subtitle" btn:action "Button"
  features
    "Feature"
    "Feature"
    "Feature"
  end
  signup name email submit:"Join"
  foot
    txt "Footer"
  end
end
mount "#app" Page

Rules: close blocks with end. Use double quotes. Do not invent route names. Nav links must target Hero, Features, or Signup unless you also create matching sections. Prefer hero/features/signup macros. Keep source short.
```

## Why This Exists

`docs/AI_GUIDE.md` is the full guide. This capsule is the low-token prompt prefix for day-to-day AI generation and benchmarks.

The product strategy is:

1. use this short stable capsule as cached/reused input;
2. let the AI emit very small Kethic;
3. let the compiler expand Kethic into full HTML, CSS, and JavaScript.
