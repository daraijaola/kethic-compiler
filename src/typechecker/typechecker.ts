import { Token, TokenType } from "../lexer/tokens";
import {
  AssignmentExpressionNode,
  BinaryExpressionNode,
  BreakStatementNode,
  BlockStatementNode,
  CallExpressionNode,
  ConditionalStatementNode,
  ConditionalExpressionNode,
  ConstantDeclarationNode,
  ContinueStatementNode,
  ErrorHandlingStatementNode,
  ExpressionNode,
  ExpressionStatementNode,
  FunctionCallStatementNode,
  FunctionDeclarationNode,
  IdentifierExpressionNode,
  IndexExpressionNode,
  LoopStatementNode,
  MemberExpressionNode,
  OvrinDeclarationNode,
  ParameterNode,
  ProgramNode,
  ReturnStatementNode,
  StatementNode,
  SwitchStatementNode,
  TypeDefinitionNode,
  TemplateStringNode,
  UnaryExpressionNode,
  VariableDeclarationNode,
} from "../parser/ast";
import { SymbolTable } from "./symbolTable";
import {
  BOOLEAN_TYPE,
  createFunctionType,
  FunctionSymbol,
  isUnknownType,
  KethicSymbol,
  KethicType,
  NUMBER_TYPE,
  STRING_TYPE,
  TypeCheckDiagnostic,
  typeToString,
  UNKNOWN_TYPE,
  ValueSymbol,
  VOID_TYPE,
} from "./types";

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
  private loopDepth: number = 0;
  private switchDepth: number = 0;

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
      case "SwitchStatement":
        this.checkSwitchStatement(statement);
        return;
      case "BreakStatement":
        this.checkBreakStatement(statement);
        return;
      case "ContinueStatement":
        this.checkContinueStatement(statement);
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

    const inferredType: KethicType =
      statement.initializer === null ? UNKNOWN_TYPE : this.inferExpression(statement.initializer, statement.keyword);

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

    const inferredType: KethicType = this.inferExpression(statement.initializer, statement.keyword);
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

    const parameterTypes: KethicType[] = statement.parameters.map(() => UNKNOWN_TYPE);
    const functionType = createFunctionType(parameterTypes, UNKNOWN_TYPE);
    const symbol: FunctionSymbol = {
      kind: "Function",
      name: statement.name.lexeme,
      parameterCount: statement.parameters.length,
      parameterNames: statement.parameters.map((parameter: ParameterNode) => parameter.name.lexeme),
      parameterTypes,
      returnType: UNKNOWN_TYPE,
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
      type: functionType,
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
        name: parameter.name.lexeme,
        type: UNKNOWN_TYPE,
        declarationKeyword: statement.keyword,
        declarationName: parameter.name,
      };

      if (!this.symbols.define(parameterSymbol)) {
        this.report(statement.keyword, `duplicate parameter "${parameter.name.lexeme}"`);
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
      type: UNKNOWN_TYPE,
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
    const actualType: KethicType =
      statement.value === null ? VOID_TYPE : this.inferExpression(statement.value, statement.keyword);

    if (this.currentFunction === null) {
      this.report(statement.keyword, "Duren cannot appear outside a Kelthar");
      return;
    }

    if (isUnknownType(this.currentFunction.returnType)) {
      this.currentFunction.returnType = actualType;
      this.currentFunction.type.returnType = actualType;
      return;
    }

    if (!this.typesCompatible(this.currentFunction.returnType, actualType)) {
      this.report(
        statement.keyword,
        `Kelthar "${this.currentFunction.name}" returns ${typeToString(this.currentFunction.returnType)} but received ${typeToString(actualType)}`,
      );
    }
  }

  /**
   * checkConditionalStatement checks the Ikhshev condition and scoped body.
   */
  private checkConditionalStatement(statement: ConditionalStatementNode): void {
    this.inferExpression(statement.condition, statement.keyword);
    this.checkBlock(statement.thenBranch, true);

    if (statement.elseBranch === null) {
      return;
    }

    if (statement.elseBranch.kind === "ConditionalStatement") {
      this.checkConditionalStatement(statement.elseBranch);
      return;
    }

    this.checkBlock(statement.elseBranch, true);
  }

  /**
   * checkLoopStatement checks the Rukhar condition and scoped body.
   */
  private checkLoopStatement(statement: LoopStatementNode): void {
    this.inferExpression(statement.condition, statement.keyword);
    this.loopDepth += 1;
    this.checkBlock(statement.body, true);
    this.loopDepth -= 1;
  }

  /**
   * checkSwitchStatement validates Ikhselthar case values and scoped branches.
   */
  private checkSwitchStatement(statement: SwitchStatementNode): void {
    const switchType: KethicType = this.inferExpression(statement.expression, statement.keyword);
    let defaultCount: number = 0;

    this.switchDepth += 1;

    for (const switchCase of statement.cases) {
      if (switchCase.matchValue === null) {
        defaultCount += 1;
        if (defaultCount > 1) {
          this.report(switchCase.keyword, "only one Ovikhnak default case is allowed per Ikhselthar");
        }
      } else {
        const caseType: KethicType = this.inferExpression(switchCase.matchValue, switchCase.keyword);
        if (!this.typesCompatible(switchType, caseType)) {
          this.report(
            switchCase.keyword,
            `Selikhshev value must match Ikhselthar type ${typeToString(switchType)} but received ${typeToString(caseType)}`,
          );
        }
      }

      this.checkBlock(switchCase.body, true);
    }

    this.switchDepth -= 1;
  }

  /**
   * checkBreakStatement validates Duruk appears inside Rukhar or Ikhselthar.
   */
  private checkBreakStatement(statement: BreakStatementNode): void {
    if (this.loopDepth === 0 && this.switchDepth === 0) {
      this.report(statement.keyword, "Duruk cannot appear outside a Rukhar loop or Ikhselthar switch");
    }
  }

  /**
   * checkContinueStatement validates Rukum appears inside Rukhar.
   */
  private checkContinueStatement(statement: ContinueStatementNode): void {
    if (this.loopDepth === 0) {
      this.report(statement.keyword, "Rukum cannot appear outside a Rukhar loop");
    }
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
  private inferExpression(expression: ExpressionNode, contextKeyword: Token): KethicType {
    switch (expression.kind) {
      case "NumberLiteral":
        return NUMBER_TYPE;
      case "StringLiteral":
        return STRING_TYPE;
      case "TemplateString":
        return this.inferTemplateString(expression, contextKeyword);
      case "BooleanLiteral":
        return BOOLEAN_TYPE;
      case "IdentifierExpression":
        return this.inferIdentifier(expression, contextKeyword);
      case "GroupingExpression":
        return this.inferExpression(expression.expression, contextKeyword);
      case "UnaryExpression":
        return this.inferUnaryExpression(expression, contextKeyword);
      case "BinaryExpression":
        return this.inferBinaryExpression(expression, contextKeyword);
      case "ConditionalExpression":
        return this.inferConditionalExpression(expression, contextKeyword);
      case "AssignmentExpression":
        return this.inferAssignmentExpression(expression, contextKeyword);
      case "CallExpression":
        return this.inferCallExpression(expression, contextKeyword);
      case "UmkelCallExpression":
        return this.inferUmkelCallExpression(expression);
      case "MemberExpression":
        return this.inferMemberExpression(expression, contextKeyword);
      case "IndexExpression":
        return this.inferIndexExpression(expression, contextKeyword);
    }
  }

  /**
   * inferIdentifier resolves a variable or reports use before declaration.
   */
  private inferIdentifier(expression: IdentifierExpressionNode, contextKeyword: Token): KethicType {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.name.lexeme);

    if (symbol === null) {
      this.report(contextKeyword, `variable "${expression.name.lexeme}" was used before it was declared`);
      return UNKNOWN_TYPE;
    }

    return symbol.kind === "Function" ? symbol.type : symbol.type;
  }

  /**
   * inferUnaryExpression checks prefix operators.
   */
  private inferUnaryExpression(expression: UnaryExpressionNode, contextKeyword: Token): KethicType {
    const argumentType: KethicType = this.inferExpression(expression.argument, contextKeyword);

    if (expression.operator.type === TokenType.Bang) {
      return BOOLEAN_TYPE;
    }

    if (expression.operator.type === TokenType.Minus && !this.typesCompatible(NUMBER_TYPE, argumentType)) {
      this.report(contextKeyword, `operator "${expression.operator.lexeme}" expected Number but received ${typeToString(argumentType)}`);
    }

    return argumentType;
  }

  /**
   * inferBinaryExpression checks operator compatibility and result type.
   */
  private inferBinaryExpression(expression: BinaryExpressionNode, contextKeyword: Token): KethicType {
    const leftType: KethicType = this.inferExpression(expression.left, contextKeyword);
    const rightType: KethicType = this.inferExpression(expression.right, contextKeyword);

    if ([TokenType.DoubleEquals, TokenType.BangEquals, TokenType.Less, TokenType.LessEquals, TokenType.Greater, TokenType.GreaterEquals].includes(expression.operator.type)) {
      return BOOLEAN_TYPE;
    }

    if ([TokenType.AndAnd, TokenType.OrOr].includes(expression.operator.type)) {
      return BOOLEAN_TYPE;
    }

    if (expression.operator.type === TokenType.Plus && (this.isPrimitive(leftType, "String") || this.isPrimitive(rightType, "String"))) {
      return STRING_TYPE;
    }

    if (!this.typesCompatible(NUMBER_TYPE, leftType) || !this.typesCompatible(NUMBER_TYPE, rightType)) {
      this.report(contextKeyword, `operator "${expression.operator.lexeme}" expected Number operands but received ${typeToString(leftType)} and ${typeToString(rightType)}`);
      return UNKNOWN_TYPE;
    }

    return NUMBER_TYPE;
  }

  /**
   * inferTemplateString checks interpolation values and returns String.
   */
  private inferTemplateString(expression: TemplateStringNode, contextKeyword: Token): KethicType {
    for (const part of expression.parts) {
      if (part.kind !== "TemplateExpressionPart") {
        continue;
      }

      const embeddedType: KethicType = this.inferExpression(part.expression, contextKeyword);
      if (embeddedType.kind === "Function" || this.isPrimitive(embeddedType, "Void")) {
        this.report(
          contextKeyword,
          `template interpolation must be convertible to String but received ${typeToString(embeddedType)}`,
        );
      }
    }

    return STRING_TYPE;
  }


  /**
   * inferConditionalExpression checks ternary condition and branch compatibility.
   */
  private inferConditionalExpression(expression: ConditionalExpressionNode, contextKeyword: Token): KethicType {
    const conditionType: KethicType = this.inferExpression(expression.condition, contextKeyword);
    const trueType: KethicType = this.inferExpression(expression.whenTrue, contextKeyword);
    const falseType: KethicType = this.inferExpression(expression.whenFalse, contextKeyword);

    if (!this.typesCompatible(BOOLEAN_TYPE, conditionType)) {
      this.report(
        contextKeyword,
        `conditional expression expected Boolean condition but received ${typeToString(conditionType)}`,
      );
    }

    if (!this.typesCompatible(trueType, falseType)) {
      this.report(
        contextKeyword,
        `conditional branches must return compatible types but received ${typeToString(trueType)} and ${typeToString(falseType)}`,
      );
      return UNKNOWN_TYPE;
    }

    return isUnknownType(trueType) ? falseType : trueType;
  }

  /**
   * inferAssignmentExpression checks reassignment against the declared type.
   */
  private inferAssignmentExpression(expression: AssignmentExpressionNode, contextKeyword: Token): KethicType {
    const receivedType: KethicType = this.inferExpression(expression.value, contextKeyword);

    if (expression.target.kind !== "IdentifierExpression") {
      this.inferExpression(expression.target, contextKeyword);
      return receivedType;
    }

    const symbol: KethicSymbol | null = this.symbols.resolve(expression.target.name.lexeme);

    if (symbol === null) {
      this.report(contextKeyword, `variable "${expression.target.name.lexeme}" was used before it was declared`);
      return UNKNOWN_TYPE;
    }

    if (symbol.kind === "Function") {
      this.report(contextKeyword, `cannot assign to Kelthar "${symbol.name}"`);
      return UNKNOWN_TYPE;
    }

    if (symbol.kind === "Constant") {
      this.report(contextKeyword, `Torūn "${symbol.name}" cannot be assigned after first assignment`);
      return symbol.type;
    }

    if (!this.typesCompatible(symbol.type, receivedType)) {
      this.report(
        contextKeyword,
        `variable "${symbol.name}" was declared as ${typeToString(symbol.type)} but received ${typeToString(receivedType)}`,
      );
    }

    return symbol.type;
  }

  /**
   * inferCallExpression validates expression-level Kelthar calls.
   */
  private inferCallExpression(expression: CallExpressionNode, contextKeyword: Token): KethicType {
    if (expression.callee.kind !== "IdentifierExpression") {
      this.inferExpression(expression.callee, contextKeyword);
      for (const argument of expression.arguments) {
        this.inferExpression(argument, contextKeyword);
      }
      return UNKNOWN_TYPE;
    }

    const symbol: KethicSymbol | null = this.symbols.resolve(expression.callee.name.lexeme);
    if (symbol === null || symbol.kind !== "Function") {
      this.report(contextKeyword, `Kelthar "${expression.callee.name.lexeme}" does not exist`);
      return UNKNOWN_TYPE;
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
  private inferUmkelCallExpression(expression: ExpressionNode & { kind: "UmkelCallExpression" }): KethicType {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.callee.lexeme);
    if (symbol === null || symbol.kind !== "Function") {
      this.report(expression.keyword, `Kelthar "${expression.callee.lexeme}" does not exist`);
      return UNKNOWN_TYPE;
    }

    this.checkArgumentCount(expression.keyword, expression.callee.lexeme, symbol, expression.arguments.length);

    for (const argument of expression.arguments) {
      this.inferExpression(argument, expression.keyword);
    }

    return symbol.returnType;
  }

  /**
   * inferMemberExpression validates dot notation against known current types.
   */
  private inferMemberExpression(expression: MemberExpressionNode, contextKeyword: Token): KethicType {
    const objectType: KethicType = this.inferExpression(expression.object, contextKeyword);

    if (isUnknownType(objectType)) {
      return UNKNOWN_TYPE;
    }

    if (this.isPrimitive(objectType, "String") && expression.property.lexeme === "length") {
      return NUMBER_TYPE;
    }

    this.report(
      contextKeyword,
      `type ${typeToString(objectType)} has no member "${expression.property.lexeme}"`,
    );
    return UNKNOWN_TYPE;
  }

  /**
   * inferIndexExpression validates bracket notation for known current types.
   */
  private inferIndexExpression(expression: IndexExpressionNode, contextKeyword: Token): KethicType {
    const objectType: KethicType = this.inferExpression(expression.object, contextKeyword);
    const indexType: KethicType = this.inferExpression(expression.index, contextKeyword);

    if (!this.typesCompatible(NUMBER_TYPE, indexType)) {
      this.report(contextKeyword, `index expression expected Number but received ${typeToString(indexType)}`);
    }

    if (isUnknownType(objectType)) {
      return UNKNOWN_TYPE;
    }

    if (this.isPrimitive(objectType, "String")) {
      return STRING_TYPE;
    }

    this.report(contextKeyword, `type ${typeToString(objectType)} cannot be indexed`);
    return UNKNOWN_TYPE;
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
  private typesCompatible(expected: KethicType, actual: KethicType): boolean {
    if (isUnknownType(expected) || isUnknownType(actual)) {
      return true;
    }

    if (expected.kind !== actual.kind) {
      return false;
    }

    if (expected.kind === "Primitive" && actual.kind === "Primitive") {
      return expected.name === actual.name;
    }

    return expected === actual;
  }

  /**
   * isPrimitive checks for a specific primitive type name.
   */
  private isPrimitive(type: KethicType, name: "Number" | "String" | "Boolean" | "Void"): boolean {
    return type.kind === "Primitive" && type.name === name;
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
