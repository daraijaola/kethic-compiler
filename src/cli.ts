import { CodeGenerator } from "./codegen";
import { Lexer } from "./lexer/lexer";
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
  resolve(path: string): string;
}

/**
 * CompileCommand stores parsed command-line arguments for `kethic compile`.
 */
interface CompileCommand {
  readonly inputPath: string;
  readonly outputPath: string | null;
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
 * compileSource runs the current Kethic compiler phases through clean JS codegen.
 */
function compileSource(source: string): CompileResult {
  const ast: ProgramNode = new Parser(new Lexer(source).scanTokens()).parse();
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

    throw new Error(`Unknown option "${current}".\n\n${usage()}`);
  }

  return {
    inputPath,
    outputPath,
  };
}

/**
 * runCompile reads the source file and either prints or writes generated JS.
 */
function runCompile(command: CompileCommand): void {
  const absoluteInput: string = path.resolve(command.inputPath);
  const source: string = fs.readFileSync(absoluteInput, "utf8");
  const result: CompileResult = compileSource(source);

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
 * usage returns the supported CLI surface.
 */
function usage(): string {
  return [
    "Usage:",
    "  kethic compile <input.keth> [--out output.js]",
    "",
    "Examples:",
    "  kethic compile examples/milestone1.keth",
    "  kethic compile examples/milestone1.keth --out dist/milestone1.js",
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
