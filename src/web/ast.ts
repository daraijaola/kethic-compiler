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
  Button = "Button",
  Form = "Form",
  Input = "Input",
  Textarea = "Textarea",
  ValidationMessage = "ValidationMessage",
  Component = "Component",
  ComponentUse = "ComponentUse",
  Slot = "Slot",
  StyleBlock = "StyleBlock",
  StyleDeclaration = "StyleDeclaration",
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
export type WebTopLevelNode = PageNode | ComponentNode | StyleBlockNode | MountNode | StateNode | ActionNode;

/**
 * WebChildNode lists nodes that can render inside page/component content.
 */
export type WebChildNode =
  | SectionNode
  | ContainerNode
  | TextNode
  | HeadingNode
  | ButtonNode
  | FormNode
  | InputNode
  | TextareaNode
  | ValidationMessageNode
  | ComponentUseNode
  | SlotNode;

/**
 * WebValue stores either literal text or a reference to a component parameter.
 */
export interface WebValue {
  readonly kind: "literal" | "reference";
  readonly value: string;
}

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
 * PageNode represents Torvathar, the page/document root.
 */
export interface PageNode extends WebNode {
  readonly kind: WebNodeKind.Page;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * SectionNode represents Shevva, a semantic page region.
 */
export interface SectionNode extends WebNode {
  readonly kind: WebNodeKind.Section;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * ContainerNode represents Vakar, a neutral layout vessel.
 */
export interface ContainerNode extends WebNode {
  readonly kind: WebNodeKind.Container;
  readonly name: string;
  readonly children: readonly WebChildNode[];
}

/**
 * TextNode represents Kelen, a paragraph or inline text offering.
 */
export interface TextNode extends WebNode {
  readonly kind: WebNodeKind.Text;
  readonly value: WebValue;
}

/**
 * HeadingNode represents Keltor, a semantic heading.
 */
export interface HeadingNode extends WebNode {
  readonly kind: WebNodeKind.Heading;
  readonly level: number;
  readonly value: WebValue;
}

/**
 * ButtonNode represents Umkar, an action trigger.
 */
export interface ButtonNode extends WebNode {
  readonly kind: WebNodeKind.Button;
  readonly action: string | null;
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
 * InputNode represents Enva, a single-line answer vessel.
 */
export interface InputNode extends WebNode {
  readonly kind: WebNodeKind.Input;
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
}

/**
 * TextareaNode represents Kelrinva, a long speech-carrying vessel.
 */
export interface TextareaNode extends WebNode {
  readonly kind: WebNodeKind.Textarea;
  readonly name: string;
  readonly label: string;
  readonly rows: number;
  readonly required: boolean;
}

/**
 * ValidationMessageNode represents Ikhen, a test-answer for a field.
 */
export interface ValidationMessageNode extends WebNode {
  readonly kind: WebNodeKind.ValidationMessage;
  readonly fieldName: string;
  readonly message: string;
}

/**
 * ComponentNode represents Selthar, a sealed reusable interface pattern.
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
 * SlotNode represents Umva, a content opening inside a component.
 */
export interface SlotNode extends WebNode {
  readonly kind: WebNodeKind.Slot;
  readonly name: string;
}

/**
 * StyleBlockNode represents Tharsel, a sealed style block.
 */
export interface StyleBlockNode extends WebNode {
  readonly kind: WebNodeKind.StyleBlock;
  readonly target: string;
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
 * MountNode represents Umvator, the render target for a page.
 */
export interface MountNode extends WebNode {
  readonly kind: WebNodeKind.Mount;
  readonly selector: string;
  readonly pageName: string;
}

/**
 * StateNode represents Lumva, reactive UI state.
 */
export interface StateNode extends WebNode {
  readonly kind: WebNodeKind.State;
  readonly name: string;
  readonly initialValue: WebExpression;
}

/**
 * ActionNode represents Umrin, an event handler that updates Lumva state.
 */
export interface ActionNode extends WebNode {
  readonly kind: WebNodeKind.Action;
  readonly name: string;
  readonly updates: readonly StateUpdateNode[];
}

/**
 * StateUpdateNode represents one state update inside Umrin.
 */
export interface StateUpdateNode extends WebNode {
  readonly kind: WebNodeKind.StateUpdate;
  readonly stateName: string;
  readonly value: WebExpression;
}
