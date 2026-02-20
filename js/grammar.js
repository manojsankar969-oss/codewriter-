/**
 * Grammar Rules Module
 * Defines patterns that the parser uses to match tokenized input
 * and extract structured AST nodes.
 *
 * Each rule has:
 *   - name: AST node type
 *   - match(tokens): function that checks if tokens match, returns AST node or null
 */

import { TokenType } from "./tokenizer.js";

// Helper: check if a token matches a specific keyword
function isKw(token, value) {
    return token && token.type === TokenType.KEYWORD && token.value === value;
}

// Helper: check if token is an identifier
function isId(token) {
    return token && token.type === TokenType.IDENTIFIER;
}

// Helper: check if token is a value (number, string, identifier, boolean)
function isValue(token) {
    return (
        token &&
        (token.type === TokenType.NUMBER ||
            token.type === TokenType.STRING ||
            token.type === TokenType.IDENTIFIER ||
            token.type === TokenType.BOOLEAN)
    );
}

// Helper: get the raw value of a token for code generation
function val(token) {
    if (!token) return undefined;
    if (token.type === TokenType.STRING) return `"${token.value}"`;
    return token.value;
}

/**
 * All grammar rules, ordered by specificity (most specific first).
 */
const GRAMMAR_RULES = [
    // ───── COMMENT ─────
    // comment <text...>
    {
        name: "comment",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "comment")) {
                const text = tokens
                    .slice(1)
                    .map((t) => t.value)
                    .join(" ");
                return { type: "comment", text };
            }
            return null;
        },
    },

    // ───── LIST CREATION ─────
    // create list <name> values <v1> <v2> ...
    {
        name: "list_creation",
        match(tokens) {
            if (tokens.length >= 4 && isKw(tokens[0], "create") && isKw(tokens[1], "list")) {
                const name = tokens[2];
                if (!isId(name)) return null;
                let values = [];
                let startIdx = 3;
                // skip optional "value" keyword
                if (tokens[startIdx] && isKw(tokens[startIdx], "value")) startIdx++;
                for (let i = startIdx; i < tokens.length; i++) {
                    if (isValue(tokens[i])) {
                        values.push(val(tokens[i]));
                    }
                }
                return { type: "list_creation", name: name.value, values };
            }
            return null;
        },
    },

    // ───── APPEND ─────
    // append <value> to <list>
    {
        name: "append",
        match(tokens) {
            if (tokens.length >= 4 && isKw(tokens[0], "append")) {
                const value = tokens[1];
                if (!isValue(value)) return null;
                // find "to"
                let listToken = null;
                for (let i = 2; i < tokens.length; i++) {
                    if (isKw(tokens[i], "to") && i + 1 < tokens.length) {
                        listToken = tokens[i + 1];
                        break;
                    }
                }
                if (!listToken || !isId(listToken)) return null;
                return { type: "append", list: listToken.value, value: val(value) };
            }
            return null;
        },
    },

    // ───── FUNCTION DEFINITION ─────
    // define function <name> [parameter/parameters <p1> <p2>...] do <body...>
    {
        name: "function_def",
        match(tokens) {
            if (
                tokens.length >= 4 &&
                isKw(tokens[0], "define") &&
                isKw(tokens[1], "function")
            ) {
                const nameToken = tokens[2];
                if (!isId(nameToken)) return null;
                const name = nameToken.value;

                let params = [];
                let bodyStart = 3;

                // Check for parameters
                if (tokens[bodyStart] && (isKw(tokens[bodyStart], "parameter") || isKw(tokens[bodyStart], "parameters"))) {
                    bodyStart++;
                    while (bodyStart < tokens.length && isId(tokens[bodyStart]) && !isKw(tokens[bodyStart], "do")) {
                        params.push(tokens[bodyStart].value);
                        bodyStart++;
                    }
                }

                // Skip "do" if present
                if (tokens[bodyStart] && isKw(tokens[bodyStart], "do")) bodyStart++;

                // Remaining tokens are the body (as raw tokens to re-parse)
                const bodyTokens = tokens.slice(bodyStart);
                return { type: "function_def", name, params, bodyTokens };
            }
            return null;
        },
    },

    // ───── FUNCTION CALL ─────
    // call <name> [with <arg1> <arg2>...]
    {
        name: "function_call",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "call")) {
                const nameToken = tokens[1];
                if (!isId(nameToken)) return null;
                let args = [];
                let startIdx = 2;
                // skip "with" if present
                if (tokens[startIdx] && isKw(tokens[startIdx], "value")) startIdx++;
                for (let i = startIdx; i < tokens.length; i++) {
                    if (isValue(tokens[i])) {
                        args.push(val(tokens[i]));
                    }
                }
                return { type: "function_call", name: nameToken.value, args };
            }
            return null;
        },
    },

    // ───── RETURN ─────
    // return <value>
    {
        name: "return",
        match(tokens) {
            if (tokens.length >= 1 && isKw(tokens[0], "return")) {
                if (tokens.length >= 2 && isValue(tokens[1])) {
                    return { type: "return", value: val(tokens[1]) };
                }
                return { type: "return", value: null };
            }
            return null;
        },
    },

    // ───── FOR LOOP ─────
    // for <var> from <start> to <end> [by <step>] do <body...>
    {
        name: "for_loop",
        match(tokens) {
            if (tokens.length >= 6 && isKw(tokens[0], "for")) {
                const varToken = tokens[1];
                if (!isId(varToken)) return null;

                let fromVal = null,
                    toVal = null,
                    stepVal = null;
                let bodyStart = -1;

                for (let i = 2; i < tokens.length; i++) {
                    if (isKw(tokens[i], "from") && i + 1 < tokens.length) {
                        fromVal = val(tokens[i + 1]);
                        i++;
                    } else if (isKw(tokens[i], "to") && i + 1 < tokens.length) {
                        toVal = val(tokens[i + 1]);
                        i++;
                    } else if (isKw(tokens[i], "by") && i + 1 < tokens.length) {
                        stepVal = val(tokens[i + 1]);
                        i++;
                    } else if (isKw(tokens[i], "do")) {
                        bodyStart = i + 1;
                        break;
                    }
                }

                if (fromVal === null || toVal === null) return null;
                const bodyTokens = bodyStart >= 0 ? tokens.slice(bodyStart) : [];
                return {
                    type: "for_loop",
                    variable: varToken.value,
                    from: fromVal,
                    to: toVal,
                    step: stepVal,
                    bodyTokens,
                };
            }
            return null;
        },
    },

    // ───── WHILE LOOP ─────
    // while <left> <comparison> <right> do <body...>
    {
        name: "while_loop",
        match(tokens) {
            if (tokens.length >= 5 && isKw(tokens[0], "while")) {
                const parsed = parseCondition(tokens, 1);
                if (!parsed) return null;

                let bodyStart = parsed.nextIndex;
                if (tokens[bodyStart] && isKw(tokens[bodyStart], "do")) bodyStart++;

                const bodyTokens = tokens.slice(bodyStart);
                return {
                    type: "while_loop",
                    condition: parsed.condition,
                    bodyTokens,
                };
            }
            return null;
        },
    },

    // ───── IF-ELSE / IF ─────
    // if <left> <comparison> <right> then <body...> [else <body...>]
    {
        name: "if_statement",
        match(tokens) {
            if (tokens.length >= 4 && isKw(tokens[0], "if")) {
                const parsed = parseCondition(tokens, 1);
                if (!parsed) return null;

                let thenStart = parsed.nextIndex;
                if (tokens[thenStart] && isKw(tokens[thenStart], "then")) thenStart++;

                // Find "else" to split body
                let elseIndex = -1;
                for (let i = thenStart; i < tokens.length; i++) {
                    if (isKw(tokens[i], "else")) {
                        elseIndex = i;
                        break;
                    }
                }

                let thenTokens, elseTokens;
                if (elseIndex >= 0) {
                    thenTokens = tokens.slice(thenStart, elseIndex);
                    elseTokens = tokens.slice(elseIndex + 1);
                } else {
                    thenTokens = tokens.slice(thenStart);
                    elseTokens = [];
                }

                return {
                    type: "if_statement",
                    condition: parsed.condition,
                    thenTokens,
                    elseTokens,
                };
            }
            return null;
        },
    },

    // ───── ARITHMETIC ─────
    // add/subtract/multiply/divide <a> and <b> store in <result>
    {
        name: "arithmetic",
        match(tokens) {
            const ops = ["add", "subtract", "multiply", "divide", "modulus"];
            if (tokens.length >= 4 && tokens[0].type === TokenType.KEYWORD && ops.includes(tokens[0].value)) {
                const op = tokens[0].value;
                let a = null, b = null, result = null;

                if (isValue(tokens[1])) a = val(tokens[1]);
                // find "and" or second value
                for (let i = 2; i < tokens.length; i++) {
                    if (isKw(tokens[i], "and") && i + 1 < tokens.length && isValue(tokens[i + 1])) {
                        b = val(tokens[i + 1]);
                        i++;
                    } else if (b === null && isValue(tokens[i]) && !isKw(tokens[i], "store") && !isKw(tokens[i], "in")) {
                        b = val(tokens[i]);
                    } else if (isKw(tokens[i], "store") || isKw(tokens[i], "in")) {
                        // next identifier is the result
                        for (let j = i + 1; j < tokens.length; j++) {
                            if (isKw(tokens[j], "in")) continue;
                            if (isId(tokens[j])) {
                                result = tokens[j].value;
                                break;
                            }
                        }
                        break;
                    }
                }

                if (a === null || b === null) return null;
                return { type: "arithmetic", operator: op, left: a, right: b, result };
            }
            return null;
        },
    },

    // ───── INCREMENT ─────
    // increment <var> [by <val>]
    {
        name: "increment",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "increment")) {
                const varToken = tokens[1];
                if (!isId(varToken)) return null;
                let amount = "1";
                if (tokens.length >= 4 && isKw(tokens[2], "by") && isValue(tokens[3])) {
                    amount = val(tokens[3]);
                }
                return { type: "increment", variable: varToken.value, amount };
            }
            return null;
        },
    },

    // ───── DECREMENT ─────
    // decrement <var> [by <val>]
    {
        name: "decrement",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "decrement")) {
                const varToken = tokens[1];
                if (!isId(varToken)) return null;
                let amount = "1";
                if (tokens.length >= 4 && isKw(tokens[2], "by") && isValue(tokens[3])) {
                    amount = val(tokens[3]);
                }
                return { type: "decrement", variable: varToken.value, amount };
            }
            return null;
        },
    },

    // ───── INPUT ─────
    // input <var>
    {
        name: "input",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "input")) {
                const varToken = tokens[1];
                if (!isId(varToken)) return null;
                return { type: "input", variable: varToken.value };
            }
            return null;
        },
    },

    // ───── VARIABLE CREATION ─────
    // create [variable] <name> value <value>
    {
        name: "variable_creation",
        match(tokens) {
            if (tokens.length >= 3 && isKw(tokens[0], "create")) {
                let idx = 1;
                // skip optional "variable" keyword
                if (isKw(tokens[idx], "variable")) idx++;
                const nameToken = tokens[idx];
                if (!isId(nameToken)) return null;
                idx++;
                // skip optional "value" keyword
                if (tokens[idx] && isKw(tokens[idx], "value")) idx++;
                if (tokens[idx] && isValue(tokens[idx])) {
                    return {
                        type: "variable_creation",
                        name: nameToken.value,
                        value: val(tokens[idx]),
                    };
                }
                // No value given, create with null/default
                return { type: "variable_creation", name: nameToken.value, value: null };
            }
            return null;
        },
    },

    // ───── ASSIGNMENT ─────
    // set <var> [to/value] <value>
    {
        name: "assignment",
        match(tokens) {
            if (tokens.length >= 3 && isKw(tokens[0], "set")) {
                const varToken = tokens[1];
                if (!isId(varToken)) return null;
                let idx = 2;
                // skip "to" or "value"
                if (tokens[idx] && (isKw(tokens[idx], "to") || isKw(tokens[idx], "value"))) idx++;
                if (tokens[idx] && isValue(tokens[idx])) {
                    return {
                        type: "assignment",
                        name: varToken.value,
                        value: val(tokens[idx]),
                    };
                }
                return null;
            }
            return null;
        },
    },

    // ───── PRINT ─────
    // print <value> [<value>...]
    {
        name: "print",
        match(tokens) {
            if (tokens.length >= 2 && isKw(tokens[0], "print")) {
                const values = [];
                for (let i = 1; i < tokens.length; i++) {
                    if (isValue(tokens[i])) {
                        values.push(val(tokens[i]));
                    }
                }
                if (values.length === 0) return null;
                return { type: "print", values };
            }
            return null;
        },
    },
];

