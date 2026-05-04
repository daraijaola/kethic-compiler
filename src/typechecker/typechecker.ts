import { Token, TokenType } from "../lexer/tokens";
import {
  AssignmentExpressionNode,
  BinaryExpressionNode,
  BlockStatementNode,
  CallExpressionNode,
  ConditionalStatementNode,
  ConstantDeclarationNode,
  ErrorHandlingStatementNode,
  ExpressionNode,
  ExpressionStatementNode,
  FunctionCallStatementNode,
  FunctionDeclarationNode,
  IdentifierExpressionNode,
  LoopStatementNode,
  OvrinDeclarationNode,
  ProgramNode,
  ReturnStatementNode,
  StatementNode,
  TypeDefinitionNode,
  UnaryExpressionNode,
  VariableDeclarationNode,
} from "../parser/ast";
import { SymbolTable } from "./symbolTable";
import { FunctionSymbol, KethicSymbol, PrimitiveTypeName, TypeCheckDiagnostic, ValueSymbol } from "./types";

/**
 * KethicTypeError formats one type-checking diagnostic in the project style.
 */
export class KethicTypeError extends Error {
  public readonly diagnostic: TypeCheckDiagnostic;

  public constructor(diagnostic: TypeCheckDiagnostic) {
    super(
      `KethicTypeError [Line ${diagnostic.line}, Col ${diagnostic.column}] — ${diagnostic.keyword}: ${diagnostic.message}`,
    );
    this.name = "KethicTypeError";
    this.diagnostic = diagnostic;
  }
}

/**
 * TypeChecker walks a parsed Kethic AST and records errors before codegen.
 */
export class TypeChecker {
  private readonly symbols: SymbolTable = new SymbolTable();
  private readonly diagnostics: TypeCheckDiagnostic[] = [];
  private currentFunction: FunctionSymbol | null = null;

  /**
   * check returns all type-checking errors found in a full Program AST.
   */
  public check(program: ProgramNode): TypeCheckDiagnostic[] {
    this.predeclareFunctions(program);

    for (const statement of program.body) {
      this.checkStatement(statement);
    }

    return this.diagnostics;
  }

  /**
   * formatDiagnostics converts structured diagnostics into printable messages.
   */
  public formatDiagnostics(diagnostics: TypeCheckDiagnostic[]): string[] {
    return diagnostics.map((diagnostic: TypeCheckDiagnostic) => new KethicTypeError(diagnostic).message);
  }

  /**
   * predeclareFunctions allows Kelthar calls before the function body is checked.
   */
  private predeclareFunctions(program: ProgramNode): void {
    for (const statement of program.body) {
      if (statement.kind === "FunctionDeclaration") {
        this.declareFunction(statement);
      }
    }
  }

  /**
   * checkStatement dispatches each AST statement to its specific rule.
   */
  private checkStatement(statement: StatementNode): void {
    switch (statement.kind) {
      case "VariableDeclaration":
        this.checkVariableDeclaration(statement);
        return;
      case "ConstantDeclaration":
        this.checkConstantDeclaration(statement);
        return;
      case "FunctionDeclaration":
        this.checkFunctionDeclaration(statement);
        return;
      case "TypeDefinition":
        this.checkTypeDefinition(statement);
        return;
      case "OvrinDeclaration":
        this.checkOvrinDeclaration(statement);
        return;
      case "BlockStatement":
        this.checkBlock(statement, true);
        return;
      case "FunctionCallStatement":
        this.checkFunctionCallStatement(statement);
        return;
      case "ReturnStatement":
        this.checkReturnStatement(statement);
        return;
      case "ConditionalStatement":
        this.checkConditionalStatement(statement);
        return;
      case "LoopStatement":
        this.checkLoopStatement(statement);
        return;
      case "ErrorHandlingStatement":
        this.checkErrorHandlingStatement(statement);
        return;
      case "ExpressionStatement":
        this.checkExpressionStatement(statement);
        return;
    }
  }

