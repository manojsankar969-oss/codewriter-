// Node.js test runner — verifies all modules work correctly
import { preprocess, preprocessLines } from './js/preprocessor.js';
import { tokenize, TokenType } from './js/tokenizer.js';
import { parse, parseLine } from './js/parser.js';
import { generate, generateProgram } from './js/generator.js';

let passed = 0, failed = 0;

function assert(name, actual, expected) {
    if (actual === expected) {
        console.log(`  ✓ ${name}`);
        passed++;
    } else {
        console.log(`  ✗ ${name}`);
        console.log(`    Expected: ${JSON.stringify(expected)}`);
        console.log(`    Got:      ${JSON.stringify(actual)}`);
        failed++;
    }
}

function assertIncludes(name, actual, substring) {
    if (actual && actual.includes(substring)) {
        console.log(`  ✓ ${name}`);
        passed++;
    } else {
        console.log(`  ✗ ${name}`);
        console.log(`    Expected to contain: ${JSON.stringify(substring)}`);
        console.log(`    Got: ${JSON.stringify(actual)}`);
        failed++;
    }
}

// ═══ PREPROCESSOR ═══
console.log('\n=== PREPROCESSOR ===');
assert('Synonym: make → create', preprocess('make x'), 'create x');
assert('Synonym: display → print', preprocess('display x'), 'print x');
assert('Filler removal', preprocess('please print x'), 'print x');
assert('Complex synonym chain', preprocess('make variable y equal 20'), 'create variable y value 20');
assert('Empty input', preprocess(''), '');

// ═══ TOKENIZER ═══
console.log('\n=== TOKENIZER ===');
let tokens = tokenize('create variable x value 10');
assert('Token count', tokens.length, 5);
assert('Keyword token', tokens[0].type, TokenType.KEYWORD);
assert('Identifier token', tokens[2].type, TokenType.IDENTIFIER);
assert('Number token', tokens[4].type, TokenType.NUMBER);

tokens = tokenize('print "hello world"');
assert('String token type', tokens[1].type, TokenType.STRING);
assert('String token value', tokens[1].value, 'hello world');

// ═══ PARSER ═══
console.log('\n=== PARSER — Variable ===');
let result = parseLine('create variable x value 10');
assert('Variable creation parses', result.success, true);
assert('Variable name', result.node.name, 'x');
assert('Variable value', result.node.value, '10');

console.log('\n=== PARSER — Assignment ===');
result = parseLine('set x to 20');
assert('Assignment parses', result.success, true);
assert('Assignment name', result.node.name, 'x');

console.log('\n=== PARSER — Print ===');
result = parseLine('print x');
assert('Print parses', result.success, true);
assert('Print type', result.node.type, 'print');

result = parseLine('print "hello"');
assert('Print string', result.success, true);

console.log('\n=== PARSER — Arithmetic ===');
result = parseLine('add x and y store in z');
assert('Arithmetic parses', result.success, true);
assert('Operator', result.node.operator, 'add');
assert('Left', result.node.left, 'x');
assert('Right', result.node.right, 'y');
assert('Result', result.node.result, 'z');

console.log('\n=== PARSER — If Statement ===');
result = parseLine('if x greater than 10 then print x');
assert('If parses', result.success, true);
assert('If type', result.node.type, 'if_statement');
assert('Condition operator', result.node.condition.operator, 'greater');

console.log('\n=== PARSER — While Loop ===');
result = parseLine('while x less than 10 do increment x');
assert('While parses', result.success, true);
assert('While condition', result.node.condition.operator, 'less');

console.log('\n=== PARSER — For Loop ===');
result = parseLine('for i from 1 to 10 do print i');
assert('For parses', result.success, true);
assert('For variable', result.node.variable, 'i');
assert('For from', result.node.from, '1');
assert('For to', result.node.to, '10');

console.log('\n=== PARSER — Function ===');
result = parseLine('define function greet do print "hello"');
assert('Function def parses', result.success, true);
assert('Function name', result.node.name, 'greet');

result = parseLine('call greet');
assert('Function call parses', result.success, true);
assert('Call name', result.node.name, 'greet');

console.log('\n=== PARSER — List ===');
result = parseLine('create list nums value 1 2 3');
assert('List creation', result.success, true);
assert('List name', result.node.name, 'nums');
assert('List values count', result.node.values.length, 3);

result = parseLine('append 4 to nums');
assert('Append parses', result.success, true);

console.log('\n=== PARSER — Misc ===');
result = parseLine('comment this is a test');
assert('Comment', result.success, true);

result = parseLine('increment x');
assert('Increment', result.success, true);
assert('Increment var', result.node.variable, 'x');

result = parseLine('decrement y by 5');
assert('Decrement', result.success, true);
assert('Decrement amount', result.node.amount, '5');

result = parseLine('input x');
assert('Input', result.success, true);

result = parseLine('return x');
assert('Return', result.success, true);

result = parseLine('blah blah');
assert('Invalid fails', result.success, false);

// ═══ GENERATOR ═══
console.log('\n=== GENERATOR — Python ===');
result = parseLine('create variable x value 10');
assert('Python variable', generate(result.node, 'python'), 'x = 10');

result = parseLine('print x');
assert('Python print', generate(result.node, 'python'), 'print(x)');

result = parseLine('increment x');
assert('Python increment', generate(result.node, 'python'), 'x += 1');

console.log('\n=== GENERATOR — Java ===');
result = parseLine('create variable x value 10');
assert('Java variable', generate(result.node, 'java'), 'int x = 10;');

result = parseLine('print x');
assert('Java print', generate(result.node, 'java'), 'System.out.println(x);');

console.log('\n=== GENERATOR — C++ ===');
result = parseLine('create variable x value 10');
assert('C++ variable', generate(result.node, 'cpp'), 'int x = 10;');

result = parseLine('print x');
assert('C++ print', generate(result.node, 'cpp'), 'std::cout << x << std::endl;');

result = parseLine('input y');
assert('C++ input', generate(result.node, 'cpp'), 'std::cin >> y;');

// ═══ FULL PROGRAM ═══
console.log('\n=== FULL PROGRAM ===');

const nodes = [];
let r;
r = parseLine('create variable x value 10'); nodes.push(r.node);
r = parseLine('print x'); nodes.push(r.node);

let pyProg = generateProgram(nodes, 'python');
assertIncludes('Python program has var', pyProg, 'x = 10');
assertIncludes('Python program has print', pyProg, 'print(x)');

let javaProg = generateProgram(nodes, 'java');
assertIncludes('Java has class', javaProg, 'public class Main');
assertIncludes('Java has main', javaProg, 'public static void main');

let cppProg = generateProgram(nodes, 'cpp');
assertIncludes('C++ has include', cppProg, '#include <iostream>');
assertIncludes('C++ has main', cppProg, 'int main()');

// ═══ SYNONYM TOLERANCE ═══
console.log('\n=== SYNONYM TOLERANCE ===');
const cleanedMake = preprocess('make y equal 20');
r = parseLine(cleanedMake);
assert('make y equal 20 → variable', r.success, true);
assert('make y equal 20 → python', generate(r.node, 'python'), 'y = 20');

const cleanedDisplay = preprocess('display x');
r = parseLine(cleanedDisplay);
assert('display x → print', generate(r.node, 'python'), 'print(x)');

// ═══ SUMMARY ═══
console.log('\n' + '═'.repeat(50));
console.log(`  ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed === 0) {
    console.log('  ✅ ALL TESTS PASSED');
} else {
    console.log('  ❌ SOME TESTS FAILED');
}
console.log('═'.repeat(50));
