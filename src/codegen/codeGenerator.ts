import { TokenType } from "../lexer/tokens";
import {
  BinaryExpressionNode,
  BlockStatementNode,
  ConditionalStatementNode,
  ExpressionNode,
  ArrowFunctionExpressionNode,
  FunctionDeclarationNode,
  FunctionExpressionNode,
  GenericTypeDefinitionNode,
  MapLiteralNode,
  OvrinDeclarationNode,
  ParameterNode,
  ProgramNode,
  StatementNode,
  SwitchStatementNode,
  TemplateStringNode,
  TypeDefinitionNode,
  ObjectLiteralNode,
} from "../parser/ast";
import { standardLibraryByName, StandardLibraryFunction } from "../stdlib";
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
          `${this.emitNamedCall(
            statement.callee.lexeme,
            statement.arguments.map((argument: ExpressionNode) => this.emitExpression(argument)),
          )};`,
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
      case "SwitchStatement":
        this.emitSwitchStatement(statement);
        return;
      case "BreakStatement":
        this.emitMappedLine("break;", statement.keyword.line);
        return;
      case "ContinueStatement":
        this.emitMappedLine("continue;", statement.keyword.line);
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
      case "UnionTypeDefinition":
        this.emitMappedLine(`/** @typedef {*} ${statement.name.lexeme} */`, statement.keyword.line);
        return;
      case "GenericTypeDefinition":
        this.emitGenericTypeDefinition(statement);
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
    const parameters: string = this.emitParameterList(statement.parameters);
    const asyncPrefix: string = statement.isAsync ? "async " : "";
    this.emitMappedLine(`${asyncPrefix}function ${statement.name.lexeme}(${parameters}) {`, statement.keyword.line);
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
   * emitSwitchStatement emits Ikhselthar branches as JavaScript switch cases.
   */
  private emitSwitchStatement(statement: SwitchStatementNode): void {
    this.emitMappedLine(`switch (${this.emitExpression(statement.expression)}) {`, statement.keyword.line);
    this.indentLevel += 1;

    for (const switchCase of statement.cases) {
      if (switchCase.matchValue === null) {
        this.emitMappedLine("default: {", switchCase.keyword.line);
      } else {
        this.emitMappedLine(`case ${this.emitExpression(switchCase.matchValue)}: {`, switchCase.keyword.line);
      }

      this.emitBlockBody(switchCase.body);
      this.emitRawLine(`${this.indent()}}`);
    }

    this.indentLevel -= 1;
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
   * emitGenericTypeDefinition emits Tharkar as a JS typedef placeholder.
   */
  private emitGenericTypeDefinition(statement: GenericTypeDefinitionNode): void {
    this.emitMappedLine(`/** @typedef {*} ${statement.name.lexeme} */`, statement.keyword.line);
  }

  /**
   * emitOvrinDeclaration emits Ovrin as import or export syntax.
   */
  private emitOvrinDeclaration(statement: OvrinDeclarationNode): void {
    const names: string = statement.specifiers.map((specifier) => specifier.name.lexeme).join(", ");

    if (statement.source !== null) {
      this.emitMappedLine(`import { ${names} } from ${statement.source.token.lexeme};`, statement.keyword.line);
      return;
    }

    this.emitMappedLine(`export { ${names} };`, statement.keyword.line);
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
      case "NullLiteral":
        return "null";
      case "ArrayLiteral":
        return `[${expression.elements.map((element: ExpressionNode) => this.emitExpression(element)).join(", ")}]`;
      case "ObjectLiteral":
        return this.emitObjectLiteral(expression);
      case "MapLiteral":
        return this.emitMapLiteral(expression);
      case "FunctionExpression":
        return this.emitFunctionExpression(expression);
      case "ArrowFunctionExpression":
        return this.emitArrowFunctionExpression(expression);
      case "TemplateString":
        return this.emitTemplateString(expression);
      case "BooleanLiteral":
        return expression.value ? "true" : "false";
      case "UnaryExpression":
        return `${expression.operator.lexeme}${this.emitExpression(expression.argument)}`;
      case "AwaitExpression":
        return `await ${this.emitExpression(expression.argument)}`;
      case "BinaryExpression":
        return this.emitBinaryExpression(expression);
      case "ConditionalExpression":
        return `${this.emitExpression(expression.condition)} ? ${this.emitExpression(expression.whenTrue)} : ${this.emitExpression(expression.whenFalse)}`;
      case "AssignmentExpression":
        return `${this.emitExpression(expression.target)} = ${this.emitExpression(expression.value)}`;
      case "CallExpression":
        if (expression.callee.kind === "IdentifierExpression") {
          return this.emitNamedCall(
            expression.callee.name.lexeme,
            expression.arguments.map((argument) => this.emitExpression(argument)),
          );
        }

        return `${this.emitExpression(expression.callee)}(${expression.arguments.map((argument) => this.emitExpression(argument)).join(", ")})`;
      case "MemberExpression":
        return `${this.emitExpression(expression.object)}.${expression.property.lexeme}`;
      case "IndexExpression":
        return `${this.emitExpression(expression.object)}[${this.emitExpression(expression.index)}]`;
      case "UmkelCallExpression":
        return this.emitNamedCall(
          expression.callee.lexeme,
          expression.arguments.map((argument) => this.emitExpression(argument)),
        );
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
   * emitNamedCall maps compiler-known standard library functions to their
   * JavaScript targets while leaving user Kelthar calls unchanged.
   */
  private emitNamedCall(name: string, argumentsList: readonly string[]): string {
    const builtin: StandardLibraryFunction | undefined = standardLibraryByName.get(name);
    if (builtin !== undefined) {
      return builtin.emitCall(argumentsList);
    }

    return `${name}(${argumentsList.join(", ")})`;
  }

  /**
   * emitObjectLiteral emits anonymous objects while preserving property names.
   */
  private emitObjectLiteral(expression: ObjectLiteralNode): string {
    const properties: string = expression.properties
      .map((property) => `${this.emitObjectKey(property.key)}: ${this.emitExpression(property.value)}`)
      .join(", ");
    return `{ ${properties} }`;
  }

  /**
   * emitObjectKey keeps identifier keys bare and string keys quoted.
   */
  private emitObjectKey(key: { readonly type: TokenType; readonly lexeme: string }): string {
    return key.type === TokenType.String ? key.lexeme : key.lexeme;
  }

  /**
   * emitMapLiteral emits Selva lookup archives as JavaScript Map instances.
   */
  private emitMapLiteral(expression: MapLiteralNode): string {
    if (expression.entries.length === 0) {
      return "({})";
    }

    const entries: string = expression.entries
      .map((entry) => `[${this.emitExpression(entry.key)}]: ${this.emitExpression(entry.value)}`)
      .join(", ");
    return `({ ${entries} })`;
  }

  /**
   * emitFunctionExpression emits Tharva/Kelthar expression functions inline.
   */
  private emitFunctionExpression(expression: FunctionExpressionNode): string {
    const parameters: string = this.emitParameterList(expression.parameters);
    const body: string[] = this.emitBlockBodyAsLines(expression.body, 1);
    const asyncPrefix: string = expression.isAsync ? "async " : "";
    return `${asyncPrefix}function (${parameters}) {\n${body.join("\n")}\n}`;
  }

  /**
   * emitArrowFunctionExpression emits Rinthar expression or block bodies.
   */
  private emitArrowFunctionExpression(expression: ArrowFunctionExpressionNode): string {
    const parameters: string = this.emitParameterList(expression.parameters);
    const asyncPrefix: string = expression.isAsync ? "async " : "";

    if (expression.body.kind !== "BlockStatement") {
      return `${asyncPrefix}(${parameters}) => ${this.emitExpression(expression.body)}`;
    }

    const body: string[] = this.emitBlockBodyAsLines(expression.body, 1);
    return `${asyncPrefix}(${parameters}) => {\n${body.join("\n")}\n}`;
  }

  /**
   * emitParameterList maps defaults and rest parameters to JavaScript syntax.
   */
  private emitParameterList(parameters: ParameterNode[]): string {
    return parameters
      .map((parameter: ParameterNode) => {
        const restPrefix: string = parameter.isRest ? "..." : "";
        const defaultSuffix: string =
          parameter.defaultValue === null ? "" : ` = ${this.emitExpression(parameter.defaultValue)}`;
        return `${restPrefix}${parameter.name.lexeme}${defaultSuffix}`;
      })
      .join(", ");
  }

  /**
   * emitBlockBodyAsLines emits function-expression bodies without mutating the
   * top-level output buffer or source map.
   */
  private emitBlockBodyAsLines(block: BlockStatementNode, indentLevel: number): string[] {
    return block.body.flatMap((statement: StatementNode) => this.emitStatementAsLines(statement, indentLevel));
  }

  /**
   * emitStatementAsLines converts statements for nested expression contexts.
   */
  private emitStatementAsLines(statement: StatementNode, indentLevel: number): string[] {
    const indent: string = this.indentText(indentLevel);

    switch (statement.kind) {
      case "VariableDeclaration":
        return [
          `${indent}let ${statement.name.lexeme}${statement.initializer === null ? "" : ` = ${this.emitExpression(statement.initializer)}`};`,
        ];
      case "ConstantDeclaration":
        return [`${indent}const ${statement.name.lexeme} = ${this.emitExpression(statement.initializer)};`];
      case "ReturnStatement":
        return [`${indent}return${statement.value === null ? "" : ` ${this.emitExpression(statement.value)}`};`];
      case "ExpressionStatement":
        return [`${indent}${this.emitExpression(statement.expression)};`];
      case "BreakStatement":
        return [`${indent}break;`];
      case "ContinueStatement":
        return [`${indent}continue;`];
      case "BlockStatement":
        return [`${indent}{`, ...this.emitBlockBodyAsLines(statement, indentLevel + 1), `${indent}}`];
      case "ConditionalStatement":
        return this.emitConditionalAsLines(statement, indentLevel, false);
      case "LoopStatement":
        return [
          `${indent}while (${this.emitExpression(statement.condition)}) {`,
          ...this.emitBlockBodyAsLines(statement.body, indentLevel + 1),
          `${indent}}`,
        ];
      case "SwitchStatement":
        return this.emitSwitchAsLines(statement, indentLevel);
      case "ErrorHandlingStatement":
        return [
          `${indent}try {`,
          ...this.emitBlockBodyAsLines(statement.guardedBody, indentLevel + 1),
          `${indent}} catch (error) {`,
          ...this.emitBlockBodyAsLines(statement.recoveryBody, indentLevel + 1),
          `${indent}}`,
        ];
      case "FunctionDeclaration":
        return [
          `${indent}${statement.isAsync ? "async " : ""}function ${statement.name.lexeme}(${this.emitParameterList(statement.parameters)}) {`,
          ...this.emitBlockBodyAsLines(statement.body, indentLevel + 1),
          `${indent}}`,
        ];
      case "TypeDefinition":
        return [
          `${indent}/** @typedef {{ ${statement.fields.map((field) => `${field.name.lexeme}: ${field.typeName.lexeme}`).join("; ")} }} ${statement.name.lexeme} */`,
        ];
      case "UnionTypeDefinition":
        return [`${indent}/** @typedef {*} ${statement.name.lexeme} */`];
      case "GenericTypeDefinition":
        return [`${indent}/** @typedef {*} ${statement.name.lexeme} */`];
      case "OvrinDeclaration":
        const names: string = statement.specifiers.map((specifier) => specifier.name.lexeme).join(", ");
        return [
          statement.source === null
            ? `${indent}export { ${names} };`
            : `${indent}import { ${names} } from ${statement.source.token.lexeme};`,
        ];
      default:
        return [`${indent}/* unsupported nested statement: ${statement.kind} */`];
    }
  }

  /**
   * emitConditionalAsLines mirrors Ikhshev/Shev emission for expression-local bodies.
   */
  private emitConditionalAsLines(statement: ConditionalStatementNode, indentLevel: number, asElseIf: boolean): string[] {
    const indent: string = this.indentText(indentLevel);
    const prefix: string = asElseIf ? "} else if" : "if";
    const lines: string[] = [
      `${indent}${prefix} (${this.emitExpression(statement.condition)}) {`,
      ...this.emitBlockBodyAsLines(statement.thenBranch, indentLevel + 1),
    ];

    if (statement.elseBranch === null) {
      lines.push(`${indent}}`);
      return lines;
    }

    if (statement.elseBranch.kind === "ConditionalStatement") {
      return [...lines, ...this.emitConditionalAsLines(statement.elseBranch, indentLevel, true)];
    }

    lines.push(`${indent}} else {`);
    lines.push(...this.emitBlockBodyAsLines(statement.elseBranch, indentLevel + 1));
    lines.push(`${indent}}`);
    return lines;
  }

  /**
   * emitSwitchAsLines mirrors Ikhselthar emission for expression-local bodies.
   */
  private emitSwitchAsLines(statement: SwitchStatementNode, indentLevel: number): string[] {
    const indent: string = this.indentText(indentLevel);
    const lines: string[] = [`${indent}switch (${this.emitExpression(statement.expression)}) {`];

    for (const switchCase of statement.cases) {
      const caseIndent: string = this.indentText(indentLevel + 1);
      lines.push(
        switchCase.matchValue === null
          ? `${caseIndent}default: {`
          : `${caseIndent}case ${this.emitExpression(switchCase.matchValue)}: {`,
      );
      lines.push(...this.emitBlockBodyAsLines(switchCase.body, indentLevel + 2));
      lines.push(`${caseIndent}}`);
    }

    lines.push(`${indent}}`);
    return lines;
  }

  /**
   * emitTemplateString emits Kethic {expression} interpolation as JS ${expression}.
   */
  private emitTemplateString(expression: TemplateStringNode): string {
    let output: string = "`";

    for (const part of expression.parts) {
      if (part.kind === "TemplateStaticPart") {
        output += this.escapeTemplateStaticText(part.value);
      } else {
        output += "${" + this.emitExpression(part.expression) + "}";
      }
    }

    return `${output}\``;
  }

  /**
   * escapeTemplateStaticText preserves literal text inside emitted JS templates.
   */
  private escapeTemplateStaticText(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$\{/g, "\\${");
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
      case "SwitchStatement":
        return statement.cases.some((switchCase) => this.statementContainsTopLevelReturn(switchCase.body));
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

  /**
   * indentText returns indentation for generated expression-local blocks.
   */
  private indentText(level: number): string {
    return "  ".repeat(level);
  }
}
