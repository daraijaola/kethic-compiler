import { describe, expect, it } from "vitest";
import { CodeGenerator, Lexer, Obfuscator, Parser, TokenType, TypeChecker } from "../src";

function compile(source: string): { readonly code: string; readonly diagnostics: string[] } {
  const ast = new Parser(new Lexer(source).scanTokens()).parse();
  const checker = new TypeChecker();
  const diagnostics = checker.formatDiagnostics(checker.check(ast));
  const generated = new CodeGenerator().generate(ast);

  return {
    code: generated.code,
    diagnostics,
  };
}

describe("Kethic regression coverage", () => {
  it("tokenizes reserved Second Archive words as non-identifier tokens", () => {
    const source: string = "Rukva Kelva Selva Shevkar Umrava Tharkar Ovesh Seltor Torkel Torselthar Selikh Eshrin Umresh Selovva Torumsel";
    const tokens = new Lexer(source).scanTokens();

    expect(tokens.map((token) => token.type)).toEqual([
      TokenType.Rukva,
      TokenType.Kelva,
      TokenType.Selva,
      TokenType.Shevkar,
      TokenType.Umrava,
      TokenType.Tharkar,
      TokenType.Ovesh,
      TokenType.Seltor,
      TokenType.Torkel,
      TokenType.Torselthar,
      TokenType.Selikh,
      TokenType.Eshrin,
      TokenType.Umresh,
      TokenType.Selovva,
      TokenType.Torumsel,
      TokenType.EOF,
    ]);
  });

  it("emits switch, ternary, break, and default branches", () => {
    const result = compile(`
Navā status = "active";
Navā label = status == "active" ? "on" : "off";
Ikhselthar status {
  Selikhshev "active" {
    Duruk;
  }
  Ovikhnak {
    Navā fallback = "unknown";
  }
}
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain('let label = status === "active" ? "on" : "off";');
    expect(result.code).toContain("switch (status) {");
    expect(result.code).toContain('case "active": {');
    expect(result.code).toContain("break;");
    expect(result.code).toContain("default: {");
  });

  it("emits template strings and function expression forms", () => {
    const result = compile(`
Navā double = Tharva(x) { Duren x * 2; };
Navā triple = Rinthar (x) -> x * 3;
Navā greet = Kelthar(name = "stranger") {
  Duren ` + "`Hello {name}`" + `;
};
Kelthar collect(...items) {
  Duren items;
}
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let double = function (x) {");
    expect(result.code).toContain("let triple = (x) => x * 3;");
    expect(result.code).toContain('let greet = function (name = "stranger") {');
    expect(result.code).toContain("return `Hello ${name}`;");
    expect(result.code).toContain("function collect(...items) {");
  });

  it("infers arrays, objects, null, member access, and indexing", () => {
    const result = compile(`
Navā scores = [95, 87, 72];
Navā user = { name: "Aru", age: 30 };
Navā first = scores[0];
Navā age = user.age;
Navā empty = Umra;
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let scores = [95, 87, 72];");
    expect(result.code).toContain('let user = { name: "Aru", age: 30 };');
    expect(result.code).toContain("let first = scores[0];");
    expect(result.code).toContain("let age = user.age;");
    expect(result.code).toContain("let empty = null;");
  });

  it("emits Selva maps as lookup dictionaries with typed indexing", () => {
    const result = compile(`
Navā labels = Selva { "active": "on", "paused": "off" };
Navā current = labels["active"];
Navā emptyLabels = Selva {};
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain('let labels = ({ ["active"]: "on", ["paused"]: "off" });');
    expect(result.code).toContain('let current = labels["active"];');
    expect(result.code).toContain("let emptyLabels = ({});");
  });

  it("preserves object keys but obfuscates object values", () => {
    const generated = new CodeGenerator().generate(
      new Parser(new Lexer('Navā user = { name: "Aru", age: 30 };').scanTokens()).parse(),
    );
    const obfuscated = new Obfuscator().obfuscate({ code: generated.code, sourceMap: generated.sourceMap, seed: "regression" });

    expect(obfuscated.code).toContain("name:");
    expect(obfuscated.code).toContain("age:");
    expect(obfuscated.code).toContain("\\x41\\x72\\x75");
    expect(obfuscated.code).not.toContain('"Aru"');
  });
});
