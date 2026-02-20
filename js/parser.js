/**
 * Parser Module
 * Takes tokenized input and matches it against grammar rules to produce AST nodes.
 */

import { GRAMMAR_RULES } from "./grammar.js";
import { tokenize } from "./tokenizer.js";

/**
 * Parse a token array into an AST node.
 * @param {Array} tokens - Array of token objects from the tokenizer
 * @returns {{ success: boolean, node?: object, error?: string }}
 */
function parse(tokens) {
    if (!tokens || tokens.length === 0) {
        return { success: false, error: "Empty input" };
    }

    for (const rule of GRAMMAR_RULES) {
        const node = rule.match(tokens);
        if (node) {
            // If the node has sub-tokens (bodyTokens, thenTokens, elseTokens),
            // try to parse them recursively
            if (node.bodyTokens && node.bodyTokens.length > 0) {
                const bodyParsed = parse(node.bodyTokens);
                if (bodyParsed.success) {
                    node.body = bodyParsed.node;
                }
                delete node.bodyTokens;
            }
            if (node.thenTokens && node.thenTokens.length > 0) {
                const thenParsed = parse(node.thenTokens);
                if (thenParsed.success) {
                    node.thenBody = thenParsed.node;
                }
                delete node.thenTokens;
            }
            if (node.elseTokens && node.elseTokens.length > 0) {
                const elseParsed = parse(node.elseTokens);
                if (elseParsed.success) {
                    node.elseBody = elseParsed.node;
                }
                delete node.elseTokens;
            }

            return { success: true, node };
        }
    }

    const input = tokens.map((t) => t.value).join(" ");
    return {
        success: false,
        error: `Unrecognized command: "${input}".\nTry patterns like: "create variable x value 10", "print x", "if x greater than 5 then print x"`,
    };
}

/**
 * Parse a preprocessed string directly (tokenize + parse).
 * @param {string} preprocessedLine - A single preprocessed line
 * @returns {{ success: boolean, node?: object, error?: string }}
 */
function parseLine(preprocessedLine) {
    const tokens = tokenize(preprocessedLine);
    return parse(tokens);
}

export { parse, parseLine };
