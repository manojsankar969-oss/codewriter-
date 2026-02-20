/**
 * Synonym Dictionary for English-to-Code Translator
 * Maps alternative words/phrases to canonical keywords used by the parser.
 */

const SYNONYMS = {
  // --- Variable creation ---
  "make": "create",
  "declare": "create",
  "define": "create",
  "initialize": "create",
  "init": "create",
  "new": "create",
  "let": "create",
  "var": "create",

  // --- Assignment ---
  "assign": "set",
  "update": "set",
  "change": "set",
  "modify": "set",
  "put": "set",

  // --- Value keywords ---
  "equal": "value",
  "equals": "value",
  "as": "value",
  "with": "value",
  "of": "value",
  "be": "value",

  // --- Print / Output ---
  "display": "print",
  "show": "print",
  "output": "print",
  "write": "print",
  "log": "print",
  "echo": "print",
  "say": "print",

  // --- Input ---
  "read": "input",
  "get": "input",
  "ask": "input",
  "prompt": "input",
  "accept": "input",
  "receive": "input",

  // --- Arithmetic operators ---
  "plus": "add",
  "sum": "add",
  "subtract": "subtract",
  "minus": "subtract",
  "difference": "subtract",
  "multiply": "multiply",
  "times": "multiply",
  "product": "multiply",
  "divide": "divide",
  "over": "divide",
  "quotient": "divide",
  "modulo": "modulus",
  "mod": "modulus",
  "remainder": "modulus",

  // --- Comparison operators ---
  "bigger": "greater",
  "more": "greater",
  "above": "greater",
  "larger": "greater",
  "exceeds": "greater",
  "smaller": "less",
  "below": "less",
  "fewer": "less",
  "lower": "less",
  "under": "less",
  "same": "equal_to",
  "identical": "equal_to",
  "matches": "equal_to",
  "not": "not",
  "different": "not_equal",
  "unequal": "not_equal",

  // --- Logical ---
  "also": "and",
  "both": "and",
  "either": "or",
  "otherwise": "else",
  "alternatively": "else",

  // --- Loops ---
  "repeat": "while",
  "loop": "while",
  "iterate": "for",

  // --- Increment / Decrement ---
  "increase": "increment",
  "raise": "increment",
  "grow": "increment",
  "decrease": "decrement",
  "reduce": "decrement",
  "shrink": "decrement",
  "lower": "decrement",

  // --- Function ---
  "function": "function",
  "func": "function",
  "method": "function",
  "procedure": "function",
  "routine": "function",
  "subroutine": "function",

  // --- Call ---
  "invoke": "call",
  "execute": "call",
  "run": "call",

  // --- Return ---
  "give": "return",
  "send": "return",
  "respond": "return",

  // --- List / Array ---
  "array": "list",
  "collection": "list",

  // --- Append ---
  "push": "append",
  "insert": "append",

  // --- Comment ---
  "note": "comment",
  "remark": "comment",

  // --- Store ---
  "save": "store",
  "keep": "store",
  "place": "store",
  "put": "store",

  // --- Misc directional words (kept as-is) ---
  "to": "to",
  "into": "to",
  "in": "in",
  "from": "from",
  "than": "than",
  "then": "then",
  "do": "do",
  "does": "do",
};

/**
 * Filler / stop words that are removed during preprocessing.
 */
const FILLER_WORDS = new Set([
  "please",
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "should",
  "would",
  "could",
  "can",
  "will",
  "shall",
  "may",
  "might",
  "must",
  "now",
  "just",
  "also",
  "so",
  "very",
  "really",
  "actually",
  "basically",
  "simply",
  "just",
  "named",
  "called",
]);

export { SYNONYMS, FILLER_WORDS };
