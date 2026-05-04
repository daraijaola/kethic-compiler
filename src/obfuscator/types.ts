import { SourceMapEntry } from "../codegen/types";

/**
 * ObfuscationInput is the Phase 5 input contract.
 */
export interface ObfuscationInput {
  readonly code: string;
  readonly sourceMap: SourceMapEntry[];
  readonly seed?: string;
}

/**
 * ObfuscationResult is the Phase 5 output contract.
 */
export interface ObfuscationResult {
  readonly code: string;
  readonly sourceMap: SourceMapEntry[];
}

/**
 * LineTransform stores one obfuscated output line and its original JS line.
 */
export interface LineTransform {
  readonly originalJsLine: number | null;
  readonly code: string;
}
