import { Token, TokenType } from "../lexer/tokens";
import { Lexer } from "../lexer/lexer";
import {
  AssignmentExpressionNode,
  ArrayLiteralNode,
  BinaryExpressionNode,
  BooleanLiteralNode,
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
  GroupingExpressionNode,
  IdentifierExpressionNode,
  IndexExpressionNode,
  LoopStatementNode,
  MemberExpressionNode,
  NumberLiteralNode,
  NullLiteralNode,
  ObjectLiteralNode,
  ObjectPropertyNode,
  OvrinDeclarationNode,
  ParameterNode,
  ProgramNode,
  ReturnStatementNode,
  SourceLocation,
  StatementNode,
  StringLiteralNode,
  SwitchCaseNode,
  SwitchStatementNode,
  TemplateExpressionPartNode,
  TemplateStaticPartNode,
  TemplateStringNode,
  TypeDefinitionNode,
  TypeFieldNode,
  UmkelCallExpressionNode,
  UnaryExpressionNode,
  VariableDeclarationNode,
} from "./ast";

/**
 * ParserError is thrown when a valid token stream does not match Kethic grammar.
 */
export class ParserError extends Error {
  public readonly token: Token;

  public constructor(token: Token, message: string) {
    super(`${message} at line ${token.line}, column ${token.column}`);
    this.name = "ParserError";
    this.token = token;
  }
}

/**
 * Parser consumes lexer tokens and produces a fully typed AST.
 * It does not perform type checking or code generation.
 */
export class Parser {
  private readonly tokens: Token[];
  private current: number = 0;

  public constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * parse returns the root Program node for a complete Kethic source file.
   */
  public parse(): ProgramNode {
    const body: StatementNode[] = [];
    const firstToken: Token = this.peek();

    while (!this.isAtEnd()) {
      body.push(this.parseDeclarationOrStatement());
    }

    return {
      kind: "Program",
      location: this.locationFrom(firstToken),
      body,
    };
  }

  /**
   * parseExpressionOnly parses a standalone expression token stream.
   */
  public parseExpressionOnly(): ExpressionNode {
    const expression: ExpressionNode = this.parseExpression();
    this.consume(TokenType.EOF, "Expected end of expression.");
    return expression;
  }

  /**
   * parseDeclarationOrStatement routes top-level and block forms by keyword.
   */
  private parseDeclarationOrStatement(): StatementNode {
    if (this.match(TokenType.Nava)) {
      return this.parseVariableDeclaration(this.previous());
    }

    if (this.match(TokenType.Torun)) {
      return this.parseConstantDeclaration(this.previous());
    }

    if (this.match(TokenType.Kelthar)) {
      return this.parseFunctionDeclaration(this.previous());
    }

    if (this.match(TokenType.Selkar)) {
      return this.parseTypeDefinition(this.previous());
    }

    if (this.match(TokenType.Ovrin)) {
      return this.parseOvrinDeclaration(this.previous());
    }

    return this.parseStatement();
  }

  /**
   * parseStatement handles executable statement forms.
   */
  private parseStatement(): StatementNode {
    if (this.match(TokenType.Umkel)) {
      return this.parseFunctionCallStatement(this.previous());
    }

    if (this.match(TokenType.Duren)) {
      return this.parseReturnStatement(this.previous());
    }

    if (this.match(TokenType.Ikhshev)) {
      return this.parseConditionalStatement(this.previous());
    }

    if (this.match(TokenType.Rukhar)) {
      return this.parseLoopStatement(this.previous());
    }

    if (this.match(TokenType.Ikhselthar)) {
      return this.parseSwitchStatement(this.previous());
    }

    if (this.match(TokenType.Duruk)) {
      return this.parseBreakStatement(this.previous());
    }

    if (this.match(TokenType.Rukum)) {
      return this.parseContinueStatement(this.previous());
    }

    if (this.match(TokenType.Eshnak)) {
      return this.parseErrorHandlingStatement(this.previous());
    }

    if (this.match(TokenType.LeftBrace)) {
      return this.parseBlockFromOpening(this.previous());
    }

    return this.parseExpressionStatement();
  }

