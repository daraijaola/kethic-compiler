import { describe, expect, it } from "vitest";
import { ModuleGraphCompiler, ModuleGraphFileSystem } from "../src";

class MemoryModuleFileSystem implements ModuleGraphFileSystem {
  public constructor(private readonly files: Readonly<Record<string, string>>) {}

  public readFile(path: string): string {
    const source: string | undefined = this.files[this.resolvePath(path)];
    if (source === undefined) {
      throw new Error(`Missing test module ${path}`);
    }

    return source;
  }

  public resolvePath(path: string): string {
    return path.replace(/\\/g, "/");
  }

  public resolveImport(fromFile: string, source: string): string {
    const fromDirectory: string = fromFile.replace(/\\/g, "/").replace(/\/[^/]*$/, "");
    const parts: string[] = `${fromDirectory}/${source}`.split("/");
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === "" || part === ".") {
        continue;
      }

      if (part === "..") {
        resolved.pop();
        continue;
      }

      resolved.push(part);
    }

    return resolved.join("/");
  }
}

describe("ModuleGraphCompiler", () => {
  it("type-checks imports against real exported Kethic symbols", () => {
    const compiler = new ModuleGraphCompiler(
      new MemoryModuleFileSystem({
        "app/math.keth": `
Kelthar add(a: Number, b: Number) {
  Duren a + b;
}
Ovrin { add };
`,
        "app/main.keth": `
Ovrin { add } from "./math.keth";
Navā total = Umkel add(1, 2);
`,
      }),
    );

    const result = compiler.compile("app/main.keth");

    expect(result.diagnostics).toEqual([]);
    expect(result.modules.map((module) => module.filePath)).toEqual(["app/math.keth", "app/main.keth"]);
    expect(result.modules[1].output.code).toContain('import { add } from "./math.js";');
    expect(result.modules[1].output.code).toContain("let total = add(1, 2);");
  });

  it("reports wrong imported function usage", () => {
    const compiler = new ModuleGraphCompiler(
      new MemoryModuleFileSystem({
        "app/math.keth": `
Kelthar add(a: Number, b: Number) {
  Duren a + b;
}
Ovrin { add };
`,
        "app/main.keth": `
Ovrin { add } from "./math.keth";
Navā total = Umkel add("wrong", 2);
`,
      }),
    );

    const result = compiler.compile("app/main.keth");

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].filePath).toBe("app/main.keth");
    expect(result.diagnostics[0].message).toContain('Kelthar "add" argument 1 expected Number but received String');
  });

  it("reports imports that are not exported by the dependency", () => {
    const compiler = new ModuleGraphCompiler(
      new MemoryModuleFileSystem({
        "app/math.keth": `
Navā hidden = 1;
`,
        "app/main.keth": `
Ovrin { hidden } from "./math.keth";
Navā total = hidden;
`,
      }),
    );

    const result = compiler.compile("app/main.keth");

    expect(result.diagnostics.map((diagnostic) => diagnostic.message)).toContain(
      'module "./math.keth" does not export "hidden"',
    );
  });
});
