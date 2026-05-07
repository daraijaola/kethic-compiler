import {
  ButtonNode,
  ActionNode,
  ComponentNode,
  ComponentUseNode,
  HeadingNode,
  MountNode,
  PageNode,
  StateNode,
  StateUpdateNode,
  StyleBlockNode,
  StyleDeclarationNode,
  TextNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebTopLevelNode,
  WebValue,
  WebExpression,
} from "./ast";
import { WebDiagnostic } from "./diagnostics";

const SUPPORTED_STYLE_ATTRIBUTES: ReadonlySet<string> = new Set<string>([
  "Savarin",
  "Ovsa",
  "Shevsa",
  "Mirlu",
  "Kellu",
  "Natorkar",
  "Mireshel",
]);

/**
 * WebTypeChecker validates semantic web rules before output generation.
 */
export class WebTypeChecker {
  private readonly diagnostics: WebDiagnostic[] = [];
  private readonly pages: Map<string, PageNode> = new Map<string, PageNode>();
  private readonly components: Map<string, ComponentNode> = new Map<string, ComponentNode>();
  private readonly states: Map<string, StateNode> = new Map<string, StateNode>();
  private readonly actions: Map<string, ActionNode> = new Map<string, ActionNode>();

  /**
   * check validates a web program and returns all diagnostics.
   */
  public check(program: WebProgramNode): readonly WebDiagnostic[] {
    this.diagnostics.length = 0;
    this.pages.clear();
    this.components.clear();
    this.states.clear();
    this.actions.clear();

    for (const node of program.body) {
      if (node.kind === WebNodeKind.Component) {
        this.registerComponent(node);
      }

      if (node.kind === WebNodeKind.State) {
        this.registerState(node);
      }

      if (node.kind === WebNodeKind.Action) {
        this.registerAction(node);
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
      case WebNodeKind.StyleBlock:
        this.checkStyleBlock(node);
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
    if (this.pages.has(node.name)) {
      this.report(node, "Torvathar", `page "${node.name}" is already declared`);
      return;
    }

    this.pages.set(node.name, node);
    this.checkChildren(node.children, null);
  }

  private registerComponent(node: ComponentNode): void {
    if (this.components.has(node.name)) {
      this.report(node, "Selthar", `component "${node.name}" is already declared`);
      return;
    }

    this.components.set(node.name, node);
  }

  private registerState(node: StateNode): void {
    if (this.states.has(node.name)) {
      this.report(node, "Lumva", `state "${node.name}" is already declared`);
      return;
    }

    this.states.set(node.name, node);
  }

  private registerAction(node: ActionNode): void {
    if (this.actions.has(node.name)) {
      this.report(node, "Umrin", `action "${node.name}" is already declared`);
      return;
    }

    this.actions.set(node.name, node);
  }

  private checkComponent(node: ComponentNode): void {
    const seenParameters: Set<string> = new Set<string>();

    for (const parameter of node.parameters) {
      if (seenParameters.has(parameter)) {
        this.report(node, "Selthar", `parameter "${parameter}" is duplicated`);
      }

      seenParameters.add(parameter);
    }

    this.checkChildren(node.children, node);
  }

  private checkMount(node: MountNode): void {
    if (!node.selector.startsWith("#")) {
      this.report(node, "Umvator", "mount target must be an id selector such as \"#app\"");
    }

    if (!this.pages.has(node.pageName)) {
      this.report(node, "Umvator", `page "${node.pageName}" does not exist`);
    }
  }

  private checkState(node: StateNode): void {
    this.checkExpression(node.initialValue, node, "Lumva");
  }

  private checkAction(node: ActionNode): void {
    if (node.updates.length === 0) {
      this.report(node, "Umrin", `action "${node.name}" has no state updates`);
    }

    for (const update of node.updates) {
      this.checkStateUpdate(update);
    }
  }

  private checkStateUpdate(node: StateUpdateNode): void {
    if (!this.states.has(node.stateName)) {
      this.report(node, "Umrin", `state "${node.stateName}" does not exist`);
    }

    this.checkExpression(node.value, node, "Umrin");
  }

  private checkStyleBlock(node: StyleBlockNode): void {
    if (node.declarations.length === 0) {
      this.report(node, "Tharsel", `style block "${node.target}" has no declarations`);
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

      if (child.kind === WebNodeKind.Heading) {
        this.checkHeading(child, currentComponent);
      }

      if (child.kind === WebNodeKind.Text) {
        this.checkText(child, currentComponent);
      }

      if (child.kind === WebNodeKind.ComponentUse) {
        this.checkComponentUse(child);
      }

      if ("children" in child) {
        this.checkChildren(child.children, currentComponent);
      }
    }
  }

  private checkHeading(node: HeadingNode, currentComponent: ComponentNode | null): void {
    if (node.value.value.trim().length === 0) {
      this.report(node, "Keltor", "heading text cannot be empty");
    }

    this.checkValueReference(node, "Keltor", node.value, currentComponent);
  }

  private checkText(node: TextNode, currentComponent: ComponentNode | null): void {
    this.checkValueReference(node, "Kelen", node.value, currentComponent);
    if (node.value.kind === "literal") {
      for (const stateName of this.extractInterpolatedStateNames(node.value.value)) {
        if (!this.states.has(stateName)) {
          this.report(node, "Kelen", `state "${stateName}" does not exist`);
        }
      }
    }
  }

  private checkButton(node: ButtonNode): void {
    const hasText: boolean = node.children.some((child: WebChildNode) => child.kind === WebNodeKind.Text);
    if (!hasText) {
      this.report(node, "Umkar", "button must contain Kelen text in Web Phase 2");
    }

    if (node.action !== null && !this.actions.has(node.action)) {
      this.report(node, "Umkar", `action "${node.action}" does not exist`);
    }
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
