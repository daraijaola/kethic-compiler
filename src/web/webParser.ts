import {
  ButtonNode,
  ActionNode,
  ComponentNode,
  ComponentUseNode,
  ContainerNode,
  FooterNode,
  FormNode,
  StateNode,
  StateUpdateNode,
  WebExpression,
  HeadingNode,
  InputNode,
  LinkNode,
  NavigationNode,
  PageNode,
  RouteNode,
  SectionNode,
  SlotNode,
  StyleBlockNode,
  StyleDeclarationNode,
  TextNode,
  TextareaNode,
  ValidationMessageNode,
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
      readonly node:
        | PageNode
        | SectionNode
        | ContainerNode
        | ButtonNode
        | NavigationNode
        | FooterNode
        | FormNode
        | ComponentNode
        | ComponentUseNode;
      readonly children: WebChildNode[];
    }
  | { readonly mode: "style"; readonly node: StyleBlockNode; readonly declarations: StyleDeclarationNode[] }
  | { readonly mode: "action"; readonly node: ActionNode; readonly updates: StateUpdateNode[] };

/**
 * WebParser parses the first static Kethic Native web slice.
 */
export class WebParser {
  private readonly diagnostics: WebDiagnostic[] = [];
  private readonly body: WebTopLevelNode[] = [];
  private readonly stack: OpenBlock[] = [];
  private pendingFeatures: { readonly location: WebSourceLocation; readonly items: string[] } | null = null;

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

