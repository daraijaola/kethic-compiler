import { describe, expect, it } from "vitest";
import { CodeGenerator, Lexer, Parser } from "../src";

describe("CodeGenerator", () => {
  it("emits runnable JavaScript and source mappings", () => {
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

    const ast = new Parser(new Lexer(source).scanTokens()).parse();
    const result = new CodeGenerator().generate(ast);

    expect(result.code).toContain("let price = 100;");
    expect(result.code).toContain("const tax = 0.2;");
    expect(result.code).toContain("function calculate(price, tax) {");
    expect(result.code).toContain("try {");
    expect(result.code).toContain("} catch (error) {");
    expect(result.sourceMap.length).toBeGreaterThan(0);
  });
});
