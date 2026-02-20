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
        code: `create variable x value 10\ncreate variable y value 20\nadd x and y store in result\nprint result`,
    },
    {
        title: "If-Else Logic",
        code: `create variable age value 18\nif age greater than 17 then print "Adult" else print "Minor"`,
    },
    {
        title: "While Loop",
        code: `create variable counter value 0\nwhile counter less than 5 do increment counter\nprint counter`,
    },
    {
        title: "For Loop",
        code: `for i from 1 to 11 do print i`,
    },
    {
        title: "Function",
        code: `define function greet do print "Hello!"\ncall greet`,
    },
    {
        title: "List Operations",
        code: `create list numbers values 1 2 3 4 5\nappend 6 to numbers\nprint numbers`,
    },
    {
        title: "Full Program",
        code: `comment A simple calculator\ncreate variable a value 15\ncreate variable b value 7\nadd a and b store in sum\nsubtract a and b store in diff\nmultiply a and b store in prod\nprint sum\nprint diff\nprint prod`,
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
    },
    java: {
        keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|void|int|double|float|long|short|byte|char|boolean|String|true|false|null)\b/g,
        builtins: /\b(System|out|println|Scanner|ArrayList|Arrays|Math|Integer|Double|Float|Long|Object)\b/g,
        strings: /("(?:[^"\\]|\\.)*")/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b(\d+\.?\d*[fFdDlL]?)\b/g,
        types: /\b(int|double|float|long|short|byte|char|boolean|String|void|var|ArrayList|Scanner|Object)\b/g,
    },
    cpp: {
        keywords: /\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|namespace|template|this|new|delete|try|catch|throw|public|private|protected|virtual|inline|using|bool|true|false|nullptr)\b/g,
        builtins: /\b(std|cout|cin|endl|string|vector|map|set|pair|queue|stack|sort|find|begin|end|push_back|size|empty|front|back|insert|erase)\b/g,
        strings: /("(?:[^"\\]|\\.)*")/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b(\d+\.?\d*[fFlLuU]*)\b/g,
        includes: /(#include\s*<[^>]+>)/g,
        types: /\b(int|double|float|long|short|char|bool|void|auto|string|vector|map|set|pair)\b/g,
    },
};

function highlightCode(code, lang) {
    if (!code) return "";
    const rules = SYNTAX_RULES[lang];
    if (!rules) return escapeHtml(code);

    let result = escapeHtml(code);
    const protectedSegments = [];
    let protectId = 0;

    // Protect comments
    if (rules.comments) {
        result = result.replace(rules.comments, (match) => {
            const id = `__P${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-cmt">${match}</span>` });
            return id;
        });
    }

    // Protect strings
    if (rules.strings) {
        result = result.replace(rules.strings, (match) => {
            const id = `__P${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-str">${match}</span>` });
            return id;
        });
    }

    // Protect includes (C++)
    if (rules.includes) {
        result = result.replace(rules.includes, (match) => {
            const id = `__P${protectId++}__`;
            protectedSegments.push({ id, html: `<span class="syn-include">${match}</span>` });
            return id;
        });
    }

    // Keywords
    if (rules.keywords) result = result.replace(rules.keywords, '<span class="syn-kw">$1</span>');
    // Types
    if (rules.types) result = result.replace(rules.types, '<span class="syn-type">$1</span>');
    // Builtins
    if (rules.builtins) result = result.replace(rules.builtins, '<span class="syn-builtin">$1</span>');
    // Numbers
    if (rules.numbers) result = result.replace(rules.numbers, '<span class="syn-num">$1</span>');

    // Restore protected segments
    protectedSegments.forEach(({ id, html }) => {
        result = result.replace(id, html);
    });

    // Braces
    result = result.replace(/([{}()\[\]])/g, '<span class="syn-brace">$1</span>');

    return result;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── TOAST SYSTEM ───

function showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
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
    const grammarCloseBtn = document.getElementById("grammar-close-btn");
    const grammarSuggestionsEl = document.getElementById("grammar-suggestions");
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
    const statLines = document.getElementById("stat-lines");
    const statTokens = document.getElementById("stat-tokens");
    const statTime = document.getElementById("stat-time");
    const statLang = document.getElementById("stat-lang");

    const EMPTY_STATE = `<div class="empty-state"><div class="empty-state-icon">💻</div><div class="empty-state-text">Your generated code will appear here</div><div class="empty-state-hint">Type commands or pick an example →</div></div>`;

    // ─── Populate examples ───
    EXAMPLE_COMMANDS.forEach((example) => {
        const card = document.createElement("div");
        card.className = "example-card";
        const firstLine = example.code.split("\n")[0];
        const hasMore = example.code.split("\n").length > 1;
        card.innerHTML = `<div class="example-title">${example.title}</div><code>${firstLine}${hasMore ? "..." : ""}</code>`;
        card.addEventListener("click", () => {
            inputEl.value = example.code;
            doTranslate();
            updateLineNumbers();
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

    // ─── Translate ───
    translateBtn.addEventListener("click", doTranslate);

    // ─── Clear ───
    clearBtn.addEventListener("click", () => {
        inputEl.value = "";
        outputEl.innerHTML = EMPTY_STATE;
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

    // ─── Grammar close button ───
    if (grammarCloseBtn) {
        grammarCloseBtn.addEventListener("click", () => {
            grammarPanel.style.display = "none";
        });
    }

    // ─── Use improved text ───
    useImprovedBtn.addEventListener("click", () => {
        const improved = improvedTextEl.value;
        if (improved) {
            inputEl.value = improved;
            grammarPanel.style.display = "none";
            updateLineNumbers();
            doTranslate();
            showToast("Improved text applied!", "success", 2000);
        }
    });

    // ─── Copy ───
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!lastCode) { showToast("No code to copy", "error", 2000); return; }
            navigator.clipboard.writeText(lastCode).then(() => {
                copyBtn.classList.add("copied");
                showToast("Copied to clipboard!", "success", 2000);
                setTimeout(() => copyBtn.classList.remove("copied"), 2000);
            }).catch(() => showToast("Failed to copy", "error", 2000));
        });
    }

    // ─── Download ───
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            if (!lastCode) { showToast("No code to download", "error", 2000); return; }
            const ext = { python: "py", java: "java", cpp: "cpp" }[currentLang] || "txt";
            const filename = `generated.${ext}`;
            const blob = new Blob([lastCode], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = filename;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Downloaded ${filename}`, "success", 2000);
        });
    }

    // ─── Mobile menu ───
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener("click", () => sidebar.classList.toggle("mobile-open"));
    }

    // ─── Keyboard shortcuts ───
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doTranslate(); }
        if (e.key === "Escape" && sidebar?.classList.contains("mobile-open")) {
            sidebar.classList.remove("mobile-open");
        }
    });

    // ─── Real-time translate (debounced) ───
    let debounceTimer;
    inputEl.addEventListener("input", () => {
        updateLineNumbers();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doTranslate, 350);
    });

    // ─── Scroll sync ───
    inputEl.addEventListener("scroll", () => { lineNumbers.scrollTop = inputEl.scrollTop; });

    // ─── Scroll progress ───
    const scrollProgress = document.getElementById("scroll-progress");
    if (scrollProgress) {
        window.addEventListener("scroll", () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgress.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + "%";
        });
    }

    // ─── Helpers ───
    function updateLineNumbers() {
        const lines = inputEl.value.split("\n");
        lineNumbers.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join("");
    }

    function updateOutputLineNumbers(code) {
        if (!outputLineNumbers) return;
        if (!code) { outputLineNumbers.innerHTML = ""; return; }
        outputLineNumbers.innerHTML = code.split("\n").map((_, i) => `<span>${i + 1}</span>`).join("");
    }

    function updateStats(lines, tokens, time) {
        if (statLines) statLines.textContent = lines;
        if (statTokens) statTokens.textContent = tokens;
        if (statTime) statTime.textContent = time > 0 ? `${time}ms` : "—";
    }

    // ─── Grammar Improvement ───
    async function doImproveGrammar() {
        const raw = inputEl.value;
        if (!raw.trim()) { showToast("Enter some text first", "error", 2000); return; }

        grammarBtn.disabled = true;
        grammarBtn.textContent = "⏳ Checking...";

        try {
            const result = await improveEnglish(raw);

            grammarPanel.style.display = "block";

            if (result.success && result.improved && result.improved !== result.original) {
                // Show corrections
                if (result.corrections && result.corrections.length > 0) {
                    let html = `<div class="corrections-list">`;
                    html += `<p>Found ${result.corrections.length} correction(s):</p>`;
                    result.corrections.forEach((c, i) => {
                        html += `<div class="correction-item">
                            <span class="correction-index">${i + 1}</span>
                            <span class="original">${escapeHtml(c.original)}</span>
                            <span class="arrow">→</span>
                            <span class="suggested">${escapeHtml(c.suggested)}</span>
                            <div class="correction-msg">${escapeHtml(c.message || "")}</div>
                        </div>`;
                    });
                    html += `</div>`;
                    grammarSuggestionsEl.innerHTML = html;
                } else {
                    grammarSuggestionsEl.innerHTML = `<p style="color: var(--accent-5);">✅ Text was improved!</p>`;
                }

                // Show improved text
                improvedTextEl.value = result.improved;
                document.getElementById("grammar-improved").style.display = "block";
                showToast("Grammar corrections found!", "success", 2500);
            } else if (result.success) {
                grammarSuggestionsEl.innerHTML = `<p style="color: var(--accent-5);">✅ Your text looks perfect — no changes needed!</p>`;
                document.getElementById("grammar-improved").style.display = "none";
                showToast("Text is already correct!", "success", 2000);
            } else {
                grammarSuggestionsEl.innerHTML = `<p style="color: var(--accent-error);">❌ ${escapeHtml(result.error || result.message || "Grammar check failed")}</p>`;
                document.getElementById("grammar-improved").style.display = "none";
                showToast("Grammar check failed", "error", 3000);
            }
        } catch (error) {
            showToast("Grammar check error: " + error.message, "error", 3000);
            grammarPanel.style.display = "block";
            grammarSuggestionsEl.innerHTML = `<p style="color: var(--accent-error);">❌ Error: ${escapeHtml(error.message)}</p>`;
            document.getElementById("grammar-improved").style.display = "none";
        } finally {
            grammarBtn.disabled = false;
            grammarBtn.textContent = "✏️ Grammar";
        }
    }

    // ─── Translation ───
    function doTranslate() {
        const raw = inputEl.value;
        if (!raw.trim()) {
            outputEl.innerHTML = EMPTY_STATE;
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
            outputEl.innerHTML = highlightCode(result.code, currentLang);
            updateOutputLineNumbers(result.code);
            updateStats(result.code.split("\n").length, result.totalTokens || 0, elapsed);
        } else {
            outputEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Could not generate code</div><div class="empty-state-hint">Check errors below</div></div>`;
            lastCode = "";
            updateOutputLineNumbers("");
            updateStats(0, result.totalTokens || 0, elapsed);
        }

        if (result.errors && result.errors.length > 0) {
            errorEl.style.display = "block";
            errorEl.innerHTML = result.errors.map(e =>
                `<div class="error-line"><span class="error-badge">Line ${e.line}</span> ${escapeHtml(e.error)}</div>`
            ).join("");
        } else {
            errorEl.style.display = "none";
            errorEl.textContent = "";
        }

        if (astOutput && result.nodes) {
            astOutput.textContent = JSON.stringify(result.nodes, null, 2);
        }
    }

    // Init
    updateLineNumbers();
    if (inputEl.value.trim()) doTranslate();
}

document.addEventListener("DOMContentLoaded", initApp);

export { translateLine, translateProgram, EXAMPLE_COMMANDS };
