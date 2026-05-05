import { TokenType } from "../lexer/tokens";
import {
  BinaryExpressionNode,
  BlockStatementNode,
  ConditionalStatementNode,
  ExpressionNode,
  FunctionDeclarationNode,
  OvrinDeclarationNode,
  ProgramNode,
  StatementNode,
  TypeDefinitionNode,
} from "../parser/ast";
import { CodeGenerationResult, SourceMapEntry } from "./types";

/**
 * CodeGenerator walks a validated AST and emits clean, runnable JavaScript.
 */
export class CodeGenerator {
  private readonly lines: string[] = [];
  private readonly sourceMap: SourceMapEntry[] = [];
  private indentLevel: number = 0;

  /**
   * generate returns JavaScript plus a Kethic-line to JS-line source map.
   */
  public generate(program: ProgramNode): CodeGenerationResult {
    this.lines.length = 0;
    this.sourceMap.length = 0;
    this.indentLevel = 0;

    const wrapInFunction: boolean = this.programNeedsReturnWrapper(program);
    if (wrapInFunction) {
      this.emitRawLine("(() => {");
      this.indentLevel += 1;
    }

    for (const statement of program.body) {
      this.emitStatement(statement);
    }

    if (wrapInFunction) {
      this.indentLevel -= 1;
      this.emitRawLine("})();");
    }

    return {
      code: this.lines.join("\n"),
      sourceMap: [...this.sourceMap],
    };
  }

  /**
   * emitStatement routes each Kethic statement to its JavaScript equivalent.
   */
  private emitStatement(statement: StatementNode): void {
    switch (statement.kind) {
      case "VariableDeclaration":
        this.emitMappedLine(
          `let ${statement.name.lexeme}${statement.initializer === null ? "" : ` = ${this.emitExpression(statement.initializer)}`};`,
          statement.keyword.line,
        );
        return;
      case "ConstantDeclaration":
        this.emitMappedLine(
          `const ${statement.name.lexeme} = ${this.emitExpression(statement.initializer)};`,
          statement.keyword.line,
        );
        return;
      case "FunctionDeclaration":
        this.emitFunctionDeclaration(statement);
        return;
      case "FunctionCallStatement":
        this.emitMappedLine(
          `${statement.callee.lexeme}(${statement.arguments.map((argument: ExpressionNode) => this.emitExpression(argument)).join(", ")});`,
          statement.keyword.line,
        );
        return;
      case "ReturnStatement":
        this.emitMappedLine(
          `return${statement.value === null ? "" : ` ${this.emitExpression(statement.value)}`};`,
          statement.keyword.line,
        );
        return;
      case "ConditionalStatement":
        this.emitConditionalStatement(statement, false);
        return;
      case "LoopStatement":
        this.emitMappedLine(`while (${this.emitExpression(statement.condition)}) {`, statement.keyword.line);
        this.emitBlockBody(statement.body);
        this.emitRawLine(`${this.indent()}}`);
        return;
      case "ErrorHandlingStatement":
        this.emitMappedLine("try {", statement.keyword.line);
        this.emitBlockBody(statement.guardedBody);
        this.emitRawLine(`${this.indent()}} catch (error) {`);
        this.emitBlockBody(statement.recoveryBody);
        this.emitRawLine(`${this.indent()}}`);
        return;
      case "TypeDefinition":
        this.emitTypeDefinition(statement);
        return;
      case "OvrinDeclaration":
        this.emitOvrinDeclaration(statement);
        return;
      case "BlockStatement":
        this.emitMappedLine("{", statement.location.line);
        this.emitBlockBody(statement);
        this.emitRawLine(`${this.indent()}}`);
        return;
      case "ExpressionStatement":
        this.emitMappedLine(`${this.emitExpression(statement.expression)};`, statement.location.line);
        return;
    }
  }

  /**
   * emitFunctionDeclaration emits Kelthar as a JavaScript function declaration.
   */
  private emitFunctionDeclaration(statement: FunctionDeclarationNode): void {
    const parameters: string = statement.parameters.map((parameter) => parameter.name.lexeme).join(", ");
    this.emitMappedLine(`function ${statement.name.lexeme}(${parameters}) {`, statement.keyword.line);
    this.emitBlockBody(statement.body);
    this.emitRawLine(`${this.indent()}}`);
  }

  /**
   * emitConditionalStatement emits Ikhshev/Shev chains as if/else-if/else.
   */
  private emitConditionalStatement(statement: ConditionalStatementNode, asElseIf: boolean): void {
    const prefix: string = asElseIf ? "} else if" : "if";
    this.emitMappedLine(`${prefix} (${this.emitExpression(statement.condition)}) {`, statement.keyword.line);
    this.emitBlockBody(statement.thenBranch);

    if (statement.elseBranch === null) {
      this.emitRawLine(`${this.indent()}}`);
      return;
    }

    if (statement.elseBranch.kind === "ConditionalStatement") {
      this.emitConditionalStatement(statement.elseBranch, true);
      return;
    }

    this.emitRawLine(`${this.indent()}} else {`);
    this.emitBlockBody(statement.elseBranch);
    this.emitRawLine(`${this.indent()}}`);
  }

  /**
   * emitTypeDefinition emits Selkar as a plain JS block comment for Phase 4.
   */
  private emitTypeDefinition(statement: TypeDefinitionNode): void {
    const fields: string = statement.fields
      .map((field) => `${field.name.lexeme}: ${field.typeName.lexeme}`)
      .join("; ");
    this.emitMappedLine(`/** @typedef {{ ${fields} }} ${statement.name.lexeme} */`, statement.keyword.line);
  }

