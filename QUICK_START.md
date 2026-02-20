# Quick Start (30 seconds)

Welcome to CODE_WRITER! This guide gets you running in less than a minute.

---

## What This Does

CODE_WRITER translates English commands into Python, Java, and C++ code.

### Core Features (Always Working)

- ✅ English → Python, Java, C++ code
- ✅ Live preview as you type
- ✅ No internet required for translation

### Grammar Feature (Optional)

- ✅ Improve English before translating
- ✅ Free (no setup) or premium (your API key)

---

## Start in 3 Steps

### 1️⃣ Install & Run

```bash
npm install
npm start
```

Opens at **`localhost:3000`**

### 2️⃣ Write English Commands

```text
create a function called greet that takes name and says hello
```

### 3️⃣ Click "Translate"

See instant Python/Java/C++ code!

---

## Try These Examples

### Example 1: Simple Variable

**English:**

```text
create a variable x equal to 10
```

**Output:**

```python
x = 10
```

### Example 2: Function

**English:**

```text
create a function called add that takes a and b and returns a plus b
```

**Output:**

```python
def add(a, b):
    return a + b
```

### Example 3: Loop

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

## Using Grammar Feature

### Free (No Setup Needed!)

- Uses LanguageTool free API
- Instant access
- Rate limited (OK for testing)

### Premium (Optional)

- Better performance with your own API key
- Get key from <https://languagetoolplus.com>
- Unlimited requests
- Worth it for production

### To Add Your API Key

1. Get free key from <https://languagetoolplus.com>
2. Create `.env` file
3. Add your key:

   ```env
   GRAMMAR_API_KEY=your_key_here
   ```

4. Restart server

Done! 🎉

---

## Output Formats

### Switch Languages

Click tabs in output panel:

- **Python** (default)
- **Java**
- **C++**

### Export Code

Click **Copy** button to clipboard.

---

## Configuration

### `.env` File

Create optional ``.env`` file for:

- Custom API key
- Custom API URL
- Port number
- Environment mode

See `.env.example` for template.

### No `.env`?

App runs fine with defaults:

- Port: 3000
- Free grammar API
- All core features work

---

## Common Tasks

### Learn the Syntax

- Explore example commands in the app
- See patterns in existing translations
- Try variations

### Customize

- Add your own grammar patterns in `js/parser.js`
- Modify code generators in `js/generator.js`
- Extend tokenizer in `js/tokenizer.js`

### Deploy

To deploy to production:

```bash
npm start
# Then deploy to hosting service
```

---

## Troubleshooting

### Nothing shows at localhost:3000

```bash
npm install
npm start
```

Then check browser console (F12) for errors.

### Grammar feature not working

- Check internet connection
- Try later (free API rate limited)
- Add API key for faster responses

### Code generation not working

- Check English syntax
- Use clearer commands
- See examples in app

### "Cannot find module" errors

```bash
npm install
```

Reinstall dependencies.

---

## What's Next?

1. **Translate** some English to code
2. **Explore** the JavaScript generator patterns
3. **Customize** for your use case
4. **Share** your results!

---

## More Help

- **Full Setup**: See [SETUP.md](SETUP.md)
- **Grammar Details**: See [API_CONFIGURATION.md](API_CONFIGURATION.md)
- **All Features**: See [README.md](README.md)
- **Complete Guide**: See [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)

---

**Happy translating!** 🚀
