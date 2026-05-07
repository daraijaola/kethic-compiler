import {
  ButtonNode,
  ComponentNode,
  ComponentUseNode,
  ContainerNode,
  HeadingNode,
  MountNode,
  PageNode,
  SectionNode,
  SlotNode,
  TextNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebValue,
} from "./ast";

/**
 * RenderContext carries component parameters and slot content during rendering.
 */
interface RenderContext {
  readonly values: ReadonlyMap<string, string>;
  readonly slotChildren: readonly WebChildNode[];
}

/**
 * HtmlGenerator emits standard accessible HTML from the Web AST.
 */
export class HtmlGenerator {
  private readonly components: Map<string, ComponentNode> = new Map<string, ComponentNode>();

  /**
   * generate emits one complete HTML document.
   */
  public generate(program: WebProgramNode): string {
    this.components.clear();
    for (const node of program.body) {
      if (node.kind === WebNodeKind.Component) {
        this.components.set(node.name, node);
      }
    }

    const page: PageNode = this.findPage(program);
    const mountId: string = this.findMountId(program, page.name);
    const content: string = page.children
      .map((child: WebChildNode) => this.renderChild(child, 3, this.emptyContext()))
      .join("\n");

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

  private renderChild(node: WebChildNode, depth: number, context: RenderContext): string {
    switch (node.kind) {
      case WebNodeKind.Section:
        return this.renderSection(node, depth, context);
      case WebNodeKind.Container:
        return this.renderContainer(node, depth, context);
      case WebNodeKind.Text:
        return this.renderText(node, depth, context);
      case WebNodeKind.Heading:
        return this.renderHeading(node, depth, context);
      case WebNodeKind.Button:
        return this.renderButton(node, depth, context);
      case WebNodeKind.ComponentUse:
        return this.renderComponentUse(node, depth, context);
      case WebNodeKind.Slot:
        return this.renderSlot(node, depth, context);
      default:
        return "";
    }
  }

  private renderSection(node: SectionNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    return [
      `${this.indent(depth)}<section class="${this.className(node.name)} kethic-section">`,
      inner,
      `${this.indent(depth)}</section>`,
    ].join("\n");
  }

  private renderContainer(node: ContainerNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    return [
      `${this.indent(depth)}<div class="${this.className(node.name)} kethic-container">`,
      inner,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderText(node: TextNode, depth: number, context: RenderContext): string {
    return `${this.indent(depth)}<p>${this.escapeHtml(this.resolveValue(node.value, context))}</p>`;
  }

  private renderHeading(node: HeadingNode, depth: number, context: RenderContext): string {
    const tag: string = `h${node.level}`;
    const text: string = this.resolveValue(node.value, context);
    return `${this.indent(depth)}<${tag} id="${this.idFor(text)}">${this.escapeHtml(text)}</${tag}>`;
  }

  private renderButton(node: ButtonNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderButtonChild(child, depth + 1, context)).join("\n");
    const action: string = node.action === null ? "" : ` data-kethic-action="${this.escapeHtml(node.action)}"`;
    return [`${this.indent(depth)}<button type="button"${action} class="kethic-button">`, inner, `${this.indent(depth)}</button>`].join("\n");
  }

  private renderButtonChild(node: WebChildNode, depth: number, context: RenderContext): string {
    if (node.kind === WebNodeKind.Text) {
      return `${this.indent(depth)}<span>${this.escapeHtml(this.resolveValue(node.value, context))}</span>`;
    }

    return this.renderChild(node, depth, context);
  }

  private renderComponentUse(node: ComponentUseNode, depth: number, context: RenderContext): string {
    const component: ComponentNode | undefined = this.components.get(node.name);
    if (component === undefined) {
      return "";
    }

    const values: Map<string, string> = new Map<string, string>();
    for (let index: number = 0; index < component.parameters.length; index += 1) {
      values.set(component.parameters[index], this.resolveValue(node.arguments[index], context));
    }

    const componentContext: RenderContext = {
      values,
      slotChildren: node.children,
    };
    const inner: string = component.children
      .map((child: WebChildNode) => this.renderChild(child, depth + 1, componentContext))
      .join("\n");

    return [
      `${this.indent(depth)}<div class="${this.componentClassName(component.name)} kethic-component" data-kethic-component="${this.escapeHtml(component.name)}">`,
      inner,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderSlot(_node: SlotNode, depth: number, context: RenderContext): string {
    return context.slotChildren.map((child: WebChildNode) => this.renderChild(child, depth, context)).join("\n");
  }

  private emptyContext(): RenderContext {
    return { values: new Map<string, string>(), slotChildren: [] };
  }

  private resolveValue(value: WebValue | undefined, context: RenderContext): string {
    if (value === undefined) {
      return "";
    }

    if (value.kind === "literal") {
      return value.value;
    }

    return context.values.get(value.value) ?? "";
  }

  private className(name: string): string {
    return `kethic-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
  }

  private componentClassName(name: string): string {
    return `kethic-selthar-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
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