  /**
   * emitOvrinDeclaration emits Ovrin as import or export syntax.
   */
  private emitOvrinDeclaration(statement: OvrinDeclarationNode): void {
    if (statement.source !== null) {
      this.emitMappedLine(`import { ${statement.name.lexeme} } from ${statement.source.token.lexeme};`, statement.keyword.line);
      return;
    }

    this.emitMappedLine(`export { ${statement.name.lexeme} };`, statement.keyword.line);
  }

  /**
   * emitBlockBody emits children with one additional indentation level.
   */
  private emitBlockBody(block: BlockStatementNode): void {
    this.indentLevel += 1;
    for (const statement of block.body) {
      this.emitStatement(statement);
    }
    this.indentLevel -= 1;
  }

  /**
   * emitExpression converts Kethic expressions into JavaScript expressions.
   */
  private emitExpression(expression: ExpressionNode): string {
    switch (expression.kind) {
      case "IdentifierExpression":
        return expression.name.lexeme;
      case "NumberLiteral":
        return expression.token.lexeme;
      case "StringLiteral":
        return expression.token.lexeme;
      case "BooleanLiteral":
        return expression.value ? "true" : "false";
      case "UnaryExpression":
        return `${expression.operator.lexeme}${this.emitExpression(expression.argument)}`;
      case "BinaryExpression":
        return this.emitBinaryExpression(expression);
      case "AssignmentExpression":
        return `${this.emitExpression(expression.target)} = ${this.emitExpression(expression.value)}`;
      case "CallExpression":
        return `${this.emitExpression(expression.callee)}(${expression.arguments.map((argument) => this.emitExpression(argument)).join(", ")})`;
      case "MemberExpression":
        return `${this.emitExpression(expression.object)}.${expression.property.lexeme}`;
      case "IndexExpression":
        return `${this.emitExpression(expression.object)}[${this.emitExpression(expression.index)}]`;
      case "UmkelCallExpression":
        return `${expression.callee.lexeme}(${expression.arguments.map((argument) => this.emitExpression(argument)).join(", ")})`;
      case "GroupingExpression":
        return `(${this.emitExpression(expression.expression)})`;
    }
  }

  /**
   * emitBinaryExpression maps Kethic binary operators to JavaScript operators.
   */
  private emitBinaryExpression(expression: BinaryExpressionNode): string {
    const operator: string = this.emitBinaryOperator(expression.operator.type);
    return `${this.emitExpression(expression.left)} ${operator} ${this.emitExpression(expression.right)}`;
  }

  /**
   * emitBinaryOperator normalizes token types into JavaScript operator text.
   */
  private emitBinaryOperator(type: TokenType): string {
    switch (type) {
      case TokenType.Plus:
        return "+";
      case TokenType.Minus:
        return "-";
      case TokenType.Star:
        return "*";
      case TokenType.Slash:
        return "/";
      case TokenType.Percent:
        return "%";
      case TokenType.DoubleEquals:
        return "===";
      case TokenType.BangEquals:
        return "!==";
      case TokenType.Less:
        return "<";
      case TokenType.LessEquals:
        return "<=";
      case TokenType.Greater:
        return ">";
      case TokenType.GreaterEquals:
        return ">=";
      case TokenType.AndAnd:
        return "&&";
      case TokenType.OrOr:
        return "||";
      default:
        return "";
    }
  }

  /**
   * programNeedsReturnWrapper keeps top-level Duren runnable in browser scripts.
   */
  private programNeedsReturnWrapper(program: ProgramNode): boolean {
    return program.body.some((statement: StatementNode) => this.statementContainsTopLevelReturn(statement));
  }

  /**
   * statementContainsTopLevelReturn detects Duren outside Kelthar declarations.
   */
  private statementContainsTopLevelReturn(statement: StatementNode): boolean {
    switch (statement.kind) {
      case "ReturnStatement":
        return true;
      case "BlockStatement":
        return statement.body.some((child: StatementNode) => this.statementContainsTopLevelReturn(child));
      case "ConditionalStatement":
        return (
          this.statementContainsTopLevelReturn(statement.thenBranch) ||
          (statement.elseBranch !== null && this.statementContainsTopLevelReturn(statement.elseBranch))
        );
      case "LoopStatement":
        return this.statementContainsTopLevelReturn(statement.body);
      case "ErrorHandlingStatement":
        return (
          this.statementContainsTopLevelReturn(statement.guardedBody) ||
          this.statementContainsTopLevelReturn(statement.recoveryBody)
        );
      case "FunctionDeclaration":
        return false;
      default:
        return false;
    }
  }

  /**
   * emitMappedLine appends a JS line and records its source Kethic line.
   */
  private emitMappedLine(line: string, kethicLine: number): void {
    this.lines.push(`${this.indent()}${line}`);
    this.sourceMap.push({
      kethicLine,
      jsLine: this.lines.length,
    });
  }

  /**
   * emitRawLine appends generated structure that has no direct Kethic line.
   */
  private emitRawLine(line: string): void {
    this.lines.push(line);
  }

  /**
   * indent returns the current JavaScript indentation prefix.
   */
  private indent(): string {
    return "  ".repeat(this.indentLevel);
  }
}
