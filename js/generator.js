/**
 * Code Generator Module
 * Converts AST nodes into target language code (Python, Java, C++).
 */

// ─── Operator Maps ───

const COMPARISON_OPS = {
    greater: { python: ">", java: ">", cpp: ">" },
    less: { python: "<", java: "<", cpp: "<" },
    equal: { python: "==", java: "==", cpp: "==" },
    not_equal: { python: "!=", java: "!=", cpp: "!=" },
};

const ARITHMETIC_OPS = {
    add: { python: "+", java: "+", cpp: "+" },
    subtract: { python: "-", java: "-", cpp: "-" },
    multiply: { python: "*", java: "*", cpp: "*" },
    divide: { python: "/", java: "/", cpp: "/" },
    modulus: { python: "%", java: "%", cpp: "%" },
};

// ─── Helpers ───

function indent(code, level, lang) {
    const unit = lang === "python" ? "    " : "    ";
    const prefix = unit.repeat(level);
    return code
        .split("\n")
        .map((line) => (line.trim() ? prefix + line : line))
        .join("\n");
}

function isNumeric(val) {
    return /^-?\d+(\.\d+)?$/.test(val);
}

function inferType(val) {
    if (val === null || val === undefined) return "int";
    if (val === "true" || val === "false") return "bool";
    if (/^".*"$/.test(val)) return "string";
    if (/^\d+\.\d+$/.test(val)) return "double";
    if (/^\d+$/.test(val)) return "int";
    return "auto";
}

function javaType(val) {
    const t = inferType(val);
    const map = { int: "int", double: "double", string: "String", bool: "boolean", auto: "var" };
    return map[t] || "var";
}

function cppType(val) {
    const t = inferType(val);
    const map = { int: "int", double: "double", string: "std::string", bool: "bool", auto: "auto" };
    return map[t] || "auto";
}

function formatValue(val, lang) {
    if (val === null || val === undefined) {
        return lang === "python" ? "None" : lang === "java" ? "0" : "0";
    }
    if (val === "true") return lang === "python" ? "True" : "true";
    if (val === "false") return lang === "python" ? "False" : "false";
    return val;
}

// ─── Generator per AST node type ───

