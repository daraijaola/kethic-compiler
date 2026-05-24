import {
  ButtonNode,
  ActionNode,
  ComponentNode,
  ComponentUseNode,
  ConditionalNode,
  DataNode,
  FooterNode,
  FormNode,
  HeadingNode,
  InputNode,
  LinkNode,
  MountNode,
  NavigationNode,
  PageNode,
  RepeatNode,
  RouteNode,
  StateNode,
  StateUpdateNode,
  StyleBlockNode,
  StyleDeclarationNode,
  TextareaNode,
  TextNode,
  ValidationMessageNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebTopLevelNode,
  WebValue,
  WebExpression,
} from "./ast";
import { WebDiagnostic } from "./diagnostics";

const SUPPORTED_STYLE_ATTRIBUTES: ReadonlySet<string> = new Set<string>([
  "pad",
  "margin",
  "gap",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "background",
  "color",
  "font",
  "weight",
  "line",
  "alignText",
  "border",
  "borderColor",
  "borderWidth",
  "radius",
  "shadow",
  "opacity",
  "overflow",
  "z",
  "position",
  "inset",
  "display",
  "align",
  "justify",
  "wrap",
  "container",
  "ratio",
]);

/**
 * WebTypeChecker validates semantic web rules before output generation.
 */
export class WebTypeChecker {
  private readonly diagnostics: WebDiagnostic[] = [];
  private readonly pages: Map<string, PageNode> = new Map<string, PageNode>();
  private readonly components: Map<string, ComponentNode> = new Map<string, ComponentNode>();
  private readonly dataBlocks: Map<string, DataNode> = new Map<string, DataNode>();
  private readonly states: Map<string, StateNode> = new Map<string, StateNode>();
  private readonly actions: Map<string, ActionNode> = new Map<string, ActionNode>();
  private readonly routesByTarget: Map<string, RouteNode> = new Map<string, RouteNode>();
  private readonly routePaths: Set<string> = new Set<string>();
  private readonly sectionTargets: Set<string> = new Set<string>();

  /**
   * check validates a web program and returns all diagnostics.
   */
  public check(program: WebProgramNode): readonly WebDiagnostic[] {
    this.diagnostics.length = 0;
    this.pages.clear();
    this.components.clear();
    this.dataBlocks.clear();
    this.states.clear();
    this.actions.clear();
    this.routesByTarget.clear();
    this.routePaths.clear();
    this.sectionTargets.clear();

    for (const node of program.body) {
      if (node.kind === WebNodeKind.Page) {
        this.registerPage(node);
      }

      if (node.kind === WebNodeKind.Component) {
        this.registerComponent(node);
      }

      if (node.kind === WebNodeKind.Data) {
        this.registerData(node);
      }

      if (node.kind === WebNodeKind.State) {
        this.registerState(node);
      }

      if (node.kind === WebNodeKind.Action) {
        this.registerAction(node);
      }

      if (node.kind === WebNodeKind.Route) {
        this.registerRoute(node);
      }
    }

    for (const node of program.body) {
      this.checkTopLevel(node);
    }

    return [...this.diagnostics];
  }

  private checkTopLevel(node: WebTopLevelNode): void {
    switch (node.kind) {
      case WebNodeKind.Page:
        this.checkPage(node);
        return;
      case WebNodeKind.Component:
        this.checkComponent(node);
        return;
      case WebNodeKind.Data:
        this.checkData(node);
        return;
      case WebNodeKind.StyleBlock:
        this.checkStyleBlock(node);
        return;
      case WebNodeKind.Route:
        this.checkRoute(node);
        return;
      case WebNodeKind.Mount:
        this.checkMount(node);
        return;
      case WebNodeKind.State:
        this.checkState(node);
        return;
      case WebNodeKind.Action:
        this.checkAction(node);
        return;
      default:
        return;
    }
  }

  private checkPage(node: PageNode): void {
    this.checkChildren(node.children, null);
  }

