import { Token, TokenType } from "../lexer/tokens";
import {
  AssignmentExpressionNode,
  ArrayLiteralNode,
  AwaitExpressionNode,
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
  ArrowFunctionExpressionNode,
  FunctionCallStatementNode,
  FunctionDeclarationNode,
  FunctionExpressionNode,
  GenericTypeDefinitionNode,
  IdentifierExpressionNode,
  IndexExpressionNode,
  LoopStatementNode,
  MapLiteralNode,
  MemberExpressionNode,
  OvrinDeclarationNode,
  ParameterNode,
  ProgramNode,
  ReturnStatementNode,
  StatementNode,
  SwitchStatementNode,
  TypeDefinitionNode,
  TypeExpressionNode,
  TemplateStringNode,
  UnaryExpressionNode,
  UnionTypeDefinitionNode,
  VariableDeclarationNode,
} from "../parser/ast";
import { SymbolTable } from "./symbolTable";
import {
  BOOLEAN_TYPE,
  createArrayType,
  createFunctionType,
  createMapType,
  createUnionType,
  createPromiseType,
  FunctionType,
  FunctionSymbol,
  GenericTypeSymbol,
  isUnknownType,
  KethicSymbol,
  KethicType,
  NUMBER_TYPE,
  NULL_TYPE,
  createObjectType,
  STRING_TYPE,
  TypeCheckDiagnostic,
  TypeSymbol,
  typeToString,
  UNKNOWN_TYPE,
  ValueSymbol,
  VOID_TYPE,
} from "./types";