  /**
   * parseVariableDeclaration parses Navā name (= expression)?;
   */
  private parseVariableDeclaration(keyword: Token): VariableDeclarationNode {
    const name: Token = this.consume(TokenType.Identifier, "Expected variable name after Navā.");
    const initializer: ExpressionNode | null = this.match(TokenType.Equals) ? this.parseExpression() : null;
    this.consume(TokenType.Semicolon, "Expected ';' after variable declaration.");

    return {
      kind: "VariableDeclaration",
      location: this.locationFrom(keyword),
      keyword,
      name,
      initializer,
    };
  }

  /**
   * parseConstantDeclaration parses Torūn name = expression;
   */
  private parseConstantDeclaration(keyword: Token): ConstantDeclarationNode {
    const name: Token = this.consume(TokenType.Identifier, "Expected constant name after Torūn.");
    this.consume(TokenType.Equals, "Expected '=' after constant name.");
    const initializer: ExpressionNode = this.parseExpression();
    this.consume(TokenType.Semicolon, "Expected ';' after constant declaration.");

    return {
      kind: "ConstantDeclaration",
      location: this.locationFrom(keyword),
      keyword,
      name,
      initializer,
    };
  }

  /**
   * parseFunctionDeclaration parses Kelthar name(param, param) { ... }
   */
  private parseFunctionDeclaration(keyword: Token): FunctionDeclarationNode {
    const name: Token = this.consume(TokenType.Identifier, "Expected function name after Kelthar.");
    const parameters: ParameterNode[] = this.parseParameterList();
    const body: BlockStatementNode = this.parseRequiredBlock("Expected function body after Kelthar parameters.");

    return {
      kind: "FunctionDeclaration",
      location: this.locationFrom(keyword),
      keyword,
      name,
      parameters,
      body,
    };
  }

  /**
   * parseTypeDefinition parses Selkar Name { field: Type; }
   */
  private parseTypeDefinition(keyword: Token): TypeDefinitionNode {
    const name: Token = this.consume(TokenType.Identifier, "Expected type name after Selkar.");
    this.consume(TokenType.LeftBrace, "Expected '{' before Selkar fields.");

    const fields: TypeFieldNode[] = [];
    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      const fieldName: Token = this.consume(TokenType.Identifier, "Expected Selkar field name.");
      this.consume(TokenType.Colon, "Expected ':' after Selkar field name.");
      const typeName: Token = this.consume(TokenType.Identifier, "Expected Selkar field type.");
      this.consume(TokenType.Semicolon, "Expected ';' after Selkar field.");

      fields.push({
        kind: "TypeField",
        location: this.locationFrom(fieldName),
        name: fieldName,
        typeName,
      });
    }

    this.consume(TokenType.RightBrace, "Expected '}' after Selkar fields.");

