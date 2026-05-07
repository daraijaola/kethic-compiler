import { ActionNode, StateNode, StateUpdateNode, WebExpression, WebNodeKind, WebProgramNode } from "./ast";

/**
 * RuntimeGenerator emits the small browser runtime needed by Web Phase 3.
 */
export class RuntimeGenerator {
  /**
   * generate returns an empty string when the page is static.
   */
  public generate(program: WebProgramNode): string {
    const states: StateNode[] = program.body.filter((node): node is StateNode => node.kind === WebNodeKind.State);
    const actions: ActionNode[] = program.body.filter((node): node is ActionNode => node.kind === WebNodeKind.Action);

    if (states.length === 0 && actions.length === 0) {
      return "";
    }

    return [
      "(() => {",
      `  const state = ${this.generateStateObject(states)};`,
      "  const render = () => {",
      "    for (const node of document.querySelectorAll('[data-kethic-bind]')) {",
      "      const template = node.getAttribute('data-kethic-template') || '';",
      "      node.textContent = template.replace(/\\{([A-Za-z_][A-Za-z0-9_]*)\\}/g, (_match, name) => String(state[name] ?? ''));",
      "    }",
      "  };",
      "  const actions = {",
      ...actions.map((action: ActionNode) => this.generateAction(action)),
      "  };",
      "  document.addEventListener('click', (event) => {",
      "    const target = event.target instanceof Element ? event.target.closest('[data-kethic-action]') : null;",
      "    if (target === null) return;",
      "    const actionName = target.getAttribute('data-kethic-action');",
      "    if (actionName !== null && typeof actions[actionName] === 'function') {",
      "      actions[actionName]();",
      "      render();",
      "    }",
      "  });",
      "  render();",
      "})();",
    ].join("\n");
  }

  private generateStateObject(states: readonly StateNode[]): string {
    const entries: string[] = states.map((state: StateNode) => `${JSON.stringify(state.name)}: ${this.generateExpression(state.initialValue)}`);
    return `{ ${entries.join(", ")} }`;
  }

  private generateAction(action: ActionNode): string {
    const updates: string[] = action.updates.map((update: StateUpdateNode) => `      state[${JSON.stringify(update.stateName)}] = ${this.generateExpression(update.value)};`);
    return [`    ${JSON.stringify(action.name)}: () => {`, ...updates, "    },"].join("\n");
  }

  private generateExpression(expression: WebExpression): string {
    switch (expression.kind) {
      case "literal":
        return JSON.stringify(expression.value);
      case "identifier":
        return `state[${JSON.stringify(expression.name)}]`;
      case "unary":
        return `(!${this.generateExpression(expression.argument)})`;
      case "binary":
        return `(${this.generateExpression(expression.left)} ${expression.operator === "plus" ? "+" : "-"} ${this.generateExpression(expression.right)})`;
      default:
        return "undefined";
    }
  }
}

