/**
 * App Module — Main Orchestrator
 * Wires the full pipeline: input → preprocess → tokenize → parse → generate → display
 * Premium features: syntax highlighting, copy, download, toasts, keyboard shortcuts
 */

import { preprocess, preprocessLines } from "./preprocessor.js";
import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { generate, generateProgram } from "./generator.js";
import { improveEnglish } from "./grammar-client.js";

/**
 * Translate a single line of English input.
 */
function translateLine(rawLine, lang) {
    const cleaned = preprocess(rawLine);
    if (!cleaned) return { success: false, error: "Empty input" };

    const tokens = tokenize(cleaned);
    if (tokens.length === 0) return { success: false, error: "No tokens found" };

    const result = parse(tokens);
    if (!result.success) return { success: false, error: result.error };

    const code = generate(result.node, lang);
    return { success: true, code, ast: result.node };
}

/**
 * Translate multi-line English input into a full program.
 */
function translateProgram(rawInput, lang) {
    const cleanedLines = preprocessLines(rawInput);
    if (cleanedLines.length === 0) {
        return { success: false, errors: [{ line: 0, error: "Empty input" }] };
    }

    const nodes = [];
    const errors = [];
    let totalTokens = 0;

    cleanedLines.forEach((line, index) => {
        const tokens = tokenize(line);
        totalTokens += tokens.length;
        const result = parse(tokens);
        if (result.success) {
            nodes.push(result.node);
        } else {
            errors.push({ line: index + 1, error: result.error });
        }
    });

    if (nodes.length === 0 && errors.length > 0) {
        return { success: false, errors, totalTokens };
    }

    const code = generateProgram(nodes, lang);
    return { success: true, code, errors, nodes, totalTokens };
}

// ─── EXAMPLE COMMANDS ───

const EXAMPLE_COMMANDS = [
    {
        title: "Hello World",
        code: 'print "Hello World"',
    },
    {
        title: "Variables & Math",
        code: `create variable x value 10
create variable y value 20
add x and y store in result
print result`,
    },
    {
        title: "If-Else Logic",
        code: `create variable age value 18
if age greater than 17 then print "Adult" else print "Minor"`,
    },
    {
        title: "While Loop",
        code: `create variable counter value 0
while counter less than 5 do increment counter
print counter`,
    },
    {
        title: "For Loop",
        code: `for i from 1 to 11 do print i`,
    },
    {
        title: "Function",
        code: `define function greet do print "Hello!"
call greet`,
    },
    {
        title: "List Operations",
        code: `create list numbers values 1 2 3 4 5
append 6 to numbers
print numbers`,
    },
    {
        title: "Full Program",
        code: `comment A simple calculator
create variable a value 15
create variable b value 7
add a and b store in sum
subtract a and b store in diff
multiply a and b store in prod
print sum
print diff
print prod`,
    },
];

// ─── SYNTAX HIGHLIGHTING ───

const SYNTAX_RULES = {
    python: {
        keywords: /\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|finally|raise|pass|break|continue|and|or|not|in|is|lambda|yield|global|nonlocal|assert|del|True|False|None)\b/g,
        builtins: /\b(print|range|len|str|int|float|list|dict|set|tuple|input|open|type|isinstance|enumerate|zip|map|filter|sorted|reversed|abs|min|max|sum|any|all|super)\b/g,
        strings: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        comments: /(#.*$)/gm,
        numbers: /\b(\d+\.?\d*)\b/g,
        functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        operators: /([+\-*/%=<>!&|^~]=?|==|!=|<=|>=|<<|>>|\*\*|\/\/)/g,
    },
    java: {
        keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|void|int|double|float|long|short|byte|char|boolean|String|true|false|null)\b/g,
        builtins: /\b(System|out|println|Scanner|ArrayList|Arrays|Math|Integer|Double|Float|Long|Object)\b/g,
        strings: /("(?:[^"\\]|\\.)*")/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b(\d+\.?\d*[fFdDlL]?)\b/g,
        functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        types: /\b(int|double|float|long|short|byte|char|boolean|String|void|var|ArrayList|Scanner|Object)\b/g,
        operators: /([+\-*/%=<>!&|^~]=?|==|!=|<=|>=|<<|>>|\+\+|--)/g,
    },
    cpp: {
        keywords: /\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|namespace|template|this|new|delete|try|catch|throw|public|private|protected|virtual|inline|using|bool|true|false|nullptr)\b/g,
        builtins: /\b(std|cout|cin|endl|string|vector|map|set|pair|queue|stack|sort|find|begin|end|push_back|size|empty|front|back|insert|erase)\b/g,
        strings: /("(?:[^"\\]|\\.)*")/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b(\d+\.?\d*[fFlLuU]*)\b/g,
        functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        includes: /(#include\s*<[^>]+>)/g,
        types: /\b(int|double|float|long|short|char|bool|void|auto|string|vector|map|set|pair)\b/g,
        operators: /([+\-*/%=<>!&|^~]=?|==|!=|<=|>=|<<|>>|\+\+|--|::)/g,
    },
};

