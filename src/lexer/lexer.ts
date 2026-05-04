import { KEYWORDS, Token, TokenType } from "./tokens";

/**
 * LexerError is thrown when raw Kethic source cannot be tokenized.
 * It preserves line and column separately so callers can format diagnostics.
 */
export class LexerError extends Error {
  public readonly line: number;
  public readonly column: number;

  public constructor(message: string, line: number, column: number) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = "LexerError";
    this.line = line;
    this.column = column;
  }
}

/**
 * Lexer turns raw .keth source text into a typed token stream.
 * It performs only lexical work: no parsing, type checking, or semantic rules.
 */
export class Lexer {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private current: number = 0;
  private line: number = 1;
  private column: number = 1;

  public constructor(source: string) {
    this.source = source;
  }

  /**
   * scanTokens walks the full input and returns every token, ending with EOF.
   */
  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

  /**
   * scanToken consumes one lexical unit from the current source position.
   */
  private scanToken(): void {
    const startLine: number = this.line;
    const startColumn: number = this.column;
    const character: string = this.advance();

    switch (character) {
      // Whitespace separates tokens but has no meaning in the token stream.
      case " ":
      case "\r":
      case "\t":
        return;
      case "\n":
        return;

      // Single-character arithmetic operators.
      case "+":
        this.addToken(TokenType.Plus, character, startLine, startColumn);
        return;
      case "*":
        this.addToken(TokenType.Star, character, startLine, startColumn);
        return;
      case "/":
        this.addToken(TokenType.Slash, character, startLine, startColumn);
        return;
      case "%":
        this.addToken(TokenType.Percent, character, startLine, startColumn);
        return;

      // Minus may stand alone or introduce an arrow operator.
      case "-":
        this.addToken(
          this.match(">") ? TokenType.Arrow : TokenType.Minus,
          this.matchWasUsedLexeme(character, ">"),
          startLine,
          startColumn,
        );
        return;

      // Assignment, comparison, and logical operators may be one or two characters.
      case "=":
        this.addToken(
          this.match("=") ? TokenType.DoubleEquals : TokenType.Equals,
          this.matchWasUsedLexeme(character, "="),
          startLine,
          startColumn,
        );
        return;
      case "!":
        this.addToken(
          this.match("=") ? TokenType.BangEquals : TokenType.Bang,
          this.matchWasUsedLexeme(character, "="),
          startLine,
          startColumn,
        );
        return;
      case "<":
        this.addToken(
          this.match("=") ? TokenType.LessEquals : TokenType.Less,
          this.matchWasUsedLexeme(character, "="),
          startLine,
          startColumn,
        );
        return;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GreaterEquals : TokenType.Greater,
          this.matchWasUsedLexeme(character, "="),
          startLine,
          startColumn,
        );
        return;
      case "&":
        if (this.match("&")) {
          this.addToken(TokenType.AndAnd, "&&", startLine, startColumn);
          return;
        }
        throw new LexerError("Unexpected '&'; did you mean '&&'?", startLine, startColumn);
      case "|":
        if (this.match("|")) {
          this.addToken(TokenType.OrOr, "||", startLine, startColumn);
          return;
        }
        throw new LexerError("Unexpected '|'; did you mean '||'?", startLine, startColumn);

      // Punctuation tokens define grouping and separators.
      case "(":
        this.addToken(TokenType.LeftParen, character, startLine, startColumn);
        return;
      case ")":
        this.addToken(TokenType.RightParen, character, startLine, startColumn);
        return;
      case "{":
        this.addToken(TokenType.LeftBrace, character, startLine, startColumn);
        return;
      case "}":
        this.addToken(TokenType.RightBrace, character, startLine, startColumn);
        return;
      case "[":
        this.addToken(TokenType.LeftBracket, character, startLine, startColumn);
        return;
      case "]":
        this.addToken(TokenType.RightBracket, character, startLine, startColumn);
        return;
      case ",":
        this.addToken(TokenType.Comma, character, startLine, startColumn);
        return;
      case ".":
        this.addToken(TokenType.Dot, character, startLine, startColumn);
        return;
      case ":":
        this.addToken(TokenType.Colon, character, startLine, startColumn);
        return;
      case ";":
        this.addToken(TokenType.Semicolon, character, startLine, startColumn);
        return;

      // Strings are enclosed in double quotes and may include simple escapes.
      case "\"":
        this.scanString(startLine, startColumn);
        return;

      default:
        if (this.isDigit(character)) {
          this.scanNumber(character, startLine, startColumn);
          return;
        }

        if (this.isIdentifierStart(character)) {
          this.scanIdentifier(character, startLine, startColumn);
          return;
        }

        throw new LexerError(`Unexpected character '${character}'`, startLine, startColumn);
    }
  }

  /**
   * scanString consumes a double-quoted string, including supported escapes.
   */
  private scanString(startLine: number, startColumn: number): void {
    let lexeme: string = "\"";

    while (!this.isAtEnd()) {
      const character: string = this.advance();
      lexeme += character;

      if (character === "\\") {
        if (this.isAtEnd()) {
          throw new LexerError("Unterminated string escape", this.line, this.column);
        }

        const escaped: string = this.advance();
        lexeme += escaped;
        continue;
      }

      if (character === "\"") {
        this.addToken(TokenType.String, lexeme, startLine, startColumn);
        return;
      }
    }

    throw new LexerError("Unterminated string", startLine, startColumn);
  }

  /**
   * scanNumber consumes an integer or decimal number literal.
   */
  private scanNumber(firstCharacter: string, startLine: number, startColumn: number): void {
    let lexeme: string = firstCharacter;

    while (this.isDigit(this.peek())) {
      lexeme += this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      lexeme += this.advance();

      while (this.isDigit(this.peek())) {
        lexeme += this.advance();
      }
    }

    this.addToken(TokenType.Number, lexeme, startLine, startColumn);
  }

  /**
   * scanIdentifier consumes a keyword or user-defined identifier.
   */
  private scanIdentifier(firstCharacter: string, startLine: number, startColumn: number): void {
    let lexeme: string = firstCharacter;

    while (this.isIdentifierPart(this.peek())) {
      lexeme += this.advance();
    }

    this.addToken(KEYWORDS.get(lexeme) ?? TokenType.Identifier, lexeme, startLine, startColumn);
  }

  /**
   * addToken appends a fully positioned token to the output stream.
   */
  private addToken(type: TokenType, lexeme: string, line: number, column: number): void {
    this.tokens.push({ type, lexeme, line, column });
  }

  /**
   * advance consumes the next character and updates line and column tracking.
   */
  private advance(): string {
    const character: string = this.source.charAt(this.current);
    this.current += 1;

    if (character === "\n") {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }

    return character;
  }

  /**
   * match consumes the expected character only when it is next in the stream.
   */
  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.advance();
    return true;
  }

  /**
   * matchWasUsedLexeme reconstructs the operator lexeme after a match call.
   */
  private matchWasUsedLexeme(firstCharacter: string, expectedSecondCharacter: string): string {
    const previousCharacter: string = this.source.charAt(this.current - 1);
    return previousCharacter === expectedSecondCharacter
      ? `${firstCharacter}${expectedSecondCharacter}`
      : firstCharacter;
  }

  /**
   * peek returns the next character without consuming it.
   */
  private peek(): string {
    return this.isAtEnd() ? "\0" : this.source.charAt(this.current);
  }

  /**
   * peekNext returns the character after the next character without consuming it.
   */
  private peekNext(): string {
    return this.current + 1 >= this.source.length ? "\0" : this.source.charAt(this.current + 1);
  }

  /**
   * isAtEnd reports whether the lexer has consumed the full source.
   */
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  /**
   * isDigit identifies ASCII digits used in Kethic number literals.
   */
  private isDigit(character: string): boolean {
    return character >= "0" && character <= "9";
  }

  /**
   * isIdentifierStart allows Unicode letters and underscore as identifier starts.
   */
  private isIdentifierStart(character: string): boolean {
    return character === "_" || /^\p{L}$/u.test(character);
  }

  /**
   * isIdentifierPart allows Unicode letters, digits, and underscore after the first character.
   */
  private isIdentifierPart(character: string): boolean {
    return character === "_" || this.isDigit(character) || /^\p{L}$/u.test(character);
  }
}
