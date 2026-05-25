import { StyleBlockNode, StyleDeclarationNode, WebNodeKind, WebProgramNode } from "./ast";
import { ResolvedBrandProfile } from "./brandProfile";

/**
 * CssGenerator emits scoped CSS from Kethic style declarations.
 */
export class CssGenerator {
  public constructor(private readonly brandProfile?: ResolvedBrandProfile) {}

  /**
   * generate emits defaults, token placeholders, and user style blocks.
   */
  public generate(program: WebProgramNode): string {
    const styleBlocks: StyleBlockNode[] = program.body.filter(
      (node): node is StyleBlockNode => node.kind === WebNodeKind.StyleBlock,
    );

    return [
      this.generateDefaults(),
      ...styleBlocks.map((block: StyleBlockNode) => this.generateStyleBlock(block)),
    ].join("\n\n");
  }

  private generateDefaults(): string {
    if (this.brandProfile !== undefined) {
      return this.generateBrandedDefaults(this.brandProfile);
    }

    return [
      "@layer kethic.reset, kethic.tokens, kethic.components;",
      "",
      "@layer kethic.tokens {",
      "  :root {",
      "    --sa-0: 0;",
      "    --sa-1: 0.25rem;",
      "    --sa-2: 0.5rem;",
      "    --sa-3: 0.75rem;",
      "    --sa-4: 1rem;",
      "    --sa-5: 1.5rem;",
      "    --sa-6: 2rem;",
      "    --color-sand-50: #f8f4ec;",
      "    --color-ink-900: #171512;",
      "    --color-river-700: #12384a;",
      "    --color-night-950: #10101c;",
      "    --color-orchid-600: #bb3cff;",
      "    --color-coral-500: #ff5d73;",
      "    --color-gold-400: #ffd166;",
      "    --color-cyan-300: #4ee7f8;",
      "    --color-mint-300: #79f2c0;",
      "    --color-glass-100: rgb(255 255 255 / 0.1);",
      "    --radius-soft: 0.75rem;",
      "    --shadow-low: 0 1px 2px rgb(16 16 28 / 0.18);",
      "    --shadow-raised: 0 26px 80px rgb(16 16 28 / 0.28);",
      "  }",
      "}",
      "",
      "@layer kethic.reset {",
      "  *, *::before, *::after { box-sizing: border-box; }",
      "  body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: radial-gradient(circle at 10% 0%, rgb(187 60 255 / 0.24), transparent 32rem), radial-gradient(circle at 90% 8%, rgb(78 231 248 / 0.18), transparent 34rem), linear-gradient(135deg, #10101c 0%, #19172b 45%, #2b1434 100%); color: white; }",
      "  [hidden] { display: none !important; }",
      "  button { font: inherit; min-inline-size: 2.75rem; min-block-size: 2.75rem; }",
      "  :focus-visible { outline: 3px solid var(--color-cyan-300); outline-offset: 3px; }",
      "}",
      "",
      "@layer kethic.components {",
      "  .kethic-page { min-block-size: 100vh; overflow: hidden; }",
      "  .kethic-section { padding: clamp(4rem, 7vw, 7rem) var(--sa-6); position: relative; }",
      "  .kethic-section h1 { max-inline-size: 13ch; margin: 0; font-size: clamp(3rem, 6.8vw, 6.6rem); line-height: 0.94; letter-spacing: 0; }",
      "  .kethic-section h2 { max-inline-size: 15ch; margin: 0 0 var(--sa-4); font-size: clamp(2rem, 4.5vw, 3.85rem); line-height: 1; letter-spacing: 0; }",
      "  .kethic-section h3 { margin: 0 0 var(--sa-2); font-size: 0.92rem; color: var(--color-gold-400); letter-spacing: 0.07em; text-transform: uppercase; }",
      "  .kethic-section p { max-inline-size: 68ch; font-size: 1.02rem; line-height: 1.68; color: rgb(255 255 255 / 0.76); }",
      "  .kethic-container { max-inline-size: 76rem; margin-inline: auto; position: relative; z-index: 1; }",
      "  .kethic-section-hero { min-block-size: min(88vh, 56rem); display: grid; align-items: center; overflow: hidden; }",
      "  .kethic-section-hero::after { content: ''; position: absolute; inset: 14% 7vw auto auto; inline-size: min(24rem, 38vw); aspect-ratio: 1; border-radius: 999px; background: radial-gradient(circle, rgb(78 231 248 / 0.26), transparent 68%); pointer-events: none; }",
      "  .kethic-section-features, .kethic-section-proof { background: rgb(255 255 255 / 0.035); border-block: 1px solid rgb(255 255 255 / 0.08); }",
      "  .kethic-section-cta { background: linear-gradient(135deg, rgb(255 93 115 / 0.16), rgb(78 231 248 / 0.1)); border-block: 1px solid rgb(255 255 255 / 0.12); }",
      "  .kethic-section-faq .kethic-layout-grid, .kethic-section-pricing .kethic-layout-grid { grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr)); }",
      ...this.generateVariantCss(false),
      "  .kethic-navigation { position: sticky; inset-block-start: 0; z-index: 10; display: flex; gap: var(--sa-3); align-items: center; padding: var(--sa-3) var(--sa-6); background: rgb(16 16 28 / 0.68); backdrop-filter: blur(18px); border-block-end: 1px solid rgb(255 255 255 / 0.12); }",
      "  .kethic-link { color: rgb(255 255 255 / 0.82); font-weight: 750; text-decoration: none; }",
      "  .kethic-link:hover { color: var(--color-cyan-300); }",
      "  .kethic-button { border: 0; border-radius: 999px; padding: var(--sa-3) var(--sa-5); cursor: pointer; background: linear-gradient(135deg, var(--color-coral-500), var(--color-orchid-600)); color: white; font-weight: 800; box-shadow: 0 18px 44px rgb(255 93 115 / 0.24); transition: transform 180ms ease, box-shadow 180ms ease; }",
      "  .kethic-button:hover { transform: translateY(-2px); box-shadow: var(--shadow-raised); }",
      "  .kethic-button:disabled { cursor: not-allowed; opacity: 0.55; }",
      "  .kethic-form { display: grid; gap: var(--sa-4); max-inline-size: 42rem; }",
      "  .kethic-field { display: grid; gap: var(--sa-2); }",
      "  .kethic-field label { font-weight: 700; }",
      "  .kethic-field input, .kethic-field textarea { inline-size: 100%; border: 1px solid rgb(255 255 255 / 0.22); border-radius: 999px; padding: var(--sa-3) var(--sa-4); font: inherit; background: rgb(255 255 255 / 0.12); color: white; }",
      "  .kethic-field textarea { resize: vertical; }",
      "  .kethic-validation { margin: calc(var(--sa-3) * -1) 0 0; color: var(--color-gold-400); font-size: 0.95rem; }",
      "  .kethic-footer { padding: var(--sa-5) var(--sa-6); border-block-start: 1px solid rgb(255 255 255 / 0.12); color: rgb(255 255 255 / 0.62); }",
      "  .kethic-layout-stack { display: flex; flex-direction: column; gap: var(--sa-4); }",
      "  .kethic-layout-row { display: flex; flex-direction: row; align-items: center; gap: var(--sa-4); }",
      "  .kethic-layout-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(17.5rem, 100%), 1fr)); gap: var(--sa-4); }",
      "  .kethic-layout-center { display: grid; place-items: center; text-align: center; }",
      "  .kethic-metriccard { position: relative; min-block-size: 13rem; padding: var(--sa-5); border: 1px solid rgb(255 255 255 / 0.14); border-radius: 1.1rem; background: linear-gradient(145deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.045)); box-shadow: var(--shadow-low); overflow: hidden; }",
      "  .kethic-metriccard::before { content: ''; position: absolute; inset: -45% -25% auto auto; inline-size: 10rem; block-size: 10rem; border-radius: 999px; background: radial-gradient(circle, rgb(78 231 248 / 0.24), transparent 70%); }",
      "  .kethic-metriccard h2 { color: var(--color-cyan-300); font-size: clamp(2.7rem, 7vw, 5.8rem); }",
      "  .kethic-signup { border-block: 1px solid rgb(255 255 255 / 0.14); background: linear-gradient(135deg, rgb(255 93 115 / 0.2), rgb(187 60 255 / 0.18)); }",
      "",
      "  @media (max-width: 720px) {",
      "    .kethic-section { padding: var(--sa-5) var(--sa-4); }",
      "    .kethic-section-hero { min-block-size: auto; }",
      "    .kethic-section-hero::after { opacity: 0.16; }",
      "    .kethic-navigation { align-items: flex-start; flex-direction: column; padding: var(--sa-3) var(--sa-4); }",
      "    .kethic-layout-row { align-items: stretch; flex-direction: column; }",
      "    .kethic-button { inline-size: 100%; }",
      "    .kethic-footer { padding: var(--sa-4); }",
      "  }",
      "}",
    ].join("\n");
  }