    if (this.pendingFeatures !== null) {
      this.report(this.pendingFeatures.location, "features", "features block was not closed with end");
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
    const location: WebSourceLocation = { line: lineNumber, column: 1 };

    if (this.pendingFeatures !== null) {
      if (line === "Tor" || line === "end") {
        this.finishFeaturesMacro();
        return;
      }

      if (line.length === 0 || line.startsWith("#")) {
        return;
      }

      this.addFeatureMacroItem(line, location);
      return;
    }

    if (line.length === 0 || line.startsWith("#")) {
      return;
    }

    if (line === "Tor" || line === "end") {
      this.closeBlock(location);
      return;
    }

    if (line.startsWith("hero ")) {
      this.addChild(this.parseHeroMacro(line, location));
      return;
    }

    if (line.startsWith("signup ")) {
      this.addChild(this.parseSignupMacro(line, location));
      return;
    }

    if (line === "features") {
      this.pendingFeatures = { location, items: [] };
      return;
    }

    if (line.startsWith("pg ")) {
      this.openContainerBlock(this.parseCompactPage(line, location));
      return;
    }

    if (line.startsWith("cmp ")) {
      this.openContainerBlock(this.parseCompactComponent(line, location));
      return;
    }

    if (line.startsWith("sec ")) {
      this.openContainerBlock(this.parseCompactSection(line, location));
      return;
    }

    if (line.startsWith("nav ")) {
      this.openContainerBlock(this.parseCompactNavigation(line, location));
      return;
    }

    if (line === "foot") {
      this.openContainerBlock(this.parseFooter(location));
      return;
    }

    if (line.startsWith("link ")) {
      this.addChild(this.parseCompactLink(line, location));
      return;
    }

    if (line.startsWith("box ")) {
      this.openContainerBlock(this.parseCompactContainer(line, location));
      return;
    }

    if (line.startsWith("btn ")) {
      this.addChild(this.parseCompactButton(line, location));
      return;
    }

    if (line.startsWith("form ")) {
      this.openContainerBlock(this.parseCompactForm(line, location));
      return;
    }

    if (line.startsWith("in ")) {
      this.addChild(this.parseCompactInput(line, location));
      return;
    }

    if (line.startsWith("area ")) {
      this.addChild(this.parseCompactTextarea(line, location));
      return;
    }

    if (line.startsWith("msg ")) {
      this.addChild(this.parseCompactValidationMessage(line, location));
      return;
    }

    if (line.startsWith("use ")) {
      this.openContainerBlock(this.parseCompactComponentUse(line, location));
      return;
    }

    if (line.startsWith("slot ")) {
      this.addChild(this.parseCompactSlot(line, location));
      return;
    }

    if (line.startsWith("st ")) {
      this.addTopLevel(this.parseCompactState(line, location));
      return;
    }

    if (line.startsWith("act ")) {
      this.stack.push({ mode: "action", node: this.parseCompactAction(line, location), updates: [] });
      return;
    }

    if (line.startsWith("h") && /^h[1-6]\s+/.test(line)) {
      this.addChild(this.parseCompactHeading(line, location));
      return;
    }

    if (line.startsWith("txt ")) {
      this.addChild(this.parseCompactText(line, location));
      return;
    }

    if (line.startsWith("mount ")) {
      this.addTopLevel(this.parseCompactMount(line, location));
      return;
    }

    if (line.startsWith("rt ")) {
      this.addTopLevel(this.parseCompactRoute(line, location));
      return;
    }

    if (line.startsWith("style ")) {
      this.stack.push({ mode: "style", node: this.parseCompactStyleBlock(line, location), declarations: [] });
      return;
    }

    if (this.isInsideActionBlock() && line.startsWith("set ")) {
      this.addStateUpdate(this.parseCompactStateUpdate(line, location));
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

    if (line.startsWith("Rukshev ")) {
      this.openContainerBlock(this.parseNavigation(line, location));
      return;
    }

    if (line === "Durkel") {
      this.openContainerBlock(this.parseFooter(location));
      return;
    }

    if (line.startsWith("Ovshev ")) {
      this.addChild(this.parseLink(line, location));
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

    if (line.startsWith("Selvathar ")) {
      this.openContainerBlock(this.parseForm(line, location));
      return;
    }

    if (line.startsWith("Enva ")) {
      this.addChild(this.parseInput(line, location));
      return;
    }

    if (line.startsWith("Kelrinva ")) {
      this.addChild(this.parseTextarea(line, location));
      return;
    }

    if (line.startsWith("Ikhen ")) {
      this.addChild(this.parseValidationMessage(line, location));
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

    if (line.startsWith("Lumva ")) {
      this.addTopLevel(this.parseState(line, location));
      return;
    }

    if (line.startsWith("Umrin ")) {
      this.stack.push({ mode: "action", node: this.parseAction(line, location), updates: [] });
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

    if (line.startsWith("Rinshev ")) {
      this.addTopLevel(this.parseRoute(line, location));
      return;
    }

    if (this.isInsideStyleBlock()) {
      this.addStyleDeclaration(this.parseStyleDeclaration(line, location));
      return;
    }

    if (this.isInsideActionBlock()) {
      this.addStateUpdate(this.parseStateUpdate(line, location));
      return;
    }

    this.report(location, "WebParser", `unsupported Native web syntax "${line}"`);
  }

  /**
   * openContainerBlock starts a node that may hold renderable child nodes.
   */
  private openContainerBlock(
    node: PageNode | SectionNode | ContainerNode | ButtonNode | NavigationNode | FooterNode | FormNode | ComponentNode | ComponentUseNode,
  ): void {
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

    if (open.mode === "action") {
      this.addTopLevel({ ...open.node, updates: open.updates });
      return;
    }

    const closedNode: PageNode | SectionNode | ContainerNode | ButtonNode | NavigationNode | FooterNode | FormNode | ComponentNode | ComponentUseNode = {
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

  private parseHeroMacro(line: string, location: WebSourceLocation): SectionNode {
    const match: RegExpMatchArray | null = line.match(/^hero\s+"([^"]+)"\s+"([^"]+)"(?:\s+btn:([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)")?$/);
    if (match === null) {
      this.report(location, "hero", 'expected hero "Title" "Subtitle" or hero "Title" "Subtitle" btn:action "Label"');
      return { kind: WebNodeKind.Section, location, name: "Hero", children: [] };
    }

    const children: WebChildNode[] = [
      { kind: WebNodeKind.Heading, location, level: 1, value: { kind: "literal", value: match[1] } },
      { kind: WebNodeKind.Text, location, value: { kind: "literal", value: match[2] } },
    ];

    if (match[3] !== undefined && match[4] !== undefined) {
      children.push({
        kind: WebNodeKind.Button,
        location,
        action: match[3],
        children: [{ kind: WebNodeKind.Text, location, value: { kind: "literal", value: match[4] } }],
      });
    }

    return { kind: WebNodeKind.Section, location, name: "Hero", children };
  }

  private parseSignupMacro(line: string, location: WebSourceLocation): SectionNode {
    const match: RegExpMatchArray | null = line.match(/^signup\s+(.+?)\s+submit:"([^"]+)"$/);
    if (match === null) {
      this.report(location, "signup", 'expected signup name email submit:"Join"');
      return { kind: WebNodeKind.Section, location, name: "Signup", children: [] };
    }

    const fieldNames: string[] = match[1].split(/\s+/).filter((name: string) => name.length > 0);
    const formChildren: WebChildNode[] = [];

    for (const fieldName of fieldNames) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fieldName)) {
        this.report(location, "signup", `invalid field name "${fieldName}"`);
        continue;
      }

      const label: string = this.labelFromName(fieldName);
      formChildren.push({ kind: WebNodeKind.Input, location, name: fieldName, label, required: true });
      formChildren.push({
        kind: WebNodeKind.ValidationMessage,
        location,
        fieldName,
        message: `Enter your ${label.toLowerCase()}.`,
      });
    }

    formChildren.push({
      kind: WebNodeKind.Button,
      location,
      action: null,
      children: [{ kind: WebNodeKind.Text, location, value: { kind: "literal", value: match[2] } }],
    });

    return {
      kind: WebNodeKind.Section,
      location,
      name: "Signup",
      children: [{ kind: WebNodeKind.Form, location, name: "Signup", children: formChildren }],
    };
  }

  private addFeatureMacroItem(line: string, location: WebSourceLocation): void {
    const value: string = this.parseValue(line, location, "features");
    if (value.length === 0) {
      return;
    }

    this.pendingFeatures = {
      location: this.pendingFeatures?.location ?? location,
      items: [...(this.pendingFeatures?.items ?? []), value],
    };
  }

  private finishFeaturesMacro(): void {
    if (this.pendingFeatures === null) {
      return;
    }

    const location: WebSourceLocation = this.pendingFeatures.location;
    const children: WebChildNode[] = [
      { kind: WebNodeKind.Heading, location, level: 2, value: { kind: "literal", value: "Features" } },
      ...this.pendingFeatures.items.map((item: string, index: number): ContainerNode => ({
        kind: WebNodeKind.Container,
        location,
        name: `Feature${index + 1}`,
        children: [{ kind: WebNodeKind.Heading, location, level: 3, value: { kind: "literal", value: item } }],
      })),
    ];

    this.pendingFeatures = null;
    this.addChild({ kind: WebNodeKind.Section, location, name: "Features", children });
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

  private addStateUpdate(node: StateUpdateNode): void {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];

    if (open === undefined || open.mode !== "action") {
      this.report(node.location, "Umrin", "state update must appear inside Umrin");
      return;
    }

    open.updates.push(node);
  }

  private parsePage(line: string, location: WebSourceLocation): PageNode {
    return { kind: WebNodeKind.Page, location, name: this.requiredName(line, "Torvathar", location), children: [] };
  }

  private parseCompactPage(line: string, location: WebSourceLocation): PageNode {
    return { kind: WebNodeKind.Page, location, name: this.requiredName(line, "pg", location), children: [] };
  }

  private parseSection(line: string, location: WebSourceLocation): SectionNode {
    return { kind: WebNodeKind.Section, location, name: this.requiredName(line, "Shevva", location), children: [] };
  }

  private parseCompactSection(line: string, location: WebSourceLocation): SectionNode {
    return { kind: WebNodeKind.Section, location, name: this.requiredName(line, "sec", location), children: [] };
  }

  private parseNavigation(line: string, location: WebSourceLocation): NavigationNode {
    return { kind: WebNodeKind.Navigation, location, name: this.requiredName(line, "Rukshev", location), children: [] };
  }

  private parseCompactNavigation(line: string, location: WebSourceLocation): NavigationNode {
    return { kind: WebNodeKind.Navigation, location, name: this.requiredName(line, "nav", location), children: [] };
  }

  private parseFooter(location: WebSourceLocation): FooterNode {
    return { kind: WebNodeKind.Footer, location, children: [] };
  }

  private parseLink(line: string, location: WebSourceLocation): LinkNode {
    const match: RegExpMatchArray | null = line.match(/^Ovshev\s+to:(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s+(.+)$/);
    if (match === null) {
      this.report(location, "Ovshev", 'expected Ovshev to:RouteName "Label" or Ovshev to:"#path" "Label"');
      return { kind: WebNodeKind.Link, location, target: "", label: "" };
    }

    return {
      kind: WebNodeKind.Link,
      location,
      target: match[1] ?? match[2],
      label: this.parseValue(match[3], location, "Ovshev"),
    };
  }

  private parseCompactLink(line: string, location: WebSourceLocation): LinkNode {
    const match: RegExpMatchArray | null = line.match(/^link\s+(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s+"([^"]+)"$/);
    if (match === null) {
      this.report(location, "link", 'expected link Target "Label" or link "#path" "Label"');
      return { kind: WebNodeKind.Link, location, target: "", label: "" };
    }

    return {
      kind: WebNodeKind.Link,
      location,
      target: match[1] ?? match[2],
      label: match[3],
    };
  }

  private parseContainer(line: string, location: WebSourceLocation): ContainerNode {
    return { kind: WebNodeKind.Container, location, name: this.requiredName(line, "Vakar", location), children: [] };
  }

  private parseCompactContainer(line: string, location: WebSourceLocation): ContainerNode {
    return { kind: WebNodeKind.Container, location, name: this.requiredName(line, "box", location), children: [] };
  }

  private parseForm(line: string, location: WebSourceLocation): FormNode {
    return { kind: WebNodeKind.Form, location, name: this.requiredName(line, "Selvathar", location), children: [] };
  }

  private parseCompactForm(line: string, location: WebSourceLocation): FormNode {
    return { kind: WebNodeKind.Form, location, name: this.requiredName(line, "form", location), children: [] };
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

  private parseCompactComponent(line: string, location: WebSourceLocation): ComponentNode {
    const match: RegExpMatchArray | null = line.match(/^cmp\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+receives\s+(.+))?$/);
    if (match === null) {
      this.report(location, "cmp", "expected cmp Name or cmp Name receives prop, other");
      return { kind: WebNodeKind.Component, location, name: "", parameters: [], children: [] };
    }

    return {
      kind: WebNodeKind.Component,
      location,
      name: match[1],
      parameters: match[2] === undefined ? [] : this.parseNameList(match[2], location, "cmp"),
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

  private parseCompactStyleBlock(line: string, location: WebSourceLocation): StyleBlockNode {
    return {
      kind: WebNodeKind.StyleBlock,
      location,
      target: this.requiredName(line, "style", location),
      declarations: [],
    };
  }

  private parseState(line: string, location: WebSourceLocation): StateNode {
    const match: RegExpMatchArray | null = line.match(/^Lumva\s+([A-Za-z_][A-Za-z0-9_]*)\s+holds\s+(.+)$/);
    if (match === null) {
      this.report(location, "Lumva", "expected Lumva name holds value");
      return { kind: WebNodeKind.State, location, name: "", initialValue: { kind: "literal", value: false } };
    }

    return {
      kind: WebNodeKind.State,
      location,
      name: match[1],
      initialValue: this.parseExpression(match[2], location, "Lumva"),
    };
  }

  private parseCompactState(line: string, location: WebSourceLocation): StateNode {
    const match: RegExpMatchArray | null = line.match(/^st\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (match === null) {
      this.report(location, "st", "expected st name = value");
      return { kind: WebNodeKind.State, location, name: "", initialValue: { kind: "literal", value: false } };
    }

    return {
      kind: WebNodeKind.State,
      location,
      name: match[1],
      initialValue: this.parseExpression(match[2], location, "st"),
    };
  }

  private parseAction(line: string, location: WebSourceLocation): ActionNode {
    return { kind: WebNodeKind.Action, location, name: this.requiredName(line, "Umrin", location), updates: [] };
  }

  private parseCompactAction(line: string, location: WebSourceLocation): ActionNode {
    return { kind: WebNodeKind.Action, location, name: this.requiredName(line, "act", location), updates: [] };
  }

  private parseStateUpdate(line: string, location: WebSourceLocation): StateUpdateNode {
    const match: RegExpMatchArray | null = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+holds\s+(.+)$/);
    if (match === null) {
      this.report(location, "Umrin", "expected stateName holds expression");
      return { kind: WebNodeKind.StateUpdate, location, stateName: "", value: { kind: "literal", value: false } };
    }

    return {
      kind: WebNodeKind.StateUpdate,
      location,
      stateName: match[1],
      value: this.parseExpression(match[2], location, "Umrin"),
    };
  }

  private parseCompactStateUpdate(line: string, location: WebSourceLocation): StateUpdateNode {
    const match: RegExpMatchArray | null = line.match(/^set\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (match === null) {
      this.report(location, "set", "expected set stateName = expression");
      return { kind: WebNodeKind.StateUpdate, location, stateName: "", value: { kind: "literal", value: false } };
    }

    return {
      kind: WebNodeKind.StateUpdate,
      location,
      stateName: match[1],
      value: this.parseExpression(match[2], location, "set"),
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

  private parseCompactButton(line: string, location: WebSourceLocation): ButtonNode {
    const match: RegExpMatchArray | null = line.match(/^btn(?:\s+([A-Za-z_][A-Za-z0-9_]*))?\s+"([^"]+)"$/);
    if (match === null) {
      this.report(location, "btn", 'expected btn "Label" or btn actionName "Label"');
      return { kind: WebNodeKind.Button, location, action: null, children: [] };
    }

    return {
      kind: WebNodeKind.Button,
      location,
      action: match[1] ?? null,
      children: [{ kind: WebNodeKind.Text, location, value: { kind: "literal", value: match[2] } }],
    };
  }

  private parseInput(line: string, location: WebSourceLocation): InputNode {
    const match: RegExpMatchArray | null = line.match(/^Enva\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+label:"([^"]+)")?(\s+Torikh)?$/);
    if (match === null) {
      this.report(location, "Enva", 'expected Enva name label:"Label" or Enva name label:"Label" Torikh');
      return { kind: WebNodeKind.Input, location, name: "", label: "", required: false };
    }

    return {
      kind: WebNodeKind.Input,
      location,
      name: match[1],
      label: match[2] ?? "",
      required: match[3] !== undefined,
    };
  }

  private parseCompactInput(line: string, location: WebSourceLocation): InputNode {
    const match: RegExpMatchArray | null = line.match(/^in\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)"(?:\s+!)?$/);
    if (match === null) {
      this.report(location, "in", 'expected in name "Label" or in name "Label" !');
      return { kind: WebNodeKind.Input, location, name: "", label: "", required: false };
    }

    return {
      kind: WebNodeKind.Input,
      location,
      name: match[1],
      label: match[2],
      required: line.endsWith(" !"),
    };
  }

  private parseTextarea(line: string, location: WebSourceLocation): TextareaNode {
    const match: RegExpMatchArray | null = line.match(
      /^Kelrinva\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+label:"([^"]+)")?(?:\s+rows:(\d+))?(\s+Torikh)?$/,
    );
    if (match === null) {
      this.report(location, "Kelrinva", 'expected Kelrinva name label:"Label" rows:6 or Kelrinva name label:"Label" rows:6 Torikh');
      return { kind: WebNodeKind.Textarea, location, name: "", label: "", rows: 4, required: false };
    }

    return {
      kind: WebNodeKind.Textarea,
      location,
      name: match[1],
      label: match[2] ?? "",
      rows: match[3] === undefined ? 4 : Number(match[3]),
      required: match[4] !== undefined,
    };
  }

  private parseCompactTextarea(line: string, location: WebSourceLocation): TextareaNode {
    const match: RegExpMatchArray | null = line.match(/^area\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)"(?:\s+rows:(\d+))?(?:\s+!)?$/);
    if (match === null) {
      this.report(location, "area", 'expected area name "Label" rows:5 !');
      return { kind: WebNodeKind.Textarea, location, name: "", label: "", rows: 4, required: false };
    }

    return {
      kind: WebNodeKind.Textarea,
      location,
      name: match[1],
      label: match[2],
      rows: match[3] === undefined ? 4 : Number(match[3]),
      required: line.endsWith(" !"),
    };
  }

  private parseValidationMessage(line: string, location: WebSourceLocation): ValidationMessageNode {
    const match: RegExpMatchArray | null = line.match(/^Ikhen\s+for:([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
    if (match === null) {
      this.report(location, "Ikhen", 'expected Ikhen for:fieldName "Message"');
      return { kind: WebNodeKind.ValidationMessage, location, fieldName: "", message: "" };
    }

    return {
      kind: WebNodeKind.ValidationMessage,
      location,
      fieldName: match[1],
      message: this.parseValue(match[2], location, "Ikhen"),
    };
  }

  private parseCompactValidationMessage(line: string, location: WebSourceLocation): ValidationMessageNode {
    const match: RegExpMatchArray | null = line.match(/^msg\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)"$/);
    if (match === null) {
      this.report(location, "msg", 'expected msg fieldName "Message"');
      return { kind: WebNodeKind.ValidationMessage, location, fieldName: "", message: "" };
    }

    return {
      kind: WebNodeKind.ValidationMessage,
      location,
      fieldName: match[1],
      message: match[2],
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

  private parseCompactComponentUse(line: string, location: WebSourceLocation): ComponentUseNode {
    const match: RegExpMatchArray | null = line.match(/^use\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+(.+))?$/);
    if (match === null) {
      this.report(location, "use", 'expected use ComponentName or use ComponentName "value", "other"');
      return { kind: WebNodeKind.ComponentUse, location, name: "", arguments: [], children: [] };
    }

    return {
      kind: WebNodeKind.ComponentUse,
      location,
      name: match[1],
      arguments: match[2] === undefined ? [] : this.parseValueList(match[2], location, "use"),
      children: [],
    };
  }

  private parseSlot(line: string, location: WebSourceLocation): SlotNode {
    return { kind: WebNodeKind.Slot, location, name: this.requiredName(line, "Umva", location) };
  }

  private parseCompactSlot(line: string, location: WebSourceLocation): SlotNode {
    return { kind: WebNodeKind.Slot, location, name: this.requiredName(line, "slot", location) };
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

  private parseCompactHeading(line: string, location: WebSourceLocation): HeadingNode {
    const match: RegExpMatchArray | null = line.match(/^h([1-6])\s+(.+)$/);
    if (match === null) {
      this.report(location, "h", 'expected h1 "Text"');
      return { kind: WebNodeKind.Heading, location, level: 1, value: { kind: "literal", value: "" } };
    }

    return {
      kind: WebNodeKind.Heading,
      location,
      level: Number(match[1]),
      value: this.parseContentValue(match[2], location, "h"),
    };
  }

  private parseText(line: string, location: WebSourceLocation): TextNode {
    return {
      kind: WebNodeKind.Text,
      location,
      value: this.parseContentValue(line.slice("Kelen ".length).trim(), location, "Kelen"),
    };
  }

  private parseCompactText(line: string, location: WebSourceLocation): TextNode {
    return {
      kind: WebNodeKind.Text,
      location,
      value: this.parseContentValue(line.slice("txt ".length).trim(), location, "txt"),
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

  private parseCompactMount(line: string, location: WebSourceLocation): WebTopLevelNode {
    const match: RegExpMatchArray | null = line.match(/^mount\s+(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (match === null) {
      this.report(location, "mount", 'expected mount "#app" PageName');
      return { kind: WebNodeKind.Mount, location, selector: "#app", pageName: "" };
    }

    return {
      kind: WebNodeKind.Mount,
      location,
      selector: this.parseValue(match[1], location, "mount"),
      pageName: match[2],
    };
  }

  private parseRoute(line: string, location: WebSourceLocation): RouteNode {
    const match: RegExpMatchArray | null = line.match(/^Rinshev\s+"([^"]+)"\s+receives\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (match === null) {
      this.report(location, "Rinshev", 'expected Rinshev "#path" receives SectionName');
      return { kind: WebNodeKind.Route, location, path: "", target: "" };
    }

    return {
      kind: WebNodeKind.Route,
      location,
      path: match[1],
      target: match[2],
    };
  }

  private parseCompactRoute(line: string, location: WebSourceLocation): RouteNode {
    const match: RegExpMatchArray | null = line.match(/^rt\s+"([^"]+)"\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (match === null) {
      this.report(location, "rt", 'expected rt "#path" SectionName');
      return { kind: WebNodeKind.Route, location, path: "", target: "" };
    }

    return {
      kind: WebNodeKind.Route,
      location,
      path: match[1],
      target: match[2],
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
      name: this.normalizeStyleName(match[1]),
      value: this.parseValue(match[2], location, match[1]),
    };
  }

  private normalizeStyleName(name: string): string {
    const aliases: ReadonlyMap<string, string> = new Map<string, string>([
      ["sarin", "Sarin"],
      ["savarin", "Savarin"],
      ["ovsa", "Ovsa"],
      ["shevsa", "Shevsa"],
      ["vator", "Vator"],
      ["torkar", "Torkar"],
      ["naktor", "Naktor"],
      ["tornak", "Tornak"],
      ["lusel", "Lusel"],
      ["mirlu", "Mirlu"],
      ["kellu", "Kellu"],
      ["kelsa", "Kelsa"],
      ["keltorva", "Keltorva"],
      ["kelruksa", "Kelruksa"],
      ["kelshev", "Kelshev"],
      ["torkarva", "Torkarva"],
      ["torlu", "Torlu"],
      ["torsa", "Torsa"],
      ["natorkar", "Natorkar"],
      ["mireshel", "Mireshel"],
      ["luna", "Luna"],
      ["vashev", "Vashev"],
      ["torshev", "Torshev"],
      ["torrin", "Torrin"],
      ["rintor", "Rintor"],
      ["karum", "Karum"],
    ]);

    return aliases.get(name.toLowerCase()) ?? name;
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

  private labelFromName(name: string): string {
    return name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (first: string) => first.toUpperCase());
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

  private parseExpression(raw: string, location: WebSourceLocation, keyword: string): WebExpression {
    const value: string = raw.trim();

    if (value.startsWith("not ")) {
      return { kind: "unary", operator: "not", argument: this.parseExpression(value.slice("not ".length), location, keyword) };
    }

    const plusIndex: number = value.indexOf(" plus ");
    if (plusIndex >= 0) {
      return {
        kind: "binary",
        operator: "plus",
        left: this.parseExpression(value.slice(0, plusIndex), location, keyword),
        right: this.parseExpression(value.slice(plusIndex + " plus ".length), location, keyword),
      };
    }

    const minusIndex: number = value.indexOf(" minus ");
    if (minusIndex >= 0) {
      return {
        kind: "binary",
        operator: "minus",
        left: this.parseExpression(value.slice(0, minusIndex), location, keyword),
        right: this.parseExpression(value.slice(minusIndex + " minus ".length), location, keyword),
      };
    }

    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      return { kind: "literal", value: value.slice(1, -1) };
    }

    if (value === "true") {
      return { kind: "literal", value: true };
    }

    if (value === "false") {
      return { kind: "literal", value: false };
    }

    if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      return { kind: "literal", value: Number(value) };
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
      return { kind: "identifier", name: value };
    }

    this.report(location, keyword, `unsupported web expression "${value}"`);
    return { kind: "literal", value: false };
  }

  private isInsideStyleBlock(): boolean {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];
    return open !== undefined && open.mode === "style";
  }

  private isInsideActionBlock(): boolean {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];
    return open !== undefined && open.mode === "action";
  }

  private report(location: WebSourceLocation, keyword: string, message: string): void {
    this.diagnostics.push({ line: location.line, column: location.column, keyword, message });
  }
}
