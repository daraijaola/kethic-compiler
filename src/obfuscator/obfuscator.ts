import { SourceMapEntry } from "../codegen/types";
import { LineTransform, ObfuscationInput, ObfuscationResult } from "./types";

/**
 * Obfuscator transforms clean generated JavaScript into equivalent unreadable JavaScript.
 * The identifier map is intentionally private and is never returned from this class.
 */
export class Obfuscator {
  private readonly identifierMap: Map<string, string> = new Map<string, string>();
  private random: SeededRandom = new SeededRandom(`${Date.now()}-${Math.random()}`);
  private readonly reservedWords: ReadonlySet<string> = new Set<string>([
    "break",
    "case",
    "catch",
    "const",
    "continue",
    "default",
    "else",
    "export",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "let",
    "return",
    "switch",
    "throw",
    "true",
    "try",
    "var",
    "while",
  ]);

  /**
   * obfuscate performs name mangling, literal encoding, control-flow wrapping,
   * dead-code injection, and source-map remapping.
   */
  public obfuscate(input: ObfuscationInput): ObfuscationResult {
    this.identifierMap.clear();
    this.random = new SeededRandom(input.seed ?? `${Date.now()}-${Math.random()}`);
    this.collectDeclaredIdentifiers(input.code);

    const transformedLines: LineTransform[] = this.transformLines(input.code);
    const flattenedLines: LineTransform[] = this.flattenControlFlow(transformedLines);

    return {
      code: flattenedLines.map((line: LineTransform) => line.code).join("\n"),
      sourceMap: this.remapSourceMap(input.sourceMap, flattenedLines),
    };
  }

  /**
   * collectDeclaredIdentifiers finds generated local names and gives each a random hex alias.
   */
  private collectDeclaredIdentifiers(code: string): void {
    const plainCode: string = this.replaceStringsAndCommentsWithSpaces(code);
    const declarationPattern: RegExp = /\b(?:let|const|function|catch)\s*(?:\(\s*)?([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let declarationMatch: RegExpExecArray | null = declarationPattern.exec(plainCode);

    while (declarationMatch !== null) {
      this.ensureIdentifierMapping(declarationMatch[1]);
      declarationMatch = declarationPattern.exec(plainCode);
    }

    const functionPattern: RegExp = /\bfunction\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(([^)]*)\)/g;
    let functionMatch: RegExpExecArray | null = functionPattern.exec(plainCode);

    while (functionMatch !== null) {
      this.collectParameterIdentifiers(functionMatch[1]);
      functionMatch = functionPattern.exec(plainCode);
    }

    const anonymousFunctionPattern: RegExp = /\bfunction\s*\(([^)]*)\)/g;
    let anonymousFunctionMatch: RegExpExecArray | null = anonymousFunctionPattern.exec(plainCode);

    while (anonymousFunctionMatch !== null) {
      this.collectParameterIdentifiers(anonymousFunctionMatch[1]);
      anonymousFunctionMatch = anonymousFunctionPattern.exec(plainCode);
    }

    const arrowFunctionPattern: RegExp = /\(([^)]*)\)\s*=>/g;
    let arrowFunctionMatch: RegExpExecArray | null = arrowFunctionPattern.exec(plainCode);

    while (arrowFunctionMatch !== null) {
      this.collectParameterIdentifiers(arrowFunctionMatch[1]);
      arrowFunctionMatch = arrowFunctionPattern.exec(plainCode);
    }
  }

