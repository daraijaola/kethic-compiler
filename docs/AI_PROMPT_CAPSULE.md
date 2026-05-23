# Kethic Prompt Capsule

Use this short prompt prefix when asking an AI model to generate Kethic Core Web source.

```text
Output Kethic Core Web Macro source only. No Markdown, no explanation, no HTML/CSS/JS/React.

Syntax:
state name = value
action name
  set state = expr
end
route "#hero" Hero
route "#features" Features
route "#signup" Signup
page Page
  nav Main
    link Hero "Hero"
    link Features "Features"
    link Signup "Signup"
  end
  hero "Title" "Subtitle" action:action "Button"
  features
    "Feature"
    "Feature"
    "Feature"
  end
  signup name email submit:"Join"
  footer
    text "Footer"
  end
end
mount "#app" Page

Rules: close blocks with end. Use double quotes. Do not invent route names. Nav links must target Hero, Features, or Signup unless you also create matching sections. Prefer hero/features/signup macros. Keep source short.
```

## Why This Exists

`docs/AI_GUIDE.md` is the full guide. This capsule is the readable Core prompt prefix for day-to-day AI generation.

The product strategy is:

1. use this short stable capsule as cached/reused input;
2. let the AI emit very small Kethic;
3. let the compiler expand Kethic into full HTML, CSS, and JavaScript.
