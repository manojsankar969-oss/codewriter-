/**
 * Preprocessor Module
 * Cleans raw English input: lowercases, strips punctuation, removes filler words,
 * and applies synonym mapping to produce a normalized command string.
 */

import { SYNONYMS, FILLER_WORDS } from "./synonyms.js";

/**
 * Preprocess a single line of English input.
 * @param {string} input - Raw user input
 * @returns {string} Cleaned, normalized string
 */
function preprocess(input) {
    if (!input || typeof input !== "string") return "";

    // 1. Convert to lowercase
    let cleaned = input.toLowerCase().trim();

    // 2. Preserve strings in quotes (single or double)
    const stringLiterals = [];
    cleaned = cleaned.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
        stringLiterals.push(match.slice(1, -1)); // store without quotes
        return `__STRING_${stringLiterals.length - 1}__`;
    });

    // 3. Remove punctuation except underscores and string placeholders
    cleaned = cleaned.replace(/[^\w\s_]/g, " ");

    // 4. Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // 5. Split into words
    let words = cleaned.split(" ");

    // 6. Remove filler words (but keep words that are also keywords/synonyms)
    words = words.filter((word) => {
        if (SYNONYMS[word] !== undefined) return true; // keep synonyms even if they're filler
        return !FILLER_WORDS.has(word);
    });

    // 7. Apply synonym mapping
    words = words.map((word) => {
        if (SYNONYMS[word] !== undefined) {
            return SYNONYMS[word];
        }
        return word;
    });

    // 8. Restore string literals
    let result = words.join(" ");
    stringLiterals.forEach((literal, index) => {
        result = result.replace(`__string_${index}__`, `"${literal}"`);
    });

    return result;
}

/**
 * Preprocess multiple lines of input.
 * @param {string} input - Multi-line raw user input
 * @returns {string[]} Array of cleaned strings, one per line
 */
function preprocessLines(input) {
    if (!input || typeof input !== "string") return [];
    return input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => preprocess(line));
}

export { preprocess, preprocessLines };