const generators = {
    // ─── VARIABLE CREATION ───
    variable_creation(node, lang) {
        const v = formatValue(node.value, lang);
        switch (lang) {
            case "python":
                return `${node.name} = ${v}`;
            case "java":
                return `${javaType(node.value)} ${node.name} = ${v};`;
            case "cpp":
                return `${cppType(node.value)} ${node.name} = ${v};`;
        }
    },

    // ─── ASSIGNMENT ───
    assignment(node, lang) {
        const v = formatValue(node.value, lang);
        switch (lang) {
            case "python":
                return `${node.name} = ${v}`;
            case "java":
            case "cpp":
                return `${node.name} = ${v};`;
        }
    },

    // ─── PRINT ───
    print(node, lang) {
        const vals = node.values.map((v) => formatValue(v, lang));
        switch (lang) {
            case "python":
                return `print(${vals.join(", ")})`;
            case "java":
                return `System.out.println(${vals.join(" + ")});`;
            case "cpp":
                return `std::cout << ${vals.join(' << " " << ')} << std::endl;`;
        }
    },

    // ─── INPUT ───
    input(node, lang) {
        switch (lang) {
            case "python":
                return `${node.variable} = input()`;
            case "java":
                return `${node.variable} = scanner.nextLine();`;
            case "cpp":
                return `std::cin >> ${node.variable};`;
        }
    },

    // ─── ARITHMETIC ───
    arithmetic(node, lang) {
        const op = ARITHMETIC_OPS[node.operator][lang];
        const expr = `${node.left} ${op} ${node.right}`;
        if (node.result) {
            switch (lang) {
                case "python":
                    return `${node.result} = ${expr}`;
                case "java":
                case "cpp":
                    return `${node.result} = ${expr};`;
            }
        }
        // No result variable — just the expression
        return expr;
    },

    // ─── INCREMENT ───
    increment(node, lang) {
        if (node.amount === "1") {
            switch (lang) {
                case "python":
                    return `${node.variable} += 1`;
                case "java":
                case "cpp":
                    return `${node.variable}++;`;
            }
        }
        switch (lang) {
            case "python":
                return `${node.variable} += ${node.amount}`;
            case "java":
            case "cpp":
                return `${node.variable} += ${node.amount};`;
        }
    },

    // ─── DECREMENT ───
    decrement(node, lang) {
        if (node.amount === "1") {
            switch (lang) {
                case "python":
                    return `${node.variable} -= 1`;
                case "java":
                case "cpp":
                    return `${node.variable}--;`;
            }
        }
        switch (lang) {
            case "python":
                return `${node.variable} -= ${node.amount}`;
            case "java":
            case "cpp":
                return `${node.variable} -= ${node.amount};`;
        }
    },

    // ─── IF STATEMENT ───
    if_statement(node, lang) {
        const op = COMPARISON_OPS[node.condition.operator][lang];
        const cond = `${node.condition.left} ${op} ${node.condition.right}`;
        const thenCode = node.thenBody ? generate(node.thenBody, lang) : "pass";
        const elseCode = node.elseBody ? generate(node.elseBody, lang) : null;

        switch (lang) {
            case "python": {
                let code = `if ${cond}:\n${indent(thenCode, 1, lang)}`;
                if (elseCode) code += `\nelse:\n${indent(elseCode, 1, lang)}`;
                return code;
            }
            case "java": {
                let code = `if (${cond}) {\n${indent(thenCode, 1, lang)}\n}`;
                if (elseCode) code += ` else {\n${indent(elseCode, 1, lang)}\n}`;
                return code;
            }
            case "cpp": {
                let code = `if (${cond}) {\n${indent(thenCode, 1, lang)}\n}`;
                if (elseCode) code += ` else {\n${indent(elseCode, 1, lang)}\n}`;
                return code;
            }
        }
    },

    // ─── WHILE LOOP ───
    while_loop(node, lang) {
        const op = COMPARISON_OPS[node.condition.operator][lang];
        const cond = `${node.condition.left} ${op} ${node.condition.right}`;
        const bodyCode = node.body ? generate(node.body, lang) : "pass";

        switch (lang) {
            case "python":
                return `while ${cond}:\n${indent(bodyCode, 1, lang)}`;
            case "java":
                return `while (${cond}) {\n${indent(bodyCode, 1, lang)}\n}`;
            case "cpp":
                return `while (${cond}) {\n${indent(bodyCode, 1, lang)}\n}`;
        }
    },

    // ─── FOR LOOP ───
    for_loop(node, lang) {
        const bodyCode = node.body ? generate(node.body, lang) : "pass";
        const step = node.step || "1";

        switch (lang) {
            case "python": {
                let rangeArgs =
                    step === "1"
                        ? `${node.from}, ${node.to}`
                        : `${node.from}, ${node.to}, ${step}`;
                return `for ${node.variable} in range(${rangeArgs}):\n${indent(bodyCode, 1, lang)}`;
            }
            case "java":
                return `for (int ${node.variable} = ${node.from}; ${node.variable} < ${node.to}; ${node.variable} += ${step}) {\n${indent(bodyCode, 1, lang)}\n}`;
            case "cpp":
                return `for (int ${node.variable} = ${node.from}; ${node.variable} < ${node.to}; ${node.variable} += ${step}) {\n${indent(bodyCode, 1, lang)}\n}`;
        }
    },

    // ─── FUNCTION DEFINITION ───
    function_def(node, lang) {
        const params = node.params || [];
        const bodyCode = node.body ? generate(node.body, lang) : (lang === "python" ? "pass" : "");

        switch (lang) {
            case "python":
                return `def ${node.name}(${params.join(", ")}):\n${indent(bodyCode, 1, lang)}`;
            case "java":
                return `public static void ${node.name}(${params.map((p) => `Object ${p}`).join(", ")}) {\n${indent(bodyCode, 1, lang)}\n}`;
            case "cpp":
                return `void ${node.name}(${params.map((p) => `auto ${p}`).join(", ")}) {\n${indent(bodyCode, 1, lang)}\n}`;
        }
    },

    // ─── FUNCTION CALL ───
    function_call(node, lang) {
        const args = (node.args || []).join(", ");
        switch (lang) {
            case "python":
                return `${node.name}(${args})`;
            case "java":
                return `${node.name}(${args});`;
            case "cpp":
                return `${node.name}(${args});`;
        }
    },

    // ─── RETURN ───
    return(node, lang) {
        const v = node.value ? formatValue(node.value, lang) : "";
        switch (lang) {
            case "python":
                return v ? `return ${v}` : "return";
            case "java":
                return v ? `return ${v};` : "return;";
            case "cpp":
                return v ? `return ${v};` : "return;";
        }
    },

    // ─── LIST CREATION ───
    list_creation(node, lang) {
        const vals = node.values.join(", ");
        switch (lang) {
            case "python":
                return `${node.name} = [${vals}]`;
            case "java":
                return `ArrayList<Object> ${node.name} = new ArrayList<>(Arrays.asList(${vals}));`;
            case "cpp":
                return `std::vector<auto> ${node.name} = {${vals}};`;
        }
    },

    // ─── APPEND ───
    append(node, lang) {
        switch (lang) {
            case "python":
                return `${node.list}.append(${node.value})`;
            case "java":
                return `${node.list}.add(${node.value});`;
            case "cpp":
                return `${node.list}.push_back(${node.value});`;
        }
    },

    // ─── COMMENT ───
    comment(node, lang) {
        switch (lang) {
            case "python":
                return `# ${node.text}`;
            case "java":
                return `// ${node.text}`;
            case "cpp":
                return `// ${node.text}`;
        }
    },
};

