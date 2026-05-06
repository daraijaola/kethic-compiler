/**
 * TokenType lists every syntactic unit that Phase 1 can recognize.
 * The enum values are human-readable names so diagnostics and tests stay clear.
 */
export enum TokenType {
  // Sacred Kethic keywords for the ten core language concepts.
  Nava = "Navā",
  Torun = "Torūn",
  Kelthar = "Kelthar",
  Tharva = "Tharva",
  Rinthar = "Rinthar",
  Umkel = "Umkel",
  Duren = "Duren",
  Umra = "Umra",
  Ikhshev = "Ikhshev",
  Shev = "Shev",
  Ikhselthar = "Ikhselthar",
  Selikhshev = "Selikhshev",
  Ovikhnak = "Ovikhnak",
  Rukhar = "Rukhar",
  Duruk = "Duruk",
  Rukum = "Rukum",
  Selkar = "Selkar",
  Eshnak = "Eshnak",
  Ovrin = "Ovrin",

  // Reserved Second Archive terms. These are intentionally tokenized so they
  // cannot be used as identifiers before their compiler phases are implemented.
  Rukva = "Rukva",
  Kelva = "Kelva",
  Selva = "Selva",
  Shevkar = "Shevkar",
  Umrava = "Umrava",
  Tharkar = "Tharkar",
  Ovesh = "Ovesh",
  Seltor = "Seltor",
  Torkel = "Torkel",
  Torselthar = "Torselthar",
  Selikh = "Selikh",
  Eshrin = "Eshrin",
  Umresh = "Umresh",
  Selovva = "Selovva",
  Torumsel = "Torumsel",

  // General literals and user-defined names.
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  TemplateString = "TemplateString",

  // Arithmetic operators.
  Plus = "Plus",
  Minus = "Minus",
  Star = "Star",
  Slash = "Slash",
  Percent = "Percent",

  // Assignment and comparison operators.
  Equals = "Equals",
  DoubleEquals = "DoubleEquals",
  Bang = "Bang",
  BangEquals = "BangEquals",
  Less = "Less",
  LessEquals = "LessEquals",
  Greater = "Greater",
  GreaterEquals = "GreaterEquals",

  // Logical operators.
  AndAnd = "AndAnd",
  OrOr = "OrOr",

  // Function and type syntax operators.
  Arrow = "Arrow",
  Ellipsis = "Ellipsis",
  QuestionMark = "QuestionMark",
  Backtick = "Backtick",

  // Punctuation used to group, separate, and terminate syntax.
  LeftParen = "LeftParen",
  RightParen = "RightParen",
  LeftBrace = "LeftBrace",
  RightBrace = "RightBrace",
  LeftBracket = "LeftBracket",
  RightBracket = "RightBracket",
  Comma = "Comma",
  Dot = "Dot",
  Colon = "Colon",
  Semicolon = "Semicolon",

  // Marks the end of the source stream.
  EOF = "EOF",
}

/**
 * Token is the fully typed lexer output consumed by later compiler phases.
 * Line and column are one-based positions for diagnostics.
 */
export interface Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly line: number;
  readonly column: number;
}

/**
 * Keyword map converts exact Kethic source spellings into keyword tokens.
 * The accented forms are part of the language surface and are intentionally
 * kept as exact string keys.
 */
export const KEYWORDS: ReadonlyMap<string, TokenType> = new Map<string, TokenType>([
  ["Navā", TokenType.Nava],
  ["Torūn", TokenType.Torun],
  ["Kelthar", TokenType.Kelthar],
  ["Tharva", TokenType.Tharva],
  ["Rinthar", TokenType.Rinthar],
  ["Umkel", TokenType.Umkel],
  ["Duren", TokenType.Duren],
  ["Umra", TokenType.Umra],
  ["Ikhshev", TokenType.Ikhshev],
  ["Shev", TokenType.Shev],
  ["Ikhselthar", TokenType.Ikhselthar],
  ["Selikhshev", TokenType.Selikhshev],
  ["Ovikhnak", TokenType.Ovikhnak],
  ["Rukhar", TokenType.Rukhar],
  ["Duruk", TokenType.Duruk],
  ["Rukum", TokenType.Rukum],
  ["Selkar", TokenType.Selkar],
  ["Eshnak", TokenType.Eshnak],
  ["Ovrin", TokenType.Ovrin],
  ["Rukva", TokenType.Rukva],
  ["Kelva", TokenType.Kelva],
  ["Selva", TokenType.Selva],
  ["Shevkar", TokenType.Shevkar],
  ["Umrava", TokenType.Umrava],
  ["Tharkar", TokenType.Tharkar],
  ["Ovesh", TokenType.Ovesh],
  ["Seltor", TokenType.Seltor],
  ["Torkel", TokenType.Torkel],
  ["Torselthar", TokenType.Torselthar],
  ["Selikh", TokenType.Selikh],
  ["Eshrin", TokenType.Eshrin],
  ["Umresh", TokenType.Umresh],
  ["Selovva", TokenType.Selovva],
  ["Torumsel", TokenType.Torumsel],
]);
