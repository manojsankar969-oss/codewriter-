/**
 * Tokenizer Module
 * Splits preprocessed input into classified tokens.
 */

/**
 * Set of recognized keywords (canonical forms after synonym mapping).
 */
const KEYWORDS = new Set([
    // Actions
    "create", "set", "print", "input", "add", "subtract", "multiply", "divide", "modulus",
    "increment", "decrement", "if", "else", "while", "for", "do", "then",
    "define", "function", "call", "return", "append", "comment",
    // Comparisons
    "greater", "less", "equal_to", "not", "not_equal",
    // Structures
    "variable", "list", "array",
    // Directives
    "value", "to", "in", "from", "than", "store", "and", "or",
    // Misc
    "end", "by", "with", "parameter", "parameters", "result",
    "true", "false",
]);

/**
 * Token types.
 */
const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    NUMBER: "NUMBER",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    UNKNOWN: "UNKNOWN",
};

/**
 * Check if a string is a valid number.
 */
function isNumber(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

/**
 * Check if a string is a quoted string placeholder or actual quoted string.
 */
function isString(str) {
    return /^".*"$/.test(str) || /^'.*'$/.test(str);
}

/**
 * Tokenize a preprocessed input string.
 * @param {string} input - Preprocessed, cleaned input string
 * @returns {Array<{type: string, value: string}>} Array of token objects
 */
function tokenize(input) {
    if (!input || typeof input !== "string") return [];

    const tokens = [];

    // Split but preserve quoted strings
    const parts = [];
    let current = "";
    let inQuote = false;
    let quoteChar = "";

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (!inQuote && (ch === '"' || ch === "'")) {
            if (current.trim()) {
                parts.push(...current.trim().split(/\s+/));
            }
            current = ch;
            inQuote = true;
            quoteChar = ch;
        } else if (inQuote && ch === quoteChar) {
            current += ch;
            parts.push(current);
            current = "";
            inQuote = false;
        } else if (inQuote) {
            current += ch;
        } else {
            current += ch;
        }
    }
    if (current.trim()) {
        parts.push(...current.trim().split(/\s+/));
    }

    for (const word of parts) {
        if (!word) continue;

        if (isString(word)) {
            tokens.push({ type: TokenType.STRING, value: word.slice(1, -1) });
        } else if (isNumber(word)) {
            tokens.push({ type: TokenType.NUMBER, value: word });
        } else if (word === "true" || word === "false") {
            tokens.push({ type: TokenType.BOOLEAN, value: word });
        } else if (KEYWORDS.has(word)) {
            tokens.push({ type: TokenType.KEYWORD, value: word });
        } else if (/^[a-z_][a-z0-9_]*$/i.test(word)) {
            tokens.push({ type: TokenType.IDENTIFIER, value: word });
        } else {
            tokens.push({ type: TokenType.UNKNOWN, value: word });
        }
    }

    return tokens;
}

export { tokenize, TokenType, KEYWORDS };