    return {
      kind: "TypeDefinition",
      location: this.locationFrom(keyword),
      keyword,
      name,
      fields,
    };
  }

  /**
   * parseOvrinDeclaration parses either:
   * Ovrin name;
   * Ovrin name from "module";
   * The word from is intentionally parsed as an identifier until Phase 3 gives
   * module flow stronger semantics.
   */
  private parseOvrinDeclaration(keyword: Token): OvrinDeclarationNode {
    const name: Token = this.consume(TokenType.Identifier, "Expected carried name after Ovrin.");
    let source: StringLiteralNode | null = null;

    if (this.check(TokenType.Identifier) && this.peek().lexeme === "from") {
      this.advance();
      const sourceToken: Token = this.consume(TokenType.String, "Expected source string after Ovrin from.");
      source = this.createStringLiteral(sourceToken);
    }

    this.consume(TokenType.Semicolon, "Expected ';' after Ovrin declaration.");

    return {
      kind: "OvrinDeclaration",
      location: this.locationFrom(keyword),
      keyword,
      name,
      source,
    };
  }

  /**
   * parseFunctionCallStatement parses Umkel name(argument, argument);
   */
  private parseFunctionCallStatement(keyword: Token): FunctionCallStatementNode {
    const callee: Token = this.consume(TokenType.Identifier, "Expected function name after Umkel.");
    const args: ExpressionNode[] = this.parseArgumentList();
    this.consume(TokenType.Semicolon, "Expected ';' after Umkel call.");

    return {
      kind: "FunctionCallStatement",
      location: this.locationFrom(keyword),
      keyword,
      callee,
      arguments: args,
    };
  }

  /**
   * parseReturnStatement parses Duren expression?;
   */
  private parseReturnStatement(keyword: Token): ReturnStatementNode {
    const value: ExpressionNode | null = this.check(TokenType.Semicolon) ? null : this.parseExpression();
    this.consume(TokenType.Semicolon, "Expected ';' after Duren statement.");

    return {
      kind: "ReturnStatement",
      location: this.locationFrom(keyword),
      keyword,
      value,
    };
  }

  /**
   * parseConditionalStatement parses Ikhshev expression { ... }
   */
  private parseConditionalStatement(keyword: Token): ConditionalStatementNode {
    const condition: ExpressionNode = this.parseExpression();
    const thenBranch: BlockStatementNode = this.parseRequiredBlock("Expected Ikhshev branch body.");
    const elseBranch: ConditionalStatementNode | BlockStatementNode | null = this.parseOptionalShevBranch();

    return {
      kind: "ConditionalStatement",
      location: this.locationFrom(keyword),
      keyword,
      condition,
      thenBranch,
      elseBranch,
    };
  }

  /**
   * parseOptionalShevBranch parses Shev { ... } and Shev Ikhshev ... chains.
   */
  private parseOptionalShevBranch(): ConditionalStatementNode | BlockStatementNode | null {
    if (!this.match(TokenType.Shev)) {
      return null;
    }

    if (this.match(TokenType.Ikhshev)) {
      return this.parseConditionalStatement(this.previous());
    }

    return this.parseRequiredBlock("Expected Shev branch body.");
  }

  /**
   * parseLoopStatement parses Rukhar expression { ... }
   */
  private parseLoopStatement(keyword: Token): LoopStatementNode {
    const condition: ExpressionNode = this.parseExpression();
    const body: BlockStatementNode = this.parseRequiredBlock("Expected Rukhar body.");

    return {
      kind: "LoopStatement",
      location: this.locationFrom(keyword),
      keyword,
      condition,
      body,
    };
  }

  /**
   * parseSwitchStatement parses Ikhselthar expression { Selikhshev value { ... } Ovikhnak { ... } }
   */
  private parseSwitchStatement(keyword: Token): SwitchStatementNode {
    const expression: ExpressionNode = this.parseExpression();
    this.consume(TokenType.LeftBrace, "Expected '{' before Ikhselthar body.");

    const cases: SwitchCaseNode[] = [];
    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      if (this.match(TokenType.Selikhshev)) {
        cases.push(this.parseSwitchCase(this.previous(), false));
        continue;
      }

      if (this.match(TokenType.Ovikhnak)) {
        cases.push(this.parseSwitchCase(this.previous(), true));
        continue;
      }

      throw new ParserError(this.peek(), "Expected Selikhshev or Ovikhnak in Ikhselthar body.");
    }

    this.consume(TokenType.RightBrace, "Expected '}' after Ikhselthar body.");

    if (cases.length === 0) {
      throw new ParserError(keyword, "Expected at least one Selikhshev or Ovikhnak branch.");
    }

    return {
      kind: "SwitchStatement",
      location: this.locationFrom(keyword),
      keyword,
      expression,
      cases,
    };
  }

  /**
   * parseSwitchCase parses either a Selikhshev match block or an Ovikhnak default block.
   */
  private parseSwitchCase(keyword: Token, isDefault: boolean): SwitchCaseNode {
    const matchValue: ExpressionNode | null = isDefault ? null : this.parseExpression();
    const body: BlockStatementNode = this.parseRequiredBlock(
      isDefault ? "Expected Ovikhnak body." : "Expected Selikhshev body.",
    );

    return {
      kind: "SwitchCase",
      location: this.locationFrom(keyword),
      keyword,
      matchValue,
      body,
    };
  }

  /**
   * parseBreakStatement parses Duruk;
   */
  private parseBreakStatement(keyword: Token): BreakStatementNode {
    this.consume(TokenType.Semicolon, "Expected ';' after Duruk.");

    return {
      kind: "BreakStatement",
      location: this.locationFrom(keyword),
      keyword,
    };
  }

  /**
   * parseContinueStatement parses Rukum;
   */
  private parseContinueStatement(keyword: Token): ContinueStatementNode {
    this.consume(TokenType.Semicolon, "Expected ';' after Rukum.");

    return {
      kind: "ContinueStatement",
      location: this.locationFrom(keyword),
      keyword,
    };
  }

  /**
   * parseErrorHandlingStatement parses Eshnak { guarded } { recovery }.
   */
  private parseErrorHandlingStatement(keyword: Token): ErrorHandlingStatementNode {
    const guardedBody: BlockStatementNode = this.parseRequiredBlock("Expected guarded block after Eshnak.");

    if (this.match(TokenType.Ikhshev)) {
      const recoveryBodyWithIkhshev: BlockStatementNode = this.parseRequiredBlock("Expected recovery block after Eshnak Ikhshev.");

      return {
        kind: "ErrorHandlingStatement",
        location: this.locationFrom(keyword),
        keyword,
        guardedBody,
        recoveryBody: recoveryBodyWithIkhshev,
      };
    }

    const recoveryBody: BlockStatementNode = this.parseRequiredBlock("Expected recovery block after Eshnak guarded block.");

    return {
      kind: "ErrorHandlingStatement",
      location: this.locationFrom(keyword),
      keyword,
      guardedBody,
      recoveryBody,
    };
  }

  /**
   * parseExpressionStatement parses expression;
   */
  private parseExpressionStatement(): ExpressionStatementNode {
    const expression: ExpressionNode = this.parseExpression();
    this.consume(TokenType.Semicolon, "Expected ';' after expression.");

    return {
      kind: "ExpressionStatement",
      location: expression.location,
      expression,
    };
  }

  /**
   * parseBlockFromOpening parses a block after the opening brace has been consumed.
   */
  private parseBlockFromOpening(openingBrace: Token): BlockStatementNode {
    const body: StatementNode[] = [];

    while (!this.check(TokenType.RightBrace) && !this.isAtEnd()) {
      body.push(this.parseDeclarationOrStatement());
    }

    this.consume(TokenType.RightBrace, "Expected '}' after block.");

    return {
      kind: "BlockStatement",
      location: this.locationFrom(openingBrace),
      body,
    };
  }

  /**
   * parseRequiredBlock consumes and parses a required braced block.
   */
  private parseRequiredBlock(message: string): BlockStatementNode {
    const openingBrace: Token = this.consume(TokenType.LeftBrace, message);
    return this.parseBlockFromOpening(openingBrace);
  }

  /**
   * parseExpression starts the expression precedence chain.
   */
  private parseExpression(): ExpressionNode {
    return this.parseAssignment();
  }

  /**
   * parseAssignment handles right-associative identifier assignment.
   */
  private parseAssignment(): ExpressionNode {
    const expression: ExpressionNode = this.parseConditionalExpression();

    if (this.match(TokenType.Equals)) {
      const equals: Token = this.previous();
      const value: ExpressionNode = this.parseAssignment();

      if (!this.isAssignmentTarget(expression)) {
        throw new ParserError(equals, "Invalid assignment target.");
      }

      return {
        kind: "AssignmentExpression",
        location: expression.location,
        target: expression,
        equals,
        value,
      } satisfies AssignmentExpressionNode;
    }

    return expression;
  }

  /**
   * parseConditionalExpression handles condition ? whenTrue : whenFalse.
   */
  private parseConditionalExpression(): ExpressionNode {
    const condition: ExpressionNode = this.parseLogicalOr();

    if (!this.match(TokenType.QuestionMark)) {
      return condition;
    }

    const questionMark: Token = this.previous();
    const whenTrue: ExpressionNode = this.parseExpression();
    const colon: Token = this.consume(TokenType.Colon, "Expected ':' in conditional expression.");
    const whenFalse: ExpressionNode = this.parseConditionalExpression();

    return {
      kind: "ConditionalExpression",
      location: condition.location,
      condition,
      questionMark,
      whenTrue,
      colon,
      whenFalse,
    } satisfies ConditionalExpressionNode;
  }

  /**
   * parseLogicalOr handles || expressions.
   */
  private parseLogicalOr(): ExpressionNode {
    return this.parseBinaryLeftAssociative(() => this.parseLogicalAnd(), TokenType.OrOr);
  }

  /**
   * parseLogicalAnd handles && expressions.
   */
  private parseLogicalAnd(): ExpressionNode {
    return this.parseBinaryLeftAssociative(() => this.parseEquality(), TokenType.AndAnd);
  }

  /**
   * parseEquality handles == and != expressions.
   */
  private parseEquality(): ExpressionNode {
    return this.parseBinaryLeftAssociative(
      () => this.parseComparison(),
      TokenType.DoubleEquals,
      TokenType.BangEquals,
    );
  }

  /**
   * parseComparison handles <, <=, >, and >= expressions.
   */
  private parseComparison(): ExpressionNode {
    return this.parseBinaryLeftAssociative(
      () => this.parseTerm(),
      TokenType.Less,
      TokenType.LessEquals,
      TokenType.Greater,
      TokenType.GreaterEquals,
    );
  }

  /**
   * parseTerm handles + and - expressions.
   */
  private parseTerm(): ExpressionNode {
    return this.parseBinaryLeftAssociative(() => this.parseFactor(), TokenType.Plus, TokenType.Minus);
  }

  /**
   * parseFactor handles *, /, and % expressions.
   */
  private parseFactor(): ExpressionNode {
    return this.parseBinaryLeftAssociative(
      () => this.parseUnary(),
      TokenType.Star,
      TokenType.Slash,
      TokenType.Percent,
    );
  }

  /**
   * parseUnary handles prefix ! and -.
   */
  private parseUnary(): ExpressionNode {
    if (this.match(TokenType.Bang, TokenType.Minus)) {
      const operator: Token = this.previous();
      const argument: ExpressionNode = this.parseUnary();

      return {
        kind: "UnaryExpression",
        location: this.locationFrom(operator),
        operator,
        argument,
      } satisfies UnaryExpressionNode;
    }

    return this.parseCall();
  }

  /**
   * parseCall handles expression-level calls such as pattern(value).
   */
  private parseCall(): ExpressionNode {
    let expression: ExpressionNode = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LeftParen)) {
        const openingParen: Token = this.previous();
        const args: ExpressionNode[] = this.parseArgumentsAfterOpeningParen();
        expression = {
          kind: "CallExpression",
          location: expression.location,
          callee: expression,
          arguments: args,
        } satisfies CallExpressionNode;

        if (openingParen.type !== TokenType.LeftParen) {
          throw new ParserError(openingParen, "Internal parser error while parsing call.");
        }
        continue;
      }

      if (this.match(TokenType.Dot)) {
        const property: Token = this.consume(TokenType.Identifier, "Expected property name after '.'.");
        expression = {
          kind: "MemberExpression",
          location: expression.location,
          object: expression,
          property,
        } satisfies MemberExpressionNode;
        continue;
      }

      if (this.match(TokenType.LeftBracket)) {
        const index: ExpressionNode = this.parseExpression();
        this.consume(TokenType.RightBracket, "Expected ']' after index expression.");
        expression = {
          kind: "IndexExpression",
          location: expression.location,
          object: expression,
          index,
        } satisfies IndexExpressionNode;
        continue;
      }

      break;
    }

    return expression;
  }

  /**
   * parsePrimary handles literals, identifiers, and grouped expressions.
   */
  private parsePrimary(): ExpressionNode {
    if (this.match(TokenType.Umkel)) {
      const keyword: Token = this.previous();
      const callee: Token = this.consume(TokenType.Identifier, "Expected function name after Umkel.");
      const args: ExpressionNode[] = this.parseArgumentList();

      return {
        kind: "UmkelCallExpression",
        location: this.locationFrom(keyword),
        keyword,
        callee,
        arguments: args,
      } satisfies UmkelCallExpressionNode;
    }

    if (this.match(TokenType.Tharva)) {
      return this.parseFunctionExpression(this.previous());
    }

    if (this.match(TokenType.Kelthar)) {
      return this.parseFunctionExpression(this.previous());
    }

    if (this.match(TokenType.Rinthar)) {
      return this.parseArrowFunctionExpression(this.previous());
    }

    if (this.match(TokenType.Number)) {
      const token: Token = this.previous();
      const value: number = Number(token.lexeme);

      return {
        kind: "NumberLiteral",
        location: this.locationFrom(token),
        token,
        value,
      } satisfies NumberLiteralNode;
    }

    if (this.match(TokenType.String)) {
      return this.createStringLiteral(this.previous());
    }

    if (this.match(TokenType.Umra)) {
      return this.createNullLiteral(this.previous());
    }

    if (this.match(TokenType.LeftBracket)) {
      return this.parseArrayLiteral(this.previous());
    }

    if (this.match(TokenType.LeftBrace)) {
      return this.parseObjectLiteral(this.previous());
    }

    if (this.match(TokenType.TemplateString)) {
      return this.createTemplateString(this.previous());
    }

    if (this.match(TokenType.Identifier)) {
      const name: Token = this.previous();

      if (name.lexeme === "true" || name.lexeme === "false") {
        return {
          kind: "BooleanLiteral",
          location: this.locationFrom(name),
          token: name,
          value: name.lexeme === "true",
        } satisfies BooleanLiteralNode;
      }

      return {
        kind: "IdentifierExpression",
        location: this.locationFrom(name),
        name,
      } satisfies IdentifierExpressionNode;
    }

    if (this.match(TokenType.LeftParen)) {
      const openingParen: Token = this.previous();
      const expression: ExpressionNode = this.parseExpression();
      this.consume(TokenType.RightParen, "Expected ')' after grouped expression.");

      return {
        kind: "GroupingExpression",
        location: this.locationFrom(openingParen),
        expression,
      } satisfies GroupingExpressionNode;
    }

    throw new ParserError(this.peek(), "Expected expression.");
  }

  /**
   * parseBinaryLeftAssociative parses binary operators of a single precedence level.
   */
  private parseBinaryLeftAssociative(parseOperand: () => ExpressionNode, ...operators: TokenType[]): ExpressionNode {
    let expression: ExpressionNode = parseOperand();

    while (this.match(...operators)) {
      const operator: Token = this.previous();
      const right: ExpressionNode = parseOperand();
      expression = {
        kind: "BinaryExpression",
        location: expression.location,
        left: expression,
        operator,
        right,
      } satisfies BinaryExpressionNode;
    }

    return expression;
  }

  /**
   * parseParameterList parses function parameters inside parentheses.
   */
  private parseParameterList(): ParameterNode[] {
    this.consume(TokenType.LeftParen, "Expected '(' before parameter list.");
    const parameters: ParameterNode[] = [];

    if (!this.check(TokenType.RightParen)) {
      do {
        const isRest: boolean = this.match(TokenType.Ellipsis);
        const name: Token = this.consume(TokenType.Identifier, "Expected parameter name.");
        const defaultValue: ExpressionNode | null = this.match(TokenType.Equals) ? this.parseExpression() : null;

        if (isRest && defaultValue !== null) {
          throw new ParserError(name, "Rest parameters cannot have default values.");
        }

        parameters.push({
          kind: "Parameter",
          location: this.locationFrom(name),
          name,
          defaultValue,
          isRest,
        });

        if (isRest && !this.check(TokenType.RightParen)) {
          throw new ParserError(name, "Rest parameter must be the final parameter.");
        }
      } while (this.match(TokenType.Comma));
    }

    this.consume(TokenType.RightParen, "Expected ')' after parameter list.");
    return parameters;
  }

  /**
   * parseFunctionExpression parses Tharva(...) { ... } or expression-position Kelthar(...) { ... }.
   */
  private parseFunctionExpression(keyword: Token): FunctionExpressionNode {
    const parameters: ParameterNode[] = this.parseParameterList();
    const body: BlockStatementNode = this.parseRequiredBlock("Expected function expression body.");

    return {
      kind: "FunctionExpression",
      location: this.locationFrom(keyword),
      keyword,
      parameters,
      body,
    };
  }

  /**
   * parseArrowFunctionExpression parses Rinthar (...) -> expression or block.
   */
  private parseArrowFunctionExpression(keyword: Token): ArrowFunctionExpressionNode {
    const parameters: ParameterNode[] = this.parseParameterList();
    this.consume(TokenType.Arrow, "Expected '->' after Rinthar parameters.");

    const body: ExpressionNode | BlockStatementNode = this.match(TokenType.LeftBrace)
      ? this.parseBlockFromOpening(this.previous())
      : this.parseExpression();

    return {
      kind: "ArrowFunctionExpression",
      location: this.locationFrom(keyword),
      keyword,
      parameters,
      body,
    };
  }

  /**
   * parseArgumentList parses call arguments from the opening parenthesis.
   */
  private parseArgumentList(): ExpressionNode[] {
    this.consume(TokenType.LeftParen, "Expected '(' before argument list.");
    return this.parseArgumentsAfterOpeningParen();
  }

  /**
   * parseArgumentsAfterOpeningParen parses arguments after '(' has been consumed.
   */
  private parseArgumentsAfterOpeningParen(): ExpressionNode[] {
    const args: ExpressionNode[] = [];

    if (!this.check(TokenType.RightParen)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.Comma));
    }

    this.consume(TokenType.RightParen, "Expected ')' after argument list.");
    return args;
  }

  /**
   * parseArrayLiteral parses [value, value] including empty and nested arrays.
   */
  private parseArrayLiteral(openingBracket: Token): ArrayLiteralNode {
    const elements: ExpressionNode[] = [];

    if (!this.check(TokenType.RightBracket)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.Comma));
    }

    this.consume(TokenType.RightBracket, "Expected ']' after array literal.");

    return {
      kind: "ArrayLiteral",
      location: this.locationFrom(openingBracket),
      openingBracket,
      elements,
    };
  }

  /**
   * parseObjectLiteral parses { key: value, key: value } anonymous structures.
   */
  private parseObjectLiteral(openingBrace: Token): ObjectLiteralNode {
    const properties: ObjectPropertyNode[] = [];

    if (!this.check(TokenType.RightBrace)) {
      do {
        const key: Token = this.match(TokenType.Identifier)
          ? this.previous()
          : this.consume(TokenType.String, "Expected object property name.");
        this.consume(TokenType.Colon, "Expected ':' after object property name.");
        const value: ExpressionNode = this.parseExpression();
        properties.push({
          kind: "ObjectProperty",
          location: this.locationFrom(key),
          key,
          value,
        });
      } while (this.match(TokenType.Comma));
    }

    this.consume(TokenType.RightBrace, "Expected '}' after object literal.");

    return {
      kind: "ObjectLiteral",
      location: this.locationFrom(openingBrace),
      openingBrace,
      properties,
    };
  }

  /**
   * createStringLiteral strips quotes from a string token while preserving escapes.
   */
  private createStringLiteral(token: Token): StringLiteralNode {
    return {
      kind: "StringLiteral",
      location: this.locationFrom(token),
      token,
      value: token.lexeme.slice(1, -1),
    };
  }

  /**
   * createNullLiteral converts Umra into a null literal AST node.
   */
  private createNullLiteral(token: Token): NullLiteralNode {
    return {
      kind: "NullLiteral",
      location: this.locationFrom(token),
      keyword: token,
      value: null,
    };
  }

  /**
   * createTemplateString splits a raw template token into static and expression parts.
   */
  private createTemplateString(token: Token): TemplateStringNode {
    const body: string = token.lexeme.slice(1, -1);
    const parts: (TemplateStaticPartNode | TemplateExpressionPartNode)[] = [];
    let staticText: string = "";
    let index: number = 0;

    while (index < body.length) {
      const character: string = body.charAt(index);

      if (character === "\\") {
        if (index + 1 < body.length) {
          staticText += body.charAt(index + 1);
          index += 2;
          continue;
        }
      }

      if (character === "{") {
        if (staticText.length > 0) {
          parts.push({
            kind: "TemplateStaticPart",
            location: this.locationFrom(token),
            value: staticText,
          });
          staticText = "";
        }

        const expressionEnd: number = this.findTemplateExpressionEnd(body, index + 1, token);
        const expressionSource: string = body.slice(index + 1, expressionEnd).trim();
        const expression: ExpressionNode = new Parser(new Lexer(expressionSource).scanTokens()).parseExpressionOnly();
        parts.push({
          kind: "TemplateExpressionPart",
          location: this.locationFrom(token),
          expression,
        });
        index = expressionEnd + 1;
        continue;
      }

      staticText += character;
      index += 1;
    }

    if (staticText.length > 0) {
      parts.push({
        kind: "TemplateStaticPart",
        location: this.locationFrom(token),
        value: staticText,
      });
    }

    return {
      kind: "TemplateString",
      location: this.locationFrom(token),
      token,
      parts,
    };
  }

  /**
   * findTemplateExpressionEnd finds the matching interpolation close brace.
   */
  private findTemplateExpressionEnd(body: string, startIndex: number, token: Token): number {
    let depth: number = 0;

    for (let index: number = startIndex; index < body.length; index += 1) {
      const character: string = body.charAt(index);

      if (character === "{") {
        depth += 1;
        continue;
      }

      if (character === "}") {
        if (depth === 0) {
          return index;
        }
        depth -= 1;
      }
    }

    throw new ParserError(token, "Unterminated template string interpolation.");
  }

  /**
   * isAssignmentTarget reports whether an expression can receive assignment.
   */
  private isAssignmentTarget(expression: ExpressionNode): expression is IdentifierExpressionNode | MemberExpressionNode | IndexExpressionNode {
    return (
      expression.kind === "IdentifierExpression" ||
      expression.kind === "MemberExpression" ||
      expression.kind === "IndexExpression"
    );
  }

  /**
   * match consumes the current token when it has any requested type.
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  /**
   * consume requires the current token to have a specific type.
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw new ParserError(this.peek(), message);
  }

  /**
   * check tests the current token without consuming it.
   */
  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  /**
   * advance consumes the current token and returns it.
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1;
    }

    return this.previous();
  }

  /**
   * isAtEnd reports whether the parser has reached EOF.
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * peek returns the current token.
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * previous returns the most recently consumed token.
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * locationFrom creates an AST source location from a token.
   */
  private locationFrom(token: Token): SourceLocation {
    return {
      line: token.line,
      column: token.column,
    };
  }
}
