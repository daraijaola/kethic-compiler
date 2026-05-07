import { CodeGenerator } from "../codegen";
import { Lexer } from "../lexer/lexer";
import { NativeParser } from "../native";
import { OvrinDeclarationNode, Parser, ProgramNode } from "../parser";
import { KethicSymbol, TypeChecker, TypeCheckDiagnostic, UNKNOWN_TYPE, ValueSymbol } from "../typechecker";
import { CompiledModule, ModuleGraphCompilerOptions, ModuleGraphDiagnostic, ModuleGraphFileSystem, ModuleGraphResult } from "./types";

/**
 * ModuleGraphCompiler compiles an entry file and every reachable Kethic module.
 */
export class ModuleGraphCompiler {
  private readonly modules: Map<string, CompiledModule> = new Map<string, CompiledModule>();
  private readonly diagnostics: ModuleGraphDiagnostic[] = [];
  private readonly visiting: Set<string> = new Set<string>();

  public constructor(
    private readonly fileSystem: ModuleGraphFileSystem,
    private readonly options: ModuleGraphCompilerOptions = {},
  ) {}

  /**
   * compile resolves the entry file, follows local .keth imports, and returns
   * typed outputs for every module in dependency-first order.
   */
  public compile(entryPath: string): ModuleGraphResult {
    this.modules.clear();
    this.diagnostics.length = 0;
    this.visiting.clear();

    const resolvedEntryPath: string = this.fileSystem.resolvePath(entryPath);
    this.compileModule(resolvedEntryPath);

    return {
      entryPath: resolvedEntryPath,
      modules: [...this.modules.values()],
      diagnostics: [...this.diagnostics],
    };
  }

  /**
   * compileModule performs parse, dependency compile, type check, and codegen.
   */
  private compileModule(filePath: string): void {
    if (this.modules.has(filePath)) {
      return;
    }

    if (this.visiting.has(filePath)) {
      this.report(filePath, 1, 1, "Ovrin", `circular module import involving "${filePath}"`);
      return;
    }

    this.visiting.add(filePath);

    let program: ProgramNode;
    try {
      program = this.parseSource(this.fileSystem.readFile(filePath));
    } catch (error: unknown) {
      this.report(filePath, 1, 1, "Parser", error instanceof Error ? error.message : String(error));
      this.visiting.delete(filePath);
      return;
    }

    for (const declaration of this.importDeclarations(program)) {
      if (declaration.source !== null && this.isKethicModule(declaration.source.value)) {
        const dependencyPath: string = this.fileSystem.resolveImport(filePath, declaration.source.value);
        this.compileModule(dependencyPath);
      }
    }

    const importedSymbols: KethicSymbol[] = this.collectImportedSymbols(filePath, program);
    const checker: TypeChecker = new TypeChecker(importedSymbols);
    const typeDiagnostics: TypeCheckDiagnostic[] = checker.check(program);
    for (const diagnostic of typeDiagnostics) {
      this.diagnostics.push({ ...diagnostic, filePath });
    }

    const exports: ReadonlyMap<string, KethicSymbol> = this.collectExports(program, checker);
    const output = new CodeGenerator({
      mapImportSource: (source: string): string => this.rewriteImportSource(source),
    }).generate(program);

    this.modules.set(filePath, {
      filePath,
      program,
      exports,
      output,
    });
    this.visiting.delete(filePath);
  }

  /**
   * parseSource selects Kethic Native or Classic syntax for graph compilation.
   */
  private parseSource(source: string): ProgramNode {
    if (this.options.nativeMode === true) {
      return new NativeParser(source).parse();
    }

    return new Parser(new Lexer(source).scanTokens()).parse();
  }

  /**
   * collectImportedSymbols resolves imported names against dependency exports.
   */
  private collectImportedSymbols(filePath: string, program: ProgramNode): KethicSymbol[] {
    const symbols: KethicSymbol[] = [];

    for (const declaration of this.importDeclarations(program)) {
      if (declaration.source === null) {
        continue;
      }

      if (!this.isKethicModule(declaration.source.value)) {
        symbols.push(...this.createExternalImportSymbols(declaration));
        continue;
      }

      const dependencyPath: string = this.fileSystem.resolveImport(filePath, declaration.source.value);
      const dependency: CompiledModule | undefined = this.modules.get(dependencyPath);

      for (const specifier of declaration.specifiers) {
        const exportedSymbol: KethicSymbol | undefined = dependency?.exports.get(specifier.name.lexeme);

        if (exportedSymbol === undefined) {
          this.report(
            filePath,
            specifier.name.line,
            specifier.name.column,
            declaration.keyword.lexeme,
            `module "${declaration.source.value}" does not export "${specifier.name.lexeme}"`,
          );
          continue;
        }

        symbols.push(exportedSymbol);
      }
    }

    return symbols;
  }

  /**
   * createExternalImportSymbols keeps non-Kethic imports as Unknown values.
   */
  private createExternalImportSymbols(declaration: OvrinDeclarationNode): KethicSymbol[] {
    return declaration.specifiers.map((specifier): ValueSymbol => ({
      kind: "Variable",
      name: specifier.name.lexeme,
      type: UNKNOWN_TYPE,
      declarationKeyword: declaration.keyword,
      declarationName: specifier.name,
    }));
  }

  /**
   * collectExports reads checked symbols for every Ovrin export specifier.
   */
  private collectExports(program: ProgramNode, checker: TypeChecker): ReadonlyMap<string, KethicSymbol> {
    const exports: Map<string, KethicSymbol> = new Map<string, KethicSymbol>();

    for (const declaration of this.importDeclarations(program)) {
      if (declaration.source !== null) {
        continue;
      }

      for (const specifier of declaration.specifiers) {
        const symbol: KethicSymbol | null = checker.resolveSymbol(specifier.name.lexeme);
        if (symbol !== null) {
          exports.set(specifier.name.lexeme, symbol);
        }
      }
    }

    return exports;
  }

  /**
   * importDeclarations returns every Ovrin declaration in top-level order.
   */
  private importDeclarations(program: ProgramNode): OvrinDeclarationNode[] {
    return program.body.filter((statement): statement is OvrinDeclarationNode => statement.kind === "OvrinDeclaration");
  }

  /**
   * rewriteImportSource maps Kethic imports to emitted JavaScript modules.
   */
  private rewriteImportSource(source: string): string {
    return this.isKethicModule(source) ? source.replace(/\.keth$/i, ".js") : source;
  }

  /**
   * isKethicModule recognizes local Kethic source modules.
   */
  private isKethicModule(source: string): boolean {
    return source.toLowerCase().endsWith(".keth");
  }

  /**
   * report appends a file-aware graph diagnostic.
   */
  private report(filePath: string, line: number, column: number, keyword: string, message: string): void {
    this.diagnostics.push({
      filePath,
      line,
      column,
      keyword,
      message,
    });
  }
}
