/**
 * WebNodeKind names every node in the first Kethic Native web AST.
 */
export enum WebNodeKind {
  Program = "Program",
  Page = "Page",
  Section = "Section",
  Container = "Container",
  Text = "Text",
  Heading = "Heading",
  Link = "Link",
  Button = "Button",
  Conditional = "Conditional",
  Navigation = "Navigation",
  Footer = "Footer",
  Form = "Form",
  Input = "Input",
  Textarea = "Textarea",
  ValidationMessage = "ValidationMessage",
  Component = "Component",
  ComponentUse = "ComponentUse",
  Repeat = "Repeat",
  Data = "Data",
  DataItem = "DataItem",
  Slot = "Slot",
  StyleBlock = "StyleBlock",
  StyleDeclaration = "StyleDeclaration",
  Route = "Route",
  Mount = "Mount",
  State = "State",
  Action = "Action",
  StateUpdate = "StateUpdate",
}

/**
 * SourceLocation keeps diagnostics tied to original Kethic source lines.
 */
export interface WebSourceLocation {
  readonly line: number;
  readonly column: number;
}

/**
 * WebNode is the base shape for all web AST nodes.
 */
export interface WebNode {
  readonly kind: WebNodeKind;
  readonly location: WebSourceLocation;
}

/**
 * WebProgramNode is the full parsed web file.
 */
export interface WebProgramNode extends WebNode {
  readonly kind: WebNodeKind.Program;
  readonly body: readonly WebTopLevelNode[];
}

/**
 * WebTopLevelNode lists declarations allowed at the top level.
 */
export type WebTopLevelNode = PageNode | ComponentNode | StyleBlockNode | RouteNode | MountNode | StateNode | ActionNode | DataNode;

/**
 * WebChildNode lists nodes that can render inside page/component content.
 */
export type WebChildNode =
  | SectionNode
  | ContainerNode
  | TextNode
  | HeadingNode
  | LinkNode
  | ButtonNode
  | ConditionalNode
  | NavigationNode
  | FooterNode
  | FormNode
  | InputNode
  | TextareaNode
  | ValidationMessageNode
  | ComponentUseNode
  | RepeatNode
  | SlotNode;

/**
 * WebValue stores either literal text or a reference to a component parameter.
 */
export interface WebValue {
  readonly kind: "literal" | "reference";
  readonly value: string;
}

/**
 * WebLayoutKind marks built-in layout vessels.
 */
export type WebLayoutKind = "stack" | "row" | "grid" | "center";

/**
 * WebResponsiveKind names the first responsive breakpoints.
 */
export type WebResponsiveKind = "mobile" | "tablet" | "desktop";

/**
 * WebSectionRole gives the compiler design context without verbose source.
 */
export type WebSectionRole = "hero" | "features" | "proof" | "pricing" | "faq" | "cta" | "content";

/**
 * WebExpression is the small expression model used by Web Phase 3 runtime actions.
 */
export type WebExpression = LiteralExpression | IdentifierExpression | UnaryExpression | BinaryExpression;

export interface LiteralExpression {
  readonly kind: "literal";
  readonly value: string | number | boolean;
}

export interface IdentifierExpression {
  readonly kind: "identifier";
  readonly name: string;
}

export interface UnaryExpression {
  readonly kind: "unary";
  readonly operator: "not";
  readonly argument: WebExpression;
}

export interface BinaryExpression {
  readonly kind: "binary";
  readonly operator: "plus" | "minus";
  readonly left: WebExpression;
  readonly right: WebExpression;
}

/**
 * PageNode represents the page/document root.
 */