  private generateBrandedDefaults(profile: ResolvedBrandProfile): string {
    const palette: BrandPalette = this.palette(profile.palette);
    const radius: string = this.radiusToken(profile.radius);
    const shadow: string = this.shadowToken(profile.surface, palette.shadow);
    const spacingScale: readonly string[] = this.spacingScale(profile.density);
    const headingFont: string = this.headingFont(profile.type);
    const bodyFont: string = this.bodyFont(profile.type);
    const heroVariant: number = profile.seed % 3;
    const cardVariant: number = Math.floor(profile.seed / 3) % 3;
    const motionSeconds: string = this.motionDuration(profile.motion);
    const heroLayout: string = heroVariant === 0 ? "grid" : "flex";
    const heroLayoutRules: string =
      heroVariant === 0
        ? "display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr); align-items: center;"
        : "display: flex; flex-direction: column; align-items: flex-start;";
    const heroAfter: string =
      heroVariant === 2
        ? "  .kethic-section:first-of-type::after { content: ''; position: absolute; inset: auto 5vw 8% auto; inline-size: min(28rem, 42vw); aspect-ratio: 1; border-radius: 36% 64% 42% 58%; background: linear-gradient(135deg, var(--color-accent), var(--color-highlight)); opacity: 0.24; filter: blur(2px); transform: rotate(-10deg); }\n"
        : "  .kethic-section:first-of-type::after { content: ''; position: absolute; inset: 12% 6vw auto auto; inline-size: min(24rem, 38vw); aspect-ratio: 1; border-radius: 999px; background: radial-gradient(circle, var(--color-highlight), transparent 68%); opacity: 0.32; }\n";
    const cardBackground: string =
      cardVariant === 0
        ? "linear-gradient(145deg, rgb(255 255 255 / 0.13), rgb(255 255 255 / 0.04))"
        : cardVariant === 1
          ? "linear-gradient(180deg, var(--color-surface), color-mix(in oklab, var(--color-surface), black 8%))"
          : "linear-gradient(135deg, color-mix(in oklab, var(--color-accent), transparent 82%), var(--color-surface))";

    return [
      "@layer kethic.reset, kethic.tokens, kethic.components;",
      "",
      "@layer kethic.tokens {",
      "  :root {",
      `    --brand-name: "${this.escapeCssString(profile.name)}";`,
      `    --sa-0: ${spacingScale[0]};`,
      `    --sa-1: ${spacingScale[1]};`,
      `    --sa-2: ${spacingScale[2]};`,
      `    --sa-3: ${spacingScale[3]};`,
      `    --sa-4: ${spacingScale[4]};`,
      `    --sa-5: ${spacingScale[5]};`,
      `    --sa-6: ${spacingScale[6]};`,
      `    --color-page: ${palette.page};`,
      `    --color-ink: ${palette.ink};`,
      `    --color-muted: ${palette.muted};`,
      `    --color-surface: ${palette.surface};`,
      `    --color-accent: ${palette.accent};`,
      `    --color-highlight: ${palette.highlight};`,
      `    --color-border: ${palette.border};`,
      `    --color-sand-50: ${palette.ink};`,
      `    --color-ink-900: ${palette.ink};`,
      `    --color-river-700: ${palette.accent};`,
      `    --color-night-950: ${palette.page};`,
      `    --color-orchid-600: ${palette.accent};`,
      `    --color-coral-500: ${palette.highlight};`,
      `    --color-gold-400: ${palette.highlight};`,
      `    --color-cyan-300: ${palette.accent};`,
      `    --color-mint-300: ${palette.highlight};`,
      "    --color-glass-100: rgb(255 255 255 / 0.12);",
      `    --radius-soft: ${radius};`,
      `    --shadow-low: 0 1px 2px ${palette.shadow};`,
      `    --shadow-raised: ${shadow};`,
      `    --motion-fast: ${motionSeconds};`,
      "  }",
      "}",
      "",
      "@layer kethic.reset {",
      "  *, *::before, *::after { box-sizing: border-box; }",
      `  body { margin: 0; font-family: ${bodyFont}; background: ${palette.background}; color: var(--color-ink); }`,
      "  [hidden] { display: none !important; }",
      "  button { font: inherit; min-inline-size: 2.75rem; min-block-size: 2.75rem; }",
      "  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }",
      "}",
      "",
      "@layer kethic.components {",
      "  .kethic-page { min-block-size: 100vh; overflow: hidden; }",
      "  .kethic-section { padding: clamp(4rem, 7vw, 7rem) var(--sa-6); position: relative; }",
      `  .kethic-section:first-of-type, .kethic-section-hero { min-block-size: min(88vh, 56rem); ${heroLayoutRules} gap: var(--sa-6); overflow: hidden; }`,
      heroAfter.trimEnd(),
      `  .kethic-section h1 { max-inline-size: ${heroLayout === "grid" ? "11ch" : "17ch"}; margin: 0; font-family: ${headingFont}; font-size: ${this.heroFontSize(profile.type)}; line-height: 0.93; letter-spacing: 0; }`,
      `  .kethic-section h2 { margin: 0 0 var(--sa-4); font-family: ${headingFont}; font-size: ${this.sectionFontSize(profile.type)}; line-height: 1; letter-spacing: 0; }`,
      "  .kethic-section h3 { margin: 0 0 var(--sa-2); font-size: 0.88rem; color: var(--color-highlight); letter-spacing: 0.08em; text-transform: uppercase; }",
      "  .kethic-section p { max-inline-size: 68ch; font-size: 1.08rem; line-height: 1.75; color: var(--color-muted); }",
      "  .kethic-container { max-inline-size: 76rem; margin-inline: auto; position: relative; z-index: 1; }",
      "  .kethic-section-hero::after { content: ''; position: absolute; inset: 14% 7vw auto auto; inline-size: min(24rem, 38vw); aspect-ratio: 1; border-radius: 999px; background: radial-gradient(circle, var(--color-highlight), transparent 68%); opacity: 0.22; pointer-events: none; }",
      "  .kethic-section-features, .kethic-section-proof { background: color-mix(in oklab, var(--color-surface), transparent 55%); border-block: 1px solid var(--color-border); }",
      "  .kethic-section-cta { background: color-mix(in oklab, var(--color-accent), transparent 86%); border-block: 1px solid var(--color-border); }",
      "  .kethic-section-faq .kethic-layout-grid, .kethic-section-pricing .kethic-layout-grid { grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr)); }",
      ...this.generateVariantCss(true),
      "  .kethic-navigation { position: sticky; inset-block-start: 0; z-index: 10; display: flex; gap: var(--sa-3); align-items: center; padding: var(--sa-3) var(--sa-6); background: color-mix(in oklab, var(--color-page), transparent 20%); backdrop-filter: blur(18px); border-block-end: 1px solid var(--color-border); }",
      "  .kethic-link { color: var(--color-muted); font-weight: 750; text-decoration: none; transition: color var(--motion-fast) ease, transform var(--motion-fast) ease; }",
      "  .kethic-link:hover { color: var(--color-accent); transform: translateY(-1px); }",
      "  .kethic-button { border: 0; border-radius: 999px; padding: var(--sa-3) var(--sa-5); cursor: pointer; background: linear-gradient(135deg, var(--color-accent), var(--color-highlight)); color: var(--color-page); font-weight: 850; box-shadow: var(--shadow-low); transition: transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease; }",
      "  .kethic-button:hover { transform: translateY(-2px); box-shadow: var(--shadow-raised); }",
      "  .kethic-button:disabled { cursor: not-allowed; opacity: 0.55; }",
      "  .kethic-form { display: grid; gap: var(--sa-4); max-inline-size: 42rem; }",
      "  .kethic-field { display: grid; gap: var(--sa-2); }",
      "  .kethic-field label { font-weight: 750; }",
      "  .kethic-field input, .kethic-field textarea { inline-size: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-soft); padding: var(--sa-3) var(--sa-4); font: inherit; background: var(--color-surface); color: var(--color-ink); }",
      "  .kethic-field textarea { resize: vertical; }",
      "  .kethic-validation { margin: calc(var(--sa-3) * -1) 0 0; color: var(--color-highlight); font-size: 0.95rem; }",
      "  .kethic-footer { padding: var(--sa-5) var(--sa-6); border-block-start: 1px solid var(--color-border); color: var(--color-muted); }",
      "  .kethic-layout-stack { display: flex; flex-direction: column; gap: var(--sa-4); }",
      "  .kethic-layout-row { display: flex; flex-direction: row; align-items: center; gap: var(--sa-4); }",
      "  .kethic-layout-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: var(--sa-4); }",
      "  .kethic-layout-center { display: grid; place-items: center; text-align: center; }",
      `  .kethic-metriccard { position: relative; min-block-size: 13rem; padding: var(--sa-5); border: 1px solid var(--color-border); border-radius: var(--radius-soft); background: ${cardBackground}; box-shadow: var(--shadow-low); overflow: hidden; }`,
      "  .kethic-metriccard::before { content: ''; position: absolute; inset: -40% -20% auto auto; inline-size: 12rem; block-size: 12rem; border-radius: 999px; background: radial-gradient(circle, var(--color-highlight), transparent 70%); opacity: 0.28; }",
      "  .kethic-metriccard h2 { color: var(--color-accent); font-size: clamp(2.7rem, 7vw, 5.8rem); }",
      "  .kethic-signup { border-block: 1px solid var(--color-border); background: color-mix(in oklab, var(--color-accent), transparent 88%); }",
      "",
      "  @media (max-width: 720px) {",
      "    .kethic-section { padding: var(--sa-5) var(--sa-4); }",
      "    .kethic-section:first-of-type, .kethic-section-hero { min-block-size: auto; display: block; }",
      "    .kethic-section:first-of-type::after, .kethic-section-hero::after { opacity: 0.14; }",
      "    .kethic-navigation { align-items: flex-start; flex-direction: column; padding: var(--sa-3) var(--sa-4); }",
      "    .kethic-layout-row { align-items: stretch; flex-direction: column; }",
      "    .kethic-button { inline-size: 100%; }",
      "    .kethic-footer { padding: var(--sa-4); }",
      "  }",
      "}",
    ].join("\n");
  }

