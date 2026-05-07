import { describe, expect, it } from "vitest";
import { CodeGenerator, NativeParser, TypeChecker } from "../src";

function compileNative(source: string): { readonly classic: string; readonly code: string; readonly diagnostics: string[] } {
  const parser = new NativeParser(source);
  const ast = parser.parse();
  const checker = new TypeChecker();
  const diagnostics = checker.formatDiagnostics(checker.check(ast));

  return {
    classic: parser.toClassicSource(),
    code: new CodeGenerator().generate(ast).code,
    diagnostics,
  };
}

describe("NativeParser", () => {
  it("lowers Native core declarations, functions, returns, and calls", () => {
    const result = compileNative(`
Navā price holds 100
Torūn tax oath 20

Kelthar add receives a, b
  Duren a
Tor

Navā total holds Umkel add with price, tax
Umkel Print with total
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.classic).toContain("Navā price = 100;");
    expect(result.classic).toContain("Torūn tax = 20;");
    expect(result.classic).toContain("Kelthar add(a, b) {");
    expect(result.classic).toContain("Duren a;");
    expect(result.classic).toContain("}");
    expect(result.classic).toContain("Navā total = Umkel add(price, tax);");
    expect(result.classic).toContain("Umkel Print(total);");
    expect(result.code).toContain("let price = 100;");
    expect(result.code).toContain("const tax = 20;");
    expect(result.code).toContain("function add(a, b) {");
    expect(result.code).toContain("let total = add(price, tax);");
    expect(result.code).toContain("console.log(total);");
  });

  it("reports unsupported Native syntax before Classic parsing", () => {
    expect(() => new NativeParser("price holds 100").parse()).toThrow("unsupported Native syntax");
  });
});
