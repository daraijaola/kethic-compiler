import { CodeGenerationResult } from "../codegen";
import { ProgramNode } from "../parser";
import { KethicSymbol, TypeCheckDiagnostic } from "../typechecker";

/**
 * ModuleGraphFileSystem is the host boundary used by graph compilation.
 */
export interface ModuleGraphFileSystem {
  readFile(path: string): string;
  resolvePath(path: string): string;
  resolveImport(fromFile: string, source: string): string;
}

/**
 * ModuleGraphDiagnostic attaches a compiler diagnostic to its source file.
 */
export interface ModuleGraphDiagnostic extends TypeCheckDiagnostic {
  readonly filePath: string;
}

/**
 * CompiledModule stores all compiler outputs for one .keth file.
 */
export interface CompiledModule {
  readonly filePath: string;
  readonly program: ProgramNode;
  readonly exports: ReadonlyMap<string, KethicSymbol>;
  readonly output: CodeGenerationResult;
}

/**
 * ModuleGraphResult is the full output of compiling an entry and dependencies.
 */
export interface ModuleGraphResult {
  readonly entryPath: string;
  readonly modules: readonly CompiledModule[];
  readonly diagnostics: readonly ModuleGraphDiagnostic[];
}