export interface PageNode extends WebNode {
  readonly kind: WebNodeKind.Page;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * SectionNode represents a semantic page region.
 */
export interface SectionNode extends WebNode {
  readonly kind: WebNodeKind.Section;
  readonly name: string;
  readonly role?: WebSectionRole;
  readonly children: readonly WebChildNode[];
}

/**
 * ContainerNode represents a neutral layout container.
 */
export interface ContainerNode extends WebNode {
  readonly kind: WebNodeKind.Container;
  readonly name: string;
  readonly layout?: WebLayoutKind;
  readonly children: readonly WebChildNode[];
}

/**
 * TextNode represents paragraph or inline text.
 */
export interface TextNode extends WebNode {
  readonly kind: WebNodeKind.Text;
  readonly value: WebValue;
}

/**
 * HeadingNode represents a semantic heading.
 */
export interface HeadingNode extends WebNode {
  readonly kind: WebNodeKind.Heading;
  readonly level: number;
  readonly value: WebValue;
}

/**
 * LinkNode represents a safe path across an interface boundary.
 */
export interface LinkNode extends WebNode {
  readonly kind: WebNodeKind.Link;
  readonly target: string;
  readonly label: string;
}

/**
 * ButtonNode represents an action trigger.
 */
export interface ButtonNode extends WebNode {
  readonly kind: WebNodeKind.Button;
  readonly action: string | null;
  readonly disabledWhen: string | null;
  readonly children: readonly WebChildNode[];
}

/**
 * ConditionalNode represents a visibility gate driven by state.
 */
export interface ConditionalNode extends WebNode {
  readonly kind: WebNodeKind.Conditional;
  readonly stateName: string;
  readonly children: readonly WebChildNode[];
}

/**
 * NavigationNode represents Rukshev, repeated paths through the page or app.
 */
export interface NavigationNode extends WebNode {
  readonly kind: WebNodeKind.Navigation;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * FooterNode represents the page edge/footer.
 */
export interface FooterNode extends WebNode {
  readonly kind: WebNodeKind.Footer;
  readonly children: readonly WebChildNode[];
}

/**
 * FormNode represents Selvathar, a sealed petition vessel.
 */
export interface FormNode extends WebNode {
  readonly kind: WebNodeKind.Form;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * InputNode represents a single-line field.
 */
export interface InputNode extends WebNode {
  readonly kind: WebNodeKind.Input;
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly binding: string | null;
}

/**
 * TextareaNode represents a long text field.
 */
export interface TextareaNode extends WebNode {
  readonly kind: WebNodeKind.Textarea;
  readonly name: string;
  readonly label: string;
  readonly rows: number;
  readonly required: boolean;
  readonly binding: string | null;
}

/**
 * ValidationMessageNode represents validation/help text for a field.
 */
export interface ValidationMessageNode extends WebNode {
  readonly kind: WebNodeKind.ValidationMessage;
  readonly fieldName: string;
  readonly message: string;
}

/**
 * ComponentNode represents a reusable interface pattern.
 */
export interface ComponentNode extends WebNode {
  readonly kind: WebNodeKind.Component;
  readonly name: string;
  readonly parameters: readonly string[];
  readonly children: readonly WebChildNode[];
}

/**
 * ComponentUseNode represents Umkel, awakening a sealed component pattern.
 */
export interface ComponentUseNode extends WebNode {
  readonly kind: WebNodeKind.ComponentUse;
  readonly name: string;
  readonly arguments: readonly WebValue[];
  readonly children: readonly WebChildNode[];
}

/**
 * RepeatNode renders one component for every row in a data block.
 */
export interface RepeatNode extends WebNode {
  readonly kind: WebNodeKind.Repeat;
  readonly componentName: string;
  readonly dataName: string;
}

/**
 * DataNode stores compact reusable content rows for repeaters.
 */
export interface DataNode extends WebNode {
  readonly kind: WebNodeKind.Data;
  readonly name: string;
  readonly sourcePath?: string;
  readonly items: readonly DataItemNode[];
}

/**
 * DataItemNode stores one row of values used by a repeater.
 */
export interface DataItemNode extends WebNode {
  readonly kind: WebNodeKind.DataItem;
  readonly values: readonly WebValue[];
}

/**
 * SlotNode represents Umva, a content opening inside a component.
 */
export interface SlotNode extends WebNode {
  readonly kind: WebNodeKind.Slot;
  readonly name: string;
}

/**
 * StyleBlockNode represents a style block.
 */
export interface StyleBlockNode extends WebNode {
  readonly kind: WebNodeKind.StyleBlock;
  readonly target: string;
  readonly responsive?: WebResponsiveKind;
  readonly declarations: readonly StyleDeclarationNode[];
}

/**
 * StyleDeclarationNode stores one Kethic style attribute and its token value.
 */
export interface StyleDeclarationNode extends WebNode {
  readonly kind: WebNodeKind.StyleDeclaration;
  readonly name: string;
  readonly value: string;
}

/**
 * RouteNode represents a declared route/path to a page region.
 */
export interface RouteNode extends WebNode {
  readonly kind: WebNodeKind.Route;
  readonly path: string;
  readonly target: string;
}

/**
 * MountNode represents the render target for a page.
 */
export interface MountNode extends WebNode {
  readonly kind: WebNodeKind.Mount;
  readonly selector: string;
  readonly pageName: string;
}

/**
 * StateNode represents reactive UI state.
 */
export interface StateNode extends WebNode {
  readonly kind: WebNodeKind.State;
  readonly name: string;
  readonly initialValue: WebExpression;
}

/**
 * ActionNode represents an event handler that updates state.
 */
export interface ActionNode extends WebNode {
  readonly kind: WebNodeKind.Action;
  readonly name: string;
  readonly updates: readonly StateUpdateNode[];
}

/**
 * StateUpdateNode represents one state update inside an action.
 */
export interface StateUpdateNode extends WebNode {
  readonly kind: WebNodeKind.StateUpdate;
  readonly stateName: string;
  readonly value: WebExpression;
}
