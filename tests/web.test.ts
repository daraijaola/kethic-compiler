import { describe, expect, it } from "vitest";
import { WebCompiler, WebCompilerError, WebNodeKind, WebParser } from "../src";

const sample: string = `
Tharsel Hero
  Savarin 6
  Mirlu "sand.50"
  Kellu "ink.900"
  Natorkar "soft"
  Mireshel "raised"
Tor

Lumva count holds 0

Umrin increment
  count holds count plus 1
Tor

Selthar ActionCard receives title, body
  Vakar ActionCard
    Keltor level:3 title
    Kelen body
    Umva actions
  Tor
Tor

Torvathar Home
  Shevva Hero
    Keltor level:1 "Kethic"
    Kelen "Ritual architecture for living interfaces."
    Umkel ActionCard with "Sealed Components", "Reusable UI without style leakage."
      Kelen "Count: {count}"
      Umkar
        Kelen "Enter"
      Tor
      Umkar action:increment
        Kelen "Add"
      Tor
    Tor
  Tor
Tor

Umvator "#app" receives Home
`;

describe("WebCompiler", () => {
  it("parses the static Native web slice into a Web AST", () => {
    const ast = new WebParser(sample).parse();

    expect(ast.kind).toBe(WebNodeKind.Program);
    expect(ast.body.map((node) => node.kind)).toEqual([
      WebNodeKind.StyleBlock,
      WebNodeKind.State,
      WebNodeKind.Action,
      WebNodeKind.Component,
      WebNodeKind.Page,
      WebNodeKind.Mount,
    ]);
  });

  it("emits static HTML and CSS for Web Phase 1", () => {
    const result = new WebCompiler().compile(sample);

    expect(result.html).toContain('<main id="app" class="kethic-home kethic-page">');
    expect(result.html).toContain('<section class="kethic-hero kethic-section"');
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Ritual architecture for living interfaces.");
    expect(result.html).toContain('class="kethic-selthar-actioncard kethic-component"');
    expect(result.html).toContain('data-kethic-component="ActionCard"');
    expect(result.html).toContain("Sealed Components");
    expect(result.html).toContain("Reusable UI without style leakage.");
    expect(result.html).toContain('data-kethic-template="Count: {count}"');
    expect(result.html).toContain("Count: 0");
    expect(result.html).toContain('data-kethic-action="increment"');
    expect(result.html).toContain("<span>Enter</span>");
    expect(result.html).toContain('<script defer src="./runtime.js"></script>');
    expect(result.css).toContain("@layer kethic.reset, kethic.tokens, kethic.components;");
    expect(result.css).toContain(".kethic-hero {");
    expect(result.css).toContain("padding: var(--sa-6);");
    expect(result.css).toContain("background: var(--color-sand-50);");
    expect(result.css).toContain("color: var(--color-ink-900);");
    expect(result.css).toContain("box-shadow: var(--shadow-raised);");
    expect(result.runtime).toContain('"count": 0');
    expect(result.runtime).toContain('"increment": () =>');
    expect(result.runtime).toContain('state["count"] = (state["count"] + 1);');
  });

  it("rejects unsupported style attributes in Web Phase 1", () => {
    expect(() =>
      new WebCompiler().compile(`
Tharsel Hero
  UnknownStyle 1
Tor
Torvathar Home
  Kelen "Hello"
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });

  it("rejects component calls with the wrong number of arguments", () => {
    expect(() =>
      new WebCompiler().compile(`
Selthar Card receives title, body
  Keltor level:2 title
  Kelen body
Tor
Torvathar Home
  Umkel Card with "Only title"
  Tor
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });

  it("rejects buttons that reference missing actions", () => {
    expect(() =>
      new WebCompiler().compile(`
Torvathar Home
  Umkar action:missing
    Kelen "Click"
  Tor
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });
});
