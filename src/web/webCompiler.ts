import { DataItemNode, DataNode, WebNodeKind, WebProgramNode, WebTopLevelNode, WebValue } from "./ast";
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
  readonly dataLoader?: WebDataLoader;
}

export type WebDataLoader = (sourcePath: string, dataName: string) => readonly (readonly WebValue[])[];

/**
 * WebCompiler runs parse, check, HTML generation, and CSS generation.
 */
export class WebCompiler {
  /**
   * compile turns Kethic Native web source into static browser files.
   */
  public compile(source: string, options: WebCompileOptions = {}): WebCompileResult {
    const parsedAst: WebProgramNode = new WebParser(source).parse();
    const ast: WebProgramNode = this.resolveExternalData(parsedAst, options);
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

  private resolveExternalData(program: WebProgramNode, options: WebCompileOptions): WebProgramNode {
    const body: WebTopLevelNode[] = program.body.map((node: WebTopLevelNode): WebTopLevelNode => {
      if (node.kind !== WebNodeKind.Data || node.sourcePath === undefined) {
        return node;
      }

      if (options.dataLoader === undefined) {
        throw new WebCompilerError([
          {
            line: node.location.line,
            column: node.location.column,
            keyword: "data",
            message: `external data "${node.sourcePath}" requires a data loader`,
          },
        ]);
      }

      const rows: readonly (readonly WebValue[])[] = options.dataLoader(node.sourcePath, node.name);
      const items: DataItemNode[] = rows.map((values: readonly WebValue[], index: number): DataItemNode => ({
        kind: WebNodeKind.DataItem,
        location: { line: node.location.line + index, column: node.location.column },
        values,
      }));

      const resolved: DataNode = {
        ...node,
        items,
      };

      return resolved;
    });

    return {
      ...program,
      body,
    };
  }
}