  private generateStyleBlock(block: StyleBlockNode): string {
    const declarations: string[] = block.declarations
      .map((declaration: StyleDeclarationNode) => this.generateDeclaration(declaration))
      .filter((line: string) => line.length > 0);

    const styleBlock: string = [`@layer kethic.components {`, `  .${this.className(block.target)} {`, ...declarations, "  }", "}"].join("\n");

    if (block.responsive === undefined) {
      return styleBlock;
    }

    return [`@media ${this.mediaQuery(block.responsive)} {`, ...styleBlock.split("\n").map((line: string) => `  ${line}`), "}"].join("\n");
  }

  private generateVariantCss(branded: boolean): string[] {
    const surface: string = branded ? "var(--color-surface)" : "rgb(255 255 255 / 0.08)";
    const border: string = branded ? "var(--color-border)" : "rgb(255 255 255 / 0.12)";
    const accent: string = branded ? "var(--color-accent)" : "var(--color-cyan-300)";
    const highlight: string = branded ? "var(--color-highlight)" : "var(--color-coral-500)";

    return [
      "  .kethic-variant-hero-centered { text-align: center; place-items: center; }",
      "  .kethic-variant-hero-centered .kethic-container { margin-inline: auto; align-items: center; }",
      "  .kethic-variant-hero-centered h1, .kethic-variant-hero-centered p { margin-inline: auto; }",
      "  .kethic-variant-hero-split { grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.72fr); }",
      `  .kethic-variant-hero-split::before { content: ''; position: absolute; inset: 18% 8vw auto auto; inline-size: min(27rem, 34vw); aspect-ratio: 4 / 3; border: 1px solid ${border}; border-radius: var(--radius-soft); background: linear-gradient(135deg, ${surface}, color-mix(in oklab, ${accent}, transparent 72%)); box-shadow: var(--shadow-raised); }`,
      `  .kethic-variant-hero-editorial { border-block-end: 1px solid ${border}; }`,
      "  .kethic-variant-hero-editorial h1 { max-inline-size: 16ch; }",
      `  .kethic-variant-hero-editorial p:first-of-type { border-inline-start: 3px solid ${accent}; padding-inline-start: var(--sa-4); }`,
      "  .kethic-variant-features-grid .kethic-layout-grid { grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr)); }",
      "  .kethic-variant-features-list .kethic-layout-grid { grid-template-columns: 1fr; max-inline-size: 58rem; }",
      `  .kethic-variant-features-list .kethic-metriccard { min-block-size: auto; display: grid; grid-template-columns: minmax(8rem, 0.35fr) 1fr; gap: var(--sa-4); align-items: start; }`,
      "  .kethic-variant-features-tiles .kethic-layout-grid { grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr)); }",
      `  .kethic-variant-features-tiles .kethic-metriccard { border-radius: calc(var(--radius-soft) * 0.8); box-shadow: var(--shadow-low); }`,
      `  .kethic-variant-proof-band { background: linear-gradient(135deg, color-mix(in oklab, ${accent}, transparent 88%), color-mix(in oklab, ${highlight}, transparent 90%)); }`,
      "  .kethic-variant-proof-band .kethic-layout-grid { grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr)); }",
      "  .kethic-variant-proof-cards .kethic-metriccard { min-block-size: 12rem; }",
      "  .kethic-variant-proof-numbers .kethic-metriccard h2 { font-size: clamp(3rem, 8vw, 6.2rem); }",
      "  .kethic-variant-cta-centered { text-align: center; }",
      "  .kethic-variant-cta-centered h2, .kethic-variant-cta-centered p { margin-inline: auto; }",
      `  .kethic-variant-cta-panel .kethic-container, .kethic-variant-cta-panel .kethic-form { padding: var(--sa-5); border: 1px solid ${border}; border-radius: var(--radius-soft); background: ${surface}; box-shadow: var(--shadow-low); }`,
      "  .kethic-variant-cta-split .kethic-layout-row, .kethic-variant-cta-split .kethic-container { align-items: center; justify-content: space-between; }",
      "  .kethic-variant-faq-list .kethic-layout-grid { grid-template-columns: 1fr; max-inline-size: 58rem; }",
      `  .kethic-variant-faq-boxed .kethic-metriccard { background: ${surface}; }`,
      "  .kethic-variant-pricing-spotlight .kethic-metriccard:nth-child(2), .kethic-variant-pricing-spotlight .kethic-component:nth-child(2) .kethic-metriccard { transform: translateY(-0.75rem); border-color: var(--color-accent); }",
    ];
  }

