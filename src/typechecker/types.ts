import { Token } from "../lexer/tokens";

/**
 * PrimitiveTypeName is the set of value categories understood in Phase 3.
 */
export type PrimitiveTypeName = "Number" | "String" | "Boolean" | "Void" | "Unknown";

/**
 * SymbolKind separates mutable values, constants, and declared functions.
 */
export type SymbolKind = "Variable" | "Constant" | "Function";

/**
 * ValueSymbol stores the inferred type for a Navā or Torūn name.
 */
export interface ValueSymbol {
  readonly kind: "Variable" | "Constant";
  readonly name: string;
  readonly type: PrimitiveTypeName;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
}

/**
 * FunctionSymbol stores the arity and inferred return type for a Kelthar.
 * Parameters begin as Unknown because Kethic has no parameter annotations yet.
 */
export interface FunctionSymbol {
  readonly kind: "Function";
  readonly name: string;
  readonly parameterCount: number;
  readonly parameterNames: string[];
  returnType: PrimitiveTypeName;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
}

/**
 * KethicSymbol is any named item the type checker can resolve.
 */
export type KethicSymbol = ValueSymbol | FunctionSymbol;

/**
 * Scope stores declarations visible in one lexical region.
 */
export interface Scope {
  readonly symbols: Map<string, KethicSymbol>;
  readonly parent: Scope | null;
}

/**
 * TypeCheckDiagnostic is the structured form of every Phase 3 error.
 */
export interface TypeCheckDiagnostic {
  readonly line: number;
  readonly column: number;
  readonly keyword: string;
  readonly message: string;
}
