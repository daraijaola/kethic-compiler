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

Rinshev "#hero" receives Hero
Rinshev "#contact" receives Contact

Selthar ActionCard receives title, body
  Vakar ActionCard
    Keltor level:3 title
    Kelen body
    Umva actions
  Tor
Tor

Torvathar Home
  Rukshev Main
    Ovshev to:Hero "Hero"
    Ovshev to:Contact "Contact"
  Tor
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
    Shevva Contact
      Selvathar Contact
        Enva email label:"Email" Torikh
        Kelrinva message label:"Message" rows:5 Torikh
        Ikhen for:email "Enter an email before sending."
        Ikhen for:message "Write the message you want carried."
        Umkar
          Kelen "Send"
        Tor
      Tor
    Tor
  Tor
  Durkel
    Kelen "Kethic Native web shell."
  Tor
Tor

Umvator "#app" receives Home
`;

const compactSample: string = `
st count = 0

act increment
  set count = count plus 1
end

rt "#hero" Hero
rt "#contact" Contact

cmp ActionCard receives title, body
  box ActionCard
    h3 title
    txt body
    slot actions
  end
end

pg Home
  nav Main
    link Hero "Hero"
    link Contact "Contact"
  end
  sec Hero
    h1 "Kethic"
    txt "Ritual architecture for living interfaces."
    use ActionCard "Sealed Components", "Reusable UI without style leakage."
      txt "Count: {count}"
      btn "Enter"
      btn increment "Add"
    end
    sec Contact
      form Contact
        in email "Email" !
        area message "Message" rows:5 !
        msg email "Enter an email before sending."
        msg message "Write the message you want carried."
        btn "Send"
      end
    end
  end
  foot
    txt "Kethic Native web shell."
  end
end

mount "#app" Home
`;

const macroSample: string = `
st joins = 0

act join
  set joins = joins plus 1
end

rt "#hero" Hero
rt "#features" Features
rt "#signup" Signup

pg Landing
  nav Main
    link Hero "Hero"
    link Features "Features"
    link Signup "Signup"
  end
  hero "Kethic" "AI-native websites with fewer tokens." btn:join "Join"
  features
    "Fast generation"
    "Accessible by default"
    "Compiled to real web code"
  end
  signup name email submit:"Join waitlist"
  foot
    txt "Built with Kethic."
  end
end

mount "#app" Landing
`;

const styleCoreSample: string = `
style Hero
  savarin 6
  ovsa auto
  shevsa 4
  vator full
  torkar auto
  naktor 20rem
  tornak wide
  lusel "ink.900"
  mirlu "sand.50"
  kellu "river.700"
  kelsa title
  keltorva strong
  kelruksa reading
  kelshev center
  torkarva soft
  torlu "river.700"
  torsa 1
  natorkar soft
  mireshel raised
  luna 0.95
  vashev hidden
  torshev raised
  torrin relative
  rintor 0
  karum grid
end

pg Home
  sec Hero
    h1 "Kethic"
    txt "Style Core V1"
  end
end

mount "#app" Home
`;

const layoutCoreSample: string = `
style HeroGrid
  seltorkar center
  rinshevsa between
  naruk true
  vatornak wide
  karlu 16/9
end

pg Home
  sec Hero
    stack HeroStack
      h1 "Kethic"
      txt "Layout Core V1"
      row HeroActions
        btn "Start"
        btn "Docs"
      end
    end
    grid HeroGrid
      box First
        h2 "Fast"
      end
      box Second
        h2 "Small"
      end
    end
    center HeroCenter
      txt "Centered proof."
    end
  end
end

