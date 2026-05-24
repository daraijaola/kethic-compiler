import { CodeGenerator } from "./codegen";
import { Lexer } from "./lexer/lexer";
import { CompiledModule, ModuleGraphCompiler, ModuleGraphDiagnostic, ModuleGraphFileSystem } from "./modulegraph";
import { NativeParser } from "./native";
import { Parser, ProgramNode } from "./parser";
import { TypeChecker, TypeCheckDiagnostic } from "./typechecker";
import { normalizeBrandProfile, ResolvedBrandProfile } from "./web/brandProfile";
import { WebCompiler, WebCompileResult } from "./web";

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
 * WebCommand stores parsed command-line arguments for `kethic web`.
 */
interface WebCommand {
  readonly inputPath: string;
  readonly outputDirectory: string;
  readonly brandPath: string | null;
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
 * parseWebCommand accepts:
 * kethic web input.keth --out-dir dist
 */
function parseWebCommand(args: readonly string[]): WebCommand {
  if (args.length < 4 || args[0] !== "web") {
    throw new Error(usage());
  }

  const inputPath: string = args[1];
  let outputDirectory: string | null = null;
  let brandPath: string | null = null;
  let index: number = 2;

  while (index < args.length) {
    const current: string = args[index];

    if (current === "--out-dir") {
      if (index + 1 >= args.length) {
        throw new Error("Expected output directory after --out-dir.\n\n" + usage());
      }

      outputDirectory = args[index + 1];
      index += 2;
      continue;
    }

    if (current === "--brand") {
      if (index + 1 >= args.length) {
        throw new Error("Expected brand profile path after --brand.\n\n" + usage());
      }

      brandPath = args[index + 1];
      index += 2;
      continue;
    }

    throw new Error(`Unknown option "${current}".\n\n${usage()}`);
  }

  if (outputDirectory === null) {
    throw new Error("Expected --out-dir for web output.\n\n" + usage());
  }

  return { inputPath, outputDirectory, brandPath };
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
    runGraphCompile(absoluteInput, path.resolve(command.outputDirectory), command.nativeMode);
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
function runGraphCompile(absoluteInput: string, absoluteOutputDirectory: string, nativeMode: boolean): void {
  const compiler: ModuleGraphCompiler = new ModuleGraphCompiler(new NodeModuleFileSystem(), { nativeMode });
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
 * runWebCompile writes the first static Kethic web bundle.
 */
function runWebCompile(command: WebCommand): void {
  const absoluteInput: string = path.resolve(command.inputPath);
  const absoluteOutputDirectory: string = path.resolve(command.outputDirectory);
  const brandProfile: ResolvedBrandProfile | undefined =
    command.brandPath === null ? undefined : readBrandProfile(path.resolve(command.brandPath));
  const source: string = fs.readFileSync(absoluteInput, "utf8");
  const result: WebCompileResult = new WebCompiler().compile(source, { brandProfile });
  const htmlPath: string = path.join(absoluteOutputDirectory, "index.html");
  const cssPath: string = path.join(absoluteOutputDirectory, "styles.css");
  const runtimePath: string = path.join(absoluteOutputDirectory, "runtime.js");

  fs.mkdirSync(absoluteOutputDirectory, { recursive: true });
  fs.writeFileSync(htmlPath, result.html + "\n", "utf8");
  fs.writeFileSync(cssPath, result.css + "\n", "utf8");
  process.stdout.write(`Wrote ${htmlPath}\n`);
  process.stdout.write(`Wrote ${cssPath}\n`);

  if (result.runtime.length > 0) {
    fs.writeFileSync(runtimePath, result.runtime + "\n", "utf8");
    process.stdout.write(`Wrote ${runtimePath}\n`);
  }
}

function readBrandProfile(absoluteBrandPath: string): ResolvedBrandProfile {
  const source: string = fs.readFileSync(absoluteBrandPath, "utf8");

  return normalizeBrandProfile(JSON.parse(source));
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
    "  kethic web <input.keth> --out-dir dist-web [--brand brand.json]",
    "",
    "Examples:",
    "  kethic compile examples/milestone1.keth",
    "  kethic compile examples/native-core.keth --native",
    "  kethic compile examples/milestone1.keth --out dist/milestone1.js",
    "  kethic compile examples/app.keth --out-dir dist",
    "  kethic web examples/kethic-core-showcase.keth --out-dir dist-web",
    "  kethic web examples/brand-profile-demo.keth --out-dir dist-web --brand examples/brands/nocturne.json",
  ].join("\n");
}

/**
 * main is intentionally tiny: argument parsing, command dispatch, diagnostics.
 */
function main(): void {
  try {
    const args: readonly string[] = process.argv.slice(2);
    if (args[0] === "web") {
      runWebCompile(parseWebCommand(args));
      return;
    }

    runCompile(parseCompileCommand(args));
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error);
    process.stderr.write(message + "\n");
    process.exit(1);
  }
}

main();
