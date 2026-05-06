import { Token, TokenType } from "../lexer/tokens";
import {
  BOOLEAN_TYPE,
  createArrayType,
  createFunctionType,
  FunctionSymbol,
  KethicType,
  NUMBER_TYPE,
  STRING_TYPE,
  UNKNOWN_TYPE,
  VOID_TYPE,
} from "../typechecker/types";

/**
 * BuiltinEmitter receives already-generated JavaScript argument expressions
 * and returns the final JavaScript expression for one standard library call.
 */
export type BuiltinEmitter = (argumentsList: readonly string[]) => string;

/**
 * StandardLibraryFunction describes one compiler-known Kethic standard library
 * function without requiring the user to import or declare it.
 */
export interface StandardLibraryFunction {
  readonly name: string;
  readonly parameterTypes: readonly KethicType[];
  readonly returnType: KethicType;
  readonly minimumParameterCount: number;
  readonly hasRestParameter: boolean;
  readonly emitCall: BuiltinEmitter;
}

/**
 * standardLibraryFunctions is the first small runtime surface for Kethic
 * programs. Names stay Kethic-side while output maps to ordinary JavaScript.
 */
export const standardLibraryFunctions: readonly StandardLibraryFunction[] = [
  {
    name: "Print",
    parameterTypes: [createArrayType(UNKNOWN_TYPE)],
    returnType: VOID_TYPE,
    minimumParameterCount: 0,
    hasRestParameter: true,
    emitCall: (argumentsList: readonly string[]): string => `console.log(${argumentsList.join(", ")})`,
  },
  {
    name: "MathMax",
    parameterTypes: [createArrayType(NUMBER_TYPE)],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: true,
    emitCall: (argumentsList: readonly string[]): string => `Math.max(${argumentsList.join(", ")})`,
  },
  {
    name: "MathMin",
    parameterTypes: [createArrayType(NUMBER_TYPE)],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: true,
    emitCall: (argumentsList: readonly string[]): string => `Math.min(${argumentsList.join(", ")})`,
  },
  {
    name: "MathRound",
    parameterTypes: [NUMBER_TYPE],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `Math.round(${argumentsList[0] ?? "undefined"})`,
  },
  {
    name: "MathFloor",
    parameterTypes: [NUMBER_TYPE],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `Math.floor(${argumentsList[0] ?? "undefined"})`,
  },
  {
    name: "MathCeil",
    parameterTypes: [NUMBER_TYPE],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `Math.ceil(${argumentsList[0] ?? "undefined"})`,
  },
  {
    name: "StringLength",
    parameterTypes: [STRING_TYPE],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `${argumentsList[0] ?? "\"\""}.length`,
  },
  {
    name: "StringConcat",
    parameterTypes: [createArrayType(STRING_TYPE)],
    returnType: STRING_TYPE,
    minimumParameterCount: 0,
    hasRestParameter: true,
    emitCall: (argumentsList: readonly string[]): string => argumentsList.length === 0 ? "\"\"" : argumentsList.join(" + "),
  },
  {
    name: "StringUpper",
    parameterTypes: [STRING_TYPE],
    returnType: STRING_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "\"\""}).toUpperCase()`,
  },
  {
    name: "StringLower",
    parameterTypes: [STRING_TYPE],
    returnType: STRING_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "\"\""}).toLowerCase()`,
  },
  {
    name: "StringTrim",
    parameterTypes: [STRING_TYPE],
    returnType: STRING_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "\"\""}).trim()`,
  },
  {
    name: "StringIncludes",
    parameterTypes: [STRING_TYPE, STRING_TYPE],
    returnType: BOOLEAN_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "\"\""}).includes(${argumentsList[1] ?? "\"\""})`,
  },
  {
    name: "StringStartsWith",
    parameterTypes: [STRING_TYPE, STRING_TYPE],
    returnType: BOOLEAN_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "\"\""}).startsWith(${argumentsList[1] ?? "\"\""})`,
  },
  {
    name: "StringSlice",
    parameterTypes: [STRING_TYPE, NUMBER_TYPE, NUMBER_TYPE],
    returnType: STRING_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string =>
      `(${argumentsList[0] ?? "\"\""}).slice(${argumentsList.slice(1).join(", ")})`,
  },
  {
    name: "ArrayLength",
    parameterTypes: [createArrayType(UNKNOWN_TYPE)],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 1,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `${argumentsList[0] ?? "[]"}.length`,
  },
  {
    name: "ArrayAt",
    parameterTypes: [createArrayType(UNKNOWN_TYPE), NUMBER_TYPE],
    returnType: UNKNOWN_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "[]"}).at(${argumentsList[1] ?? "0"})`,
  },
  {
    name: "ArrayPush",
    parameterTypes: [createArrayType(UNKNOWN_TYPE), UNKNOWN_TYPE],
    returnType: NUMBER_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "[]"}).push(${argumentsList[1] ?? "undefined"})`,
  },
  {
    name: "ArrayJoin",
    parameterTypes: [createArrayType(UNKNOWN_TYPE), STRING_TYPE],
    returnType: STRING_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "[]"}).join(${argumentsList[1] ?? "\",\""})`,
  },
  {
    name: "ArrayIncludes",
    parameterTypes: [createArrayType(UNKNOWN_TYPE), UNKNOWN_TYPE],
    returnType: BOOLEAN_TYPE,
    minimumParameterCount: 2,
    hasRestParameter: false,
    emitCall: (argumentsList: readonly string[]): string => `(${argumentsList[0] ?? "[]"}).includes(${argumentsList[1] ?? "undefined"})`,
  },
];

/**
 * standardLibraryByName gives compiler phases fast lookup by Kethic name.
 */
export const standardLibraryByName: ReadonlyMap<string, StandardLibraryFunction> = new Map<string, StandardLibraryFunction>(
  standardLibraryFunctions.map((definition: StandardLibraryFunction) => [definition.name, definition]),
);

/**
 * createStandardLibraryFunctionSymbol converts a standard library definition
 * into a normal FunctionSymbol so existing arity and type rules can handle it.
 */
export function createStandardLibraryFunctionSymbol(definition: StandardLibraryFunction): FunctionSymbol {
  const keyword: Token = {
    type: TokenType.Identifier,
    lexeme: definition.name,
    line: 0,
    column: 0,
  };
  const parameterTypes: KethicType[] = [...definition.parameterTypes];

  return {
    kind: "Function",
    name: definition.name,
    parameterCount: parameterTypes.length,
    minimumParameterCount: definition.minimumParameterCount,
    hasRestParameter: definition.hasRestParameter,
    isAsync: false,
    parameterNames: parameterTypes.map((_: KethicType, index: number) => `arg${index}`),
    parameterTypes,
    returnType: definition.returnType,
    declarationKeyword: keyword,
    declarationName: keyword,
    type: createFunctionType(
      parameterTypes,
      definition.returnType,
      definition.minimumParameterCount,
      definition.hasRestParameter,
      false,
    ),
  };
}
