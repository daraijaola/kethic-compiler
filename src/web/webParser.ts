import {
  ButtonNode,
  ComponentNode,
  ComponentUseNode,
  ContainerNode,
  HeadingNode,
  PageNode,
  SectionNode,
  SlotNode,
  StyleBlockNode,
  StyleDeclarationNode,
  TextNode,
  WebChildNode,
  WebNodeKind,
  WebProgramNode,
  WebSourceLocation,
  WebTopLevelNode,
  WebValue,
} from "./ast";
import { WebCompilerError, WebDiagnostic } from "./diagnostics";

/**
 * OpenBlock tracks nested Native web blocks until a closing Tor appears.
 */
type OpenBlock =
  | {
      readonly mode: "children";
      readonly node: PageNode | SectionNode | ContainerNode | ButtonNode | ComponentNode | ComponentUseNode;
      readonly children: WebChildNode[];
    }
  | { readonly mode: "style"; readonly node: StyleBlockNode; readonly declarations: StyleDeclarationNode[] };

/**
 * WebParser parses the first static Kethic Native web slice.
 */
export class WebParser {
  private readonly diagnostics: WebDiagnostic[] = [];
  private readonly body: WebTopLevelNode[] = [];
  private readonly stack: OpenBlock[] = [];

  public constructor(private readonly source: string) {}

  /**
   * parse converts line-oriented Native web source into a Web AST.
   */
  public parse(): WebProgramNode {
    const lines: string[] = this.source.replace(/\r\n/g, "\n").split("\n");

    for (let index: number = 0; index < lines.length; index += 1) {
      this.parseLine(lines[index].trim(), index + 1);
    }

    if (this.stack.length > 0) {
      const open: OpenBlock = this.stack[this.stack.length - 1];
      this.report(open.node.location, open.node.kind, "block was not closed with Tor");
    }

    if (this.diagnostics.length > 0) {
      throw new WebCompilerError(this.diagnostics);
    }

    return {
      kind: WebNodeKind.Program,
      location: { line: 1, column: 1 },
      body: this.body,
    };
  }

  /**
   * parseLine dispatches one non-empty source line by keyword.
   */
  private parseLine(line: string, lineNumber: number): void {
    if (line.length === 0 || line.startsWith("#")) {
      return;
    }

    const location: WebSourceLocation = { line: lineNumber, column: 1 };

    if (line === "Tor") {
      this.closeBlock(location);
      return;
    }

    if (line.startsWith("Torvathar ")) {
      this.openContainerBlock(this.parsePage(line, location));
      return;
    }

    if (line.startsWith("Selthar ")) {
      this.openContainerBlock(this.parseComponent(line, location));
      return;
    }

    if (line.startsWith("Shevva ")) {
      this.openContainerBlock(this.parseSection(line, location));
      return;
    }

    if (line.startsWith("Vakar ")) {
      this.openContainerBlock(this.parseContainer(line, location));
      return;
    }

    if (line.startsWith("Umkar")) {
      this.openContainerBlock(this.parseButton(line, location));
      return;
    }

    if (line.startsWith("Umkel ")) {
      this.openContainerBlock(this.parseComponentUse(line, location));
      return;
    }

    if (line.startsWith("Umva ")) {
      this.addChild(this.parseSlot(line, location));
      return;
    }

    if (line.startsWith("Tharsel ")) {
      this.stack.push({ mode: "style", node: this.parseStyleBlock(line, location), declarations: [] });
      return;
    }

    if (line.startsWith("Keltor ")) {
      this.addChild(this.parseHeading(line, location));
      return;
    }

    if (line.startsWith("Kelen ")) {
      this.addChild(this.parseText(line, location));
      return;
    }

    if (line.startsWith("Umvator ")) {
      this.addTopLevel(this.parseMount(line, location));
      return;
    }

    if (this.isInsideStyleBlock()) {
      this.addStyleDeclaration(this.parseStyleDeclaration(line, location));
      return;
    }

    this.report(location, "WebParser", `unsupported Native web syntax "${line}"`);
  }

