import { Lexer } from "./lexer/lexer";
import { Parser, ProgramNode } from "./parser";
import { TypeChecker, TypeCheckDiagnostic } from "./typechecker";
import { RotatingObfuscationEngine, RotationSnapshot } from "./rotator";

/**
 * Minimal CommonJS require declaration keeps this file dependency-free while
 * still allowing Node built-ins without @types/node.
 */
declare function require(moduleName: string): unknown;

/**
 * __dirname is provided by Node's CommonJS runtime after TypeScript compilation.
 */
declare const __dirname: string;

/**
 * HttpRequest is the small request surface needed by this server.
 */
interface HttpRequest {
  readonly method?: string;
  readonly url?: string;
}

/**
 * HttpResponse is the small response surface needed by this server.
 */
interface HttpResponse {
  writeHead(statusCode: number, headers: Record<string, string>): void;
  end(body?: string): void;
}

/**
 * HttpServer is the small server surface needed to listen on a port.
 */
interface HttpServer {
  listen(port: number, hostname: string, callback: () => void): void;
}

/**
 * HttpModule is the Node built-in http module shape used here.
 */
interface HttpModule {
  createServer(listener: (request: HttpRequest, response: HttpResponse) => void): HttpServer;
}

/**
 * FsModule is the Node built-in fs module shape used here.
 */
interface FsModule {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: "utf8"): string;
}

/**
 * PathModule is the Node built-in path module shape used here.
 */
interface PathModule {
  join(...segments: string[]): string;
}

const http: HttpModule = require("http") as HttpModule;
const fs: FsModule = require("fs") as FsModule;
const path: PathModule = require("path") as PathModule;

/**
 * compileDemo reads examples/demo.keth and validates it through Phases 1-3.
 */
function compileDemo(): ProgramNode {
  const sourcePath: string = path.join(__dirname, "..", "examples", "demo.keth");
  const distPath: string = path.join(__dirname, "..", "..", "examples", "demo.keth");
  const demoPath: string = fs.existsSync(sourcePath) ? sourcePath : distPath;
  const source: string = fs.readFileSync(demoPath, "utf8");
  const ast: ProgramNode = new Parser(new Lexer(source).scanTokens()).parse();
  const checker: TypeChecker = new TypeChecker();
  const diagnostics: TypeCheckDiagnostic[] = checker.check(ast);

  if (diagnostics.length > 0) {
    throw new Error(checker.formatDiagnostics(diagnostics).join("\n"));
  }

  return ast;
}

/**
 * startServer starts the rotating bundle server at localhost:3000.
 */
function startServer(): void {
  const engine: RotatingObfuscationEngine = new RotatingObfuscationEngine(compileDemo(), {
    intervalMs: 100,
    onRotate: (event) => {
      console.log(`rotation ${event.version} key=${event.key} preview=${event.preview}`);
    },
  });

  engine.start();

  const server: HttpServer = http.createServer((request: HttpRequest, response: HttpResponse): void => {
    if (request.method === "GET" && request.url === "/bundle.js") {
      const snapshot: RotationSnapshot = engine.getCurrentVersion();
      response.writeHead(200, {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-store",
        "X-Kethic-Version": String(snapshot.version),
      });
      response.end(snapshot.code);
      return;
    }

    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Not found");
  });

  server.listen(3000, "localhost", (): void => {
    console.log("Kethic rotation server listening at http://localhost:3000/bundle.js");
  });
}

startServer();
