import {
  ButtonNode,
  HeadingNode,
  MountNode,
  PageNode,
  StyleBlockNode,
  StyleDeclarationNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebTopLevelNode,
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

  /**
   * check validates a web program and returns all diagnostics.
   */
  public check(program: WebProgramNode): readonly WebDiagnostic[] {
    this.diagnostics.length = 0;
    this.pages.clear();

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
    this.checkChildren(node.children);
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
      this.report(node, node.name, `unsupported Web Phase 1 style attribute "${node.name}"`);
    }
  }

  private checkChildren(children: readonly WebChildNode[]): void {
    for (const child of children) {
      if (child.kind === WebNodeKind.Button) {
        this.checkButton(child);
      }

      if (child.kind === WebNodeKind.Heading) {
        this.checkHeading(child);
      }

      if ("children" in child) {
        this.checkChildren(child.children);
      }
    }
  }

  private checkHeading(node: HeadingNode): void {
    if (node.value.trim().length === 0) {
      this.report(node, "Keltor", "heading text cannot be empty");
    }
  }

  private checkButton(node: ButtonNode): void {
    const hasText: boolean = node.children.some((child: WebChildNode) => child.kind === WebNodeKind.Text);
    if (!hasText) {
      this.report(node, "Umkar", "button must contain Kelen text in Web Phase 1");
    }
  }

  private report(node: { readonly location: { readonly line: number; readonly column: number } }, keyword: string, message: string): void {
    this.diagnostics.push({ line: node.location.line, column: node.location.column, keyword, message });
  }
}

