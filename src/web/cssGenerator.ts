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
      "  .kethic-button { border: 0; border-radius: var(--radius-soft); padding: var(--sa-3) var(--sa-4); cursor: pointer; background: var(--color-river-700); color: white; }",
      "  .kethic-form { display: grid; gap: var(--sa-4); max-inline-size: 42rem; }",
      "  .kethic-field { display: grid; gap: var(--sa-2); }",
      "  .kethic-field label { font-weight: 700; }",
      "  .kethic-field input, .kethic-field textarea { inline-size: 100%; border: 1px solid rgb(23 21 18 / 0.28); border-radius: var(--radius-soft); padding: var(--sa-3); font: inherit; background: white; color: var(--color-ink-900); }",
      "  .kethic-field textarea { resize: vertical; }",
      "  .kethic-validation { margin: calc(var(--sa-3) * -1) 0 0; color: #8a230f; font-size: 0.95rem; }",
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
      case "Savarin":
        return `    padding: ${this.space(declaration.value)};`;
      case "Ovsa":
        return `    margin: ${this.space(declaration.value)};`;
      case "Shevsa":
        return `    gap: ${this.space(declaration.value)};`;
      case "Mirlu":
        return `    background: ${this.color(declaration.value)};`;
      case "Kellu":
        return `    color: ${this.color(declaration.value)};`;
      case "Natorkar":
        return `    border-radius: ${this.radius(declaration.value)};`;
      case "Mireshel":
        return `    box-shadow: ${this.shadow(declaration.value)};`;
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

  private color(value: string): string {
    return `var(--color-${value.replace(/\./g, "-")})`;
  }

  private radius(value: string): string {
    return value === "soft" ? "var(--radius-soft)" : value;
  }

  private shadow(value: string): string {
    return value === "raised" ? "var(--shadow-raised)" : "var(--shadow-low)";
  }
}
