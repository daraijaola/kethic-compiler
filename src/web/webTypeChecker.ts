import {
  ButtonNode,
  ComponentNode,
  ComponentUseNode,
  HeadingNode,
  MountNode,
  PageNode,
  StyleBlockNode,
  StyleDeclarationNode,
  TextNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebTopLevelNode,
  WebValue,
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

  /**
   * check validates a web program and returns all diagnostics.
   */
  public check(program: WebProgramNode): readonly WebDiagnostic[] {
    this.diagnostics.length = 0;
    this.pages.clear();
    this.components.clear();

    for (const node of program.body) {
      if (node.kind === WebNodeKind.Component) {
        this.registerComponent(node);
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
  }

  private checkButton(node: ButtonNode): void {
    const hasText: boolean = node.children.some((child: WebChildNode) => child.kind === WebNodeKind.Text);
    if (!hasText) {
      this.report(node, "Umkar", "button must contain Kelen text in Web Phase 2");
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

  private report(node: { readonly location: { readonly line: number; readonly column: number } }, keyword: string, message: string): void {
    this.diagnostics.push({ line: node.location.line, column: node.location.column, keyword, message });
  }
}
