import {
  ButtonNode,
  ComponentNode,
  ComponentUseNode,
  ConditionalNode,
  ContainerNode,
  FooterNode,
  FormNode,
  HeadingNode,
  InputNode,
  LinkNode,
  MountNode,
  NavigationNode,
  PageNode,
  RouteNode,
  SectionNode,
  StateNode,
  SlotNode,
  TextNode,
  TextareaNode,
  ValidationMessageNode,
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
  readonly validationMessages: ReadonlySet<string>;
  readonly insideForm: boolean;
}

/**
 * HtmlGenerator emits standard accessible HTML from the Web AST.
 */
export class HtmlGenerator {
  private readonly components: Map<string, ComponentNode> = new Map<string, ComponentNode>();
  private readonly stateValues: Map<string, string> = new Map<string, string>();
  private readonly routes: Map<string, string> = new Map<string, string>();
  private readonly usedIds: Set<string> = new Set<string>();

  public constructor(private readonly includeRuntime: boolean) {}

  /**
   * generate emits one complete HTML document.
   */
  public generate(program: WebProgramNode): string {
    this.components.clear();
    this.stateValues.clear();
    this.routes.clear();
    this.usedIds.clear();
    for (const node of program.body) {
      if (node.kind === WebNodeKind.Component) {
        this.components.set(node.name, node);
      }

      if (node.kind === WebNodeKind.Route) {
        this.routes.set(node.target, node.path);
      }

      if (node.kind === WebNodeKind.State) {
        this.stateValues.set(node.name, this.evaluateInitialState(node));
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
      ...(this.includeRuntime ? ['    <script defer src="./runtime.js"></script>'] : []),
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
      throw new Error("Web program has no page.");
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
      case WebNodeKind.Link:
        return this.renderLink(node, depth);
      case WebNodeKind.Button:
        return this.renderButton(node, depth, context);
      case WebNodeKind.Conditional:
        return this.renderConditional(node, depth, context);
      case WebNodeKind.Navigation:
        return this.renderNavigation(node, depth, context);
      case WebNodeKind.Footer:
        return this.renderFooter(node, depth, context);
      case WebNodeKind.Form:
        return this.renderForm(node, depth, context);
      case WebNodeKind.Input:
        return this.renderInput(node, depth, context);
      case WebNodeKind.Textarea:
        return this.renderTextarea(node, depth, context);
      case WebNodeKind.ValidationMessage:
        return this.renderValidationMessage(node, depth);
      case WebNodeKind.ComponentUse:
        return this.renderComponentUse(node, depth, context);
      case WebNodeKind.Slot:
        return this.renderSlot(node, depth, context);
      default:
        return "";
    }
  }

  private renderSection(node: SectionNode, depth: number, context: RenderContext): string {
    const id: string = this.reserveId(this.idFor(node.name));
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    return [
      `${this.indent(depth)}<section id="${id}" class="${this.className(node.name)} kethic-section">`,
      inner,
      `${this.indent(depth)}</section>`,
    ].join("\n");
  }

  private renderContainer(node: ContainerNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    const layoutClass: string = node.layout === undefined ? "" : ` kethic-layout-${node.layout}`;
    return [
      `${this.indent(depth)}<div class="${this.className(node.name)} kethic-container${layoutClass}">`,
      inner,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderText(node: TextNode, depth: number, context: RenderContext): string {
    const text: string = this.resolveValue(node.value, context);
    if (node.value.kind === "literal" && this.hasInterpolation(text)) {
      return `${this.indent(depth)}<p data-kethic-bind data-kethic-template="${this.escapeHtml(text)}">${this.escapeHtml(this.renderTemplate(text))}</p>`;
    }

    return `${this.indent(depth)}<p>${this.escapeHtml(text)}</p>`;
  }

  private renderHeading(node: HeadingNode, depth: number, context: RenderContext): string {
    const tag: string = `h${node.level}`;
    const text: string = this.resolveValue(node.value, context);
    const id: string = this.reserveId(this.idFor(text));
    return `${this.indent(depth)}<${tag} id="${id}">${this.escapeHtml(text)}</${tag}>`;
  }

  private renderButton(node: ButtonNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderButtonChild(child, depth + 1, context)).join("\n");
    const action: string = node.action === null ? "" : ` data-kethic-action="${this.escapeHtml(node.action)}"`;
    const disabledBinding: string = node.disabledWhen === null ? "" : ` data-kethic-disabled="${this.escapeHtml(node.disabledWhen)}"`;
    const disabled: string = node.disabledWhen !== null && this.isTruthyState(node.disabledWhen) ? " disabled" : "";
    const type: string = node.action === null && context.insideForm ? "submit" : "button";
    return [
      `${this.indent(depth)}<button type="${type}"${action}${disabledBinding}${disabled} class="kethic-button">`,
      inner,
      `${this.indent(depth)}</button>`,
    ].join("\n");
  }

  private renderConditional(node: ConditionalNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    const hidden: string = this.isTruthyState(node.stateName) ? "" : " hidden";
    return [
      `${this.indent(depth)}<div data-kethic-show="${this.escapeHtml(node.stateName)}"${hidden}>`,
      inner,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderLink(node: LinkNode, depth: number): string {
    const href: string = this.hrefFor(node.target);
    return `${this.indent(depth)}<a class="kethic-link" href="${this.escapeHtml(href)}">${this.escapeHtml(node.label)}</a>`;
  }

  private renderNavigation(node: NavigationNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    return [
      `${this.indent(depth)}<nav class="${this.className(node.name)} kethic-navigation" aria-label="${this.escapeHtml(node.name)}">`,
      inner,
      `${this.indent(depth)}</nav>`,
    ].join("\n");
  }

  private renderFooter(node: FooterNode, depth: number, context: RenderContext): string {
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, context)).join("\n");
    return [`${this.indent(depth)}<footer class="kethic-footer">`, inner, `${this.indent(depth)}</footer>`].join("\n");
  }

  private renderButtonChild(node: WebChildNode, depth: number, context: RenderContext): string {
    if (node.kind === WebNodeKind.Text) {
      const text: string = this.resolveValue(node.value, context);
      if (node.value.kind === "literal" && this.hasInterpolation(text)) {
        return `${this.indent(depth)}<span data-kethic-bind data-kethic-template="${this.escapeHtml(text)}">${this.escapeHtml(this.renderTemplate(text))}</span>`;
      }

      return `${this.indent(depth)}<span>${this.escapeHtml(text)}</span>`;
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
      validationMessages: context.validationMessages,
      insideForm: context.insideForm,
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

  private renderForm(node: FormNode, depth: number, context: RenderContext): string {
    const messageFields: Set<string> = new Set<string>(
      node.children
        .filter((child: WebChildNode): child is ValidationMessageNode => child.kind === WebNodeKind.ValidationMessage)
        .map((child: ValidationMessageNode) => child.fieldName),
    );
    const formContext: RenderContext = {
      values: context.values,
      slotChildren: context.slotChildren,
      validationMessages: messageFields,
      insideForm: true,
    };
    const inner: string = node.children.map((child: WebChildNode) => this.renderChild(child, depth + 1, formContext)).join("\n");

    return [
      `${this.indent(depth)}<form class="${this.className(node.name)} kethic-form">`,
      inner,
      `${this.indent(depth)}</form>`,
    ].join("\n");
  }

  private renderInput(node: InputNode, depth: number, context: RenderContext): string {
    const id: string = this.fieldId(node.name);
    const describedBy: string = context.validationMessages.has(node.name)
      ? ` aria-describedby="${this.escapeHtml(this.messageId(node.name))}"`
      : "";
    const required: string = node.required ? " required" : "";
    const binding: string = node.binding === null ? "" : ` data-kethic-field="${this.escapeHtml(node.binding)}"`;
    const value: string = node.binding === null ? "" : ` value="${this.escapeHtml(this.stateValues.get(node.binding) ?? "")}"`;

    return [
      `${this.indent(depth)}<div class="kethic-field">`,
      `${this.indent(depth + 1)}<label for="${this.escapeHtml(id)}">${this.escapeHtml(node.label)}</label>`,
      `${this.indent(depth + 1)}<input id="${this.escapeHtml(id)}" name="${this.escapeHtml(node.name)}"${binding}${value}${required}${describedBy}>`,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderTextarea(node: TextareaNode, depth: number, context: RenderContext): string {
    const id: string = this.fieldId(node.name);
    const describedBy: string = context.validationMessages.has(node.name)
      ? ` aria-describedby="${this.escapeHtml(this.messageId(node.name))}"`
      : "";
    const required: string = node.required ? " required" : "";
    const binding: string = node.binding === null ? "" : ` data-kethic-field="${this.escapeHtml(node.binding)}"`;
    const value: string = node.binding === null ? "" : this.escapeHtml(this.stateValues.get(node.binding) ?? "");

    return [
      `${this.indent(depth)}<div class="kethic-field">`,
      `${this.indent(depth + 1)}<label for="${this.escapeHtml(id)}">${this.escapeHtml(node.label)}</label>`,
      `${this.indent(depth + 1)}<textarea id="${this.escapeHtml(id)}" name="${this.escapeHtml(node.name)}"${binding} rows="${node.rows}"${required}${describedBy}>${value}</textarea>`,
      `${this.indent(depth)}</div>`,
    ].join("\n");
  }

  private renderValidationMessage(node: ValidationMessageNode, depth: number): string {
    return `${this.indent(depth)}<p id="${this.escapeHtml(this.messageId(node.fieldName))}" class="kethic-validation">${this.escapeHtml(node.message)}</p>`;
  }

  private emptyContext(): RenderContext {
    return { values: new Map<string, string>(), slotChildren: [], validationMessages: new Set<string>(), insideForm: false };
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

  private evaluateInitialState(node: StateNode): string {
    if (node.initialValue.kind === "literal") {
      return String(node.initialValue.value);
    }

    return "";
  }

  private isTruthyState(name: string): boolean {
    const value: string | undefined = this.stateValues.get(name);
    return value !== undefined && value !== "" && value !== "false" && value !== "0" && value !== "null";
  }

  private hasInterpolation(value: string): boolean {
    return /\{[A-Za-z_][A-Za-z0-9_]*\}/.test(value);
  }

  private renderTemplate(value: string): string {
    return value.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match: string, name: string) => this.stateValues.get(name) ?? "");
  }

  private className(name: string): string {
    return `kethic-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
  }

  private componentClassName(name: string): string {
    return `kethic-component-${name.replace(/[^A-Za-z0-9_-]/g, "-").toLowerCase()}`;
  }

  private hrefFor(target: string): string {
    return this.routes.get(target) ?? target;
  }

  private idFor(name: string): string {
    return this.className(name).replace(/^kethic-/, "");
  }

  private reserveId(baseId: string): string {
    const safeBaseId: string = baseId.length === 0 ? "node" : baseId;
    let candidate: string = safeBaseId;
    let index: number = 2;

    while (this.usedIds.has(candidate)) {
      candidate = `${safeBaseId}-${index}`;
      index += 1;
    }

    this.usedIds.add(candidate);
    return candidate;
  }

  private fieldId(name: string): string {
    return `field-${this.idFor(name)}`;
  }

  private messageId(name: string): string {
    return `${this.fieldId(name)}-message`;
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
