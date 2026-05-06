import { Token, TokenType } from "../lexer/tokens";

/**
 * SourceLocation stores the one-based source position of the token that began
 * an AST node. Later phases use it for precise diagnostics.
 */
export interface SourceLocation {
  readonly line: number;
  readonly column: number;
}

/**
 * BaseNode gives every AST node a discriminant and source location.
 */
export interface BaseNode {
  readonly kind: string;
  readonly location: SourceLocation;
}

/**
 * ProgramNode is the root of every parsed Kethic source file.
 */
export interface ProgramNode extends BaseNode {
  readonly kind: "Program";
  readonly body: StatementNode[];
}

/**
 * Navā declares a mutable change-vessel.
 */
export interface VariableDeclarationNode extends BaseNode {
  readonly kind: "VariableDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly typeAnnotation: TypeExpressionNode | null;
  readonly initializer: ExpressionNode | null;
}

/**
 * Torūn declares an immutable stone-oath.
 */
export interface ConstantDeclarationNode extends BaseNode {
  readonly kind: "ConstantDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly typeAnnotation: TypeExpressionNode | null;
  readonly initializer: ExpressionNode;
}

/**
 * Kelthar declares a named sleeping pattern.
 */
export interface FunctionDeclarationNode extends BaseNode {
  readonly kind: "FunctionDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly parameters: ParameterNode[];
  readonly body: BlockStatementNode;
}

/**
 * ParameterNode stores formal Kelthar parameter metadata.
 * Parameters may carry an optional type annotation, default value, or rest mark.
 */
export interface ParameterNode extends BaseNode {
  readonly kind: "Parameter";
  readonly name: Token;
  readonly typeAnnotation: TypeExpressionNode | null;
  readonly defaultValue: ExpressionNode | null;
  readonly isRest: boolean;
}

/**
 * Selkar declares a seal-shape with named fields.
 */
export interface TypeDefinitionNode extends BaseNode {
  readonly kind: "TypeDefinition";
  readonly keyword: Token;
  readonly name: Token;
  readonly fields: TypeFieldNode[];
}

/**
 * TypeFieldNode stores one field inside a Selkar definition.
 */
export interface TypeFieldNode extends BaseNode {
  readonly kind: "TypeField";
  readonly name: Token;
  readonly typeName: Token;
}

/**
 * UnionTypeDefinitionNode declares a named Shevkar forked shape.
 */
export interface UnionTypeDefinitionNode extends BaseNode {
  readonly kind: "UnionTypeDefinition";
  readonly keyword: Token;
  readonly name: Token;
  readonly typeExpression: TypeExpressionNode;
}

/**
 * TypeNameNode references a primitive or declared type by name.
 */
export interface TypeNameNode extends BaseNode {
  readonly kind: "TypeName";
  readonly name: Token;
}

/**
 * UnionTypeExpressionNode stores Type | Type annotations.
 */
export interface UnionTypeExpressionNode extends BaseNode {
  readonly kind: "UnionTypeExpression";
  readonly members: TypeExpressionNode[];
}

/**
 * OptionalTypeExpressionNode stores Umrava Type annotations.
 */
export interface OptionalTypeExpressionNode extends BaseNode {
  readonly kind: "OptionalTypeExpression";
  readonly keyword: Token;
  readonly innerType: TypeExpressionNode;
}

/**
 * TypeExpressionNode is every type-level expression currently supported.
 */
export type TypeExpressionNode = TypeNameNode | UnionTypeExpressionNode | OptionalTypeExpressionNode;

/**
 * Ovrin represents controlled crossing at a module boundary. If source is
 * present, the node is an import. If source is null, the node is an export.
 */
export interface OvrinDeclarationNode extends BaseNode {
  readonly kind: "OvrinDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly source: StringLiteralNode | null;
}

/**
 * BlockStatementNode groups zero or more statements between braces.
 */
