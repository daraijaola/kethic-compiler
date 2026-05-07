import { Lexer } from "../lexer/lexer";
import { Parser, ProgramNode } from "../parser";
import { TokenType } from "../lexer/tokens";

/**
 * NativeParserError reports invalid Kethic Native source with source lines.
 */
export class NativeParserError extends Error {
  public constructor(
    public readonly line: number,
    public readonly message: string,
  ) {
    super(`NativeParserError [Line ${line}] — ${message}`);
    this.name = "NativeParserError";
  }
}

/**
 * NativeParser is the first front door for Kethic Native syntax.
 * It lowers Native core syntax into Kethic Classic source, then reuses the
 * existing parser so all later compiler phases keep working.
 */
export class NativeParser {
  public constructor(private readonly source: string) {}

  /**
   * parse returns the existing Program AST for Kethic Native source.
   */
  public parse(): ProgramNode {
    const classicSource: string = this.toClassicSource();
    return new Parser(new Lexer(classicSource).scanTokens()).parse();
  }

  /**
   * toClassicSource exposes the lowered compatibility source for tests and
   * debugging. It is not meant to become the user-facing language.
   */
  public toClassicSource(): string {
    return this.source
      .split(/\r?\n/)
      .map((line: string, index: number) => this.lowerLine(line, index + 1))
      .filter((line: string) => line.length > 0)
      .join("\n");
  }

  /**
   * lowerLine maps one Native line into one Classic line.
   */
  private lowerLine(rawLine: string, lineNumber: number): string {
    const line: string = rawLine.trim();

    if (line.length === 0 || line.startsWith("#")) {
      return "";
    }

    if (line === "Tor") {
      return "}";
    }

    if (this.startsWithKeyword(line, TokenType.Nava)) {
      return this.lowerMutableVessel(line, lineNumber);
    }

    if (this.startsWithKeyword(line, TokenType.Torun)) {
      return this.lowerStoneOath(line, lineNumber);
    }

    if (this.startsWithKeyword(line, TokenType.Kelthar)) {
      return this.lowerNamedPattern(line, lineNumber);
    }

    if (this.startsWithKeyword(line, TokenType.Duren)) {
      return this.lowerReturn(line);
    }

    if (this.startsWithKeyword(line, TokenType.Umkel)) {
      return this.lowerCallStatement(line, lineNumber);
    }

    throw new NativeParserError(lineNumber, `unsupported Native syntax: ${line}`);
  }

  /**
   * lowerMutableVessel maps Navā name holds value.
   */
  private lowerMutableVessel(line: string, lineNumber: number): string {
    const body: string = this.afterKeyword(line, TokenType.Nava).trim();
    const match: RegExpMatchArray | null = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+holds\s+(.+)$/);

    if (match === null) {
      throw new NativeParserError(lineNumber, "expected Navā name holds value");
    }

    return `${TokenType.Nava} ${match[1]} = ${this.lowerExpression(match[2])};`;
  }

  /**
   * lowerStoneOath maps Torūn name oath value.
   */
  private lowerStoneOath(line: string, lineNumber: number): string {
    const body: string = this.afterKeyword(line, TokenType.Torun).trim();
    const match: RegExpMatchArray | null = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+oath\s+(.+)$/);

    if (match === null) {
      throw new NativeParserError(lineNumber, "expected Torūn name oath value");
    }

    return `${TokenType.Torun} ${match[1]} = ${this.lowerExpression(match[2])};`;
  }

  /**
   * lowerNamedPattern maps Kelthar name receives a, b.
   */
  private lowerNamedPattern(line: string, lineNumber: number): string {
    const body: string = this.afterKeyword(line, TokenType.Kelthar).trim();
    const match: RegExpMatchArray | null = body.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+receives\s*(.*))?$/);

    if (match === null) {
      throw new NativeParserError(lineNumber, "expected Kelthar name receives parameters");
    }

    const parameters: string = (match[2] ?? "").trim();
    return `${TokenType.Kelthar} ${match[1]}(${parameters}) {`;
  }

  /**
   * lowerReturn maps Duren value.
   */
  private lowerReturn(line: string): string {
    const value: string = this.afterKeyword(line, TokenType.Duren).trim();
    return `${TokenType.Duren}${value.length === 0 ? "" : ` ${this.lowerExpression(value)}`};`;
  }

  /**
   * lowerCallStatement maps Umkel name with args.
   */
  private lowerCallStatement(line: string, lineNumber: number): string {
    const expression: string = this.lowerUmkelExpression(line, lineNumber);
    return `${expression};`;
  }

  /**
   * lowerExpression handles Native expression forms that exist in Phase 1.
   */
  private lowerExpression(expression: string): string {
    const trimmed: string = expression.trim();

    if (this.startsWithKeyword(trimmed, TokenType.Umkel)) {
      return this.lowerUmkelExpression(trimmed, 0);
    }

    return trimmed;
  }

  /**
   * lowerUmkelExpression maps Umkel name with args into classic invocation.
   */
  private lowerUmkelExpression(expression: string, lineNumber: number): string {
    const body: string = this.afterKeyword(expression, TokenType.Umkel).trim();
    const match: RegExpMatchArray | null = body.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+with\s*(.*))?$/);

    if (match === null) {
      throw new NativeParserError(lineNumber, "expected Umkel name with arguments");
    }

    const args: string = (match[2] ?? "").trim();
    return `${TokenType.Umkel} ${match[1]}(${args})`;
  }

  /**
   * startsWithKeyword accepts canonical and correctly accented spellings.
   */
  private startsWithKeyword(line: string, keyword: TokenType): boolean {
    return this.keywordSpellings(keyword).some((spelling: string) => line === spelling || line.startsWith(`${spelling} `));
  }

  /**
   * afterKeyword removes a recognized keyword spelling from the front.
   */
  private afterKeyword(line: string, keyword: TokenType): string {
    const spelling: string | undefined = this.keywordSpellings(keyword).find(
      (candidate: string) => line === candidate || line.startsWith(`${candidate} `),
    );

    return spelling === undefined ? line : line.slice(spelling.length);
  }

  /**
   * keywordSpellings bridges current Classic token spellings and proper Unicode.
   */
  private keywordSpellings(keyword: TokenType): string[] {
    switch (keyword) {
      case TokenType.Nava:
        return [TokenType.Nava, "Navā"];
      case TokenType.Torun:
        return [TokenType.Torun, "Torūn"];
      default:
        return [keyword];
    }
  }
}
