import {
  ButtonNode,
  ActionNode,
  ComponentNode,
  ComponentUseNode,
  ConditionalNode,
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
 * OpenBlock tracks nested Kethic web blocks until a closing end appears.
 */
type OpenBlock =
  | {
      readonly mode: "children";
      readonly node:
        | PageNode
        | SectionNode
        | ContainerNode
        | ButtonNode
        | ConditionalNode
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
 * WebParser parses Kethic Core and Compact web source.
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
      this.report(open.node.location, open.node.kind, "block was not closed with end");
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
      if (line === "end") {
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

    if (line === "end") {
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

    if (line.startsWith("page ")) {
      this.openContainerBlock(this.parseCompactPage(this.aliasKeyword(line, "page", "pg"), location));
      return;
    }

    if (line.startsWith("cmp ")) {
      this.openContainerBlock(this.parseCompactComponent(line, location));
      return;
    }

    if (line.startsWith("component ")) {
      this.openContainerBlock(this.parseCompactComponent(this.aliasKeyword(line, "component", "cmp"), location));
      return;
    }

    if (line.startsWith("sec ")) {
      this.openContainerBlock(this.parseCompactSection(line, location));
      return;
    }

    if (line.startsWith("section ")) {
      this.openContainerBlock(this.parseCompactSection(this.aliasKeyword(line, "section", "sec"), location));
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

    if (line === "footer") {
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

    if (line.startsWith("stack ")) {
      this.openContainerBlock(this.parseCompactLayoutContainer(line, location, "stack"));
      return;
    }

    if (line.startsWith("row ")) {
      this.openContainerBlock(this.parseCompactLayoutContainer(line, location, "row"));
      return;
    }

    if (line.startsWith("grid ")) {
      this.openContainerBlock(this.parseCompactLayoutContainer(line, location, "grid"));
      return;
    }

    if (line.startsWith("center ")) {
      this.openContainerBlock(this.parseCompactLayoutContainer(line, location, "center"));
      return;
    }

    if (line.startsWith("btn ")) {
      this.addChild(this.parseCompactButton(line, location));
      return;
    }

    if (line.startsWith("button ")) {
      this.addChild(this.parseCompactButton(this.aliasKeyword(line, "button", "btn"), location));
      return;
    }

    if (line.startsWith("show ")) {
      this.openContainerBlock(this.parseCompactConditional(line, location));
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

    if (line.startsWith("input ")) {
      this.addChild(this.parseCompactInput(this.aliasKeyword(line, "input", "in"), location));
      return;
    }

    if (line.startsWith("area ")) {
      this.addChild(this.parseCompactTextarea(line, location));
      return;
    }

    if (line.startsWith("textarea ")) {
      this.addChild(this.parseCompactTextarea(this.aliasKeyword(line, "textarea", "area"), location));
      return;
    }

    if (line.startsWith("msg ")) {
      this.addChild(this.parseCompactValidationMessage(line, location));
      return;
    }

    if (line.startsWith("message ")) {
      this.addChild(this.parseCompactValidationMessage(this.aliasKeyword(line, "message", "msg"), location));
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

    if (line.startsWith("state ")) {
      this.addTopLevel(this.parseCompactState(this.aliasKeyword(line, "state", "st"), location));
      return;
    }

    if (line.startsWith("act ")) {
      this.stack.push({ mode: "action", node: this.parseCompactAction(line, location), updates: [] });
      return;
    }

    if (line.startsWith("action ")) {
      this.stack.push({ mode: "action", node: this.parseCompactAction(this.aliasKeyword(line, "action", "act"), location), updates: [] });
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

    if (line.startsWith("text ")) {
      this.addChild(this.parseCompactText(this.aliasKeyword(line, "text", "txt"), location));
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

    if (line.startsWith("route ")) {
      this.addTopLevel(this.parseCompactRoute(this.aliasKeyword(line, "route", "rt"), location));
      return;
    }

    if (line.startsWith("style ")) {
      this.stack.push({ mode: "style", node: this.parseCompactStyleBlock(line, location), declarations: [] });
      return;
    }

    if (line.startsWith("when ")) {
      this.stack.push({ mode: "style", node: this.parseCompactResponsiveStyleBlock(line, location), declarations: [] });
      return;
    }

    if (this.isInsideActionBlock() && line.startsWith("set ")) {
      this.addStateUpdate(this.parseCompactStateUpdate(line, location));
      return;
    }

    if (this.isInsideStyleBlock()) {
      this.addStyleDeclaration(this.parseStyleDeclaration(line, location));
      return;
    }

    this.report(location, "WebParser", `unsupported Kethic web syntax "${line}"`);
  }

  /**
   * openContainerBlock starts a node that may hold renderable child nodes.
   */
  private openContainerBlock(
    node:
      | PageNode
      | SectionNode
      | ContainerNode
      | ButtonNode
      | ConditionalNode
      | NavigationNode
      | FooterNode
      | FormNode
      | ComponentNode
      | ComponentUseNode,
  ): void {
    this.stack.push({ mode: "children", node, children: [] });
  }

  /**
   * closeBlock seals the current block and attaches it to its parent.
   */
  private closeBlock(location: WebSourceLocation): void {
    const open: OpenBlock | undefined = this.stack.pop();

    if (open === undefined) {
      this.report(location, "end", "closing word has no open web block");
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

    const closedNode:
      | PageNode
      | SectionNode
      | ContainerNode
      | ButtonNode
      | ConditionalNode
      | NavigationNode
      | FooterNode
      | FormNode
      | ComponentNode
      | ComponentUseNode = {
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
    const match: RegExpMatchArray | null = line.match(
      /^hero\s+"([^"]+)"\s+"([^"]+)"(?:\s+(?:btn|action):([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)")?$/,
    );
    if (match === null) {
      this.report(location, "hero", 'expected hero "Title" "Subtitle" or hero "Title" "Subtitle" action:name "Label"');
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
        disabledWhen: null,
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
      formChildren.push({ kind: WebNodeKind.Input, location, name: fieldName, label, required: true, binding: null });
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
      disabledWhen: null,
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
   * addStyleDeclaration attaches one declaration to the current style block.
   */
  private addStyleDeclaration(node: StyleDeclarationNode): void {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];

    if (open === undefined || open.mode !== "style") {
      this.report(node.location, node.name, "style declaration must appear inside style");
      return;
    }

    open.declarations.push(node);
  }

  private addStateUpdate(node: StateUpdateNode): void {
    const open: OpenBlock | undefined = this.stack[this.stack.length - 1];

    if (open === undefined || open.mode !== "action") {
      this.report(node.location, "action", "state update must appear inside action");
      return;
    }

    open.updates.push(node);
  }

  private parseCompactPage(line: string, location: WebSourceLocation): PageNode {
    return { kind: WebNodeKind.Page, location, name: this.requiredName(line, "pg", location), children: [] };
  }

  private parseCompactSection(line: string, location: WebSourceLocation): SectionNode {
    return { kind: WebNodeKind.Section, location, name: this.requiredName(line, "sec", location), children: [] };
  }

  private parseCompactNavigation(line: string, location: WebSourceLocation): NavigationNode {
    return { kind: WebNodeKind.Navigation, location, name: this.requiredName(line, "nav", location), children: [] };
  }

  private parseFooter(location: WebSourceLocation): FooterNode {
    return { kind: WebNodeKind.Footer, location, children: [] };
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

  private parseCompactContainer(line: string, location: WebSourceLocation): ContainerNode {
    return { kind: WebNodeKind.Container, location, name: this.requiredName(line, "box", location), children: [] };
  }

  private parseCompactLayoutContainer(line: string, location: WebSourceLocation, layout: "stack" | "row" | "grid" | "center"): ContainerNode {
    return { kind: WebNodeKind.Container, location, name: this.requiredName(line, layout, location), layout, children: [] };
  }

  private parseCompactForm(line: string, location: WebSourceLocation): FormNode {
    return { kind: WebNodeKind.Form, location, name: this.requiredName(line, "form", location), children: [] };
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

  private parseCompactStyleBlock(line: string, location: WebSourceLocation): StyleBlockNode {
    return {
      kind: WebNodeKind.StyleBlock,
      location,
      target: this.requiredName(line, "style", location),
      declarations: [],
    };
  }

  private parseCompactResponsiveStyleBlock(line: string, location: WebSourceLocation): StyleBlockNode {
    const match: RegExpMatchArray | null = line.match(/^when\s+([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (match === null) {
      this.report(location, "when", "expected when mobile Target");
      return { kind: WebNodeKind.StyleBlock, location, target: "", responsive: "mobile", declarations: [] };
    }

    return {
      kind: WebNodeKind.StyleBlock,
      location,
      target: match[2],
      responsive: this.normalizeResponsiveKind(match[1], location, "when"),
      declarations: [],
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

  private parseCompactAction(line: string, location: WebSourceLocation): ActionNode {
    return { kind: WebNodeKind.Action, location, name: this.requiredName(line, "act", location), updates: [] };
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

  private parseCompactButton(line: string, location: WebSourceLocation): ButtonNode {
    const match: RegExpMatchArray | null = line.match(
      /^btn(?:\s+([A-Za-z_][A-Za-z0-9_]*))?\s+"([^"]+)"(?:\s+disabled:([A-Za-z_][A-Za-z0-9_]*))?$/,
    );
    if (match === null) {
      this.report(location, "btn", 'expected btn "Label", btn actionName "Label", or btn actionName "Label" disabled:state');
      return { kind: WebNodeKind.Button, location, action: null, disabledWhen: null, children: [] };
    }

    return {
      kind: WebNodeKind.Button,
      location,
      action: match[1] ?? null,
      disabledWhen: match[3] ?? null,
      children: [{ kind: WebNodeKind.Text, location, value: { kind: "literal", value: match[2] } }],
    };
  }

  private parseCompactConditional(line: string, location: WebSourceLocation): ConditionalNode {
    return { kind: WebNodeKind.Conditional, location, stateName: this.requiredName(line, "show", location), children: [] };
  }

  private parseCompactInput(line: string, location: WebSourceLocation): InputNode {
    const match: RegExpMatchArray | null = line.match(
      /^in\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)"(?:\s+(?:!|required))?(?:\s+bind:([A-Za-z_][A-Za-z0-9_]*))?$/,
    );
    if (match === null) {
      this.report(location, "in", 'expected in name "Label" ! bind:state');
      return { kind: WebNodeKind.Input, location, name: "", label: "", required: false, binding: null };
    }

    return {
      kind: WebNodeKind.Input,
      location,
      name: match[1],
      label: match[2],
      required: /\s(?:!|required)(?:\s|$)/.test(line),
      binding: match[3] ?? null,
    };
  }

  private parseCompactTextarea(line: string, location: WebSourceLocation): TextareaNode {
    const match: RegExpMatchArray | null = line.match(
      /^area\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]+)"(?:\s+rows:(\d+))?(?:\s+(?:!|required))?(?:\s+bind:([A-Za-z_][A-Za-z0-9_]*))?$/,
    );
    if (match === null) {
      this.report(location, "area", 'expected area name "Label" rows:5 ! bind:state');
      return { kind: WebNodeKind.Textarea, location, name: "", label: "", rows: 4, required: false, binding: null };
    }

    return {
      kind: WebNodeKind.Textarea,
      location,
      name: match[1],
      label: match[2],
      rows: match[3] === undefined ? 4 : Number(match[3]),
      required: /\s(?:!|required)(?:\s|$)/.test(line),
      binding: match[4] ?? null,
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

  private parseCompactSlot(line: string, location: WebSourceLocation): SlotNode {
    return { kind: WebNodeKind.Slot, location, name: this.requiredName(line, "slot", location) };
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

  private parseCompactText(line: string, location: WebSourceLocation): TextNode {
    return {
      kind: WebNodeKind.Text,
      location,
      value: this.parseContentValue(line.slice("txt ".length).trim(), location, "txt"),
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
      this.report(location, "style", `expected style declaration, received "${line}"`);
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
      ["pad", "pad"],
      ["margin", "margin"],
      ["gap", "gap"],
      ["width", "width"],
      ["height", "height"],
      ["minwidth", "minWidth"],
      ["maxwidth", "maxWidth"],
      ["background", "background"],
      ["color", "color"],
      ["font", "font"],
      ["weight", "weight"],
      ["line", "line"],
      ["aligntext", "alignText"],
      ["border", "border"],
      ["bordercolor", "borderColor"],
      ["borderwidth", "borderWidth"],
      ["radius", "radius"],
      ["shadow", "shadow"],
      ["opacity", "opacity"],
      ["overflow", "overflow"],
      ["z", "z"],
      ["position", "position"],
      ["inset", "inset"],
      ["display", "display"],
      ["align", "align"],
      ["justify", "justify"],
      ["wrap", "wrap"],
      ["container", "container"],
      ["ratio", "ratio"],
    ]);

    return aliases.get(name.toLowerCase()) ?? `__unsupported_${name}`;
  }

  private aliasKeyword(line: string, from: string, to: string): string {
    return `${to}${line.slice(from.length)}`;
  }

  private normalizeResponsiveKind(name: string, location: WebSourceLocation, keyword: string): "mobile" | "tablet" | "desktop" {
    const normalized: string = name.toLowerCase();
    const aliases: ReadonlyMap<string, "mobile" | "tablet" | "desktop"> = new Map<string, "mobile" | "tablet" | "desktop">([
      ["mobile", "mobile"],
      ["tablet", "tablet"],
      ["desktop", "desktop"],
    ]);
    const responsive: "mobile" | "tablet" | "desktop" | undefined = aliases.get(normalized);

    if (responsive === undefined) {
      this.report(location, keyword, `unsupported responsive breakpoint "${name}"`);
      return "mobile";
    }

    return responsive;
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
