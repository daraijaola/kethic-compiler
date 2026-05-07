import { Lexer } from "../lexer/lexer";
import { Parser, ProgramNode } from "../parser";
import { TokenType } from "../lexer/tokens";

/**
 * NativeBlockKind tracks open Native blocks while lowering to Classic braces.
 */
type NativeBlockKind = "Block" | "If" | "Switch" | "SwitchCase" | "EshnakGuard" | "EshnakRecovery";

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
  private readonly wordOperators: ReadonlyMap<string, string> = new Map<string, string>([
    ["plus", "+"],
    ["minus", "-"],
    ["times", "*"],
    ["over", "/"],
    ["remains", "%"],
    ["same", "=="],
    ["unlike", "!="],
    ["above", ">"],
    ["below", "<"],
    ["atleast", ">="],
    ["atmost", "<="],
    ["and", "&&"],
    ["or", "||"],
    ["not", "!"],
  ]);

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
    const blockStack: NativeBlockKind[] = [];
    const classicLines: string[] = [];
    const sourceLines: string[] = this.source.split(/\r?\n/);

    for (let index: number = 0; index < sourceLines.length; index += 1) {
      classicLines.push(...this.lowerLine(sourceLines[index], index + 1, blockStack));
    }

    if (blockStack.length > 0) {
      throw new NativeParserError(sourceLines.length, `unclosed Native block: ${blockStack[blockStack.length - 1]}`);
    }

    return classicLines.filter((line: string) => line.length > 0).join("\n");
  }

  /**
   * lowerLine maps one Native line into one Classic line.
   */
  private lowerLine(rawLine: string, lineNumber: number, blockStack: NativeBlockKind[]): string[] {
    const line: string = rawLine.trim();

    if (line.length === 0 || line.startsWith("#")) {
      return [];
    }

    if (line === "Tor") {
      return this.lowerTor(lineNumber, blockStack);
    }

    if (line === "Shev" || this.startsWithKeyword(line, TokenType.Shev)) {
      return [this.lowerShev(line, lineNumber, blockStack)];
    }

    if (line === "Nak") {
      return [this.lowerNak(lineNumber, blockStack)];
    }

    if (this.startsWithKeyword(line, TokenType.Nava)) {
      return [this.lowerMutableVessel(line, lineNumber)];
    }

    if (this.startsWithKeyword(line, TokenType.Torun)) {
      return [this.lowerStoneOath(line, lineNumber)];
    }

    if (this.startsWithKeyword(line, TokenType.Kelthar)) {
      blockStack.push("Block");
      return [this.lowerNamedPattern(line, lineNumber)];
    }

    if (this.startsWithKeyword(line, TokenType.Ikhshev)) {
      blockStack.push("If");
      return [this.lowerConditional(line)];
    }

    if (this.startsWithKeyword(line, TokenType.Rukhar)) {
      blockStack.push("Block");
      return [this.lowerLoop(line)];
    }

    if (this.startsWithKeyword(line, TokenType.Ikhselthar)) {
      blockStack.push("Switch");
      return [this.lowerSwitch(line)];
    }

    if (this.startsWithKeyword(line, TokenType.Selikhshev)) {
      return this.lowerSwitchCase(line, lineNumber, blockStack);
    }

    if (this.startsWithKeyword(line, TokenType.Ovikhnak)) {
      return this.lowerSwitchDefault(lineNumber, blockStack);
    }

    if (this.startsWithKeyword(line, TokenType.Eshnak)) {
      blockStack.push("EshnakGuard");
      return [`${TokenType.Eshnak} {`];
    }

    if (this.startsWithKeyword(line, TokenType.Duren)) {
      return [this.lowerReturn(line)];
    }

    if (this.startsWithKeyword(line, TokenType.Umkel)) {
      return [this.lowerCallStatement(line, lineNumber)];
    }

    if (this.startsWithKeyword(line, TokenType.Duruk)) {
      return [`${TokenType.Duruk};`];
    }

    if (this.startsWithKeyword(line, TokenType.Rukum)) {
      return [`${TokenType.Rukum};`];
    }

    throw new NativeParserError(lineNumber, `unsupported Native syntax: ${line}`);
  }

  /**
   * lowerTor closes the current Native block.
   */
  private lowerTor(lineNumber: number, blockStack: NativeBlockKind[]): string[] {
    const current: NativeBlockKind | undefined = blockStack.pop();

    if (current === undefined) {
      throw new NativeParserError(lineNumber, "Tor cannot close anything here");
    }

    if (current === "SwitchCase") {
      const parent: NativeBlockKind | undefined = blockStack.pop();
      if (parent !== "Switch") {
        throw new NativeParserError(lineNumber, "Selikhshev must be inside Ikhselthar");
      }

      return ["}", "}"];
    }

    return ["}"];
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
   * lowerConditional maps Ikhshev condition.
   */
  private lowerConditional(line: string): string {
    const condition: string = this.afterKeyword(line, TokenType.Ikhshev).trim();
    return `${TokenType.Ikhshev} ${this.lowerExpression(condition)} {`;
  }

  /**
   * lowerShev maps Shev and Shev Ikhshev condition.
   */
  private lowerShev(line: string, lineNumber: number, blockStack: NativeBlockKind[]): string {
    if (blockStack[blockStack.length - 1] !== "If") {
      throw new NativeParserError(lineNumber, "Shev must follow an Ikhshev block");
    }

    const body: string = this.afterKeyword(line, TokenType.Shev).trim();
    if (body.length === 0) {
      return `} ${TokenType.Shev} {`;
    }

    if (this.startsWithKeyword(body, TokenType.Ikhshev)) {
      const condition: string = this.afterKeyword(body, TokenType.Ikhshev).trim();
      return `} ${TokenType.Shev} ${TokenType.Ikhshev} ${this.lowerExpression(condition)} {`;
    }

    throw new NativeParserError(lineNumber, "expected Shev or Shev Ikhshev condition");
  }

  /**
   * lowerLoop maps Rukhar condition.
   */
  private lowerLoop(line: string): string {
    const condition: string = this.afterKeyword(line, TokenType.Rukhar).trim();
    return `${TokenType.Rukhar} ${this.lowerExpression(condition)} {`;
  }

  /**
   * lowerSwitch maps Ikhselthar expression.
   */
  private lowerSwitch(line: string): string {
    const expression: string = this.afterKeyword(line, TokenType.Ikhselthar).trim();
    return `${TokenType.Ikhselthar} ${this.lowerExpression(expression)} {`;
  }

  /**
   * lowerSwitchCase maps one Selikhshev branch and closes the previous branch.
   */
  private lowerSwitchCase(line: string, lineNumber: number, blockStack: NativeBlockKind[]): string[] {
    const prefix: string[] = this.closePreviousSwitchCase(lineNumber, blockStack);
    const matchValue: string = this.afterKeyword(line, TokenType.Selikhshev).trim();
    blockStack.push("SwitchCase");
    return [...prefix, `${TokenType.Selikhshev} ${this.lowerExpression(matchValue)} {`];
  }

  /**
   * lowerSwitchDefault maps Ovikhnak and closes the previous branch.
   */
  private lowerSwitchDefault(lineNumber: number, blockStack: NativeBlockKind[]): string[] {
    const prefix: string[] = this.closePreviousSwitchCase(lineNumber, blockStack);
    blockStack.push("SwitchCase");
    return [...prefix, `${TokenType.Ovikhnak} {`];
  }

  /**
   * closePreviousSwitchCase returns a Classic close brace when a new case starts.
   */
  private closePreviousSwitchCase(lineNumber: number, blockStack: NativeBlockKind[]): string[] {
    const current: NativeBlockKind | undefined = blockStack[blockStack.length - 1];

    if (current === "SwitchCase") {
      blockStack.pop();
      return ["}"];
    }

    if (current !== "Switch") {
      throw new NativeParserError(lineNumber, "Selikhshev and Ovikhnak must be inside Ikhselthar");
    }

    return [];
  }

  /**
   * lowerNak maps the Eshnak recovery boundary.
   */
  private lowerNak(lineNumber: number, blockStack: NativeBlockKind[]): string {
    if (blockStack[blockStack.length - 1] !== "EshnakGuard") {
      throw new NativeParserError(lineNumber, "Nak must follow an Eshnak guarded block");
    }

    blockStack[blockStack.length - 1] = "EshnakRecovery";
    return "} {";
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
   * lowerExpression handles Native calls and word operators.
   */
  private lowerExpression(expression: string): string {
    const trimmed: string = expression.trim();

    if (this.startsWithKeyword(trimmed, TokenType.Umkel)) {
      return this.lowerUmkelExpression(trimmed, 0);
    }

    return this.lowerWordOperators(trimmed);
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

    const args: string = this.lowerArgumentList((match[2] ?? "").trim());
    return `${TokenType.Umkel} ${match[1]}(${args})`;
  }

  /**
   * lowerArgumentList lowers each comma-separated call argument expression.
   */
  private lowerArgumentList(argumentsText: string): string {
    if (argumentsText.length === 0) {
      return "";
    }

    return this.splitArguments(argumentsText)
      .map((argument: string) => this.lowerExpression(argument))
      .join(", ");
  }

  /**
   * lowerWordOperators replaces operator words outside quoted strings.
   */
  private lowerWordOperators(expression: string): string {
    let output: string = "";
    let index: number = 0;

    while (index < expression.length) {
      const character: string = expression.charAt(index);

      if (character === "\"" || character === "'") {
        const stringEnd: number = this.findQuotedEnd(expression, index, character);
        output += expression.slice(index, stringEnd);
        index = stringEnd;
        continue;
      }

      if (character === "`") {
        const templateEnd: number = this.findQuotedEnd(expression, index, "`");
        output += expression.slice(index, templateEnd);
        index = templateEnd;
        continue;
      }

      if (this.isIdentifierStart(character)) {
        const start: number = index;
        index += 1;
        while (index < expression.length && this.isIdentifierPart(expression.charAt(index))) {
          index += 1;
        }

        const word: string = expression.slice(start, index);
        output += this.wordOperators.get(word) ?? word;
        continue;
      }

      output += character;
      index += 1;
    }

    return output;
  }

  /**
   * splitArguments separates call arguments while respecting strings and groups.
   */
  private splitArguments(argumentsText: string): string[] {
    const args: string[] = [];
    let start: number = 0;
    let depth: number = 0;
    let index: number = 0;

    while (index < argumentsText.length) {
      const character: string = argumentsText.charAt(index);

      if (character === "\"" || character === "'" || character === "`") {
        index = this.findQuotedEnd(argumentsText, index, character);
        continue;
      }

      if (character === "(" || character === "[" || character === "{") {
        depth += 1;
      }

      if (character === ")" || character === "]" || character === "}") {
        depth -= 1;
      }

      if (character === "," && depth === 0) {
        args.push(argumentsText.slice(start, index).trim());
        start = index + 1;
      }

      index += 1;
    }

    args.push(argumentsText.slice(start).trim());
    return args;
  }

  /**
   * findQuotedEnd scans to the end of one quoted string or template literal.
   */
  private findQuotedEnd(text: string, start: number, quote: string): number {
    let index: number = start + 1;

    while (index < text.length) {
      const character: string = text.charAt(index);

      if (character === "\\") {
        index += 2;
        continue;
      }

      if (character === quote) {
        return index + 1;
      }

      index += 1;
    }

    return text.length;
  }

  /**
   * isIdentifierStart checks Native expression word starts.
   */
  private isIdentifierStart(character: string): boolean {
    return /[A-Za-z_]/.test(character);
  }

  /**
   * isIdentifierPart checks Native expression word continuations.
   */
  private isIdentifierPart(character: string): boolean {
    return /[A-Za-z0-9_]/.test(character);
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