  /**
   * openContainerBlock starts a node that may hold renderable child nodes.
   */
  private openContainerBlock(node: PageNode | SectionNode | ContainerNode | ButtonNode | ComponentNode | ComponentUseNode): void {
    this.stack.push({ mode: "children", node, children: [] });
  }

  /**
   * closeBlock seals the current block and attaches it to its parent.
   */
  private closeBlock(location: WebSourceLocation): void {
    const open: OpenBlock | undefined = this.stack.pop();

    if (open === undefined) {
      this.report(location, "Tor", "closing word has no open web block");
      return;
    }

    if (open.mode === "style") {
      this.addTopLevel({ ...open.node, declarations: open.declarations });
      return;
    }

    const closedNode: PageNode | SectionNode | ContainerNode | ButtonNode | ComponentNode | ComponentUseNode = {
      ...open.node,
      children: open.children,
    };

    if (closedNode.kind === WebNodeKind.Page || closedNode.kind === WebNodeKind.Component) {
      this.addTopLevel(closedNode);
      return;
    }

    this.addChild(closedNode);
  }

  /**
   * addTopLevel attaches a node to the program body.
   */
  private addTopLevel(node: WebTopLevelNode): void {
    if (this.stack.length > 0) {
      this.report(node.location, node.kind, "top-level declaration cannot appear inside another web block");
      return;
    }

    this.body.push(node);
  }

  /**
   * addChild attaches renderable nodes to the nearest open render block.
   */
  private addChild(node: WebChildNode): void {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];

    if (open === undefined || open.mode !== "children") {
      this.report(node.location, node.kind, "render node must appear inside a page, section, container, or button");
      return;
    }