export interface BlockStatementNode extends BaseNode {
  readonly kind: "BlockStatement";
  readonly body: StatementNode[];
}

/**
 * Umkel awakens a named pattern as a statement.
 */
export interface FunctionCallStatementNode extends BaseNode {
  readonly kind: "FunctionCallStatement";
  readonly keyword: Token;
  readonly callee: Token;
  readonly arguments: ExpressionNode[];
}

/**
 * Duren returns a homeward gift from the current function.
 */
export interface ReturnStatementNode extends BaseNode {
  readonly kind: "ReturnStatement";
  readonly keyword: Token;
  readonly value: ExpressionNode | null;
}

/**
 * Ikhshev chooses a path from an omen condition.
 */
export interface ConditionalStatementNode extends BaseNode {
  readonly kind: "ConditionalStatement";
  readonly keyword: Token;
  readonly condition: ExpressionNode;
  readonly thenBranch: BlockStatementNode;
  readonly elseBranch: ConditionalElseBranchNode | null;
}

/**
 * ConditionalElseBranchNode stores Shev branches as either an else block or an
 * else-if conditional.
 */
export type ConditionalElseBranchNode = BlockStatementNode | ConditionalStatementNode;

/**
 * Rukhar repeats a block while its condition remains true.
 */
export interface LoopStatementNode extends BaseNode {
  readonly kind: "LoopStatement";
  readonly keyword: Token;
  readonly condition: ExpressionNode;
  readonly body: BlockStatementNode;
}

/**
 * Ikhselthar examines one expression and routes control through Selikhshev
 * branches or an optional Ovikhnak default.
 */
export interface SwitchStatementNode extends BaseNode {
  readonly kind: "SwitchStatement";
  readonly keyword: Token;
  readonly expression: ExpressionNode;
  readonly cases: SwitchCaseNode[];
}

/**
 * SwitchCaseNode stores one Selikhshev branch or the Ovikhnak default branch.
 * A null matchValue marks the default branch.
 */
export interface SwitchCaseNode extends BaseNode {
  readonly kind: "SwitchCase";
  readonly keyword: Token;
  readonly matchValue: ExpressionNode | null;
  readonly body: BlockStatementNode;
}

/**
 * BreakStatementNode exits the nearest Rukhar loop.
 */
export interface BreakStatementNode extends BaseNode {
  readonly kind: "BreakStatement";
  readonly keyword: Token;
}

/**
 * ContinueStatementNode skips to the next turn of the nearest Rukhar loop.
 */
export interface ContinueStatementNode extends BaseNode {
  readonly kind: "ContinueStatement";
  readonly keyword: Token;
}

/**
 * Eshnak catches faults by pairing a guarded block with a recovery block.
 */
export interface ErrorHandlingStatementNode extends BaseNode {
  readonly kind: "ErrorHandlingStatement";
  readonly keyword: Token;
  readonly guardedBody: BlockStatementNode;
  readonly recoveryBody: BlockStatementNode;
}

/**
 * ExpressionStatementNode wraps a plain expression used as a statement.
 */
export interface ExpressionStatementNode extends BaseNode {
  readonly kind: "ExpressionStatement";
  readonly expression: ExpressionNode;
}

/**
 * IdentifierExpressionNode references a named vessel, pattern, or value.
 */
export interface IdentifierExpressionNode extends BaseNode {
  readonly kind: "IdentifierExpression";
  readonly name: Token;
}

/**
 * NumberLiteralNode stores a numeric literal exactly as written.
 */
export interface NumberLiteralNode extends BaseNode {
  readonly kind: "NumberLiteral";
  readonly token: Token;
  readonly value: number;
}

/**
 * StringLiteralNode stores a string literal without its wrapping quotes.
 */
export interface StringLiteralNode extends BaseNode {
  readonly kind: "StringLiteral";
  readonly token: Token;
  readonly value: string;
}

/**
 * NullLiteralNode stores Umra, the Kethic null value.
 */
