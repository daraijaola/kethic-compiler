import { WebProgramNode } from "./ast";
import { ResolvedBrandProfile } from "./brandProfile";
import { CssGenerator } from "./cssGenerator";
import { WebCompilerError, WebDiagnostic } from "./diagnostics";
import { HtmlGenerator } from "./htmlGenerator";
import { RuntimeGenerator } from "./runtimeGenerator";
import { WebParser } from "./webParser";
import { WebTypeChecker } from "./webTypeChecker";

/**
 * WebCompileResult is the first static web output bundle.
 */
export interface WebCompileResult {
  readonly ast: WebProgramNode;
  readonly html: string;
  readonly css: string;
  readonly runtime: string;
}

/**
 * WebCompileOptions carries optional compiler-time layers.
 */
export interface WebCompileOptions {
  readonly brandProfile?: ResolvedBrandProfile;
}

/**
 * WebCompiler runs parse, check, HTML generation, and CSS generation.
 */
export class WebCompiler {
  /**
   * compile turns Kethic Native web source into static browser files.
   */
  public compile(source: string, options: WebCompileOptions = {}): WebCompileResult {
    const ast: WebProgramNode = new WebParser(source).parse();
    const checker: WebTypeChecker = new WebTypeChecker();
    const diagnostics: readonly WebDiagnostic[] = checker.check(ast);

    if (diagnostics.length > 0) {
      throw new WebCompilerError(diagnostics);
    }

    const runtime: string = new RuntimeGenerator().generate(ast);

    return {
      ast,
      html: new HtmlGenerator(runtime.length > 0).generate(ast),
      css: new CssGenerator(options.brandProfile).generate(ast),
      runtime,
    };
  }
}
