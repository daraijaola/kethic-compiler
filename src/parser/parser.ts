import { Token, TokenType } from "../lexer/tokens";
import {
  AssignmentExpressionNode,
  BinaryExpressionNode,
  BooleanLiteralNode,
  BlockStatementNode,
  CallExpressionNode,
  ConditionalStatementNode,
  ConstantDeclarationNode,
  ErrorHandlingStatementNode,
  ExpressionNode,
  ExpressionStatementNode,
  FunctionCallStatementNode,
  FunctionDeclarationNode,
  GroupingExpressionNode,
  IdentifierExpressionNode,
  IndexExpressionNode,
  LoopStatementNode,
  MemberExpressionNode,
  NumberLiteralNode,
  OvrinDeclarationNode,
  ParameterNode,
  ProgramNode,
  ReturnStatementNode,
  SourceLocation,
  StatementNode,
  StringLiteralNode,
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

    return {
      kind: "ConditionalStatement",
      location: this.locationFrom(keyword),
      keyword,
      condition,
      thenBranch,
    };
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
    const expression: ExpressionNode = this.parseLogicalOr();

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
        const name: Token = this.consume(TokenType.Identifier, "Expected parameter name.");
        parameters.push({
          kind: "Parameter",
          location: this.locationFrom(name),
          name,
        });
      } while (this.match(TokenType.Comma));
    }

    this.consume(TokenType.RightParen, "Expected ')' after parameter list.");
    return parameters;
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
