import { describe, expect, it } from "vitest";
import { Lexer, Parser, TypeChecker } from "../src";

describe("TypeChecker", () => {
  it("reports duplicate declarations and wrong Umkel argument counts", () => {
    const source: string = `
Navā price = 100;
Navā price = "hello";
Kelthar add(a, b) {
  Duren a + b;
}
Umkel add(1);
`;

    const ast = new Parser(new Lexer(source).scanTokens()).parse();
    const checker: TypeChecker = new TypeChecker();
    const output: string[] = checker.formatDiagnostics(checker.check(ast));

    expect(output).toEqual([
      'KethicTypeError [Line 3, Col 1] — Navā: duplicate declaration of "price"',
      'KethicTypeError [Line 7, Col 1] — Umkel: Kelthar "add" expected 2 argument(s) but received 1',
    ]);
  });

  it("allows Ovrin import lists and validates Ovrin exports", () => {
    const source: string = `
Ovrin { remoteValue, remoteAdd } from "./remote.js";
Navā local = remoteValue;
Ovrin { local };
`;

    const ast = new Parser(new Lexer(source).scanTokens()).parse();
    const checker: TypeChecker = new TypeChecker();
    const output: string[] = checker.formatDiagnostics(checker.check(ast));

    expect(output).toEqual([]);
  });

  it("reports Ovrin exports before declaration", () => {
    const source: string = `
Ovrin { missing };
`;

    const ast = new Parser(new Lexer(source).scanTokens()).parse();
    const checker: TypeChecker = new TypeChecker();
    const output: string[] = checker.formatDiagnostics(checker.check(ast));

    expect(output).toEqual([
      'KethicTypeError [Line 2, Col 1] — Ovrin: cannot export "missing" before it is declared',
    ]);
  });
});
