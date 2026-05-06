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

  it("emits Ovdurthar async functions and Torduren await expressions", () => {
    const result = compile(`
Ovdurthar Kelthar load(value: Number) {
  Duren value;
}
Navā delayed = Ovdurthar Tharva(value: Number) {
  Duren value;
};
Navā arrow = Ovdurthar Rinthar (value: Number) -> value;
Ovdurthar Kelthar useAll() {
  Navā first = Torduren Umkel load(1);
  Navā second = Torduren delayed(2);
  Navā third = Torduren arrow(3);
  Duren first + second + third;
}
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("async function load(value) {");
    expect(result.code).toContain("let delayed = async function (value) {");
    expect(result.code).toContain("let arrow = async (value) => value;");
    expect(result.code).toContain("let first = await load(1);");
    expect(result.code).toContain("let second = await delayed(2);");
    expect(result.code).toContain("let third = await arrow(3);");
  });

  it("reports Torduren outside Ovdurthar functions", () => {
    const result = compile(`
Kelthar load(value: Number) {
  Duren Torduren value;
}
`);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toContain("Torduren cannot appear outside an Ovdurthar function");
  });

  it("reports Torduren on immediate non-promise values inside Ovdurthar functions", () => {
    const result = compile(`
Ovdurthar Kelthar load(value: Number) {
  Duren Torduren value;
}
`);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toContain("Torduren expected Promise but received Number");
  });

  it("type-checks and emits standard library console and math calls", () => {
    const result = compile(`
Navā high = MathMax(10, 20, 5);
Navā low = Umkel MathMin(10, 20, 5);
Navā rounded = MathRound(4.7);
Umkel Print("high", high, low, rounded);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let high = Math.max(10, 20, 5);");
    expect(result.code).toContain("let low = Math.min(10, 20, 5);");
    expect(result.code).toContain("let rounded = Math.round(4.7);");
    expect(result.code).toContain('console.log("high", high, low, rounded);');
  });

  it("type-checks and emits standard library length helpers", () => {
    const result = compile(`
Navā name = "Aru";
Navā scores = [95, 87, 72];
Navā nameSize = StringLength(name);
Navā scoreCount = ArrayLength(scores);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let nameSize = name.length;");
    expect(result.code).toContain("let scoreCount = scores.length;");
  });

  it("type-checks and emits standard library string helpers", () => {
    const result = compile(`
Navā raw = "  Aru Vey  ";
Navā clean = StringTrim(raw);
Navā loud = StringUpper(clean);
Navā quiet = StringLower(loud);
Navā joined = StringConcat("Hello ", clean);
Navā hasAru = StringIncludes(clean, "Aru");
Navā starts = StringStartsWith(clean, "A");
Navā piece = StringSlice(clean, 0, 3);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let clean = (raw).trim();");
    expect(result.code).toContain("let loud = (clean).toUpperCase();");
    expect(result.code).toContain("let quiet = (loud).toLowerCase();");
    expect(result.code).toContain('let joined = "Hello " + clean;');
    expect(result.code).toContain('let hasAru = (clean).includes("Aru");');
    expect(result.code).toContain('let starts = (clean).startsWith("A");');
    expect(result.code).toContain("let piece = (clean).slice(0, 3);");
  });

  it("type-checks and emits standard library array helpers", () => {
    const result = compile(`
Navā scores = [95, 87, 72];
Navā first = ArrayAt(scores, 0);
Navā count = ArrayPush(scores, 100);
Navā csv = ArrayJoin(scores, ",");
Navā hasScore = ArrayIncludes(scores, 87);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let first = (scores).at(0);");
    expect(result.code).toContain("let count = (scores).push(100);");
    expect(result.code).toContain('let csv = (scores).join(",");');
    expect(result.code).toContain("let hasScore = (scores).includes(87);");
  });

  it("reports standard library argument type errors", () => {
    const result = compile(`
Navā bad = MathMax("wrong");
Navā alsoBad = StringLength(10);
`);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0]).toContain('Kelthar "call target" argument 1 expected Number but received String');
    expect(result.diagnostics[1]).toContain('Kelthar "call target" argument 1 expected String but received Number');
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

  it("accepts Shevkar union aliases and annotated declarations", () => {
    const result = compile(`
Shevkar Label = String | Number;
Navā status: Label = "active";
Navā count: Label = 3;
Navā maybe: String | Umra = Umra;
Kelthar echo(value: Label) {
  Duren value;
}
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("/** @typedef {*} Label */");
    expect(result.code).toContain('let status = "active";');
    expect(result.code).toContain("let count = 3;");
    expect(result.code).toContain("let maybe = null;");
    expect(result.code).toContain("function echo(value) {");
  });

  it("reports values that do not match Shevkar annotations", () => {
    const result = compile(`
Shevkar Label = String | Number;
Navā bad: Label = true;
`);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toContain('variable "bad" was declared as String | Number but received Boolean');
  });

  it("reports function arguments that do not match Shevkar parameter annotations", () => {
    const result = compile(`
Shevkar Label = String | Number;
Kelthar echo(value: Label) {
  Duren value;
}
Umkel echo(true);
`);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toContain('Kelthar "echo" argument 1 expected String | Number but received Boolean');
  });

  it("accepts Umrava optional annotations as value or null", () => {
    const result = compile(`
Shevkar MaybeLabel = Umrava String;
Navā name: Umrava String = "Aru";
Navā emptyName: Umrava String = Umra;
Navā aliasName: MaybeLabel = Umra;
Kelthar greet(value: Umrava String) {
  Duren value;
}
Umkel greet("Aru");
Umkel greet(Umra);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("/** @typedef {*} MaybeLabel */");
    expect(result.code).toContain('let name = "Aru";');
    expect(result.code).toContain("let emptyName = null;");
    expect(result.code).toContain("let aliasName = null;");
  });

  it("reports values that do not match Umrava optional annotations", () => {
    const result = compile(`
Navā name: Umrava String = 10;
Kelthar greet(value: Umrava String) {
  Duren value;
}
Umkel greet(false);
`);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0]).toContain('variable "name" was declared as String | Null but received Number');
    expect(result.diagnostics[1]).toContain('Kelthar "greet" argument 1 expected String | Null but received Boolean');
  });

  it("accepts Rukva and Kelva type annotations for arrays and objects", () => {
    const result = compile(`
Shevkar MaybeScores = Umrava Rukva Number;
Navā scores: Rukva Number = [95, 87, 72];
Navā nested: Rukva Rukva Number = [[1], [2]];
Navā user: Kelva { name: String, age: Number } = { name: "Aru", age: 30 };
Navā maybeScores: MaybeScores = Umra;
Kelthar first(items: Rukva Number) {
  Duren items[0];
}
Umkel first(scores);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("let scores = [95, 87, 72];");
    expect(result.code).toContain("let nested = [[1], [2]];");
    expect(result.code).toContain('let user = { name: "Aru", age: 30 };');
    expect(result.code).toContain("let maybeScores = null;");
  });

  it("reports values that do not match Rukva and Kelva annotations", () => {
    const result = compile(`
Navā badScores: Rukva Number = ["wrong"];
Navā badUser: Kelva { name: String, age: Number } = { name: "Aru", age: "old" };
Kelthar first(items: Rukva Number) {
  Duren items[0];
}
Umkel first(["wrong"]);
`);

    expect(result.diagnostics).toHaveLength(3);
    expect(result.diagnostics[0]).toContain('variable "badScores" was declared as Number[] but received String[]');
    expect(result.diagnostics[1]).toContain('variable "badUser" was declared as { name: String; age: Number } but received { name: String; age: String }');
    expect(result.diagnostics[2]).toContain('Kelthar "first" argument 1 expected Number[] but received String[]');
  });

  it("accepts Tharkar generic type aliases with concrete type arguments", () => {
    const result = compile(`
Tharkar Box<T> = Kelva { value: T };
Tharkar Pair<T, U> = Kelva { first: T, second: U };
Navā numberBox: Box<Number> = { value: 10 };
Navā stringBox: Box<String> = { value: "sealed" };
Navā pair: Pair<String, Number> = { first: "age", second: 30 };
Kelthar unwrap(box: Box<Number>) {
  Duren box.value;
}
Umkel unwrap(numberBox);
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("/** @typedef {*} Box */");
    expect(result.code).toContain("/** @typedef {*} Pair */");
    expect(result.code).toContain("let numberBox = { value: 10 };");
    expect(result.code).toContain('let stringBox = { value: "sealed" };');
    expect(result.code).toContain('let pair = { first: "age", second: 30 };');
  });

  it("reports Tharkar type argument and substituted shape errors", () => {
    const result = compile(`
Tharkar Box<T> = Kelva { value: T };
Navā badBox: Box<Number> = { value: "wrong" };
Navā missingArgument: Box = { value: 10 };
Navā tooManyArguments: Box<Number, String> = { value: 10 };
Kelthar unwrap(box: Box<Number>) {
  Duren box.value;
}
Umkel unwrap({ value: "wrong" });
`);

    expect(result.diagnostics).toHaveLength(4);
    expect(result.diagnostics[0]).toContain('variable "badBox" was declared as { value: Number } but received { value: String }');
    expect(result.diagnostics[1]).toContain('Tharkar "Box" expected 1 type argument(s) but received 0');
    expect(result.diagnostics[2]).toContain('Tharkar "Box" expected 1 type argument(s) but received 2');
    expect(result.diagnostics[3]).toContain('Kelthar "unwrap" argument 1 expected { value: Number } but received { value: String }');
  });

  it("infers mixed ternary branches as a union result", () => {
    const result = compile(`
Navā mixed = true ? "yes" : 1;
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain('let mixed = true ? "yes" : 1;');
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
