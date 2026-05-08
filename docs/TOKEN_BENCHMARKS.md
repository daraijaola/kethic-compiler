# Kethic Token Benchmarks

This document records reproducible token benchmarks for Kethic's AI-native compression goal.

## Benchmark Method

The current benchmark compares two prompts sent to the same model through the same gateway:

1. Ask for a complete standalone HTML file with CSS and JavaScript.
2. Ask for equivalent Kethic Web Macro source.

The Kethic result must compile locally with:

```text
node dist/src/cli.js web macro.keth --out-dir compiled
```

The benchmark script is:

```text
npm run benchmark:ai
```

It requires this environment variable:

```text
KETHIC_GATEWAY_TOKEN
```

Do not commit gateway tokens.

## 2026-05-09 Macro Benchmark

Model reported by gateway: `gpt-5.2-2025-12-11`.

Task: create a polished landing page for Kethic with hero, CTA button, three feature cards, signup form, footer, responsive styling, accessible labels, and small interaction behavior.

| Metric | Standalone HTML/CSS/JS | Kethic Web Macro |
| --- | ---: | ---: |
| Prompt tokens | 80 | 191 |
| Completion tokens | 6,723 | 200 |
| Total tokens | 6,803 | 391 |
| Source characters | 22,403 | 786 |
| Compiled successfully | N/A | Yes |
| Generated platform output characters | N/A | 5,907 |

Savings:

- output-token reduction: 97.03 percent;
- total-token reduction: 94.25 percent;
- source-character reduction: 96.49 percent.

Generated Kethic source:

```keth
st joins = 0
act join
  set joins = joins plus 1
end
rt "#hero" Hero
rt "#features" Features
rt "#signup" Signup
pg Landing
  nav Main
    link Hero "Hero"
    link Features "Features"
    link Signup "Signup"
  end
  hero "Kethic" "An open-source, AI-native programming language for building quality websites with fewer AI output tokens." btn:join "Join the waitlist"
  features
    "AI-native syntax designed for concise, high-fidelity UI generation"
    "Token-efficient authoring that cuts cost while keeping site quality high"
    "Open-source tooling for fast builds, reusable components, and clean output"
  end
  signup name email submit:"Join waitlist"
  foot
    txt "(c) Kethic - Open-source AI-native web language. Build more with fewer tokens."
  end
end
mount "#app" Landing
```

## Interpretation

This result supports the new Kethic thesis: semantic macros matter more than keyword replacement alone.

The earlier compact-alias showcase reduced source characters by 27.29 percent against readable Kethic. The first macro landing page reduced source characters by 78.85 percent against the readable showcase. In the live model benchmark above, macro Kethic reduced model completion tokens by 97.03 percent against standalone HTML/CSS/JS and compiled on the first attempt.

This is not yet a complete product benchmark. The next benchmark should compare Kethic against React plus Tailwind, then compare quality using screenshots and accessibility checks.