/**
 * Parse a condition from tokens starting at given index.
 * Handles: <left> greater/less [than] <right>, <left> equal_to <right>, <left> not equal_to <right>
 * Returns { condition: { left, operator, right }, nextIndex } or null.
 */
function parseCondition(tokens, startIdx) {
    let i = startIdx;
    if (!isValue(tokens[i])) return null;
    const left = val(tokens[i]);
    i++;

    let operator = null;

    // "not equal_to" or "not_equal"
    if (isKw(tokens[i], "not") && tokens[i + 1] && isKw(tokens[i + 1], "equal_to")) {
        operator = "not_equal";
        i += 2;
    } else if (isKw(tokens[i], "not_equal")) {
        operator = "not_equal";
        i++;
        // skip optional "to"
        if (tokens[i] && isKw(tokens[i], "to")) i++;
    } else if (isKw(tokens[i], "greater")) {
        operator = "greater";
        i++;
        if (tokens[i] && isKw(tokens[i], "than")) i++;
    } else if (isKw(tokens[i], "less")) {
        operator = "less";
        i++;
        if (tokens[i] && isKw(tokens[i], "than")) i++;
    } else if (isKw(tokens[i], "equal_to")) {
        operator = "equal";
        i++;
    } else {
        return null;
    }

    if (!tokens[i] || !isValue(tokens[i])) return null;
    const right = val(tokens[i]);
    i++;

    return { condition: { left, operator, right }, nextIndex: i };
}

export { GRAMMAR_RULES, parseCondition };