  private registerPage(node: PageNode): void {
    if (this.pages.has(node.name)) {
      this.report(node, "page", `page "${node.name}" is already declared`);
      return;
    }

    this.pages.set(node.name, node);
    this.collectSectionTargets(node.children);
  }

  private registerComponent(node: ComponentNode): void {
    if (this.components.has(node.name)) {
      this.report(node, "component", `component "${node.name}" is already declared`);
      return;
    }

    this.components.set(node.name, node);
  }

  private registerData(node: DataNode): void {
    if (this.dataBlocks.has(node.name)) {
      this.report(node, "data", `data "${node.name}" is already declared`);
      return;
    }

    this.dataBlocks.set(node.name, node);
  }

  private registerState(node: StateNode): void {
    if (this.states.has(node.name)) {
      this.report(node, "state", `state "${node.name}" is already declared`);
      return;
    }

    this.states.set(node.name, node);
  }

  private registerAction(node: ActionNode): void {
    if (this.actions.has(node.name)) {
      this.report(node, "action", `action "${node.name}" is already declared`);
      return;
    }

    this.actions.set(node.name, node);
  }

  private registerRoute(node: RouteNode): void {
    if (this.routesByTarget.has(node.target)) {
      this.report(node, "route", `route target "${node.target}" is already declared`);
      return;
    }

    if (this.routePaths.has(node.path)) {
      this.report(node, "route", `route path "${node.path}" is already declared`);
      return;
    }

    this.routesByTarget.set(node.target, node);
    this.routePaths.add(node.path);
  }

  private checkComponent(node: ComponentNode): void {
    const seenParameters: Set<string> = new Set<string>();

    for (const parameter of node.parameters) {
      if (seenParameters.has(parameter)) {
        this.report(node, "component", `parameter "${parameter}" is duplicated`);
      }

      seenParameters.add(parameter);
    }

    this.checkChildren(node.children, node);
  }

  private checkMount(node: MountNode): void {
    if (!node.selector.startsWith("#")) {
      this.report(node, "mount", "mount target must be an id selector such as \"#app\"");
    }

    if (!this.pages.has(node.pageName)) {
      this.report(node, "mount", `page "${node.pageName}" does not exist`);
    }
  }

  private checkState(node: StateNode): void {
    this.checkExpression(node.initialValue, node, "state");
  }

  private checkAction(node: ActionNode): void {
    if (node.updates.length === 0) {
      this.report(node, "action", `action "${node.name}" has no state updates`);
    }

    for (const update of node.updates) {
      this.checkStateUpdate(update);
    }
  }

  private checkStateUpdate(node: StateUpdateNode): void {
    if (!this.states.has(node.stateName)) {
      this.report(node, "action", `state "${node.stateName}" does not exist`);
    }

    this.checkExpression(node.value, node, "action");
  }

  private checkStyleBlock(node: StyleBlockNode): void {
    if (node.declarations.length === 0) {
      this.report(node, "style", `style block "${node.target}" has no declarations`);
    }

    for (const declaration of node.declarations) {
      this.checkStyleDeclaration(declaration);
    }
  }

  private checkStyleDeclaration(node: StyleDeclarationNode): void {
    if (!SUPPORTED_STYLE_ATTRIBUTES.has(node.name)) {
      this.report(node, node.name, `unsupported Web Phase 2 style attribute "${node.name}"`);
    }
  }

