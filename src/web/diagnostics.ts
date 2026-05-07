/**
 * WebDiagnostic is a parser/checker message tied to Kethic web source.
 */
export interface WebDiagnostic {
  readonly line: number;
  readonly column: number;
  readonly keyword: string;
  readonly message: string;
}

/**
 * WebCompilerError groups fatal web compiler diagnostics.
 */
export class WebCompilerError extends Error {
  public constructor(public readonly diagnostics: readonly WebDiagnostic[]) {
    super(diagnostics.map(formatWebDiagnostic).join("\n"));
  }
}

/**
 * formatWebDiagnostic renders diagnostics in the normal Kethic style.
 */
export function formatWebDiagnostic(diagnostic: WebDiagnostic): string {
  return `KethicWebError [Line ${diagnostic.line}, Col ${diagnostic.column}] — ${diagnostic.keyword}: ${diagnostic.message}`;
}