export interface NullLiteralNode extends BaseNode {
  readonly kind: "NullLiteral";
  readonly keyword: Token;
  readonly value: null;
}

/**
 * ArrayLiteralNode stores comma-separated expressions inside brackets.
 */
export interface ArrayLiteralNode extends BaseNode {
  readonly kind: "ArrayLiteral";
  readonly openingBracket: Token;
  readonly elements: ExpressionNode[];
}

/**
 * ObjectLiteralNode stores anonymous key/value structures.
 */
export interface ObjectLiteralNode extends BaseNode {
  readonly kind: "ObjectLiteral";
  readonly openingBrace: Token;
  readonly properties: ObjectPropertyNode[];
}

/**
 * ObjectPropertyNode stores one object literal property.
 */
export interface ObjectPropertyNode extends BaseNode {
  readonly kind: "ObjectProperty";
  readonly key: Token;
  readonly value: ExpressionNode;
}

/**
 * MapLiteralNode stores Selva lookup archives with key/value entries.
 */
export interface MapLiteralNode extends BaseNode {
  readonly kind: "MapLiteral";
  readonly keyword: Token;
  readonly entries: MapEntryNode[];
}

/**
 * MapEntryNode stores one key/value pair inside a Selva literal.
 */
export interface MapEntryNode extends BaseNode {
  readonly kind: "MapEntry";
  readonly key: ExpressionNode;
  readonly value: ExpressionNode;
}

/**
 * FunctionExpressionNode stores anonymous function expressions introduced by
 * Tharva or expression-position Kelthar.
 */
export interface FunctionExpressionNode extends BaseNode {
  readonly kind: "FunctionExpression";
  readonly keyword: Token;
  readonly parameters: ParameterNode[];
  readonly body: BlockStatementNode;
}

/**
 * ArrowFunctionExpressionNode stores Rinthar functions with expression or block bodies.
 */
export interface ArrowFunctionExpressionNode extends BaseNode {
  readonly kind: "ArrowFunctionExpression";
  readonly keyword: Token;
  readonly parameters: ParameterNode[];
  readonly body: ExpressionNode | BlockStatementNode;
}

/**
 * TemplateStringNode stores backtick strings with alternating static and
 * expression interpolation segments.
 */
export interface TemplateStringNode extends BaseNode {
  readonly kind: "TemplateString";
  readonly token: Token;
  readonly parts: TemplateStringPartNode[];
}

/**
 * TemplateStringPartNode is one segment of a Kethic template string.
 */
export type TemplateStringPartNode = TemplateStaticPartNode | TemplateExpressionPartNode;

/**
 * TemplateStaticPartNode stores literal text inside a template string.
 */
export interface TemplateStaticPartNode extends BaseNode {
  readonly kind: "TemplateStaticPart";
  readonly value: string;
}

/**
 * TemplateExpressionPartNode stores an interpolated expression from { ... }.
 */
export interface TemplateExpressionPartNode extends BaseNode {
  readonly kind: "TemplateExpressionPart";
  readonly expression: ExpressionNode;
}

/**
 * BooleanLiteralNode stores the built-in true and false literals.
 */
export interface BooleanLiteralNode extends BaseNode {
  readonly kind: "BooleanLiteral";
  readonly token: Token;
  readonly value: boolean;
}

/**
 * UnaryExpressionNode stores prefix operators such as !value or -value.
 */
export interface UnaryExpressionNode extends BaseNode {
  readonly kind: "UnaryExpression";
  readonly operator: Token;
  readonly argument: ExpressionNode;
}

/**
 * BinaryExpressionNode stores infix operators such as a + b or a == b.
 */
export interface BinaryExpressionNode extends BaseNode {
  readonly kind: "BinaryExpression";
  readonly left: ExpressionNode;
  readonly operator: Token;
  readonly right: ExpressionNode;
}

/**
 * ConditionalExpressionNode stores ternary condition ? whenTrue : whenFalse.
 */
