import { StyleBlockNode, StyleDeclarationNode, WebNodeKind, WebProgramNode } from "./ast";

/**
 * CssGenerator emits scoped CSS from Kethic Tharsel declarations.
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
      "    --radius-soft: 0.75rem;",
      "    --shadow-low: 0 1px 2px rgb(23 21 18 / 0.12);",
      "    --shadow-raised: 0 12px 32px rgb(23 21 18 / 0.16);",
      "  }",
      "}",
      "",
      "@layer kethic.reset {",
      "  *, *::before, *::after { box-sizing: border-box; }",
      "  body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-sand-50); color: var(--color-ink-900); }",
      "  button { font: inherit; min-inline-size: 2.75rem; min-block-size: 2.75rem; }",
      "  :focus-visible { outline: 3px solid var(--color-river-700); outline-offset: 3px; }",
      "}",
      "",
      "@layer kethic.components {",
      "  .kethic-page { min-block-size: 100vh; }",
      "  .kethic-section { padding: var(--sa-6); }",
      "  .kethic-container { max-inline-size: 72rem; margin-inline: auto; }",
      "  .kethic-navigation { position: sticky; inset-block-start: 0; z-index: 10; display: flex; gap: var(--sa-3); align-items: center; padding: var(--sa-3) var(--sa-6); background: rgb(248 244 236 / 0.92); backdrop-filter: blur(12px); border-block-end: 1px solid rgb(23 21 18 / 0.12); }",
      "  .kethic-link { color: var(--color-river-700); font-weight: 700; text-decoration-thickness: 0.12em; text-underline-offset: 0.22em; }",
      "  .kethic-button { border: 0; border-radius: var(--radius-soft); padding: var(--sa-3) var(--sa-4); cursor: pointer; background: var(--color-river-700); color: white; }",
      "  .kethic-form { display: grid; gap: var(--sa-4); max-inline-size: 42rem; }",
      "  .kethic-field { display: grid; gap: var(--sa-2); }",
      "  .kethic-field label { font-weight: 700; }",
      "  .kethic-field input, .kethic-field textarea { inline-size: 100%; border: 1px solid rgb(23 21 18 / 0.28); border-radius: var(--radius-soft); padding: var(--sa-3); font: inherit; background: white; color: var(--color-ink-900); }",
      "  .kethic-field textarea { resize: vertical; }",
      "  .kethic-validation { margin: calc(var(--sa-3) * -1) 0 0; color: #8a230f; font-size: 0.95rem; }",
      "  .kethic-footer { padding: var(--sa-5) var(--sa-6); border-block-start: 1px solid rgb(23 21 18 / 0.12); color: rgb(23 21 18 / 0.72); }",
      "",
      "  @media (max-width: 720px) {",
      "    .kethic-section { padding: var(--sa-5) var(--sa-4); }",
      "    .kethic-navigation { align-items: flex-start; flex-direction: column; padding: var(--sa-3) var(--sa-4); }",
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

    return [`@layer kethic.components {`, `  .${this.className(block.target)} {`, ...declarations, "  }", "}"].join("\n");
  }

  private generateDeclaration(declaration: StyleDeclarationNode): string {
    switch (declaration.name) {
      case "Sarin":
        return `    padding: ${this.space(declaration.value)};`;
      case "Savarin":
        return `    padding: ${this.space(declaration.value)};`;
      case "Ovsa":
        return `    margin: ${this.space(declaration.value)};`;
      case "Shevsa":
        return `    gap: ${this.space(declaration.value)};`;
      case "Vator":
        return `    inline-size: ${this.size(declaration.value)};`;
      case "Torkar":
        return `    block-size: ${this.size(declaration.value)};`;
      case "Naktor":
        return `    min-inline-size: ${this.size(declaration.value)};`;
      case "Tornak":
        return `    max-inline-size: ${this.size(declaration.value)};`;
      case "Lusel":
        return `    color: ${this.color(declaration.value)};`;
      case "Mirlu":
        return `    background: ${this.color(declaration.value)};`;
      case "Kellu":
        return `    color: ${this.color(declaration.value)};`;
      case "Kelsa":
        return `    font-size: ${this.fontSize(declaration.value)};`;
      case "Keltorva":
        return `    font-weight: ${this.fontWeight(declaration.value)};`;
      case "Kelruksa":
        return `    line-height: ${this.lineHeight(declaration.value)};`;
      case "Kelshev":
        return `    text-align: ${declaration.value};`;
      case "Torkarva":
        return `    border: ${this.border(declaration.value)};`;
      case "Torlu":
        return `    border-color: ${this.color(declaration.value)};`;
      case "Torsa":
        return `    border-width: ${this.borderWidth(declaration.value)};`;
      case "Natorkar":
        return `    border-radius: ${this.radius(declaration.value)};`;
      case "Mireshel":
        return `    box-shadow: ${this.shadow(declaration.value)};`;
      case "Luna":
        return `    opacity: ${declaration.value};`;
      case "Vashev":
        return `    overflow: ${declaration.value};`;
      case "Torshev":
        return `    z-index: ${this.layer(declaration.value)};`;
      case "Torrin":
        return `    position: ${this.position(declaration.value)};`;
      case "Rintor":
        return `    inset: ${this.space(declaration.value)};`;
      case "Karum":
        return `    display: ${declaration.value};`;
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
}