function highlightCode(code, lang) {
    if (!code) return "";

    const rules = SYNTAX_RULES[lang];
    if (!rules) return escapeHtml(code);

    // We need to tokenize and highlight without breaking HTML entities
    const escaped = escapeHtml(code);

    // We'll apply highlights in a specific order to avoid overlapping
    let result = escaped;

    // First, protect strings and comments
    const protectedSegments = [];
    let protectId = 0;

    // Protect comments
    if (rules.comments) {
        result = result.replace(rules.comments, (match) => {
            const id = `__PROTECT_${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-cmt">${match}</span>` });
            return id;
        });
    }

    // Protect strings
    if (rules.strings) {
        result = result.replace(rules.strings, (match) => {
            const id = `__PROTECT_${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-str">${match}</span>` });
            return id;
        });
    }

    // Protect includes (C++)
    if (rules.includes) {
        result = result.replace(rules.includes, (match) => {
            const id = `__PROTECT_${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-include">${match}</span>` });
            return id;
        });
    }

    // Highlight keywords
    if (rules.keywords) {
        result = result.replace(rules.keywords, '<span class="syn-kw">$1</span>');
    }

    // Highlight types
    if (rules.types) {
        result = result.replace(rules.types, '<span class="syn-type">$1</span>');
    }

    // Highlight builtins
    if (rules.builtins) {
        result = result.replace(rules.builtins, '<span class="syn-builtin">$1</span>');
    }

    // Highlight numbers
    if (rules.numbers) {
        result = result.replace(rules.numbers, '<span class="syn-num">$1</span>');
    }

    // Restore protected segments
    protectedSegments.forEach(({ id, html }) => {
        result = result.replace(id, html);
    });

    // Highlight braces
    result = result.replace(/([{}()\[\]])/g, '<span class="syn-brace">$1</span>');

    return result;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ─── TOAST SYSTEM ───

function showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const icons = { success: "✅", error: "❌", info: "ℹ️" };

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-out");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ─── UI CONTROLLER ───

let currentLang = "python";
let lastCode = "";