  /**
   * collectParameterIdentifiers maps each function parameter name.
   */
  private collectParameterIdentifiers(parameterList: string): void {
    for (const parameter of parameterList.split(",")) {
      const name: string = parameter
        .split("=")[0]
        .trim()
        .replace(/^\.\.\./, "")
        .trim();

      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
        this.ensureIdentifierMapping(name);
      }
    }
  }

  /**
   * ensureIdentifierMapping creates one private random alias for a source name.
   */
  private ensureIdentifierMapping(name: string): void {
    if (this.reservedWords.has(name) || this.identifierMap.has(name)) {
      return;
    }

    let replacement: string = this.randomHexIdentifier();
    while ([...this.identifierMap.values()].includes(replacement)) {
      replacement = this.randomHexIdentifier();
    }

    this.identifierMap.set(name, replacement);
  }

  /**
   * transformLines applies identifier, string, and number obfuscation line by line.
   */
  private transformLines(code: string): LineTransform[] {
    return code.split(/\r?\n/).map((line: string, index: number) => ({
      originalJsLine: index + 1,
      code: this.transformLine(line),
    }));
  }

  /**
   * transformLine scans one JS line while preserving quoted strings correctly.
   */
  private transformLine(line: string): string {
    let output: string = "";
    let index: number = 0;

    while (index < line.length) {
      const character: string = line.charAt(index);

      if (character === "\"" || character === "'") {
        const stringScan: StringScanResult = this.scanString(line, index, character);
        output += `"${this.encodeStringValue(stringScan.value)}"`;
        index = stringScan.nextIndex;
        continue;
      }

      if (character === "`") {
        const templateScan: TemplateScanResult = this.scanTemplate(line, index);
        output += templateScan.value;
        index = templateScan.nextIndex;
        continue;
      }

      if (this.isIdentifierStart(character)) {
        const identifierStart: number = index;
        index += 1;
        while (index < line.length && this.isIdentifierPart(line.charAt(index))) {
          index += 1;
        }

        const identifier: string = line.slice(identifierStart, index);
        output += this.identifierMap.get(identifier) ?? identifier;
        continue;
      }

      if (this.isNumberStart(line, index)) {
        const numberStart: number = index;
        index += 1;
        while (index < line.length && /[0-9.]/.test(line.charAt(index))) {
          index += 1;
        }

        output += this.encodeNumber(line.slice(numberStart, index));
        continue;
      }

      output += character;
      index += 1;
    }

    return output;
  }

  /**
   * flattenControlFlow wraps executable code in a dispatcher switch and injects dead code.
   */
  private flattenControlFlow(lines: LineTransform[]): LineTransform[] {
    const importsAndExports: LineTransform[] = lines.filter((line: LineTransform) => this.isModuleBoundaryLine(line.code));
    const executableLines: LineTransform[] = lines.filter((line: LineTransform) => !this.isModuleBoundaryLine(line.code));
    const stateName: string = this.randomHexIdentifier();
    const deadName: string = this.randomHexIdentifier();

    return [
      ...importsAndExports,
      { originalJsLine: null, code: `for (let ${stateName} = ${this.encodeNumber("0")}; ${stateName} !== ${this.encodeNumber("2")};) {` },
      { originalJsLine: null, code: `  switch (${stateName}) {` },
      { originalJsLine: null, code: `    case ${this.encodeNumber("0")}:` },
      { originalJsLine: null, code: `      if (false) { const ${deadName} = "${this.encodeStringValue("dead code")}"; }` },
      ...executableLines.map((line: LineTransform) => ({
        originalJsLine: line.originalJsLine,
        code: `      ${line.code}`,
      })),
      { originalJsLine: null, code: `      ${stateName} = ${this.encodeNumber("2")};` },
      { originalJsLine: null, code: "      break;" },
      { originalJsLine: null, code: `    case ${this.encodeNumber("1")}:` },
      { originalJsLine: null, code: `      if (${this.encodeNumber("0")}) { console.log("${this.encodeStringValue("unreachable")}"); }` },
      { originalJsLine: null, code: `      ${stateName} = ${this.encodeNumber("2")};` },
      { originalJsLine: null, code: "      break;" },
      { originalJsLine: null, code: "  }" },
      { originalJsLine: null, code: "}" },
      { originalJsLine: null, code: "void 0;" },
    ];
  }

  /**
   * remapSourceMap points each Kethic line to the obfuscated line holding its JS output.
   */
  private remapSourceMap(sourceMap: SourceMapEntry[], lines: LineTransform[]): SourceMapEntry[] {
    return sourceMap.map((entry: SourceMapEntry) => {
      const newLineIndex: number = lines.findIndex((line: LineTransform) => line.originalJsLine === entry.jsLine);
      return {
        kethicLine: entry.kethicLine,
        jsLine: newLineIndex === -1 ? entry.jsLine : newLineIndex + 1,
      };
    });
  }

  /**
   * scanString reads a quoted JavaScript string and returns its decoded source value.
   */
  private scanString(line: string, startIndex: number, quote: string): StringScanResult {
    let value: string = "";
    let index: number = startIndex + 1;

    while (index < line.length) {
      const character: string = line.charAt(index);

      if (character === "\\") {
        if (index + 1 >= line.length) {
          return { value, nextIndex: index + 1 };
        }

        const escaped: string = line.charAt(index + 1);
        value += this.decodeSimpleEscape(escaped);
        index += 2;
        continue;
      }

      if (character === quote) {
        return { value, nextIndex: index + 1 };
      }

      value += character;
      index += 1;
    }

    return { value, nextIndex: index };
  }

  /**
   * scanTemplate encodes static template text while transforming embedded JS.
   */
  private scanTemplate(line: string, startIndex: number): TemplateScanResult {
    let output: string = "`";
    let staticText: string = "";
    let index: number = startIndex + 1;

    while (index < line.length) {
      const character: string = line.charAt(index);

      if (character === "\\") {
        if (index + 1 >= line.length) {
          output += this.encodeStringValue(staticText);
          return { value: output, nextIndex: index + 1 };
        }

        staticText += this.decodeSimpleEscape(line.charAt(index + 1));
        index += 2;
        continue;
      }

      if (character === "`") {
        output += this.encodeStringValue(staticText);
        output += "`";
        return { value: output, nextIndex: index + 1 };
      }

      if (character === "$" && line.charAt(index + 1) === "{") {
        output += this.encodeStringValue(staticText);
        staticText = "";
        const expressionEnd: number = this.findTemplateExpressionEnd(line, index + 2);
        const expressionSource: string = line.slice(index + 2, expressionEnd);
        output += "${" + this.transformLine(expressionSource) + "}";
        index = expressionEnd + 1;
        continue;
      }

      staticText += character;
      index += 1;
    }

    output += this.encodeStringValue(staticText);
    return { value: output, nextIndex: index };
  }

  /**
   * findTemplateExpressionEnd finds the closing brace for a JS template expression.
   */
  private findTemplateExpressionEnd(line: string, startIndex: number): number {
    let depth: number = 0;

    for (let index: number = startIndex; index < line.length; index += 1) {
      const character: string = line.charAt(index);

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

    return line.length;
  }

  /**
   * encodeStringValue turns a string into JavaScript hex escape sequences.
   */
  private encodeStringValue(value: string): string {
    let encoded: string = "";

    for (let index: number = 0; index < value.length; index += 1) {
      const hex: string = value.charCodeAt(index).toString(16).padStart(2, "0");
      encoded += `\\x${hex}`;
    }

    return encoded;
  }

  /**
   * encodeNumber converts a numeric literal to an equivalent hex expression.
   */
  private encodeNumber(value: string): string {
    const numericValue: number = Number(value);

    if (!Number.isFinite(numericValue)) {
      return value;
    }

    if (Number.isInteger(numericValue)) {
      return `(0x${numericValue.toString(16)})`;
    }

    const scaled: number = Math.round(numericValue * 1000000);
    return `(0x${scaled.toString(16)} / 0xf4240)`;
  }

  /**
   * replaceStringsAndCommentsWithSpaces leaves identifier positions outside literals only.
   */
  private replaceStringsAndCommentsWithSpaces(code: string): string {
    return code
      .replace(/(["'])(?:\\.|(?!\1).)*\1/g, (match: string) => " ".repeat(match.length))
      .replace(/\/\/.*$/gm, (match: string) => " ".repeat(match.length))
      .replace(/\/\*[\s\S]*?\*\//g, (match: string) => " ".repeat(match.length));
  }

  /**
   * isModuleBoundaryLine keeps import and export statements at top level.
   */
  private isModuleBoundaryLine(line: string): boolean {
    const trimmed: string = line.trim();
    return trimmed.startsWith("import ") || trimmed.startsWith("export ");
  }

  /**
   * randomHexIdentifier creates JavaScript-safe randomized hex identifiers.
   */
  private randomHexIdentifier(): string {
    const value: number = Math.floor(this.random.next() * 0xfffff);
    return `_0x${value.toString(16).padStart(5, "0")}`;
  }

  /**
   * isNumberStart checks for numeric literals that are not part of identifiers.
   */
  private isNumberStart(line: string, index: number): boolean {
    const character: string = line.charAt(index);
    const previous: string = index === 0 ? "" : line.charAt(index - 1);
    return /[0-9]/.test(character) && !this.isIdentifierPart(previous);
  }

  /**
   * isIdentifierStart checks JavaScript identifier starts supported by generated code.
   */
  private isIdentifierStart(character: string): boolean {
    return /[A-Za-z_$]/.test(character);
  }

  /**
   * isIdentifierPart checks JavaScript identifier continuations supported by generated code.
   */
  private isIdentifierPart(character: string): boolean {
    return /[A-Za-z0-9_$]/.test(character);
  }

  /**
   * decodeSimpleEscape preserves common JavaScript string escapes before re-encoding.
   */
  private decodeSimpleEscape(character: string): string {
    switch (character) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      default:
        return character;
    }
  }
}

/**
 * StringScanResult is the result of scanning a single JavaScript string literal.
 */
interface StringScanResult {
  readonly value: string;
  readonly nextIndex: number;
}

/**
 * TemplateScanResult is the result of scanning a JavaScript template literal.
 */
interface TemplateScanResult {
  readonly value: string;
  readonly nextIndex: number;
}

/**
 * SeededRandom is a tiny deterministic PRNG used only for rotation-local names.
 */
class SeededRandom {
  private state: number;

  public constructor(seed: string) {
    this.state = this.hashSeed(seed);
  }

  /**
   * next returns a deterministic number in the range [0, 1).
   */
  public next(): number {
    this.state ^= this.state << 13;
    this.state ^= this.state >>> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 0x100000000;
  }

  /**
   * hashSeed converts an arbitrary key into a non-zero 32-bit state.
   */
  private hashSeed(seed: string): number {
    let hash: number = 2166136261;

    for (let index: number = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash === 0 ? 0x811c9dc5 : hash >>> 0;
  }
}
