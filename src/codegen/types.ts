/**
 * SourceMapEntry connects one emitted JavaScript line to its Kethic source line.
 */
export interface SourceMapEntry {
  readonly kethicLine: number;
  readonly jsLine: number;
}

/**
 * CodeGenerationResult is the complete Phase 4 output.
 */
export interface CodeGenerationResult {
  readonly code: string;
  readonly sourceMap: SourceMapEntry[];
}
