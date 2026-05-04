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
  readonly initializer: ExpressionNode | null;
}

/**
 * Torūn declares an immutable stone-oath.
 */
export interface ConstantDeclarationNode extends BaseNode {
  readonly kind: "ConstantDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly initializer: ExpressionNode;
}

/**
 * Kelthar declares a named sleeping pattern.
 */
export interface FunctionDeclarationNode extends BaseNode {
  readonly kind: "FunctionDeclaration";
  readonly keyword: Token;
  readonly name: Token;
  readonly parameters: Token[];
  readonly body: BlockStatementNode;
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
}

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
 * AssignmentExpressionNode stores reassignment to an existing identifier.
 */
export interface AssignmentExpressionNode extends BaseNode {
  readonly kind: "AssignmentExpression";
  readonly target: IdentifierExpressionNode;
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
  | OvrinDeclarationNode
  | BlockStatementNode
  | FunctionCallStatementNode
  | ReturnStatementNode
  | ConditionalStatementNode
  | LoopStatementNode
  | ErrorHandlingStatementNode
  | ExpressionStatementNode;

/**
 * ExpressionNode is every AST node that can produce a value.
 */
export type ExpressionNode =
  | IdentifierExpressionNode
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | AssignmentExpressionNode
  | CallExpressionNode
  | UmkelCallExpressionNode
  | GroupingExpressionNode;

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
