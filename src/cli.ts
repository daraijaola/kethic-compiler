import { CodeGenerator } from "./codegen";
import { Lexer } from "./lexer/lexer";
import { CompiledModule, ModuleGraphCompiler, ModuleGraphDiagnostic, ModuleGraphFileSystem } from "./modulegraph";
import { NativeParser } from "./native";
import { Parser, ProgramNode } from "./parser";
import { TypeChecker, TypeCheckDiagnostic } from "./typechecker";

/**
 * Minimal Node declarations keep the project dependency-free and avoid adding
 * @types/node just for this command-line wrapper.
 */
declare function require(moduleName: string): unknown;
declare const process: {
  readonly argv: string[];
  stdout: { write(text: string): void };
  stderr: { write(text: string): void };
  exit(code?: number): never;
};

/**
 * FsModule is the small subset of Node's fs API needed by the CLI.
 */
interface FsModule {
  readFileSync(path: string, encoding: "utf8"): string;
  writeFileSync(path: string, content: string, encoding: "utf8"): void;
  mkdirSync(path: string, options: { readonly recursive: boolean }): void;
}

/**
 * PathModule is the small subset of Node's path API needed by the CLI.
 */
interface PathModule {
  dirname(path: string): string;
  join(...paths: string[]): string;
  relative(from: string, to: string): string;
  resolve(...paths: string[]): string;
}

/**
 * CompileCommand stores parsed command-line arguments for `kethic compile`.
 */
interface CompileCommand {
  readonly inputPath: string;
  readonly outputPath: string | null;
  readonly outputDirectory: string | null;
  readonly nativeMode: boolean;
}

/**
 * CompileResult is the clean JavaScript emitted from a valid Kethic source.
 */
interface CompileResult {
  readonly code: string;
}

const fs: FsModule = require("fs") as FsModule;
const path: PathModule = require("path") as PathModule;

/**
 * NodeModuleFileSystem adapts Node built-ins to the module graph compiler.
 */
class NodeModuleFileSystem implements ModuleGraphFileSystem {
  public readFile(filePath: string): string {
    return fs.readFileSync(filePath, "utf8");
  }

  public resolvePath(filePath: string): string {
    return path.resolve(filePath);
  }

  public resolveImport(fromFile: string, source: string): string {
    return path.resolve(path.dirname(fromFile), source);
  }
}

/**
 * compileSource runs the current Kethic compiler phases through clean JS codegen.
 */
function compileSource(source: string, nativeMode: boolean): CompileResult {
  const ast: ProgramNode = nativeMode
    ? new NativeParser(source).parse()
    : new Parser(new Lexer(source).scanTokens()).parse();
  const checker: TypeChecker = new TypeChecker();
  const diagnostics: TypeCheckDiagnostic[] = checker.check(ast);

  if (diagnostics.length > 0) {
    throw new Error(checker.formatDiagnostics(diagnostics).join("\n"));
  }

  return {
    code: new CodeGenerator().generate(ast).code,
  };
}

/**
 * parseCompileCommand accepts:
 * kethic compile input.keth
 * kethic compile input.keth --out output.js
 */
function parseCompileCommand(args: readonly string[]): CompileCommand {
  if (args.length < 2 || args[0] !== "compile") {
    throw new Error(usage());
  }

  const inputPath: string = args[1];
  let outputPath: string | null = null;
  let outputDirectory: string | null = null;
  let nativeMode: boolean = false;
  let index: number = 2;

  while (index < args.length) {
    const current: string = args[index];

    if (current === "--out") {
      if (index + 1 >= args.length) {
        throw new Error("Expected output path after --out.\n\n" + usage());
      }

      outputPath = args[index + 1];
      index += 2;
      continue;
    }

    if (current === "--out-dir") {
      if (index + 1 >= args.length) {
        throw new Error("Expected output directory after --out-dir.\n\n" + usage());
      }

      outputDirectory = args[index + 1];
      index += 2;
      continue;
    }

    if (current === "--native") {
      nativeMode = true;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option "${current}".\n\n${usage()}`);
  }

  return {
    inputPath,
    outputPath,
    outputDirectory,
    nativeMode,
  };
}

/**
 * runCompile reads the source file and either prints or writes generated JS.
 */
function runCompile(command: CompileCommand): void {
  const absoluteInput: string = path.resolve(command.inputPath);

  if (command.outputPath !== null && command.outputDirectory !== null) {
    throw new Error("Use either --out or --out-dir, not both.\n\n" + usage());
  }

  if (command.outputDirectory !== null) {
    if (command.nativeMode) {
      throw new Error("--native with --out-dir is not supported until Native module parsing lands.\n\n" + usage());
    }

    runGraphCompile(absoluteInput, path.resolve(command.outputDirectory));
    return;
  }

  const source: string = fs.readFileSync(absoluteInput, "utf8");
  const result: CompileResult = compileSource(source, command.nativeMode);

  if (command.outputPath === null) {
    process.stdout.write(result.code + "\n");
    return;
  }

  const absoluteOutput: string = path.resolve(command.outputPath);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, result.code + "\n", "utf8");
  process.stdout.write(`Wrote ${absoluteOutput}\n`);
}

/**
 * runGraphCompile writes every compiled .keth module into an output directory.
 */
function runGraphCompile(absoluteInput: string, absoluteOutputDirectory: string): void {
  const compiler: ModuleGraphCompiler = new ModuleGraphCompiler(new NodeModuleFileSystem());
  const result = compiler.compile(absoluteInput);

  if (result.diagnostics.length > 0) {
    throw new Error(formatGraphDiagnostics(result.diagnostics).join("\n"));
  }

  const entryDirectory: string = path.dirname(result.entryPath);
  for (const module of result.modules) {
    const outputPath: string = outputPathForModule(entryDirectory, absoluteOutputDirectory, module);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, module.output.code + "\n", "utf8");
    process.stdout.write(`Wrote ${outputPath}\n`);
  }
}

/**
 * outputPathForModule preserves source-relative layout and changes .keth to .js.
 */
function outputPathForModule(entryDirectory: string, outputDirectory: string, module: CompiledModule): string {
  const relativePath: string = path.relative(entryDirectory, module.filePath);
  const jsRelativePath: string = relativePath.replace(/\.keth$/i, ".js");
  return path.join(outputDirectory, jsRelativePath);
}

/**
 * formatGraphDiagnostics includes file paths in multi-file diagnostics.
 */
function formatGraphDiagnostics(diagnostics: readonly ModuleGraphDiagnostic[]): string[] {
  return diagnostics.map((diagnostic: ModuleGraphDiagnostic) =>
    `${diagnostic.filePath}: KethicTypeError [Line ${diagnostic.line}, Col ${diagnostic.column}] — ${diagnostic.keyword}: ${diagnostic.message}`,
  );
}

/**
 * usage returns the supported CLI surface.
 */
function usage(): string {
  return [
    "Usage:",
    "  kethic compile <input.keth> [--out output.js] [--native]",
    "  kethic compile <input.keth> --out-dir dist",
    "",
    "Examples:",
    "  kethic compile examples/milestone1.keth",
    "  kethic compile examples/native-core.keth --native",
    "  kethic compile examples/milestone1.keth --out dist/milestone1.js",
    "  kethic compile examples/app.keth --out-dir dist",
  ].join("\n");
}

/**
 * main is intentionally tiny: argument parsing, command dispatch, diagnostics.
 */
function main(): void {
  try {
    runCompile(parseCompileCommand(process.argv.slice(2)));
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error);
    process.stderr.write(message + "\n");
    process.exit(1);
  }
}

main();
