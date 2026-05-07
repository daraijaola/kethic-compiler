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

  it("lowers Native word operators outside strings", () => {
    const result = compileNative(`
Navā score holds 85
Navā limit holds 50
Navā passed holds score above limit
Navā label holds "plus above same"
Navā combined holds score plus limit times 2
Navā inverted holds not false
Kelthar choose receives a, b
  Duren a same b
Tor
Navā sameValue holds Umkel choose with score plus 1, limit minus 1
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.classic).toContain("Navā passed = score > limit;");
    expect(result.classic).toContain('Navā label = "plus above same";');
    expect(result.classic).toContain("Navā combined = score + limit * 2;");
    expect(result.classic).toContain("Navā inverted = ! false;");
    expect(result.classic).toContain("Duren a == b;");
    expect(result.classic).toContain("Navā sameValue = Umkel choose(score + 1, limit - 1);");
    expect(result.code).toContain("let passed = score > limit;");
    expect(result.code).toContain('let label = "plus above same";');
    expect(result.code).toContain("let combined = score + limit * 2;");
    expect(result.code).toContain("let inverted = !false;");
    expect(result.code).toContain("return a === b;");
    expect(result.code).toContain("let sameValue = choose(score + 1, limit - 1);");
  });

  it("lowers Native control flow blocks", () => {
    const result = compileNative(`
Kelthar describe receives status
  Ikhshev status same "active"
    Duren "running"
  Shev
    Duren "stopped"
  Tor
Tor

Rukhar false
  Rukum
Tor

Ikhselthar "active"
  Selikhshev "active"
    Duruk
  Ovikhnak
    Navā fallback holds "unknown"
Tor

Eshnak
  Navā value holds 1
Nak
  Navā value holds 0
Tor
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.classic).toContain('Ikhshev status == "active" {');
    expect(result.classic).toContain("} Shev {");
    expect(result.classic).toContain("Rukhar false {");
    expect(result.classic).toContain("Rukum;");
    expect(result.classic).toContain('Ikhselthar "active" {');
    expect(result.classic).toContain('Selikhshev "active" {');
    expect(result.classic).toContain("Ovikhnak {");
    expect(result.classic).toContain("Eshnak {");
    expect(result.classic).toContain("} {");
    expect(result.code).toContain('if (status === "active") {');
    expect(result.code).toContain("} else {");
    expect(result.code).toContain("while (false) {");
    expect(result.code).toContain("switch (\"active\") {");
    expect(result.code).toContain("try {");
    expect(result.code).toContain("} catch (error) {");
  });

  it("lowers Native data vessels into array, object, map, and null literals", () => {
    const result = compileNative(`
Rukva scores holds 95, 87, 72
Rukva emptyScores holds
Kelva user holds
  name: "Aru"
  age: 30
  active: true
Tor
Selva labels holds
  "active" => "on"
  "paused" => "off"
Tor
Navā nothing holds Umra
Navā first holds scores[0]
Navā username holds user.name
Navā activeLabel holds labels["active"]
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.classic).toContain("Navā scores = [95, 87, 72];");
    expect(result.classic).toContain("Navā emptyScores = [];");
    expect(result.classic).toContain('Navā user = { name: "Aru", age: 30, active: true };');
    expect(result.classic).toContain('Navā labels = Selva { "active": "on", "paused": "off" };');
    expect(result.classic).toContain("Navā nothing = Umra;");
    expect(result.code).toContain("let scores = [95, 87, 72];");
    expect(result.code).toContain("let emptyScores = [];");
    expect(result.code).toContain('let user = { name: "Aru", age: 30, active: true };');
    expect(result.code).toContain('let labels = ({ ["active"]: "on", ["paused"]: "off" });');
    expect(result.code).toContain("let nothing = null;");
  });
});
