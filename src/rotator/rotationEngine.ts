import { CodeGenerator } from "../codegen";
import { Obfuscator } from "../obfuscator";
import { ProgramNode } from "../parser";
import { RotationEngineOptions, RotationLogEvent, RotationSnapshot } from "./types";

/**
 * RotatingObfuscationEngine owns a validated AST and refreshes its obfuscated
 * JavaScript bundle on a fixed server-side interval.
 */
export class RotatingObfuscationEngine {
  private readonly ast: ProgramNode;
  private readonly intervalMs: number;
  private readonly onRotate: ((event: RotationLogEvent) => void) | null;
  private currentSnapshot: RotationSnapshot;
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentKey: string = "";
  private version: number = 0;

  public constructor(ast: ProgramNode, options: RotationEngineOptions = {}) {
    this.ast = ast;
    this.intervalMs = options.intervalMs ?? 100;
    this.onRotate = options.onRotate ?? null;
    this.currentSnapshot = {
      version: 0,
      code: "",
      sourceMap: [],
      createdAt: new Date(0),
    };
  }

  /**
   * start generates the first bundle immediately, then rotates on the interval.
   */
  public start(): void {
    if (this.timer !== null) {
      return;
    }

    this.rotate();
    this.timer = setInterval(() => {
      this.rotate();
    }, this.intervalMs);
  }

  /**
   * stop ends the rotation timer and kills the current server-side key.
   */
  public stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.currentKey = "";
  }

  /**
   * getCurrentVersion returns the latest bundle without exposing the key.
   */
  public getCurrentVersion(): RotationSnapshot {
    return this.currentSnapshot;
  }

  /**
   * rotate creates a fresh key, regenerates clean JS, and obfuscates with that key.
   */
  private rotate(): void {
    const key: string = this.generateRotationKey();
    const generated = new CodeGenerator().generate(this.ast);
    const obfuscated = new Obfuscator().obfuscate({
      code: generated.code,
      sourceMap: generated.sourceMap,
      seed: key,
    });

    this.currentKey = key;
    this.version += 1;
    this.currentSnapshot = {
      version: this.version,
      code: obfuscated.code,
      sourceMap: obfuscated.sourceMap,
      createdAt: new Date(),
    };

    if (this.onRotate !== null) {
      this.onRotate({
        version: this.version,
        key,
        preview: obfuscated.code.slice(0, 80).replace(/\s+/g, " "),
      });
    }
  }

  /**
   * generateRotationKey creates a fresh server-only seed for one rotation.
   */
  private generateRotationKey(): string {
    const timePart: string = Date.now().toString(16);
    const versionPart: string = (this.version + 1).toString(16);
    const randomPart: string = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
    return `${timePart}-${versionPart}-${randomPart}`;
  }
}