  private checkChildren(children: readonly WebChildNode[], currentComponent: ComponentNode | null): void {
    for (const child of children) {
      if (child.kind === WebNodeKind.Button) {
        this.checkButton(child);
      }

      if (child.kind === WebNodeKind.Conditional) {
        this.checkConditional(child);
      }

      if (child.kind === WebNodeKind.Heading) {
        this.checkHeading(child, currentComponent);
      }

      if (child.kind === WebNodeKind.Text) {
        this.checkText(child, currentComponent);
      }

      if (child.kind === WebNodeKind.ComponentUse) {
        this.checkComponentUse(child);
      }

      if (child.kind === WebNodeKind.Repeat) {
        this.checkRepeat(child);
      }

      if (child.kind === WebNodeKind.Navigation) {
        this.checkNavigation(child);
      }

      if (child.kind === WebNodeKind.Link) {
        this.checkLink(child);
      }

      if (child.kind === WebNodeKind.Footer) {
        this.checkFooter(child);
      }

      if (child.kind === WebNodeKind.Form) {
        this.checkForm(child, currentComponent);
        continue;
      }

      if ("children" in child) {
        this.checkChildren(child.children, currentComponent);
      }
    }
  }

  private checkHeading(node: HeadingNode, currentComponent: ComponentNode | null): void {
    if (node.value.value.trim().length === 0) {
      this.report(node, "h", "heading text cannot be empty");
    }

    this.checkValueReference(node, "h", node.value, currentComponent);
  }

  private checkText(node: TextNode, currentComponent: ComponentNode | null): void {
    this.checkValueReference(node, "text", node.value, currentComponent);
    if (node.value.kind === "literal") {
      for (const stateName of this.extractInterpolatedStateNames(node.value.value)) {
        if (!this.states.has(stateName)) {
          this.report(node, "text", `state "${stateName}" does not exist`);
        }
      }
    }
  }

  private checkButton(node: ButtonNode): void {
    const hasText: boolean = node.children.some((child: WebChildNode) => child.kind === WebNodeKind.Text);
    if (!hasText) {
      this.report(node, "button", "button must contain text in Web Phase 2");
    }

    if (node.action !== null && !this.actions.has(node.action)) {
      this.report(node, "button", `action "${node.action}" does not exist`);
    }

    if (node.disabledWhen !== null && !this.states.has(node.disabledWhen)) {
      this.report(node, "button", `disabled state "${node.disabledWhen}" does not exist`);
    }
  }

  private checkConditional(node: ConditionalNode): void {
    if (!this.states.has(node.stateName)) {
      this.report(node, "Umralu", `state "${node.stateName}" does not exist`);
    }
  }

  private checkNavigation(node: NavigationNode): void {
    const links: LinkNode[] = node.children.filter((child: WebChildNode): child is LinkNode => child.kind === WebNodeKind.Link);
    if (links.length === 0) {
      this.report(node, "nav", `navigation "${node.name}" must contain at least one link`);
    }
  }

  private checkLink(node: LinkNode): void {
    if (node.label.trim().length === 0) {
      this.report(node, "link", "link label cannot be empty");
    }

    if (this.isLiteralHref(node.target)) {
      return;
    }

    if (!this.routesByTarget.has(node.target)) {
      this.report(node, "link", `route target "${node.target}" does not exist`);
    }
  }

  private checkFooter(node: FooterNode): void {
    const hasText: boolean = node.children.some((child: WebChildNode) => child.kind === WebNodeKind.Text);
    if (!hasText) {
      this.report(node, "footer", "footer must contain text in this web phase");
    }
  }

  private checkForm(node: FormNode, currentComponent: ComponentNode | null): void {
    const fields: Map<string, InputNode | TextareaNode> = new Map<string, InputNode | TextareaNode>();
    const messages: ValidationMessageNode[] = [];

    for (const child of node.children) {
      if (child.kind === WebNodeKind.Input || child.kind === WebNodeKind.Textarea) {
        const keyword: string = child.kind === WebNodeKind.Input ? "input" : "textarea";

        if (fields.has(child.name)) {
          this.report(child, keyword, `field "${child.name}" is already declared in this form`);
        }

        fields.set(child.name, child);

        if (child.label.trim().length === 0) {
          this.report(child, keyword, `field "${child.name}" must have a label`);
        }

        if (child.binding !== null && !this.states.has(child.binding)) {
          this.report(child, keyword, `bound state "${child.binding}" does not exist`);
        }
      }

      if (child.kind === WebNodeKind.ValidationMessage) {
        messages.push(child);
      }
    }

    for (const message of messages) {
      if (!fields.has(message.fieldName)) {
        this.report(message, "message", `field "${message.fieldName}" does not exist in this form`);
      }
    }

    this.checkChildren(node.children, currentComponent);
  }