type TypeBindings = ReadonlyMap<string, KethicType>;

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
    this.predeclareTypes(program);
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
   * predeclareTypes lets function parameter annotations reference top-level Shevkar aliases.
   */
  private predeclareTypes(program: ProgramNode): void {
    for (const statement of program.body) {
      if (statement.kind === "UnionTypeDefinition") {
        this.declareUnionType(statement);
      }

      if (statement.kind === "GenericTypeDefinition") {
        this.declareGenericType(statement);
      }
    }
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
      case "UnionTypeDefinition":
        this.checkUnionTypeDefinition(statement);
        return;
      case "GenericTypeDefinition":
        this.checkGenericTypeDefinition(statement);
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
    const declaredType: KethicType | null =
      statement.typeAnnotation === null ? null : this.resolveTypeExpression(statement.typeAnnotation, statement.keyword);

    if (declaredType !== null && statement.initializer !== null && !this.typesCompatible(declaredType, inferredType)) {
      this.report(
        statement.keyword,
        `variable "${statement.name.lexeme}" was declared as ${typeToString(declaredType)} but received ${typeToString(inferredType)}`,
      );
    }

    const symbol: ValueSymbol = {
      kind: "Variable",
      name: statement.name.lexeme,
      type: declaredType ?? inferredType,
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
    const declaredType: KethicType | null =
      statement.typeAnnotation === null ? null : this.resolveTypeExpression(statement.typeAnnotation, statement.keyword);

    if (declaredType !== null && !this.typesCompatible(declaredType, inferredType)) {
      this.report(
        statement.keyword,
        `constant "${statement.name.lexeme}" was declared as ${typeToString(declaredType)} but received ${typeToString(inferredType)}`,
      );
    }

    const symbol: ValueSymbol = {
      kind: "Constant",
      name: statement.name.lexeme,
      type: declaredType ?? inferredType,
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

    const parameterTypes: KethicType[] = statement.parameters.map((parameter: ParameterNode) =>
      parameter.typeAnnotation === null ? UNKNOWN_TYPE : this.resolveTypeExpression(parameter.typeAnnotation, statement.keyword),
    );
    const hasRestParameter: boolean = statement.parameters.some((parameter: ParameterNode) => parameter.isRest);
    const minimumParameterCount: number = this.minimumParameterCount(statement.parameters);
    const functionType = createFunctionType(parameterTypes, UNKNOWN_TYPE, minimumParameterCount, hasRestParameter, statement.isAsync);
    const symbol: FunctionSymbol = {
      kind: "Function",
      name: statement.name.lexeme,
      parameterCount: statement.parameters.length,
      minimumParameterCount,
      hasRestParameter,
      isAsync: statement.isAsync,
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

    this.defineParameters(statement.parameters, statement.keyword, symbol.parameterTypes);

    this.checkBlock(statement.body, false);
    this.symbols.exitScope();
    this.currentFunction = previousFunction;
  }

  /**
   * checkFunctionLikeBody checks anonymous and arrow block functions using the
   * same return rules as named Kelthar declarations.
   */
  private checkFunctionLikeBody(
    parameters: ParameterNode[],
    keyword: Token,
    body: BlockStatementNode,
    functionSymbol: FunctionSymbol,
    parameterTypes: KethicType[],
  ): void {
    const previousFunction: FunctionSymbol | null = this.currentFunction;
    this.currentFunction = functionSymbol;
    this.symbols.enterScope();
    this.defineParameters(parameters, keyword, parameterTypes);
    this.checkBlock(body, false);
    this.symbols.exitScope();
    this.currentFunction = previousFunction;
  }

  /**
   * defineParameters stores parameters in the current scope and validates
   * default expressions before the function body is checked.
   */
  private defineParameters(parameters: ParameterNode[], keyword: Token, parameterTypes: KethicType[]): void {
    for (let index: number = 0; index < parameters.length; index += 1) {
      const parameter: ParameterNode = parameters[index];
      const annotatedType: KethicType | null =
        parameter.typeAnnotation === null ? null : this.resolveTypeExpression(parameter.typeAnnotation, keyword);
      const defaultType: KethicType =
        parameter.defaultValue === null ? UNKNOWN_TYPE : this.inferExpression(parameter.defaultValue, keyword);
      const scalarType: KethicType = annotatedType ?? defaultType;
      const parameterType: KethicType = parameter.isRest ? createArrayType(scalarType) : scalarType;
      parameterTypes[index] = parameterType;

      if (annotatedType !== null && parameter.defaultValue !== null && !this.typesCompatible(annotatedType, defaultType)) {
        this.report(
          keyword,
          `parameter "${parameter.name.lexeme}" was declared as ${typeToString(annotatedType)} but received default ${typeToString(defaultType)}`,
        );
      }

      const parameterSymbol: ValueSymbol = {
        kind: "Variable",
        name: parameter.name.lexeme,
        type: parameterType,
        declarationKeyword: keyword,
        declarationName: parameter.name,
      };

      if (!this.symbols.define(parameterSymbol)) {
        this.report(keyword, `duplicate parameter "${parameter.name.lexeme}"`);
      }
    }
  }

  /**
   * createSyntheticFunctionSymbol makes a temporary function frame for expressions.
   */
  private createSyntheticFunctionSymbol(keyword: Token, parameters: ParameterNode[], functionType: FunctionType): FunctionSymbol {
    return {
      kind: "Function",
      name: "<anonymous>",
      parameterCount: parameters.length,
      minimumParameterCount: this.minimumParameterCount(parameters),
      hasRestParameter: parameters.some((parameter: ParameterNode) => parameter.isRest),
      isAsync: functionType.isAsync,
      parameterNames: parameters.map((parameter: ParameterNode) => parameter.name.lexeme),
      parameterTypes: functionType.parameters,
      returnType: UNKNOWN_TYPE,
      declarationKeyword: keyword,
      declarationName: keyword,
      type: functionType,
    };
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
   * checkUnionTypeDefinition records Shevkar aliases in the symbol table.
   */
  private checkUnionTypeDefinition(statement: UnionTypeDefinitionNode): void {
    const existing: KethicSymbol | null = this.symbols.resolveCurrent(statement.name.lexeme);
    if (existing !== null && existing.kind === "Type" && existing.declarationName === statement.name) {
      return;
    }

    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    this.declareUnionType(statement);
  }

  /**
   * checkGenericTypeDefinition records Tharkar aliases in the symbol table.
   */
  private checkGenericTypeDefinition(statement: GenericTypeDefinitionNode): void {
    const existing: KethicSymbol | null = this.symbols.resolveCurrent(statement.name.lexeme);
    if (existing !== null && existing.kind === "GenericType" && existing.declarationName === statement.name) {
      return;
    }

    if (existing !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    this.declareGenericType(statement);
  }

  /**
   * declareUnionType stores a Shevkar alias without checking executable code.
   */
  private declareUnionType(statement: UnionTypeDefinitionNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const type: KethicType = this.resolveTypeExpression(statement.typeExpression, statement.keyword);
    const symbol: TypeSymbol = {
      kind: "Type",
      name: statement.name.lexeme,
      type,
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
  }

  /**
   * declareGenericType stores a Tharkar pattern-shape for later substitution.
   */
  private declareGenericType(statement: GenericTypeDefinitionNode): void {
    if (this.symbols.resolveCurrent(statement.name.lexeme) !== null) {
      this.report(statement.keyword, `duplicate declaration of "${statement.name.lexeme}"`);
      return;
    }

    const symbol: GenericTypeSymbol = {
      kind: "GenericType",
      name: statement.name.lexeme,
      typeParameters: statement.typeParameters.map((parameter) => parameter.lexeme),
      typeExpression: statement.typeExpression,
      declarationKeyword: statement.keyword,
      declarationName: statement.name,
    };
    this.symbols.define(symbol);
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
    this.checkFunctionArguments(statement.keyword, statement.callee.lexeme, symbol.type, statement.arguments);
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
      case "NullLiteral":
        return NULL_TYPE;
      case "ArrayLiteral":
        return this.inferArrayLiteral(expression, contextKeyword);
      case "ObjectLiteral":
        return this.inferObjectLiteral(expression, contextKeyword);
      case "MapLiteral":
        return this.inferMapLiteral(expression, contextKeyword);
      case "FunctionExpression":
        return this.inferFunctionExpression(expression);
      case "ArrowFunctionExpression":
        return this.inferArrowFunctionExpression(expression);
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
      case "AwaitExpression":
        return this.inferAwaitExpression(expression);
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

    if (symbol.kind === "Type" || symbol.kind === "GenericType") {
      this.report(contextKeyword, `type "${expression.name.lexeme}" cannot be used as a value`);
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
   * inferAwaitExpression validates that Torduren pauses only happen inside an
   * Ovdurthar function frame, then returns the awaited expression type.
   */
  private inferAwaitExpression(expression: AwaitExpressionNode): KethicType {
    const argumentType: KethicType = this.inferExpression(expression.argument, expression.keyword);

    if (this.currentFunction === null || !this.currentFunction.isAsync) {
      this.report(expression.keyword, "Torduren cannot appear outside an Ovdurthar function");
      return UNKNOWN_TYPE;
    }

    if (isUnknownType(argumentType)) {
      return UNKNOWN_TYPE;
    }

    if (argumentType.kind !== "Promise") {
      this.report(expression.keyword, `Torduren expected Promise but received ${typeToString(argumentType)}`);
      return UNKNOWN_TYPE;
    }

    return argumentType.innerType;
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
      return createUnionType([trueType, falseType]);
    }

    return isUnknownType(trueType) ? falseType : trueType;
  }

  /**
   * inferArrayLiteral returns a homogeneous array type or Unknown[] for mixed arrays.
   */
  private inferArrayLiteral(expression: ArrayLiteralNode, contextKeyword: Token): KethicType {
    if (expression.elements.length === 0) {
      return createArrayType(UNKNOWN_TYPE);
    }

    const elementTypes: KethicType[] = expression.elements.map((element: ExpressionNode) =>
      this.inferExpression(element, contextKeyword),
    );
    const firstType: KethicType = elementTypes[0];

    if (elementTypes.every((elementType: KethicType) => this.typesCompatible(firstType, elementType))) {
      return createArrayType(firstType);
    }

    return createArrayType(UNKNOWN_TYPE);
  }

  /**
   * inferObjectLiteral creates an anonymous object shape from literal properties.
   */
  private inferObjectLiteral(expression: ExpressionNode & { kind: "ObjectLiteral" }, contextKeyword: Token): KethicType {
    const properties: Record<string, KethicType> = {};

    for (const property of expression.properties) {
      const key: string = this.objectPropertyName(property.key);
      properties[key] = this.inferExpression(property.value, contextKeyword);
    }

    return createObjectType(properties);
  }

  /**
   * inferMapLiteral returns homogeneous Selva key/value types or Unknown slots when mixed.
   */
  private inferMapLiteral(expression: MapLiteralNode, contextKeyword: Token): KethicType {
    if (expression.entries.length === 0) {
      return createMapType(UNKNOWN_TYPE, UNKNOWN_TYPE);
    }

    const keyTypes: KethicType[] = expression.entries.map((entry) => this.inferExpression(entry.key, contextKeyword));
    const valueTypes: KethicType[] = expression.entries.map((entry) => this.inferExpression(entry.value, contextKeyword));
    const firstKeyType: KethicType = keyTypes[0];
    const firstValueType: KethicType = valueTypes[0];
    const keyType: KethicType = keyTypes.every((type: KethicType) => this.typesCompatible(firstKeyType, type))
      ? firstKeyType
      : UNKNOWN_TYPE;
    const valueType: KethicType = valueTypes.every((type: KethicType) => this.typesCompatible(firstValueType, type))
      ? firstValueType
      : UNKNOWN_TYPE;

    return createMapType(keyType, valueType);
  }

  /**
   * inferFunctionExpression checks a Tharva/Kelthar expression in its own scope.
   */
  private inferFunctionExpression(expression: FunctionExpressionNode): KethicType {
    const parameterTypes: KethicType[] = expression.parameters.map(() => UNKNOWN_TYPE);
    const functionType: FunctionType = createFunctionType(
      parameterTypes,
      UNKNOWN_TYPE,
      this.minimumParameterCount(expression.parameters),
      expression.parameters.some((parameter: ParameterNode) => parameter.isRest),
      expression.isAsync,
    );
    const functionSymbol: FunctionSymbol = this.createSyntheticFunctionSymbol(expression.keyword, expression.parameters, functionType);

    this.checkFunctionLikeBody(expression.parameters, expression.keyword, expression.body, functionSymbol, parameterTypes);
    return functionType;
  }

  /**
   * inferArrowFunctionExpression checks a Rinthar expression body or block body.
   */
  private inferArrowFunctionExpression(expression: ArrowFunctionExpressionNode): KethicType {
    const parameterTypes: KethicType[] = expression.parameters.map(() => UNKNOWN_TYPE);
    const functionType: FunctionType = createFunctionType(
      parameterTypes,
      UNKNOWN_TYPE,
      this.minimumParameterCount(expression.parameters),
      expression.parameters.some((parameter: ParameterNode) => parameter.isRest),
      expression.isAsync,
    );
    const functionSymbol: FunctionSymbol = this.createSyntheticFunctionSymbol(expression.keyword, expression.parameters, functionType);

    if (expression.body.kind === "BlockStatement") {
      this.checkFunctionLikeBody(expression.parameters, expression.keyword, expression.body, functionSymbol, parameterTypes);
      return functionType;
    }

    const previousFunction: FunctionSymbol | null = this.currentFunction;
    this.currentFunction = functionSymbol;
    this.symbols.enterScope();
    this.defineParameters(expression.parameters, expression.keyword, parameterTypes);
    const returnType: KethicType = this.inferExpression(expression.body, expression.keyword);
    functionSymbol.returnType = returnType;
    functionSymbol.type.returnType = returnType;
    this.symbols.exitScope();
    this.currentFunction = previousFunction;

    return functionType;
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

    if (symbol.kind === "Type" || symbol.kind === "GenericType") {
      this.report(contextKeyword, `type "${symbol.name}" cannot be assigned as a value`);
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
    const calleeType: KethicType = this.inferExpression(expression.callee, contextKeyword);

    if (calleeType.kind !== "Function") {
      const calleeName: string = expression.callee.kind === "IdentifierExpression" ? expression.callee.name.lexeme : "<expression>";
      this.report(contextKeyword, `Kelthar "${calleeName}" does not exist`);
      return UNKNOWN_TYPE;
    }

    this.checkFunctionTypeArgumentCount(contextKeyword, "call target", calleeType, expression.arguments.length);
    this.checkFunctionArguments(contextKeyword, "call target", calleeType, expression.arguments);

    return this.callReturnType(calleeType);
  }

  /**
   * inferUmkelCallExpression validates expression-level Umkel calls.
   */
  private inferUmkelCallExpression(expression: ExpressionNode & { kind: "UmkelCallExpression" }): KethicType {
    const symbol: KethicSymbol | null = this.symbols.resolve(expression.callee.lexeme);
    if (
      symbol === null ||
      (symbol.kind !== "Function" &&
        symbol.kind !== "Variable" &&
        symbol.kind !== "Constant") ||
      (symbol.kind !== "Function" && symbol.type.kind !== "Function")
    ) {
      this.report(expression.keyword, `Kelthar "${expression.callee.lexeme}" does not exist`);
      return UNKNOWN_TYPE;
    }

    if (symbol.kind === "Function") {
      this.checkArgumentCount(expression.keyword, expression.callee.lexeme, symbol, expression.arguments.length);
    } else {
      this.checkFunctionTypeArgumentCount(expression.keyword, expression.callee.lexeme, symbol.type as FunctionType, expression.arguments.length);
    }
    this.checkFunctionArguments(
      expression.keyword,
      expression.callee.lexeme,
      symbol.kind === "Function" ? symbol.type : (symbol.type as FunctionType),
      expression.arguments,
    );

    return this.callReturnType(symbol.kind === "Function" ? symbol.type : (symbol.type as FunctionType));
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

    if (objectType.kind === "Array" && expression.property.lexeme === "length") {
      return NUMBER_TYPE;
    }

    if (objectType.kind === "Object") {
      return objectType.properties[expression.property.lexeme] ?? UNKNOWN_TYPE;
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

    if (isUnknownType(objectType)) {
      return UNKNOWN_TYPE;
    }

    if (this.isPrimitive(objectType, "String")) {
      if (!this.typesCompatible(NUMBER_TYPE, indexType)) {
        this.report(contextKeyword, `index expression expected Number but received ${typeToString(indexType)}`);
      }
      return STRING_TYPE;
    }

    if (objectType.kind === "Array") {
      if (!this.typesCompatible(NUMBER_TYPE, indexType)) {
        this.report(contextKeyword, `index expression expected Number but received ${typeToString(indexType)}`);
      }
      return objectType.elementType;
    }

    if (objectType.kind === "Map") {
      if (!this.typesCompatible(objectType.keyType, indexType)) {
        this.report(
          contextKeyword,
          `Selva index expected ${typeToString(objectType.keyType)} key but received ${typeToString(indexType)}`,
        );
      }
      return objectType.valueType;
    }

    this.report(contextKeyword, `type ${typeToString(objectType)} cannot be indexed`);
    return UNKNOWN_TYPE;
  }

  /**
   * checkArgumentCount reports mismatched Kelthar arity.
   */
  private checkArgumentCount(keyword: Token, name: string, symbol: FunctionSymbol, actualCount: number): void {
    if (actualCount < symbol.minimumParameterCount || (!symbol.hasRestParameter && actualCount > symbol.parameterCount)) {
      this.report(
        keyword,
        `Kelthar "${name}" expected ${this.formatArity(symbol.minimumParameterCount, symbol.parameterCount, symbol.hasRestParameter)} argument(s) but received ${actualCount}`,
      );
    }
  }

  /**
   * checkFunctionTypeArgumentCount validates function values without a declaration symbol.
   */
  private checkFunctionTypeArgumentCount(keyword: Token, name: string, type: FunctionType, actualCount: number): void {
    if (actualCount < type.minimumParameterCount || (!type.hasRestParameter && actualCount > type.parameters.length)) {
      this.report(
        keyword,
        `Kelthar "${name}" expected ${this.formatArity(type.minimumParameterCount, type.parameters.length, type.hasRestParameter)} argument(s) but received ${actualCount}`,
      );
    }
  }

  /**
   * checkFunctionArguments validates provided arguments against annotated parameter types.
   */
  private checkFunctionArguments(keyword: Token, name: string, type: FunctionType, argumentsList: ExpressionNode[]): void {
    for (let index: number = 0; index < argumentsList.length; index += 1) {
      const expectedType: KethicType = this.expectedArgumentType(type, index);
      const actualType: KethicType = this.inferExpression(argumentsList[index], keyword);

      if (!this.typesCompatible(expectedType, actualType)) {
        this.report(
          keyword,
          `Kelthar "${name}" argument ${index + 1} expected ${typeToString(expectedType)} but received ${typeToString(actualType)}`,
        );
      }
    }
  }

  /**
   * expectedArgumentType resolves fixed and rest parameter positions.
   */
  private expectedArgumentType(type: FunctionType, index: number): KethicType {
    if (!type.hasRestParameter || index < type.parameters.length - 1) {
      return type.parameters[index] ?? UNKNOWN_TYPE;
    }

    const restType: KethicType = type.parameters[type.parameters.length - 1] ?? UNKNOWN_TYPE;
    return restType.kind === "Array" ? restType.elementType : restType;
  }

  /**
   * minimumParameterCount counts parameters that callers must provide.
   */
  private minimumParameterCount(parameters: ParameterNode[]): number {
    let count: number = 0;

    for (const parameter of parameters) {
      if (parameter.isRest || parameter.defaultValue !== null) {
        continue;
      }

      count += 1;
    }

    return count;
  }

  /**
   * formatArity explains exact, optional, and rest argument counts.
   */
  private formatArity(minimum: number, maximum: number, hasRest: boolean): string {
    if (hasRest) {
      return `at least ${minimum}`;
    }

    if (minimum === maximum) {
      return `${maximum}`;
    }

    return `${minimum}-${maximum}`;
  }

  /**
   * typesCompatible treats Unknown as compatible to avoid cascaded errors.
   */
  private typesCompatible(expected: KethicType, actual: KethicType): boolean {
    if (isUnknownType(expected) || isUnknownType(actual)) {
      return true;
    }

    if (expected.kind !== actual.kind) {
      if (expected.kind === "Union") {
        return expected.members.some((member: KethicType) => this.typesCompatible(member, actual));
      }

      if (actual.kind === "Union") {
        return actual.members.every((member: KethicType) => this.typesCompatible(expected, member));
      }

      return false;
    }

    if (expected.kind === "Primitive" && actual.kind === "Primitive") {
      return expected.name === actual.name;
    }

    if (expected.kind === "Array" && actual.kind === "Array") {
      return this.typesCompatible(expected.elementType, actual.elementType);
    }

    if (expected.kind === "Object" && actual.kind === "Object") {
      const expectedKeys: string[] = Object.keys(expected.properties);
      const actualKeys: string[] = Object.keys(actual.properties);

      return (
        expectedKeys.length === actualKeys.length &&
        expectedKeys.every((key: string) =>
          Object.prototype.hasOwnProperty.call(actual.properties, key) &&
          this.typesCompatible(expected.properties[key], actual.properties[key]),
        )
      );
    }

    if (expected.kind === "Map" && actual.kind === "Map") {
      return (
        this.typesCompatible(expected.keyType, actual.keyType) &&
        this.typesCompatible(expected.valueType, actual.valueType)
      );
    }

    if (expected.kind === "Union" && actual.kind === "Union") {
      return actual.members.every((actualMember: KethicType) =>
        expected.members.some((expectedMember: KethicType) => this.typesCompatible(expectedMember, actualMember)),
      );
    }

    if (expected.kind === "Promise" && actual.kind === "Promise") {
      return this.typesCompatible(expected.innerType, actual.innerType);
    }

    if (expected.kind === "Function" && actual.kind === "Function") {
      return (
        expected.parameters.length === actual.parameters.length &&
        expected.minimumParameterCount === actual.minimumParameterCount &&
        expected.hasRestParameter === actual.hasRestParameter &&
        expected.isAsync === actual.isAsync &&
        this.typesCompatible(expected.returnType, actual.returnType)
      );
    }

    return expected === actual;
  }

  /**
   * isPrimitive checks for a specific primitive type name.
   */
  private isPrimitive(type: KethicType, name: "Number" | "String" | "Boolean" | "Void" | "Null"): boolean {
    return type.kind === "Primitive" && type.name === name;
  }

  /**
   * callReturnType wraps Ovdurthar function results in the internal far-return
   * Promise type while leaving normal Kelthar calls as immediate values.
   */
  private callReturnType(type: FunctionType): KethicType {
    return type.isAsync ? createPromiseType(type.returnType) : type.returnType;
  }

  /**
   * objectPropertyName normalizes identifier and quoted object keys.
   */
  private objectPropertyName(key: Token): string {
    return key.type === TokenType.String ? key.lexeme.slice(1, -1) : key.lexeme;
  }

  /**
   * resolveTypeExpression converts parser type annotations into internal types.
   */
  private resolveTypeExpression(
    expression: TypeExpressionNode,
    contextKeyword: Token,
    typeBindings: TypeBindings = new Map<string, KethicType>(),
  ): KethicType {
    if (expression.kind === "UnionTypeExpression") {
      return createUnionType(
        expression.members.map((member: TypeExpressionNode) =>
          this.resolveTypeExpression(member, contextKeyword, typeBindings),
        ),
      );
    }

    if (expression.kind === "OptionalTypeExpression") {
      return createUnionType([this.resolveTypeExpression(expression.innerType, contextKeyword, typeBindings), NULL_TYPE]);
    }

    if (expression.kind === "ArrayTypeExpression") {
      return createArrayType(this.resolveTypeExpression(expression.elementType, contextKeyword, typeBindings));
    }

    if (expression.kind === "ObjectTypeExpression") {
      const properties: Record<string, KethicType> = {};
      for (const property of expression.properties) {
        properties[property.name.lexeme] = this.resolveTypeExpression(property.valueType, contextKeyword, typeBindings);
      }
      return createObjectType(properties);
    }

    const name: string = expression.name.type === TokenType.Umra ? "Null" : expression.name.lexeme;
    const typeArguments: KethicType[] = expression.typeArguments.map((typeArgument: TypeExpressionNode) =>
      this.resolveTypeExpression(typeArgument, contextKeyword, typeBindings),
    );

    if (typeBindings.has(name)) {
      if (typeArguments.length > 0) {
        this.report(contextKeyword, `type parameter "${name}" does not accept type arguments`);
      }
      return typeBindings.get(name) ?? UNKNOWN_TYPE;
    }

    switch (name) {
      case "Number":
        this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
        return NUMBER_TYPE;
      case "String":
        this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
        return STRING_TYPE;
      case "Boolean":
        this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
        return BOOLEAN_TYPE;
      case "Void":
        this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
        return VOID_TYPE;
      case "Null":
        this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
        return NULL_TYPE;
      case "Promise":
        if (typeArguments.length !== 1) {
          this.report(contextKeyword, `type "Promise" expected 1 type argument(s) but received ${typeArguments.length}`);
          return UNKNOWN_TYPE;
        }
        return createPromiseType(typeArguments[0]);
      default: {
        const symbol: KethicSymbol | null = this.symbols.resolve(name);
        if (symbol !== null && symbol.kind === "Type") {
          this.reportUnexpectedTypeArguments(name, typeArguments.length, contextKeyword);
          return symbol.type;
        }

        if (symbol !== null && symbol.kind === "GenericType") {
          if (typeArguments.length !== symbol.typeParameters.length) {
            this.report(
              contextKeyword,
              `Tharkar "${name}" expected ${symbol.typeParameters.length} type argument(s) but received ${typeArguments.length}`,
            );
            return UNKNOWN_TYPE;
          }

          const nextBindings: Map<string, KethicType> = new Map<string, KethicType>(typeBindings);
          for (let index: number = 0; index < symbol.typeParameters.length; index += 1) {
            nextBindings.set(symbol.typeParameters[index], typeArguments[index]);
          }

          return this.resolveTypeExpression(symbol.typeExpression, contextKeyword, nextBindings);
        }

        this.report(contextKeyword, `type "${name}" does not exist`);
        return UNKNOWN_TYPE;
      }
    }
  }

  /**
   * reportUnexpectedTypeArguments rejects generic arguments on non-generic types.
   */
  private reportUnexpectedTypeArguments(name: string, argumentCount: number, contextKeyword: Token): void {
    if (argumentCount > 0) {
      this.report(contextKeyword, `type "${name}" does not accept type arguments`);
    }
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
