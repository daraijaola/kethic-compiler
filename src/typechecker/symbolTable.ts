import { KethicSymbol, Scope } from "./types";

/**
 * SymbolTable owns the scope stack used during type checking.
 */
export class SymbolTable {
  private currentScope: Scope = {
    symbols: new Map<string, KethicSymbol>(),
    parent: null,
  };

  /**
   * enterScope creates a nested lexical scope.
   */
  public enterScope(): void {
    this.currentScope = {
      symbols: new Map<string, KethicSymbol>(),
      parent: this.currentScope,
    };
  }

  /**
   * exitScope returns to the enclosing lexical scope.
   */
  public exitScope(): void {
    if (this.currentScope.parent !== null) {
      this.currentScope = this.currentScope.parent;
    }
  }

  /**
   * define adds a name to the current scope only.
   */
  public define(symbol: KethicSymbol): boolean {
    if (this.currentScope.symbols.has(symbol.name)) {
      return false;
    }

    this.currentScope.symbols.set(symbol.name, symbol);
    return true;
  }

  /**
   * resolveCurrent finds a name declared in the current scope only.
   */
  public resolveCurrent(name: string): KethicSymbol | null {
    return this.currentScope.symbols.get(name) ?? null;
  }

  /**
   * resolve walks outward until it finds a visible declaration.
   */
  public resolve(name: string): KethicSymbol | null {
    let scope: Scope | null = this.currentScope;

    while (scope !== null) {
      const symbol: KethicSymbol | undefined = scope.symbols.get(name);
      if (symbol !== undefined) {
        return symbol;
      }

      scope = scope.parent;
    }

    return null;
  }
}
