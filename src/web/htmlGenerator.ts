import {
  ButtonNode,
  ContainerNode,
  HeadingNode,
  MountNode,
  PageNode,
  SectionNode,
  TextNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
} from "./ast";

/**
 * HtmlGenerator emits standard accessible HTML from the Web AST.
 */
export class HtmlGenerator {
  /**
   * generate emits one complete HTML document.
   */
  public generate(program: WebProgramNode): string {
    const page: PageNode = this.findPage(program);
    const mountId: string = this.findMountId(program, page.name);
    const content: string = page.children.map((child: WebChildNode) => this.renderChild(child, 3)).join("\n");

    return [
      "<!doctype html>",
      '<html lang="en">',
      "  <head>",
      '    <meta charset="utf-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1">',
      `    <title>${this.escapeHtml(page.name)}</title>`,
      '    <link rel="stylesheet" href="./styles.css">',
      "  </head>",
      "  <body>",
      `    <main id="${this.escapeHtml(mountId)}" class="${this.className(page.name)} kethic-page">`,
      content,
      "    </main>",
      "  </body>",
      "</html>",
    ].join("\n");
  }

  private findPage(program: WebProgramNode): PageNode {
    const page: PageNode | undefined = program.body.find((node) => node.kind === WebNodeKind.Page) as PageNode | undefined;
    if (page === undefined) {
      throw new Error("Web program has no Torvathar page.");
    }

    return page;
  }

  private findMountId(program: WebProgramNode, pageName: string): string {
    const mount: MountNode | undefined = program.body.find(
      (node): node is MountNode => node.kind === WebNodeKind.Mount && node.pageName === pageName,
    );

    if (mount === undefined) {
      return "app";
    }

    return mount.selector.startsWith("#") ? mount.selector.slice(1) : "app";
  }

  private renderChild(node: WebChildNode, depth: number): string {
    switch (node.kind) {
      case WebNodeKind.Section:
        return this.renderSection(node, depth);
      case WebNodeKind.Container:
        return this.renderContainer(node, depth);
      case WebNodeKind.Text:
        return this.renderText(node, depth);
      case WebNodeKind.Heading:
        return this.renderHeading(node, depth);
      case WebNodeKind.Button:
        return this.renderButton(node, depth);
      default:
        return "";
    }
  }

  private renderSection(node: SectionNode, depth: number): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1)).join("\n");
    return [
      `${this.indent(depth)}<section class="${this.className(node.name)} kethic-section">`,
      inner,
      `${this.indent(depth)}</section>`,
    ].join("\n");
  }

  private renderContainer(node: ContainerNode, depth: number): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1)).join("\n");
    return [
      `${this.indent(depth)}<div class="${this.className(node.name)} kethic-container">`,
      inner,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderText(node: TextNode, depth: number): string {
    return `${this.indent(depth)}<p>${this.escapeHtml(node.value)}</p>`;
  }

  private renderHeading(node: HeadingNode, depth: number): string {
    const tag: string = `h${node.level}`;
    return `${this.indent(depth)}<${tag} id="${this.idFor(node.value)}">${this.escapeHtml(node.value)}</${tag}>`;
  }

  private renderButton(node: ButtonNode, depth: number): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderButtonChild(child, depth + 1)).join("\n");
    const action: string = node.action === null ? "" : ` data-kethic-action="${this.escapeHtml(node.action)}"`;
    return [`${this.indent(depth)}<button type="button"${action} class="kethic-button">`, inner, `${this.indent(depth)}</button>`].join("\n");
  }

  private renderButtonChild(node: WebChildNode, depth: number): string {
    if (node.kind === WebNodeKind.Text) {
      return `${this.indent(depth)}<span>${this.escapeHtml(node.value)}</span>`;
    }

    return this.renderChild(node, depth);
  }

  private className(name: string): string {
    return `kethic-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
  }

  private idFor(name: string): string {
    return this.className(name).replace(/^kethic-/, "");
  }

  private indent(depth: number): string {
    return "  ".repeat(depth);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
