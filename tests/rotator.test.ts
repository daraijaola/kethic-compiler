import { describe, expect, it } from "vitest";
import { Lexer, Parser, RotatingObfuscationEngine } from "../src";

describe("RotatingObfuscationEngine", () => {
  it("produces changing versions without exposing rotation keys", async () => {
    const source: string = `
Navā value = 1;
Kelthar run() {
  Duren value;
}
Umkel run();
`;
    const ast = new Parser(new Lexer(source).scanTokens()).parse();
    const engine: RotatingObfuscationEngine = new RotatingObfuscationEngine(ast, { intervalMs: 10 });

    engine.start();
    const first = engine.getCurrentVersion();

    await new Promise((resolve) => setTimeout(resolve, 25));
    const second = engine.getCurrentVersion();
    engine.stop();

    expect(second.version).toBeGreaterThan(first.version);
    expect(second.code).not.toEqual(first.code);
    expect(Object.prototype.hasOwnProperty.call(second, "key")).toBe(false);
  });
});
