# Setup Guide — CODE_WRITER with Grammar API

This guide walks you through setting up CODE_WRITER with the optional Grammar Improvement API.

## Quick Start (5 minutes)

### 1. Install Node.js

Download and install from <https://nodejs.org> (LTS version recommended)

Verify installation:

```bash
node --version
npm --version
```

### 2. Navigate to project folder

```bash
cd CODE_WRITER
```

### 3. Install dependencies

```bash
npm install
```

This installs:

- `express` — Web server
- `cors` — Cross-origin requests
- `dotenv` — Environment variable management
- `axios` — HTTP client for API calls

### 4. Create .env file

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

The `.env` file contains configuration. You can leave it as-is to use the free LanguageTool API.

### 5. Start the server

```bash
npm start
```

Output:

```text
✅ CODE_WRITER server running at http://localhost:3000
📝 Open http://localhost:3000 in your browser
```

### 6. Open in browser

Click the link or visit: **<http://localhost:3000>**

That's it! ✅

---

## Full Setup with API Key (Optional)

### Get a LanguageTool API Key

LanguageTool offers free and premium tiers:

1. Visit: <https://languagetoolplus.com>
2. Sign up for a free account
3. Get your API key from your dashboard
4. Copy the key

### Configure .env

Edit `.env` file in your project folder:

```env
# Grammar Correction API Configuration

# API Provider: "languagetool" (free official API)
API_PROVIDER=languagetool

# Your API Key from LanguageTool
GRAMMAR_API_KEY=abc123def456...

# API Endpoint (default is correct for LanguageTool)
GRAMMAR_API_URL=https://api.languagetoolplus.com/v2/check

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important:** Keep this file private and never commit it to GitHub!

### Restart server

```bash
npm start
```

New features now available:

- ✏️ Click "Grammar" button to check English
- Get suggestions for improvements
- Apply corrections before translating to code

---

## Verification Checklist

Before proceeding, verify:

- [ ] Node.js installed (`node --version` works)
- [ ] Navigate to project folder
- [ ] `package.json` exists in folder
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created from `.env.example`
- [ ] Server starts without errors (`npm start`)
- [ ] Browser opens at <http://localhost:3000>
- [ ] You can type English commands

---

## Troubleshooting

### "npm: command not found"

**Cause:** Node.js not installed

**Solution:** Download and install from <https://nodejs.org>

### "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Solution:** Run `npm install`

### "Port 3000 is already in use"

**Cause:** Another app using port 3000

**Solution:**

```bash
# Use different port
PORT=3001 npm start
```

### "Grammar API not responding"

**Cause:** No internet or API down

**Solution:**

- Check internet connection
- App still works without grammar API
- Try again later
- Grammar improvements are optional

### "Blank page at localhost:3000"

**Cause:** Check browser console

**Solution:**

- Press F12 to open developer tools
- Check **Console** tab for errors
- Try different browser
- Clear cache (Ctrl+Shift+Delete)

### ".env file: Grammar API not configured"

**Cause:** .env file is empty or missing

**Solution:**

- Copy `.env.example` to `.env`
- Optionally add your API key
- Restart server

---

## File Structure After Setup

```text
CODE_WRITER/
├── index.html              ← Main app (open in browser)
├── server.js              ← Backend server (start with npm start)
├── package.json           ← Dependencies
├── .env                   ← Configuration (PRIVATE - don't share)
├── .env.example          ← Template
├── .gitignore            ← Files to hide from Git
├── README.md             ← Full documentation
├── SETUP.md              ← This file
│
├── css/
│   └── style.css         ← Styling
│
├── js/
│   ├── app.js            ← Main JavaScript
│   ├── preprocessor.js   ← Input cleaning
│   ├── tokenizer.js      ← Token splitting
│   ├── parser.js         ← Grammar rules
│   ├── generator.js      ← Code generation
│   ├── grammar-client.js ← Grammar API (frontend)
│   └── synonyms.js       ← Synonym mapping
│
├── api/
│   └── grammar-api.js    ← Grammar checking (backend)
│
└── tests/
    └── test.html         ← Test runner
```

---

## Usage

### Simple Example

1. Type in English:

   ```text
   create variable name value "Alice"
   print name
   ```

2. Select language (Python, Java, or C++)

3. Click **Translate**

4. View generated code

### With Grammar Check

1. Type (even with errors):

   ```text
   i have create a variable x value 10
   ```

2. Click **Grammar**
   - See suggestions
   - Click "Use Improved Text"

3. Click **Translate**

Done! 🎉

---

## Next Steps

- Explore more examples in the app
- Try different English patterns
- Check README.md for full documentation
- Read grammar patterns in `js/parser.js`

---

## Help & Support

**Not working?**

1. Check this guide again
2. Look at console errors (F12)
3. Ensure `.env` is set up
4. Try without Grammar API
5. Restart server

**Want to customize?**

- Edit `js/grammar.js` to add patterns
- Modify `js/generator.js` to change output
- Update `css/style.css` for styling
- Add API keys in `.env`

---

Happy Coding! 🚀
