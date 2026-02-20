# CODE_WRITER Cheat Sheet

Quick reference for all CODE_WRITER syntax patterns.

---

## Quick Start

```bash
npm start
```

Open `http://localhost:3000`

Type English commands, click **Translate**, see code!

---

### Variables

**English:**

```text
create a variable x equal to 10
```

**Output:**

```python
x = 10
```

---

### Arithmetic

**English:**

```text
add x and y
```

**Output:**

```python
x + y
```

---

### Conditionals

**English:**

```text
if x greater than 5 then print yes else print no
```

**Output:**

```python
if x > 5:
    print('yes')
else:
    print('no')
```

---

### Loops

**English:**

```text
loop i from 1 to 10 and print i
```

**Output:**

```python
for i in range(1, 11):
    print(i)
```

---

### Lists

**English:**

```text
create a list called numbers with 1 2 3 4 5
```

**Output:**

```python
numbers = [1, 2, 3, 4, 5]
```

---

## Grammar Feature

### Language Selection

- **Python** (default)
- **Java**
- **C++**

Click tabs in output to switch.

### How to Use

1. Click **✏️ Grammar** button
2. See corrections in panel
3. Click **Use Improved Text**
4. Improved text loads in input
5. Code updates automatically

### What It Checks

- Capitalization (i → I)
- Spacing issues
- Common grammar errors
- Punctuation

---

## All Features

### Simple Variable

**Input:**

```text
create a number x with value 5
```

**Output:**

```python
x = 5
```

### Function

**Input:**

```text
create a function add that takes a and b and returns a plus b
```

**Output:**

```python
def add(a, b):
    return a + b
```

### Loop

**Input:**

```text
loop from 0 to 5
```

**Output:**

```python
for i in range(0, 6):
    pass
```

### List Creation

**Input:**

```text
create a list named items with apple banana cherry
```

**Output:**

```python
items = ['apple', 'banana', 'cherry']
```

---

## Commands Reference

| Command | Meaning |
| --- | --- |
| create | Define something new |
| variable | A container for data |
| function | Reusable code block |
| loop | Repeat action |
| if | Conditional branch |
| equal | = (assignment) |
| greater than | > (comparison) |
| less than | < (comparison) |
| and | Logical AND |
| or | Logical OR |

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl + Enter | Translate |
| Ctrl + G | Improve Grammar |
| Ctrl + C | Copy output |

---

## Common Patterns

### Variable Declaration

- **Pattern:** create a variable [name] equal to [value]
- **Example:** create a variable age equal to 25
- **Python:** `age = 25`

### Function Definition

- **Pattern:** create a function [name] that takes [params] and returns [result]
- **Example:** create a function add that takes a and b and returns a plus b
- **Python:** `def add(a, b): return a + b`

### For Loop

- **Pattern:** loop [var] from [start] to [end]
- **Example:** loop i from 1 to 10
- **Python:** `for i in range(1, 11):`

### If Statement

- **Pattern:** if [condition] then [action]
- **Example:** if x greater than 5 then print yes
- **Python:** `if x > 5: print('yes')`

---

## Tips

1. Use clear keywords (create, loop, if, etc.)
2. Specify data types when possible
3. Check examples in app for patterns
4. Use "then" for conditionals
5. Use "and" to chain actions

---

## Troubleshooting

### Code doesn't generate

- Check English syntax
- Use recognized keywords
- Check examples for correct pattern

### Translation seems wrong

- Use clearer English
- Add more context
- Check grammar first
- Try simpler command

### Grammar feature slow

- Check internet connection
- Try later (rate limited)
- Add API key for faster speed

---

## Language Output Samples

### Python (Default)

```python
def greet(name):
    print(f"Hello {name}")
```

### Java

```java
public void greet(String name) {
    System.out.println("Hello " + name);
}
```

### C++

```cpp
void greet(string name) {
    cout << "Hello " << name;
}
```

---

## Configuration

### .env File

```env
API_PROVIDER=languagetool
GRAMMAR_API_KEY=optional_key
PORT=3000
NODE_ENV=development
```

### No Config Needed

Everything works with defaults:

- Free GRAMMAR_API_KEY
- Port 3000
- Development mode

---

## Quick Links

- Full Guide: [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)
- Setup Help: [SETUP.md](SETUP.md)
- Grammar Setup: [API_CONFIGURATION.md](API_CONFIGURATION.md)
- 30-Second Start: [QUICK_START.md](QUICK_START.md)

---

**Ready to translate** 🚀