  private generateDeclaration(declaration: StyleDeclarationNode): string {
    switch (declaration.name) {
      case "pad":
        return `    padding: ${this.space(declaration.value)};`;
      case "margin":
        return `    margin: ${this.space(declaration.value)};`;
      case "gap":
        return `    gap: ${this.space(declaration.value)};`;
      case "width":
        return `    inline-size: ${this.size(declaration.value)};`;
      case "height":
        return `    block-size: ${this.size(declaration.value)};`;
      case "minWidth":
        return `    min-inline-size: ${this.size(declaration.value)};`;
      case "maxWidth":
        return `    max-inline-size: ${this.size(declaration.value)};`;
      case "color":
        return `    color: ${this.color(declaration.value)};`;
      case "background":
        return `    background: ${this.color(declaration.value)};`;
      case "font":
        return `    font-size: ${this.fontSize(declaration.value)};`;
      case "weight":
        return `    font-weight: ${this.fontWeight(declaration.value)};`;
      case "line":
        return `    line-height: ${this.lineHeight(declaration.value)};`;
      case "alignText":
        return `    text-align: ${declaration.value};`;
      case "border":
        return `    border: ${this.border(declaration.value)};`;
      case "borderColor":
        return `    border-color: ${this.color(declaration.value)};`;
      case "borderWidth":
        return `    border-width: ${this.borderWidth(declaration.value)};`;
      case "radius":
        return `    border-radius: ${this.radius(declaration.value)};`;
      case "shadow":
        return `    box-shadow: ${this.shadow(declaration.value)};`;
      case "opacity":
        return `    opacity: ${declaration.value};`;
      case "overflow":
        return `    overflow: ${declaration.value};`;
      case "z":
        return `    z-index: ${this.layer(declaration.value)};`;
      case "position":
        return `    position: ${this.position(declaration.value)};`;
      case "inset":
        return `    inset: ${this.space(declaration.value)};`;
      case "display":
        return `    display: ${declaration.value};`;
      case "align":
        return `    align-items: ${this.alignment(declaration.value)};`;
      case "justify":
        return `    justify-content: ${this.distribution(declaration.value)};`;
      case "wrap":
        return `    flex-wrap: ${this.wrap(declaration.value)};`;
      case "container":
        return `    max-inline-size: ${this.size(declaration.value)};\n    margin-inline: auto;\n    padding-inline: var(--sa-4);`;
      case "ratio":
        return `    aspect-ratio: ${declaration.value};`;
      default:
        return "";
    }
  }