export interface ConditionalExpressionNode extends BaseNode {
  readonly kind: "ConditionalExpression";
  readonly condition: ExpressionNode;
  readonly questionMark: Token;
  readonly whenTrue: ExpressionNode;
  readonly colon: Token;
  readonly whenFalse: ExpressionNode;
}

/**
 * AssignmentExpressionNode stores reassignment to an existing identifier.
 */
export interface AssignmentExpressionNode extends BaseNode {
  readonly kind: "AssignmentExpression";
  readonly target: AssignmentTargetNode;
  readonly equals: Token;
  readonly value: ExpressionNode;
}

/**
 * CallExpressionNode stores ordinary expression-level calls.
 */
export interface CallExpressionNode extends BaseNode {
  readonly kind: "CallExpression";
  readonly callee: ExpressionNode;
  readonly arguments: ExpressionNode[];
}

/**
 * MemberExpressionNode stores dot notation access such as vessel.name.
 */
export interface MemberExpressionNode extends BaseNode {
  readonly kind: "MemberExpression";
  readonly object: ExpressionNode;
  readonly property: Token;
}

/**
 * IndexExpressionNode stores bracket notation access such as vessel[index].
 */
export interface IndexExpressionNode extends BaseNode {
  readonly kind: "IndexExpression";
  readonly object: ExpressionNode;
  readonly index: ExpressionNode;
}

/**
 * UmkelCallExpressionNode stores expression-level Kethic invocation syntax.
 */
export interface UmkelCallExpressionNode extends BaseNode {
  readonly kind: "UmkelCallExpression";
  readonly keyword: Token;
  readonly callee: Token;
  readonly arguments: ExpressionNode[];
}

/**
 * GroupingExpressionNode preserves explicit parentheses in the source.
 */
export interface GroupingExpressionNode extends BaseNode {
  readonly kind: "GroupingExpression";
  readonly expression: ExpressionNode;
}

/**
 * StatementNode is every AST node that can appear in program or block bodies.
 */
export type StatementNode =
  | VariableDeclarationNode
  | ConstantDeclarationNode
  | FunctionDeclarationNode
  | TypeDefinitionNode
  | UnionTypeDefinitionNode
  | OvrinDeclarationNode
  | BlockStatementNode
  | FunctionCallStatementNode
  | ReturnStatementNode
  | ConditionalStatementNode
  | LoopStatementNode
  | SwitchStatementNode
  | BreakStatementNode
  | ContinueStatementNode
  | ErrorHandlingStatementNode
  | ExpressionStatementNode;

/**
 * ExpressionNode is every AST node that can produce a value.
 */
export type ExpressionNode =
  | IdentifierExpressionNode
  | NumberLiteralNode
  | StringLiteralNode
  | NullLiteralNode
  | ArrayLiteralNode
  | ObjectLiteralNode
  | MapLiteralNode
  | FunctionExpressionNode
  | ArrowFunctionExpressionNode
  | TemplateStringNode
  | BooleanLiteralNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | ConditionalExpressionNode
  | AssignmentExpressionNode
  | CallExpressionNode
  | MemberExpressionNode
  | IndexExpressionNode
  | UmkelCallExpressionNode
  | GroupingExpressionNode;

/**
 * AssignmentTargetNode is every expression form that can appear on the left
 * side of assignment without changing syntax.
 */
export type AssignmentTargetNode = IdentifierExpressionNode | MemberExpressionNode | IndexExpressionNode;

/**
 * BinaryOperatorTokenType limits binary expressions to valid operator tokens.
 */
export type BinaryOperatorTokenType =
  | TokenType.Plus
  | TokenType.Minus
  | TokenType.Star
  | TokenType.Slash
  | TokenType.Percent
  | TokenType.DoubleEquals
  | TokenType.BangEquals
  | TokenType.Less
  | TokenType.LessEquals
  | TokenType.Greater
  | TokenType.GreaterEquals
  | TokenType.AndAnd
  | TokenType.OrOr;