  private checkComponentUse(node: ComponentUseNode): void {
    const component: ComponentNode | undefined = this.components.get(node.name);
    if (component === undefined) {
      this.report(node, "Umkel", `component "${node.name}" does not exist`);
      return;
    }

    if (node.arguments.length !== component.parameters.length) {
      this.report(
        node,
        "Umkel",
        `component "${node.name}" expected ${component.parameters.length} arguments but received ${node.arguments.length}`,
      );
    }
  }

  private checkRepeat(node: RepeatNode): void {
    const component: ComponentNode | undefined = this.components.get(node.componentName);
    const data: DataNode | undefined = this.dataBlocks.get(node.dataName);

    if (component === undefined) {
      this.report(node, "repeat", `component "${node.componentName}" does not exist`);
      return;
    }

    if (data === undefined) {
      this.report(node, "repeat", `data "${node.dataName}" does not exist`);
      return;
    }

    for (const item of data.items) {
      if (item.values.length !== component.parameters.length) {
        this.report(
          item,
          "item",
          `component "${component.name}" expected ${component.parameters.length} values but data "${data.name}" item has ${item.values.length}`,
        );
      }
    }
  }

  private checkData(node: DataNode): void {
    if (node.items.length === 0) {
      this.report(node, "data", `data "${node.name}" has no items`);
    }
  }

  private checkRoute(node: RouteNode): void {
    if (!this.isLiteralHref(node.path)) {
      this.report(node, "route", `route path "${node.path}" must start with /, #, http://, https://, or mailto:`);
    }

    if (!this.sectionTargets.has(node.target) && !this.pages.has(node.target)) {
      this.report(node, "route", `route target "${node.target}" does not exist`);
    }
  }

  private checkValueReference(
    node: { readonly location: { readonly line: number; readonly column: number } },
    keyword: string,
    value: WebValue,
    currentComponent: ComponentNode | null,
  ): void {
    if (value.kind === "reference" && (currentComponent === null || !currentComponent.parameters.includes(value.value))) {
      this.report(node, keyword, `reference "${value.value}" is not a parameter in this component`);
    }
  }

  private extractInterpolatedStateNames(value: string): string[] {
    const names: string[] = [];
    const pattern: RegExp = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
    let match: RegExpExecArray | null = pattern.exec(value);

    while (match !== null) {
      names.push(match[1]);
      match = pattern.exec(value);
    }

    return names;
  }

  private collectSectionTargets(children: readonly WebChildNode[]): void {
    for (const child of children) {
      if (child.kind === WebNodeKind.Section) {
        this.sectionTargets.add(child.name);
      }

      if ("children" in child) {
        this.collectSectionTargets(child.children);
      }
    }
  }

  private isLiteralHref(value: string): boolean {
    return (
      value.startsWith("/") ||
      value.startsWith("#") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:")
    );
  }

  private checkExpression(
    expression: WebExpression,
    node: { readonly location: { readonly line: number; readonly column: number } },
    keyword: string,
  ): void {
    switch (expression.kind) {
      case "identifier":
        if (!this.states.has(expression.name)) {
          this.report(node, keyword, `state "${expression.name}" does not exist`);
        }
        return;
      case "unary":
        this.checkExpression(expression.argument, node, keyword);
        return;
      case "binary":
        this.checkExpression(expression.left, node, keyword);
        this.checkExpression(expression.right, node, keyword);
        return;
      case "literal":
        return;
      default:
        return;
    }
  }

  private report(node: { readonly location: { readonly line: number; readonly column: number } }, keyword: string, message: string): void {
    this.diagnostics.push({ line: node.location.line, column: node.location.column, keyword, message });
  }
}