mount "#app" Home
`;

describe("WebCompiler", () => {
  it("parses the static Native web slice into a Web AST", () => {
    const ast = new WebParser(sample).parse();

    expect(ast.kind).toBe(WebNodeKind.Program);
    expect(ast.body.map((node) => node.kind)).toEqual([
      WebNodeKind.StyleBlock,
      WebNodeKind.State,
      WebNodeKind.Action,
      WebNodeKind.Route,
      WebNodeKind.Route,
      WebNodeKind.Component,
      WebNodeKind.Page,
      WebNodeKind.Mount,
    ]);
  });

  it("emits static HTML and CSS for Web Phase 1", () => {
    const result = new WebCompiler().compile(sample);

    expect(result.html).toContain('<main id="app" class="kethic-home kethic-page">');
    expect(result.html).toContain('<nav class="kethic-main kethic-navigation" aria-label="Main">');
    expect(result.html).toContain('<a class="kethic-link" href="#hero">Hero</a>');
    expect(result.html).toContain('<a class="kethic-link" href="#contact">Contact</a>');
    expect(result.html).toContain('<section id="hero" class="kethic-hero kethic-section"');
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
    expect(result.html).toContain('<form class="kethic-contact kethic-form">');
    expect(result.html).toContain('<label for="field-email">Email</label>');
    expect(result.html).toContain('<input id="field-email" name="email" required aria-describedby="field-email-message">');
    expect(result.html).toContain('<textarea id="field-message" name="message" rows="5" required aria-describedby="field-message-message"></textarea>');
    expect(result.html).toContain('<p id="field-email-message" class="kethic-validation">Enter an email before sending.</p>');
    expect(result.html).toContain('<button type="submit" class="kethic-button">');
    expect(result.html).toContain('<footer class="kethic-footer">');
    expect(result.html).toContain("Kethic Native web shell.");
    expect(result.html).toContain('<script defer src="./runtime.js"></script>');
    expect(result.css).toContain("@layer kethic.reset, kethic.tokens, kethic.components;");
    expect(result.css).toContain(".kethic-hero {");
    expect(result.css).toContain("padding: var(--sa-6);");
    expect(result.css).toContain("background: var(--color-sand-50);");
    expect(result.css).toContain("color: var(--color-ink-900);");
    expect(result.css).toContain("box-shadow: var(--shadow-raised);");
    expect(result.css).toContain(".kethic-form { display: grid; gap: var(--sa-4); max-inline-size: 42rem; }");
    expect(result.css).toContain(".kethic-field input, .kethic-field textarea");
    expect(result.css).toContain(".kethic-navigation {");
    expect(result.css).toContain(".kethic-footer {");
    expect(result.runtime).toContain('"count": 0');
    expect(result.runtime).toContain('"increment": () =>');
    expect(result.runtime).toContain('state["count"] = (state["count"] + 1);');
  });

  it("compiles compact Kethic web aliases to the same output shape", () => {
    const result = new WebCompiler().compile(compactSample);

    expect(result.html).toContain('<main id="app" class="kethic-home kethic-page">');
    expect(result.html).toContain('<nav class="kethic-main kethic-navigation" aria-label="Main">');
    expect(result.html).toContain('<a class="kethic-link" href="#hero">Hero</a>');
    expect(result.html).toContain('<section id="hero" class="kethic-hero kethic-section"');
    expect(result.html).toContain("Ritual architecture for living interfaces.");
    expect(result.html).toContain("Sealed Components");
    expect(result.html).toContain('data-kethic-template="Count: {count}"');
    expect(result.html).toContain('data-kethic-action="increment"');
    expect(result.html).toContain('<form class="kethic-contact kethic-form">');
    expect(result.html).toContain('<input id="field-email" name="email" required aria-describedby="field-email-message">');
    expect(result.html).toContain('<textarea id="field-message" name="message" rows="5" required aria-describedby="field-message-message"></textarea>');
    expect(result.html).toContain('<footer class="kethic-footer">');
    expect(result.runtime).toContain('"increment": () =>');
  });

  it("expands semantic macros into valid web output", () => {
    const result = new WebCompiler().compile(macroSample);

    expect(result.html).toContain('<main id="app" class="kethic-landing kethic-page">');
    expect(result.html).toContain('<a class="kethic-link" href="#features">Features</a>');
    expect(result.html).toContain('<section id="hero" class="kethic-hero kethic-section">');
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("AI-native websites with fewer tokens.");
    expect(result.html).toContain('data-kethic-action="join"');
    expect(result.html).toContain('<section id="features" class="kethic-features kethic-section">');
    expect(result.html).toContain("Fast generation");
    expect(result.html).toContain("Accessible by default");
    expect(result.html).toContain("Compiled to real web code");
    expect(result.html).toContain('<section id="signup" class="kethic-signup kethic-section">');
    expect(result.html).toContain('<form class="kethic-signup kethic-form">');
    expect(result.html).toContain('<input id="field-name" name="name" required aria-describedby="field-name-message">');
    expect(result.html).toContain('<input id="field-email" name="email" required aria-describedby="field-email-message">');
    expect(result.html).toContain("Join waitlist");
  });

  it("keeps generated HTML ids unique when section names and headings match", () => {
    const result = new WebCompiler().compile(macroSample);
    const ids: string[] = [...result.html.matchAll(/id="([^"]+)"/g)].map((match: RegExpMatchArray) => match[1]);
    const duplicates: string[] = ids.filter((id: string, index: number) => ids.indexOf(id) !== index);

    expect(result.html).toContain('<section id="features" class="kethic-features kethic-section">');
    expect(result.html).toContain('<h2 id="features-2">Features</h2>');
    expect(duplicates).toEqual([]);
  });

  it("compiles Style Core V1 compact attributes into CSS", () => {
    const result = new WebCompiler().compile(styleCoreSample);

    expect(result.css).toContain(".kethic-hero {");
    expect(result.css).toContain("padding: var(--sa-6);");
    expect(result.css).toContain("margin: auto;");
    expect(result.css).toContain("gap: var(--sa-4);");
    expect(result.css).toContain("inline-size: 100%;");
    expect(result.css).toContain("block-size: auto;");
    expect(result.css).toContain("min-inline-size: 20rem;");
    expect(result.css).toContain("max-inline-size: 72rem;");
    expect(result.css).toContain("color: var(--color-river-700);");
    expect(result.css).toContain("background: var(--color-sand-50);");
    expect(result.css).toContain("font-size: clamp(2rem, 4vw, 4rem);");
    expect(result.css).toContain("font-weight: 700;");
    expect(result.css).toContain("line-height: 1.7;");
    expect(result.css).toContain("text-align: center;");
    expect(result.css).toContain("border: 1px solid rgb(23 21 18 / 0.14);");
    expect(result.css).toContain("border-color: var(--color-river-700);");
    expect(result.css).toContain("border-width: 1px;");
    expect(result.css).toContain("border-radius: var(--radius-soft);");
    expect(result.css).toContain("box-shadow: var(--shadow-raised);");
    expect(result.css).toContain("opacity: 0.95;");
    expect(result.css).toContain("overflow: hidden;");
    expect(result.css).toContain("z-index: 10;");
    expect(result.css).toContain("position: relative;");
    expect(result.css).toContain("inset: var(--sa-0);");
    expect(result.css).toContain("display: grid;");
  });

  it("compiles Layout Core V1 primitives into structured HTML and CSS", () => {
    const result = new WebCompiler().compile(layoutCoreSample);

    expect(result.html).toContain('class="kethic-herostack kethic-container kethic-layout-stack"');
    expect(result.html).toContain('class="kethic-heroactions kethic-container kethic-layout-row"');
    expect(result.html).toContain('class="kethic-herogrid kethic-container kethic-layout-grid"');
    expect(result.html).toContain('class="kethic-herocenter kethic-container kethic-layout-center"');
    expect(result.css).toContain(".kethic-layout-stack { display: flex; flex-direction: column; gap: var(--sa-4); }");
    expect(result.css).toContain(".kethic-layout-row { display: flex; flex-direction: row; align-items: center; gap: var(--sa-4); }");
    expect(result.css).toContain(".kethic-layout-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: var(--sa-4); }");
    expect(result.css).toContain(".kethic-layout-center { display: grid; place-items: center; text-align: center; }");
    expect(result.css).toContain(".kethic-herogrid {");
    expect(result.css).toContain("align-items: center;");
    expect(result.css).toContain("justify-content: space-between;");
    expect(result.css).toContain("flex-wrap: wrap;");
    expect(result.css).toContain("max-inline-size: 72rem;");
    expect(result.css).toContain("margin-inline: auto;");
    expect(result.css).toContain("padding-inline: var(--sa-4);");
    expect(result.css).toContain("aspect-ratio: 16/9;");
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

  it("rejects form fields without labels", () => {
    expect(() =>
      new WebCompiler().compile(`
Torvathar Home
  Selvathar Contact
    Enva email Torikh
  Tor
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });

  it("rejects validation messages for missing fields", () => {
    expect(() =>
      new WebCompiler().compile(`
Torvathar Home
  Selvathar Contact
    Enva email label:"Email" Torikh
    Ikhen for:message "Missing message."
  Tor
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });

  it("rejects links to missing route targets", () => {
    expect(() =>
      new WebCompiler().compile(`
Torvathar Home
  Rukshev Main
    Ovshev to:Missing "Missing"
  Tor
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });

  it("rejects routes to missing sections", () => {
    expect(() =>
      new WebCompiler().compile(`
Rinshev "#missing" receives Missing
Torvathar Home
  Kelen "Hello"
Tor
Umvator "#app" receives Home
`),
    ).toThrow(WebCompilerError);
  });
});
