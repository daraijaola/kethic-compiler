import { describe, expect, it } from "vitest";
import { CodeGenerator, Lexer, Obfuscator, Parser } from "../src";

describe("Obfuscator", () => {
  it("obfuscates generated JavaScript and preserves source mapping entries", () => {
    const source: string = `
Navā price = 100;
Torūn tax = 0.2;
Kelthar calculate(price, tax) {
  Duren price + tax;
}
Eshnak {
  Navā result = Umkel calculate(100, 0.2);
} Ikhshev {
  Duren "error occurred";
}
`;
    const generated = new CodeGenerator().generate(new Parser(new Lexer(source).scanTokens()).parse());
    const obfuscated = new Obfuscator().obfuscate(generated);

    expect(obfuscated.code).toContain("switch");
    expect(obfuscated.code).toContain("\\x65\\x72\\x72\\x6f\\x72");
    expect(obfuscated.code).not.toContain("calculate");
    expect(obfuscated.sourceMap.length).toBe(generated.sourceMap.length);
  });

  it("keeps Ovrin public names stable while obfuscating local bindings", () => {
    const source: string = `
Ovrin { remoteValue } from "./remote.js";
Navā local = remoteValue;
Ovrin { local };
`;
    const generated = new CodeGenerator().generate(new Parser(new Lexer(source).scanTokens()).parse());
    const obfuscated = new Obfuscator().obfuscate({ ...generated, seed: "module-test" });

    expect(obfuscated.code).toContain('from "./remote.js";');
    expect(obfuscated.code).toMatch(/import \{ remoteValue as _0x[0-9a-f]+ \}/);
    expect(obfuscated.code).toMatch(/export \{ _0x[0-9a-f]+ as local \}/);
    expect(obfuscated.code).not.toContain("let local");
  });
});
