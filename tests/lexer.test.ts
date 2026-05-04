import { describe, expect, it } from "vitest";
import { Lexer, TokenType } from "../src";

describe("Lexer", () => {
  it("tokenizes Kethic keywords and basic syntax", () => {
    const source: string = 'Torūn greeting = "stars";\nNavā count = 1;';
    const tokens = new Lexer(source).scanTokens();

    expect(tokens.map((token) => token.type)).toEqual([
      TokenType.Torun,
      TokenType.Identifier,
      TokenType.Equals,
      TokenType.String,
      TokenType.Semicolon,
      TokenType.Nava,
      TokenType.Identifier,
      TokenType.Equals,
      TokenType.Number,
      TokenType.Semicolon,
      TokenType.EOF,
    ]);
  });
});
