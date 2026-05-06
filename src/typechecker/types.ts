import { Token } from "../lexer/tokens";
import type { TypeExpressionNode } from "../parser/ast";

/**
 * PrimitiveTypeName is the set of concrete primitive values Kethic currently supports.
 */
export type PrimitiveTypeName = "Number" | "String" | "Boolean" | "Void" | "Null";

/**
 * PrimitiveType represents a concrete Kethic primitive.
 */
export interface PrimitiveType {
  readonly kind: "Primitive";
  readonly name: PrimitiveTypeName;
}

/**
 * UnknownType represents an unresolved type that should not cascade errors.
 */
export interface UnknownType {
  readonly kind: "Unknown";
}

/**
 * FunctionType represents the callable shape of a Kelthar.
 */
export interface FunctionType {
  readonly kind: "Function";
  readonly parameters: KethicType[];
  readonly minimumParameterCount: number;
  readonly hasRestParameter: boolean;
  readonly isAsync: boolean;
  returnType: KethicType;
}

/**
 * ArrayType represents repeated values, currently used for rest parameters.
 */
export interface ArrayType {
  readonly kind: "Array";
  readonly elementType: KethicType;
}

/**
 * ObjectType represents an anonymous object shape inferred from a literal.
 */
export interface ObjectType {
  readonly kind: "Object";
  readonly properties: Readonly<Record<string, KethicType>>;
}

/**
 * MapType represents a key/value lookup archive.
 */
export interface MapType {
  readonly kind: "Map";
  readonly keyType: KethicType;
  readonly valueType: KethicType;
}

/**
 * UnionType represents a value that may lawfully take several shapes.
 */
export interface UnionType {
  readonly kind: "Union";
  readonly members: readonly KethicType[];
}

/**
 * PromiseType represents the far-return value produced by Ovdurthar calls.
 */
export interface PromiseType {
  readonly kind: "Promise";
  readonly innerType: KethicType;
}

/**
 * KethicType is the formal internal type model used by the checker.
 */
export type KethicType = PrimitiveType | UnknownType | FunctionType | ArrayType | ObjectType | MapType | UnionType | PromiseType;

/**
 * Shared type objects for the currently supported Kethic types.
 */
export const NUMBER_TYPE: PrimitiveType = { kind: "Primitive", name: "Number" };
export const STRING_TYPE: PrimitiveType = { kind: "Primitive", name: "String" };
export const BOOLEAN_TYPE: PrimitiveType = { kind: "Primitive", name: "Boolean" };
export const VOID_TYPE: PrimitiveType = { kind: "Primitive", name: "Void" };
export const NULL_TYPE: PrimitiveType = { kind: "Primitive", name: "Null" };
export const UNKNOWN_TYPE: UnknownType = { kind: "Unknown" };

/**
 * SymbolKind separates mutable values, constants, and declared functions.
 */
export type SymbolKind = "Variable" | "Constant" | "Function" | "Type" | "GenericType";

/**
 * ValueSymbol stores the inferred type for a Navā or Torūn name.
 */
export interface ValueSymbol {
  readonly kind: "Variable" | "Constant";
  readonly name: string;
  readonly type: KethicType;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
}

/**
 * FunctionSymbol stores the arity and inferred return type for a Kelthar.
 * Parameters begin as annotated types or Unknown when no annotation exists.
 */
export interface FunctionSymbol {
  readonly kind: "Function";
  readonly name: string;
  readonly parameterCount: number;
  readonly minimumParameterCount: number;
  readonly hasRestParameter: boolean;
  readonly isAsync: boolean;
  readonly parameterNames: string[];
  readonly parameterTypes: KethicType[];
  returnType: KethicType;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
  readonly type: FunctionType;
}

/**
 * TypeSymbol stores named type aliases such as Shevkar unions.
 */
export interface TypeSymbol {
  readonly kind: "Type";
  readonly name: string;
  readonly type: KethicType;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
}

/**
 * GenericTypeSymbol stores Tharkar aliases that need type arguments before use.
 */
export interface GenericTypeSymbol {
  readonly kind: "GenericType";
  readonly name: string;
  readonly typeParameters: readonly string[];
  readonly typeExpression: TypeExpressionNode;
  readonly declarationKeyword: Token;
  readonly declarationName: Token;
}

/**
 * KethicSymbol is any named item the type checker can resolve.
 */
export type KethicSymbol = ValueSymbol | FunctionSymbol | TypeSymbol | GenericTypeSymbol;

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

/**
 * createFunctionType creates a mutable function type tied to a Kelthar symbol.
 */
export function createFunctionType(
  parameters: KethicType[],
  returnType: KethicType,
  minimumParameterCount: number = parameters.length,
  hasRestParameter: boolean = false,
  isAsync: boolean = false,
): FunctionType {
  return {
    kind: "Function",
    parameters,
    minimumParameterCount,
    hasRestParameter,
    isAsync,
    returnType,
  };
}

/**
 * createArrayType creates a repeated-value type for rest parameters.
 */
export function createArrayType(elementType: KethicType): ArrayType {
  return {
    kind: "Array",
    elementType,
  };
}

/**
 * createObjectType creates an anonymous object shape.
 */
export function createObjectType(properties: Readonly<Record<string, KethicType>>): ObjectType {
  return {
    kind: "Object",
    properties,
  };
}

/**
 * createMapType creates a lookup archive type from key and value types.
 */
export function createMapType(keyType: KethicType, valueType: KethicType): MapType {
  return {
    kind: "Map",
    keyType,
    valueType,
  };
}

/**
 * createUnionType creates a forked shape from one or more member types.
 */
export function createUnionType(members: readonly KethicType[]): UnionType {
  return {
    kind: "Union",
    members,
  };
}

/**
 * createPromiseType creates the internal far-return type for async calls.
 */
export function createPromiseType(innerType: KethicType): PromiseType {
  return {
    kind: "Promise",
    innerType,
  };
}

/**
 * typeToString formats structured Kethic types for diagnostics.
 */
export function typeToString(type: KethicType): string {
  switch (type.kind) {
    case "Primitive":
      return type.name;
    case "Unknown":
      return "Unknown";
    case "Function":
      return `${type.isAsync ? "Ovdurthar " : ""}Kelthar(${type.parameters.map(typeToString).join(", ")}) -> ${typeToString(type.returnType)}`;
    case "Array":
      return `${typeToString(type.elementType)}[]`;
    case "Object":
      return `{ ${Object.entries(type.properties).map(([name, value]) => `${name}: ${typeToString(value)}`).join("; ")} }`;
    case "Map":
      return `Selva<${typeToString(type.keyType)}, ${typeToString(type.valueType)}>`;
    case "Union":
      return type.members.map(typeToString).join(" | ");
    case "Promise":
      return `Promise<${typeToString(type.innerType)}>`;
  }
}

/**
 * isUnknownType checks whether a type is unresolved.
 */
export function isUnknownType(type: KethicType): boolean {
  return type.kind === "Unknown";
}
