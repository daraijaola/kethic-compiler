import { StyleBlockNode, StyleDeclarationNode, WebNodeKind, WebProgramNode } from "./ast";

/**
 * CssGenerator emits scoped CSS from Kethic style declarations.
 */
export class CssGenerator {
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
      "  .kethic-section { padding: clamp(4rem, 8vw, 8rem) var(--sa-6); position: relative; }",
      "  .kethic-section h1 { max-inline-size: 12ch; margin: 0; font-size: clamp(3.6rem, 9vw, 8.5rem); line-height: 0.88; letter-spacing: 0; }",
      "  .kethic-section h2 { margin: 0 0 var(--sa-4); font-size: clamp(2rem, 5vw, 4.5rem); line-height: 0.95; letter-spacing: 0; }",
      "  .kethic-section h3 { margin: 0 0 var(--sa-2); font-size: 1.1rem; color: var(--color-gold-400); text-transform: uppercase; }",
      "  .kethic-section p { max-inline-size: 68ch; font-size: 1.08rem; line-height: 1.75; color: rgb(255 255 255 / 0.78); }",
      "  .kethic-container { max-inline-size: 76rem; margin-inline: auto; }",
      "  .kethic-navigation { position: sticky; inset-block-start: 0; z-index: 10; display: flex; gap: var(--sa-3); align-items: center; padding: var(--sa-3) var(--sa-6); background: rgb(16 16 28 / 0.68); backdrop-filter: blur(18px); border-block-end: 1px solid rgb(255 255 255 / 0.12); }",
      "  .kethic-link { color: rgb(255 255 255 / 0.82); font-weight: 750; text-decoration: none; }",
      "  .kethic-link:hover { color: var(--color-cyan-300); }",
      "  .kethic-button { border: 0; border-radius: 999px; padding: var(--sa-3) var(--sa-5); cursor: pointer; background: linear-gradient(135deg, var(--color-coral-500), var(--color-orchid-600)); color: white; font-weight: 800; box-shadow: 0 18px 44px rgb(255 93 115 / 0.24); }",
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
      "  .kethic-layout-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: var(--sa-4); }",
      "  .kethic-layout-center { display: grid; place-items: center; text-align: center; }",
      "  .kethic-metriccard { position: relative; min-block-size: 15rem; padding: var(--sa-5); border: 1px solid rgb(255 255 255 / 0.16); border-radius: 1.4rem; background: linear-gradient(145deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.05)); box-shadow: var(--shadow-raised); overflow: hidden; }",
      "  .kethic-metriccard::before { content: ''; position: absolute; inset: -40% -20% auto auto; inline-size: 12rem; block-size: 12rem; border-radius: 999px; background: radial-gradient(circle, rgb(78 231 248 / 0.32), transparent 70%); }",
      "  .kethic-metriccard h2 { color: var(--color-cyan-300); font-size: clamp(2.7rem, 7vw, 5.8rem); }",
      "  .kethic-signup { border-block: 1px solid rgb(255 255 255 / 0.14); background: linear-gradient(135deg, rgb(255 93 115 / 0.2), rgb(187 60 255 / 0.18)); }",
      "",
      "  @media (max-width: 720px) {",
      "    .kethic-section { padding: var(--sa-5) var(--sa-4); }",
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