  private className(name: string): string {
    return `kethic-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
  }

  private space(value: string): string {
    return /^-?\d+$/.test(value) ? `var(--sa-${value})` : value;
  }

  private size(value: string): string {
    const namedSizes: ReadonlyMap<string, string> = new Map<string, string>([
      ["full", "100%"],
      ["screen", "100vh"],
      ["prose", "65ch"],
      ["reading", "72ch"],
      ["wide", "72rem"],
    ]);

    return namedSizes.get(value) ?? value;
  }

  private color(value: string): string {
    return `var(--color-${value.replace(/\./g, "-")})`;
  }

  private fontSize(value: string): string {
    const namedSizes: ReadonlyMap<string, string> = new Map<string, string>([
      ["body", "1rem"],
      ["small", "0.875rem"],
      ["title", "clamp(2rem, 4vw, 4rem)"],
      ["section", "clamp(1.5rem, 3vw, 2.5rem)"],
    ]);

    return namedSizes.get(value) ?? value;
  }

  private fontWeight(value: string): string {
    const namedWeights: ReadonlyMap<string, string> = new Map<string, string>([
      ["regular", "400"],
      ["medium", "500"],
      ["strong", "700"],
      ["heavy", "800"],
    ]);

    return namedWeights.get(value) ?? value;
  }

  private lineHeight(value: string): string {
    const namedHeights: ReadonlyMap<string, string> = new Map<string, string>([
      ["tight", "1.15"],
      ["normal", "1.5"],
      ["reading", "1.7"],
    ]);

    return namedHeights.get(value) ?? value;
  }

  private border(value: string): string {
    const namedBorders: ReadonlyMap<string, string> = new Map<string, string>([
      ["soft", "1px solid rgb(23 21 18 / 0.14)"],
      ["strong", "2px solid var(--color-river-700)"],
      ["none", "0"],
    ]);

    return namedBorders.get(value) ?? value;
  }

  private borderWidth(value: string): string {
    return /^\d+$/.test(value) ? `${value}px` : value;
  }

  private radius(value: string): string {
    return value === "soft" ? "var(--radius-soft)" : value;
  }

  private shadow(value: string): string {
    return value === "raised" ? "var(--shadow-raised)" : "var(--shadow-low)";
  }

  private palette(value: string): BrandPalette {
    switch (value) {
      case "lumen":
        return {
          page: "#fff8ea",
          ink: "#1b1820",
          muted: "rgb(27 24 32 / 0.7)",
          surface: "rgb(255 255 255 / 0.78)",
          accent: "#006d77",
          highlight: "#ffb000",
          border: "rgb(27 24 32 / 0.13)",
          shadow: "rgb(55 35 10 / 0.18)",
          background:
            "radial-gradient(circle at 8% 0%, rgb(255 176 0 / 0.24), transparent 32rem), radial-gradient(circle at 92% 10%, rgb(0 109 119 / 0.17), transparent 34rem), linear-gradient(135deg, #fff8ea 0%, #f6efe0 52%, #fffdfa 100%)",
        };
      case "forge":
        return {
          page: "#17120f",
          ink: "#fff3e5",
          muted: "rgb(255 243 229 / 0.72)",
          surface: "rgb(48 37 31 / 0.82)",
          accent: "#ff6b35",
          highlight: "#f7c59f",
          border: "rgb(255 243 229 / 0.16)",
          shadow: "rgb(0 0 0 / 0.32)",
          background:
            "radial-gradient(circle at 15% 0%, rgb(255 107 53 / 0.22), transparent 30rem), radial-gradient(circle at 88% 22%, rgb(247 197 159 / 0.14), transparent 34rem), linear-gradient(135deg, #17120f 0%, #241913 48%, #35170f 100%)",
        };
      case "nocturne":
      default:
        return {
          page: "#10101c",
          ink: "#ffffff",
          muted: "rgb(255 255 255 / 0.76)",
          surface: "rgb(255 255 255 / 0.1)",
          accent: "#4ee7f8",
          highlight: "#ff5d73",
          border: "rgb(255 255 255 / 0.14)",
          shadow: "rgb(16 16 28 / 0.28)",
          background:
            "radial-gradient(circle at 10% 0%, rgb(187 60 255 / 0.24), transparent 32rem), radial-gradient(circle at 90% 8%, rgb(78 231 248 / 0.18), transparent 34rem), linear-gradient(135deg, #10101c 0%, #19172b 45%, #2b1434 100%)",
        };
    }
  }

  private radiusToken(value: string): string {
    switch (value) {
      case "sharp":
        return "0.35rem";
      case "round":
        return "1.5rem";
      case "soft":
      default:
        return "0.9rem";
    }
  }

  private shadowToken(surface: string, fallback: string): string {
    if (surface === "paper") {
      return `0 18px 55px ${fallback}`;
    }

    if (surface === "metal") {
      return `0 24px 70px ${fallback}, inset 0 1px 0 rgb(255 255 255 / 0.12)`;
    }

    return `0 26px 80px ${fallback}`;
  }

  private spacingScale(density: string): readonly string[] {
    if (density === "dense") {
      return ["0", "0.2rem", "0.45rem", "0.7rem", "0.9rem", "1.25rem", "1.75rem"];
    }

    if (density === "airy") {
      return ["0", "0.35rem", "0.7rem", "1rem", "1.35rem", "2rem", "2.8rem"];
    }

    return ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem"];
  }

  private headingFont(type: string): string {
    if (type === "editorial") {
      return "Georgia, 'Times New Roman', serif";
    }

    if (type === "technical") {
      return "'IBM Plex Sans', Inter, ui-sans-serif, system-ui, sans-serif";
    }

    return "Inter, ui-sans-serif, system-ui, sans-serif";
  }

  private bodyFont(type: string): string {
    if (type === "editorial") {
      return "'Source Sans 3', ui-sans-serif, system-ui, sans-serif";
    }

    if (type === "technical") {
      return "'IBM Plex Sans', Inter, ui-sans-serif, system-ui, sans-serif";
    }

    return "Inter, ui-sans-serif, system-ui, sans-serif";
  }

  private heroFontSize(type: string): string {
    if (type === "editorial") {
      return "clamp(2.7rem, 5.4vw, 4.85rem)";
    }

    return "clamp(3rem, 6.8vw, 6.6rem)";
  }

  private sectionFontSize(type: string): string {
    if (type === "editorial") {
      return "clamp(1.9rem, 4.2vw, 3.6rem)";
    }

    return "clamp(2rem, 4.7vw, 4rem)";
  }

  private motionDuration(motion: string): string {
    if (motion === "still") {
      return "0ms";
    }

    if (motion === "kinetic") {
      return "140ms";
    }

    return "220ms";
  }

  private escapeCssString(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  private layer(value: string): string {
    const layers: ReadonlyMap<string, string> = new Map<string, string>([
      ["base", "0"],
      ["raised", "10"],
      ["popover", "30"],
      ["dialog", "50"],
      ["toast", "60"],
    ]);

    return layers.get(value) ?? value;
  }

  private position(value: string): string {
    return value === "anchor" ? "relative" : value;
  }

  private alignment(value: string): string {
    const alignments: ReadonlyMap<string, string> = new Map<string, string>([
      ["start", "flex-start"],
      ["center", "center"],
      ["end", "flex-end"],
      ["stretch", "stretch"],
    ]);

    return alignments.get(value) ?? value;
  }

  private distribution(value: string): string {
    const distributions: ReadonlyMap<string, string> = new Map<string, string>([
      ["start", "flex-start"],
      ["center", "center"],
      ["end", "flex-end"],
      ["between", "space-between"],
      ["around", "space-around"],
      ["evenly", "space-evenly"],
    ]);

    return distributions.get(value) ?? value;
  }

  private wrap(value: string): string {
    if (value === "true") {
      return "wrap";
    }

    if (value === "false") {
      return "nowrap";
    }

    return value;
  }

  private mediaQuery(value: "mobile" | "tablet" | "desktop"): string {
    switch (value) {
      case "mobile":
        return "(max-width: 720px)";
      case "tablet":
        return "(min-width: 721px) and (max-width: 1024px)";
      case "desktop":
        return "(min-width: 1025px)";
      default:
        return "(max-width: 720px)";
    }
  }
}

interface BrandPalette {
  readonly page: string;
  readonly ink: string;
  readonly muted: string;
  readonly surface: string;
  readonly accent: string;
  readonly highlight: string;
  readonly border: string;
  readonly shadow: string;
  readonly background: string;
}