function initApp() {
    const inputEl = document.getElementById("english-input");
    const outputEl = document.getElementById("code-output");
    const errorEl = document.getElementById("error-output");
    const langTabs = document.querySelectorAll(".lang-tab");
    const translateBtn = document.getElementById("translate-btn");
    const clearBtn = document.getElementById("clear-btn");
    const grammarBtn = document.getElementById("grammar-btn");
    const grammarPanel = document.getElementById("grammar-panel");
    const grammaticalSuggestionsEl = document.getElementById("grammar-suggestions");
    const improvedTextEl = document.getElementById("improved-text");
    const useImprovedBtn = document.getElementById("use-improved-btn");
    const examplesContainer = document.getElementById("examples-list");
    const lineNumbers = document.getElementById("line-numbers");
    const outputLineNumbers = document.getElementById("output-line-numbers");
    const astOutput = document.getElementById("ast-output");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");

    // Stats elements
    const statLines = document.getElementById("stat-lines");
    const statTokens = document.getElementById("stat-tokens");
    const statTime = document.getElementById("stat-time");
    const statLang = document.getElementById("stat-lang");

    // ─── Populate examples ───
    EXAMPLE_COMMANDS.forEach((example) => {
        const card = document.createElement("div");
        card.className = "example-card";
        card.innerHTML = `<div class="example-title">${example.title}</div><code>${example.code.split("\n")[0]}${example.code.split("\n").length > 1 ? "..." : ""}</code>`;
        card.addEventListener("click", () => {
            inputEl.value = example.code;
            doTranslate();
            updateLineNumbers();
            // Close mobile menu if open
            if (sidebar.classList.contains("mobile-open")) {
                sidebar.classList.remove("mobile-open");
            }
        });
        examplesContainer.appendChild(card);
    });

    // ─── Language tabs ───
    const langNames = { python: "Python", java: "Java", cpp: "C++" };
    langTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            langTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentLang = tab.dataset.lang;
            if (statLang) statLang.textContent = langNames[currentLang] || currentLang;
            doTranslate();
        });
    });

    // ─── Translate button ───
    translateBtn.addEventListener("click", doTranslate);

    // ─── Clear button ───
    clearBtn.addEventListener("click", () => {
        inputEl.value = "";
        outputEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💻</div><div class="empty-state-text">Your generated code will appear here</div><div class="empty-state-hint">Type commands or pick an example →</div></div>`;
        lastCode = "";
        errorEl.textContent = "";
        errorEl.style.display = "none";
        grammarPanel.style.display = "none";
        if (astOutput) astOutput.textContent = "";
        updateLineNumbers();
        updateOutputLineNumbers("");
        updateStats(0, 0, 0);
        showToast("Editor cleared", "info", 1500);
    });

    // ─── Grammar button ───
    grammarBtn.addEventListener("click", doImproveGrammar);

    // ─── Use improved text button ───
    useImprovedBtn.addEventListener("click", () => {
        const improved = improvedTextEl.value;
        if (improved) {
            inputEl.value = improved;
            grammarPanel.style.display = "none";
            updateLineNumbers();
            doTranslate();
        }
    });

    // ─── Copy button ───
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!lastCode) {
                showToast("No code to copy", "error", 2000);
                return;
            }
            navigator.clipboard.writeText(lastCode).then(() => {
                copyBtn.classList.add("copied");
                showToast("Copied to clipboard!", "success", 2000);
                setTimeout(() => copyBtn.classList.remove("copied"), 2000);
            }).catch(() => {
                showToast("Failed to copy", "error", 2000);
            });
        });
    }

    // ─── Download button ───
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            if (!lastCode) {
                showToast("No code to download", "error", 2000);
                return;
            }
            const extensions = { python: "py", java: "java", cpp: "cpp" };
            const mimeTypes = { python: "text/x-python", java: "text/x-java", cpp: "text/x-c++src" };
            const ext = extensions[currentLang] || "txt";
            const filename = `generated.${ext}`;
            const blob = new Blob([lastCode], { type: mimeTypes[currentLang] || "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Downloaded ${filename}`, "success", 2000);
        });
    }

    // ─── Mobile menu toggle ───
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }

    // ─── Keyboard shortcuts ───
    document.addEventListener("keydown", (e) => {
        // Ctrl+Enter to translate
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            doTranslate();
        }
        // Escape to clear or close mobile menu
        if (e.key === "Escape") {
            if (sidebar && sidebar.classList.contains("mobile-open")) {
                sidebar.classList.remove("mobile-open");
            }
        }
    });

    // ─── Real-time translation on typing (debounced) ───
    let debounceTimer;
    inputEl.addEventListener("input", () => {
        updateLineNumbers();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doTranslate, 350);
    });

    // ─── Auto-resize textarea ───
    inputEl.addEventListener("input", () => {
        inputEl.style.height = "auto";
        const newHeight = Math.max(400, inputEl.scrollHeight);
        inputEl.style.height = newHeight + "px";
    });

    // ─── Line numbers scroll sync ───
    inputEl.addEventListener("scroll", () => {
        lineNumbers.scrollTop = inputEl.scrollTop;
    });

    // ─── Scroll progress bar ───
    const scrollProgress = document.getElementById("scroll-progress");
    if (scrollProgress) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = progress + "%";
        });
    }

    function updateLineNumbers() {
        const lines = inputEl.value.split("\n");
        lineNumbers.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join("");
    }

    function updateOutputLineNumbers(code) {
        if (!outputLineNumbers) return;
        if (!code) {
            outputLineNumbers.innerHTML = "";
            return;
        }
        const lines = code.split("\n");
        outputLineNumbers.innerHTML = lines
            .map((_, i) => `<span>${i + 1}</span>`)
            .join("");
    }

    function updateStats(lines, tokens, time) {
        if (statLines) statLines.textContent = lines;
        if (statTokens) statTokens.textContent = tokens;
        if (statTime) statTime.textContent = time > 0 ? `${time}ms` : "—";
    }

    async function doImproveGrammar() {
        const raw = inputEl.value;
        if (!raw.trim()) {
            showToast("Enter some text first", "error", 2000);
            return;
        }

        grammarBtn.disabled = true;
        grammarBtn.textContent = "✏️ Checking...";

        try {
            const result = await improveEnglish(raw);

            if (result.success && result.improved !== result.original) {
                grammarPanel.style.display = "block";

                if (result.corrections && result.corrections.length > 0) {
                    let suggestionsHtml = "<div class='corrections-list'>";
                    suggestionsHtml += `<p><strong>Found ${result.corrections_count} issue(s):</strong></p>`;

                    result.corrections.forEach((correction, index) => {
                        suggestionsHtml += `
                            <div class="correction-item">
                                <span class="correction-index">${index + 1}</span>
                                <span class="original">❌ "${correction.original}"</span>
                                <span>→</span>
                                <span class="suggested">✓ "${correction.suggested}"</span>
                                <small>${correction.message}</small>
                            </div>
                        `;
                    });
                    suggestionsHtml += "</div>";
                    grammaticalSuggestionsEl.innerHTML = suggestionsHtml;
                } else {
                    grammaticalSuggestionsEl.innerHTML = "<p>✅ No grammar issues found!</p>";
                }

                improvedTextEl.value = result.improved;
                document.getElementById("grammar-improved").style.display = "block";
            } else {
                grammarPanel.style.display = "block";
                grammaticalSuggestionsEl.innerHTML = "<p>✅ No changes needed. Your text looks good!</p>";
                document.getElementById("grammar-improved").style.display = "none";
            }
        } catch (error) {
            showToast("Grammar check failed: " + error.message, "error");
            console.error("Grammar error:", error);
        } finally {
            grammarBtn.disabled = false;
            grammarBtn.textContent = "✏️ Grammar";
        }
    }

    function doTranslate() {
        const raw = inputEl.value;
        if (!raw.trim()) {
            outputEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💻</div><div class="empty-state-text">Your generated code will appear here</div><div class="empty-state-hint">Type commands or pick an example →</div></div>`;
            lastCode = "";
            errorEl.style.display = "none";
            if (astOutput) astOutput.textContent = "";
            updateOutputLineNumbers("");
            updateStats(0, 0, 0);
            return;
        }

        const startTime = performance.now();
        const result = translateProgram(raw, currentLang);
        const elapsed = Math.round(performance.now() - startTime);

        if (result.code) {
            lastCode = result.code;
            // Apply syntax highlighting
            const highlighted = highlightCode(result.code, currentLang);
            outputEl.innerHTML = highlighted;
            updateOutputLineNumbers(result.code);

            const lineCount = result.code.split("\n").length;
            updateStats(lineCount, result.totalTokens || 0, elapsed);
        } else {
            outputEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Could not generate code</div><div class="empty-state-hint">Check for errors below</div></div>`;
            lastCode = "";
            updateOutputLineNumbers("");
            updateStats(0, result.totalTokens || 0, elapsed);
        }

        if (result.errors && result.errors.length > 0) {
            errorEl.style.display = "block";
            errorEl.innerHTML = result.errors
                .map(
                    (e) =>
                        `<div class="error-line"><span class="error-badge">Line ${e.line}</span> ${escapeHtml(e.error)}</div>`
                )
                .join("");
        } else {
            errorEl.style.display = "none";
            errorEl.textContent = "";
        }

        // Show AST for debugging
        if (astOutput && result.nodes) {
            astOutput.textContent = JSON.stringify(result.nodes, null, 2);
        }
    }

    // ─── Initial setup ───
    updateLineNumbers();

    if (inputEl.value.trim()) {
        doTranslate();
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);

export { translateLine, translateProgram, EXAMPLE_COMMANDS };