/**
 * Generate code from an AST node for the specified language.
 * @param {object} node - AST node from the parser
 * @param {string} lang - Target language: "python", "java", or "cpp"
 * @returns {string} Generated code
 */
function generate(node, lang) {
    if (!node || !node.type) return "";
    const gen = generators[node.type];
    if (!gen) return `/* Unsupported node type: ${node.type} */`;
    return gen(node, lang);
}

/**
 * Generate a full program from an array of AST nodes.
 * @param {Array} nodes - Array of AST nodes
 * @param {string} lang - Target language
 * @returns {string} Complete generated program
 */
function generateProgram(nodes, lang) {
    if (!nodes || nodes.length === 0) return "";

    const lines = nodes.map((node) => generate(node, lang));

    // Wrap Java in a class
    if (lang === "java") {
        const needsScanner = nodes.some((n) => n.type === "input");
        const needsArrays = nodes.some((n) => n.type === "list_creation");
        let imports = "";
        if (needsScanner) imports += "import java.util.Scanner;\n";
        if (needsArrays) imports += "import java.util.ArrayList;\nimport java.util.Arrays;\n";

        let body = lines.join("\n");
        // Separate function definitions from main code
        const funcNodes = nodes.filter((n) => n.type === "function_def");
        const mainNodes = nodes.filter((n) => n.type !== "function_def");
        const funcLines = funcNodes.map((n) => indent(generate(n, lang), 1, lang));
        const mainLines = mainNodes.map((n) => indent(generate(n, lang), 2, lang));

        let scannerInit = needsScanner ? indent("Scanner scanner = new Scanner(System.in);", 2, lang) + "\n" : "";

        return `${imports}public class Main {\n${funcLines.join("\n\n")}\n    public static void main(String[] args) {\n${scannerInit}${mainLines.join("\n")}\n    }\n}`;
    }

    // Wrap C++ in main()
    if (lang === "cpp") {
        const needsIO = nodes.some((n) => ["print", "input"].includes(n.type));
        const needsVector = nodes.some((n) => ["list_creation", "append"].includes(n.type));

        let includes = "#include <iostream>\n";
        if (needsVector) includes += "#include <vector>\n";
        includes += "#include <string>\n";

        const funcNodes = nodes.filter((n) => n.type === "function_def");
        const mainNodes = nodes.filter((n) => n.type !== "function_def");
        const funcLines = funcNodes.map((n) => generate(n, lang));
        const mainLines = mainNodes.map((n) => indent(generate(n, lang), 1, lang));

        return `${includes}\n${funcLines.join("\n\n")}\nint main() {\n${mainLines.join("\n")}\n    return 0;\n}`;
    }

    // Python — just join lines
    return lines.join("\n");
}

export { generate, generateProgram };
