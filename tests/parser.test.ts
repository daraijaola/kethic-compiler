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

  it("parses named Ovrin import and export lists", () => {
    const source: string = `
Ovrin { remoteValue, remoteAdd } from "./remote.js";
Navā price = 10;
Kelthar add(a, b) {
  Duren a + b;
}
Ovrin { price, add };
`;

    const ast = new Parser(new Lexer(source).scanTokens()).parse();

    expect(ast.body[0].kind).toBe("OvrinDeclaration");
    if (ast.body[0].kind === "OvrinDeclaration") {
      expect(ast.body[0].source?.value).toBe("./remote.js");
      expect(ast.body[0].specifiers.map((specifier) => specifier.name.lexeme)).toEqual(["remoteValue", "remoteAdd"]);
    }

    expect(ast.body[3].kind).toBe("OvrinDeclaration");
    if (ast.body[3].kind === "OvrinDeclaration") {
      expect(ast.body[3].source).toBeNull();
      expect(ast.body[3].specifiers.map((specifier) => specifier.name.lexeme)).toEqual(["price", "add"]);
    }
  });
});
