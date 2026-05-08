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

The benchmark can run multiple scenarios:

```text
KETHIC_BENCHMARK_SCENARIO=standalone-html npm run benchmark:ai
KETHIC_BENCHMARK_SCENARIO=react-tailwind npm run benchmark:ai
```

On Windows PowerShell:

```text
$env:KETHIC_BENCHMARK_SCENARIO="react-tailwind"; npm run benchmark:ai
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

## 2026-05-09 React/Tailwind Comparison

Model requested: `gpt-5.2`.

Scenario: `react-tailwind`.

Task: create the same Kethic landing page as a complete React component using Tailwind CSS classes, with hero, CTA button, three feature cards, signup form, footer, responsive layout, accessible labels, and a small click handler.

| Metric | React/Tailwind Component | Kethic Web Macro |
| --- | ---: | ---: |
| Prompt tokens | 86 | 191 |
| Completion tokens | 5,806 | 207 |
| Total tokens | 5,892 | 398 |
| Source characters | 24,736 | 831 |
| Compiled successfully | N/A | Yes |
| Generated platform output characters | N/A | 5,991 |

Savings:

- output-token reduction: 96.43 percent;
- total-token reduction: 93.25 percent;
- source-character reduction: 96.64 percent.

Interpretation:

This result matters more than the standalone HTML benchmark because React plus Tailwind is closer to how AI website builders commonly emit frontend code. Kethic's macro output remained under 1,000 source characters and compiled successfully on the first attempt.

## Next Benchmark Work

The next benchmark layer should test quality, not only token count:

- render the React/Tailwind baseline and Kethic output side by side;
- capture screenshots at desktop and mobile widths;
- run basic accessibility checks for labels, headings, focusable controls, and landmarks;
- record repair-loop cost when generated source fails validation.