    open.children.push(node);
  }

  /**
   * addStyleDeclaration attaches one declaration to the current Tharsel block.
   */
  private addStyleDeclaration(node: StyleDeclarationNode): void {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];

    if (open === undefined || open.mode !== "style") {
      this.report(node.location, node.name, "style declaration must appear inside Tharsel");
      return;
    }

    open.declarations.push(node);
  }

  private parsePage(line: string, location: WebSourceLocation): PageNode {
    return { kind: WebNodeKind.Page, location, name: this.requiredName(line, "Torvathar", location), children: [] };
  }

  private parseSection(line: string, location: WebSourceLocation): SectionNode {
    return { kind: WebNodeKind.Section, location, name: this.requiredName(line, "Shevva", location), children: [] };
  }

  private parseContainer(line: string, location: WebSourceLocation): ContainerNode {
    return { kind: WebNodeKind.Container, location, name: this.requiredName(line, "Vakar", location), children: [] };
  }

  private parseComponent(line: string, location: WebSourceLocation): ComponentNode {
    const match: RegExpMatchArray | null = line.match(/^Selthar\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+receives\s+(.+))?$/);
    if (match === null) {
      this.report(location, "Selthar", "expected Selthar Name or Selthar Name receives prop, other");
      return { kind: WebNodeKind.Component, location, name: "", parameters: [], children: [] };
    }

    return {
      kind: WebNodeKind.Component,
      location,
      name: match[1],
      parameters: match[2] === undefined ? [] : this.parseNameList(match[2], location, "Selthar"),
      children: [],
    };
  }

  private parseStyleBlock(line: string, location: WebSourceLocation): StyleBlockNode {
    return {
      kind: WebNodeKind.StyleBlock,
      location,
      target: this.requiredName(line, "Tharsel", location),
      declarations: [],
    };
  }

  private parseButton(line: string, location: WebSourceLocation): ButtonNode {
    const actionMatch: RegExpMatchArray | null = line.match(/^Umkar(?:\s+action:([A-Za-z_][A-Za-z0-9_]*))?$/);
    if (actionMatch === null) {
      this.report(location, "Umkar", 'expected Umkar or Umkar action:name');
    }

    return {
      kind: WebNodeKind.Button,
      location,
      action: actionMatch?.[1] ?? null,
      children: [],
    };
  }

  private parseComponentUse(line: string, location: WebSourceLocation): ComponentUseNode {
    const match: RegExpMatchArray | null = line.match(/^Umkel\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+with\s+(.+))?$/);
    if (match === null) {
      this.report(location, "Umkel", "expected Umkel ComponentName or Umkel ComponentName with value, other");
      return { kind: WebNodeKind.ComponentUse, location, name: "", arguments: [], children: [] };
    }

    return {
      kind: WebNodeKind.ComponentUse,
      location,
      name: match[1],
      arguments: match[2] === undefined ? [] : this.parseValueList(match[2], location, "Umkel"),
      children: [],
    };
  }

  private parseSlot(line: string, location: WebSourceLocation): SlotNode {
    return { kind: WebNodeKind.Slot, location, name: this.requiredName(line, "Umva", location) };
  }

  private parseHeading(line: string, location: WebSourceLocation): HeadingNode {
    const match: RegExpMatchArray | null = line.match(/^Keltor\s+level:([1-6])\s+(.+)$/);
    if (match === null) {
      this.report(location, "Keltor", 'expected Keltor level:1 "Text"');
      return { kind: WebNodeKind.Heading, location, level: 1, value: { kind: "literal", value: "" } };
    }

    return {
      kind: WebNodeKind.Heading,
      location,
      level: Number(match[1]),
      value: this.parseContentValue(match[2], location, "Keltor"),
    };
  }

  private parseText(line: string, location: WebSourceLocation): TextNode {
    return {
      kind: WebNodeKind.Text,
      location,
      value: this.parseContentValue(line.slice("Kelen ".length).trim(), location, "Kelen"),
    };
  }

  private parseMount(line: string, location: WebSourceLocation): WebTopLevelNode {
    const match: RegExpMatchArray | null = line.match(/^Umvator\s+(.+?)\s+receives\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (match === null) {
      this.report(location, "Umvator", 'expected Umvator "#app" receives PageName');
      return { kind: WebNodeKind.Mount, location, selector: "#app", pageName: "" };
    }

    return {
      kind: WebNodeKind.Mount,
      location,
      selector: this.parseValue(match[1], location, "Umvator"),
      pageName: match[2],
    };
  }

  private parseStyleDeclaration(line: string, location: WebSourceLocation): StyleDeclarationNode {
    const match: RegExpMatchArray | null = line.match(/^([A-Za-z][A-Za-z0-9]*)\s+(.+)$/);
    if (match === null) {
      this.report(location, "Tharsel", `expected style declaration, received "${line}"`);
      return { kind: WebNodeKind.StyleDeclaration, location, name: "", value: "" };
    }

    return {
      kind: WebNodeKind.StyleDeclaration,
      location,
      name: match[1],
      value: this.parseValue(match[2], location, match[1]),
    };
  }

  private parseNameList(raw: string, location: WebSourceLocation, keyword: string): string[] {
    return raw
      .split(",")
      .map((name: string) => name.trim())
      .filter((name: string) => {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
          this.report(location, keyword, `invalid name "${name}"`);
          return false;
        }

        return true;
      });
  }

  private parseValueList(raw: string, location: WebSourceLocation, keyword: string): WebValue[] {
    return raw.split(",").map((value: string) => this.parseContentValue(value, location, keyword));
  }

  private requiredName(line: string, keyword: string, location: WebSourceLocation): string {
    const name: string = line.slice(keyword.length).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      this.report(location, keyword, "expected a simple named vessel");
      return "";
    }

    return name;
  }

  private parseValue(raw: string, location: WebSourceLocation, keyword: string): string {
    const value: string = raw.trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      return value.slice(1, -1);
    }

    if (value.length === 0) {
      this.report(location, keyword, "expected a value");
    }

    return value;
  }

  private parseContentValue(raw: string, location: WebSourceLocation, keyword: string): WebValue {
    const value: string = raw.trim();

    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      return { kind: "literal", value: value.slice(1, -1) };
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
      return { kind: "reference", value };
    }

    if (value.length === 0) {
      this.report(location, keyword, "expected a value");
      return { kind: "literal", value: "" };
    }

    return { kind: "literal", value };
  }

  private isInsideStyleBlock(): boolean {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];
    return open !== undefined && open.mode === "style";
  }

  private report(location: WebSourceLocation, keyword: string, message: string): void {
    this.diagnostics.push({ line: location.line, column: location.column, keyword, message });
  }
}