  /**
   * checkVariableDeclaration infers the type of a Navā initializer.
   */
  private checkVariableDeclaration(statement: VariableDeclarationNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const inferredType: PrimitiveTypeName =
      statement.initializer === null ? "Unknown" : this.inferExpression(statement.initializer, statement.keyword);

    const symbol: ValueSymbol = {
      kind: "Variable",
      name: statement.name.lexeme,
      type: inferredType,
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
  }

  /**
   * checkConstantDeclaration infers and stores the first Torūn assignment type.
   */
  private checkConstantDeclaration(statement: ConstantDeclarationNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const inferredType: PrimitiveTypeName = this.inferExpression(statement.initializer, statement.keyword);
    const symbol: ValueSymbol = {
      kind: "Constant",
      name: statement.name.lexeme,
      type: inferredType,
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
  }

  /**
   * declareFunction stores a Kelthar symbol without checking its body.
   */
  private declareFunction(statement: FunctionDeclarationNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const symbol: FunctionSymbol = {
      kind: "Function",
      name: statement.name.lexeme,
      parameterCount: statement.parameters.length,
      parameterNames: statement.parameters.map((parameter: Token) => parameter.lexeme),
      returnType: "Unknown",
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
  }

  /**
   * checkFunctionDeclaration checks the body in a private Kelthar scope.
   */
  private checkFunctionDeclaration(statement: FunctionDeclarationNode): void {
    const symbol: KethicSymbol | null = this.symbols.resolve(statement.name.lexeme);
    if (symbol === null || symbol.kind !== "Function") {
      return;
    }

    const previousFunction: FunctionSymbol | null = this.currentFunction;
    this.currentFunction = symbol;
    this.symbols.enterScope();

    for (const parameter of statement.parameters) {
      const parameterSymbol: ValueSymbol = {
        kind: "Variable",
        name: parameter.lexeme,
        type: "Unknown",
        declarationKeyword: statement.keyword,
        declarationName: parameter,
      };

      if (!this.symbols.define(parameterSymbol)) {
        this.report(statement.keyword, `duplicate parameter "${parameter.lexeme}"`);
      }
    }

    this.checkBlock(statement.body, false);
    this.symbols.exitScope();
    this.currentFunction = previousFunction;
  }

  /**
   * checkTypeDefinition reserves Selkar for structural validation in later phases.
   */
  private checkTypeDefinition(statement: TypeDefinitionNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
    }
  }

  /**
   * checkOvrinDeclaration records imported names as Unknown values for now.
   */
  private checkOvrinDeclaration(statement: OvrinDeclarationNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const symbol: ValueSymbol = {
      kind: "Variable",
      name: statement.name.lexeme,
      type: "Unknown",
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
  }

  /**
   * checkBlock optionally creates a nested scope for ordinary braced blocks.
   */
  private checkBlock(statement: BlockStatementNode, createScope: boolean): void {
    if (createScope) {
      this.symbols.enterScope();
    }

    for (const child of statement.body) {
      this.checkStatement(child);
    }

    if (createScope) {
      this.symbols.exitScope();
    }
  }

  /**
   * checkFunctionCallStatement validates Umkel callee existence and arity.
   */
  private checkFunctionCallStatement(statement: FunctionCallStatementNode): void {
    const symbol: KethicSymbol | null = this.symbols.resolve(statement.callee.lexeme);

    if (symbol === null || symbol.kind !== "Function") {
      this.report(statement.keyword, `Kelthar "${statement.callee.lexeme}" does not exist`);
      return;
    }

    this.checkArgumentCount(statement.keyword, statement.callee.lexeme, symbol, statement.arguments.length);

    for (const argument of statement.arguments) {
      this.inferExpression(argument, statement.keyword);
    }
  }

  /**
   * checkReturnStatement validates Duren against the current Kelthar return type.
   */
  private checkReturnStatement(statement: ReturnStatementNode): void {
    const actualType: PrimitiveTypeName =
      statement.value === null ? "Void" : this.inferExpression(statement.value, statement.keyword);

    if (this.currentFunction === null) {
      this.report(statement.keyword, "Duren cannot appear outside a Kelthar");
      return;
    }

    if (this.currentFunction.returnType === "Unknown") {
      this.currentFunction.returnType = actualType;
      return;
    }

    if (!this.typesCompatible(this.currentFunction.returnType, actualType)) {
      this.report(
        statement.keyword,
        `Kelthar "${this.currentFunction.name}" returns ${this.currentFunction.returnType} but received ${actualType}`,
      );
    }
  }

  /**
   * checkConditionalStatement checks the Ikhshev condition and scoped body.
   */
  private checkConditionalStatement(statement: ConditionalStatementNode): void {
    this.inferExpression(statement.condition, statement.keyword);
    this.checkBlock(statement.thenBranch, true);
  }

  /**
   * checkLoopStatement checks the Rukhar condition and scoped body.
   */
  private checkLoopStatement(statement: LoopStatementNode): void {
    this.inferExpression(statement.condition, statement.keyword);
    this.checkBlock(statement.body, true);
  }

  /**
   * checkErrorHandlingStatement checks both Eshnak guarded and recovery blocks.
   */
  private checkErrorHandlingStatement(statement: ErrorHandlingStatementNode): void {
    this.checkBlock(statement.guardedBody, true);
    this.checkBlock(statement.recoveryBody, true);
  }

  /**
   * checkExpressionStatement infers expression type for side-effect validation.
   */
  private checkExpressionStatement(statement: ExpressionStatementNode): void {
    this.inferExpression(statement.expression, { type: TokenType.Identifier, lexeme: "Expression", line: statement.location.line, column: statement.location.column });
  }

  /**
   * inferExpression returns the best known type for an expression node.
   */
  private inferExpression(expression: ExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    switch (expression.kind) {
      case "NumberLiteral":
        return "Number";
      case "StringLiteral":
        return "String";
      case "BooleanLiteral":
        return "Boolean";
      case "IdentifierExpression":
        return this.inferIdentifier(expression, contextKeyword);
      case "GroupingExpression":
        return this.inferExpression(expression.expression, contextKeyword);
      case "UnaryExpression":
        return this.inferUnaryExpression(expression, contextKeyword);
      case "BinaryExpression":
        return this.inferBinaryExpression(expression, contextKeyword);
      case "AssignmentExpression":
        return this.inferAssignmentExpression(expression, contextKeyword);
      case "CallExpression":
        return this.inferCallExpression(expression, contextKeyword);
      case "UmkelCallExpression":
        return this.inferUmkelCallExpression(expression);
    }
  }

  /**
   * inferIdentifier resolves a variable or reports use before declaration.
   */
  private inferIdentifier(expression: IdentifierExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.name.lexeme);

    if (symbol === null) {
      this.report(contextKeyword, `variable "${expression.name.lexeme}" was used before it was declared`);
      return "Unknown";
    }

    return symbol.kind === "Function" ? "Unknown" : symbol.type;
  }

  /**
   * inferUnaryExpression checks prefix operators.
   */
  private inferUnaryExpression(expression: UnaryExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    const argumentType: PrimitiveTypeName = this.inferExpression(expression.argument, contextKeyword);

    if (expression.operator.type === TokenType.Bang) {
      return "Boolean";
    }

    if (expression.operator.type === TokenType.Minus && !this.typesCompatible("Number", argumentType)) {
      this.report(contextKeyword, `operator "${expression.operator.lexeme}" expected Number but received ${argumentType}`);
    }

    return argumentType;
  }

  /**
   * inferBinaryExpression checks operator compatibility and result type.
   */
  private inferBinaryExpression(expression: BinaryExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    const leftType: PrimitiveTypeName = this.inferExpression(expression.left, contextKeyword);
    const rightType: PrimitiveTypeName = this.inferExpression(expression.right, contextKeyword);

    if ([TokenType.DoubleEquals, TokenType.BangEquals, TokenType.Less, TokenType.LessEquals, TokenType.Greater, TokenType.GreaterEquals].includes(expression.operator.type)) {
      return "Boolean";
    }

    if ([TokenType.AndAnd, TokenType.OrOr].includes(expression.operator.type)) {
      return "Boolean";
    }

    if (expression.operator.type === TokenType.Plus && (leftType === "String" || rightType === "String")) {
      return "String";
    }

    if (!this.typesCompatible("Number", leftType) || !this.typesCompatible("Number", rightType)) {
      this.report(contextKeyword, `operator "${expression.operator.lexeme}" expected Number operands but received ${leftType} and ${rightType}`);
      return "Unknown";
    }

    return "Number";
  }

  /**
   * inferAssignmentExpression checks reassignment against the declared type.
   */
  private inferAssignmentExpression(expression: AssignmentExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.target.name.lexeme);
    const receivedType: PrimitiveTypeName = this.inferExpression(expression.value, contextKeyword);

    if (symbol === null) {
      this.report(contextKeyword, `variable "${expression.target.name.lexeme}" was used before it was declared`);
      return "Unknown";
    }

    if (symbol.kind === "Function") {
      this.report(contextKeyword, `cannot assign to Kelthar "${symbol.name}"`);
      return "Unknown";
    }

    if (symbol.kind === "Constant") {
      this.report(contextKeyword, `Torūn "${symbol.name}" cannot be assigned after first assignment`);
      return symbol.type;
    }

    if (!this.typesCompatible(symbol.type, receivedType)) {
      this.report(
        contextKeyword,
        `variable "${symbol.name}" was declared as ${symbol.type} but received ${receivedType}`,
      );
    }

    return symbol.type;
  }

  /**
   * inferCallExpression validates expression-level Kelthar calls.
   */
  private inferCallExpression(expression: CallExpressionNode, contextKeyword: Token): PrimitiveTypeName {
    if (expression.callee.kind !== "IdentifierExpression") {
      this.report(contextKeyword, "only named Kelthar calls are supported");
      return "Unknown";
    }

    const symbol: KethicSymbol | null = this.symbols.resolve(expression.callee.name.lexeme);
    if (symbol === null || symbol.kind !== "Function") {
      this.report(contextKeyword, `Kelthar "${expression.callee.name.lexeme}" does not exist`);
      return "Unknown";
    }

    this.checkArgumentCount(contextKeyword, expression.callee.name.lexeme, symbol, expression.arguments.length);

    for (const argument of expression.arguments) {
      this.inferExpression(argument, contextKeyword);
    }

    return symbol.returnType;
  }

  /**
   * inferUmkelCallExpression validates expression-level Umkel calls.
   */
  private inferUmkelCallExpression(expression: ExpressionNode & { kind: "UmkelCallExpression" }): PrimitiveTypeName {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.callee.lexeme);
    if (symbol === null || symbol.kind !== "Function") {
      this.report(expression.keyword, `Kelthar "${expression.callee.lexeme}" does not exist`);
      return "Unknown";
    }

    this.checkArgumentCount(expression.keyword, expression.callee.lexeme, symbol, expression.arguments.length);

    for (const argument of expression.arguments) {
      this.inferExpression(argument, expression.keyword);
    }

    return symbol.returnType;
  }

  /**
   * checkArgumentCount reports mismatched Kelthar arity.
   */
  private checkArgumentCount(keyword: Token, name: string, symbol: FunctionSymbol, actualCount: number): void {
    if (symbol.parameterCount !== actualCount) {
      this.report(
        keyword,
        `Kelthar "${name}" expected ${symbol.parameterCount} argument(s) but received ${actualCount}`,
      );
    }
  }

  /**
   * typesCompatible treats Unknown as compatible to avoid cascaded errors.
   */
  private typesCompatible(expected: PrimitiveTypeName, actual: PrimitiveTypeName): boolean {
    return expected === "Unknown" || actual === "Unknown" || expected === actual;
  }

  /**
   * report appends one human-readable diagnostic with keyword and position.
   */
  private report(keyword: Token, message: string): void {
    this.diagnostics.push({
      line: keyword.line,
      column: keyword.column,
      keyword: keyword.lexeme,
      message,
    });
  }
}
