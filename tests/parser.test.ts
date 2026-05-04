import { describe, expect, it } from "vitest";
import { Lexer, Parser } from "../src";

describe("Parser", () => {
  it("parses all ten Kethic keyword forms into typed AST nodes", () => {
    const source: string = `
Ovrin chant from "river-gongs";
Selkar Vessel {
  name: Text;
}
Torūn greeting = "stars";
Navā count = 0;
Kelthar speak(name) {
  Ikhshev count == 0 {
    Umkel chant(greeting);
  }
  Rukhar count < 3 {
    count = count + 1;
  }
  Eshnak {
    Umkel chant(name);
  } {
    Umkel chant(greeting);
  }
  Duren name;
}
`;

    const parser: Parser = new Parser(new Lexer(source).scanTokens());
    const ast = parser.parse();

    expect(ast.body.map((node) => node.kind)).toEqual([
      "OvrinDeclaration",
      "TypeDefinition",
      "ConstantDeclaration",
      "VariableDeclaration",
      "FunctionDeclaration",
    ]);
  });
});
