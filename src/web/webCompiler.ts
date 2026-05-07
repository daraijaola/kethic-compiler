import { WebProgramNode } from "./ast";
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
 * WebCompiler runs parse, check, HTML generation, and CSS generation.
 */
export class WebCompiler {
  /**
   * compile turns Kethic Native web source into static browser files.
   */
  public compile(source: string): WebCompileResult {
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
      css: new CssGenerator().generate(ast),
      runtime,
    };
  }
}
