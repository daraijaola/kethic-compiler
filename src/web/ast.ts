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
  Component = "Component",
  ComponentUse = "ComponentUse",
  Slot = "Slot",
  StyleBlock = "StyleBlock",
  StyleDeclaration = "StyleDeclaration",
  Mount = "Mount",
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
export type WebTopLevelNode = PageNode | ComponentNode | StyleBlockNode | MountNode;

/**
 * WebChildNode lists nodes that can render inside page/component content.
 */
export type WebChildNode = SectionNode | ContainerNode | TextNode | HeadingNode | ButtonNode | ComponentUseNode | SlotNode;

/**
 * WebValue stores either literal text or a reference to a component parameter.
 */
export interface WebValue {
  readonly kind: "literal" | "reference";
  readonly value: string;
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
