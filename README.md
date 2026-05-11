# kethic-compiler

Kethic is an open-source, AI-native compression language for generating production websites and apps with fewer AI output tokens.

The compiler expands compact Kethic intent into standard HTML, CSS, JavaScript, and backend code while enforcing safe defaults such as accessibility, typed structure, routing, forms, and runtime behavior.

Current strategic direction:

- reduce AI-generated source size compared with React, HTML/CSS, JavaScript, and backend boilerplate;
- keep a readable Kethic syntax for humans and a compact syntax for AI output;
- benchmark token savings against equivalent production examples;
- make the language open source while keeping hosted platform services commercial.

Implemented web syntax now includes readable Kethic Native, compact aliases, and Semantic Macros V1. Start with:

- `docs/AI_GUIDE.md` for AI generation rules;
- `docs/AI_PROMPT_CAPSULE.md` for the short reusable model prompt;
- `docs/COMPACT_SYNTAX.md` for compact syntax and macros;
- `docs/STYLE_CORE_V1.md` for the first controlled CSS/style layer;
- `docs/TOKEN_BENCHMARKS.md` for measured token savings;
- `docs/WEB_QUALITY_CHECKS.md` for compiler output quality gates.
