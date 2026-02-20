# CODE_WRITER — English to Code Translator

A rule-based software application that converts structured English instructions into syntactically correct programming code in multiple languages (Python, Java, C++).

**No AI/ML required** — fully deterministic grammar rules and pattern recognition.

---

## Features

✅ **Rule-Based Translation** — No machine learning, just predefined grammar rules  
✅ **Multi-Language Support** — Python, Java, C++  
✅ **Grammar Improvement** — Optional API integration to improve English input  
✅ **Synonym Support** — 80+ synonyms mapped to standard meanings  
✅ **14+ Grammar Patterns** — Comprehensive support for common programming constructs  
✅ **Real-Time Translation** — Live code generation as you type  
✅ **AST Debugging** — View parsed abstract syntax tree  

---

## Installation

### Prerequisites

- Node.js 14+ and npm

### Setup Steps

1. **Clone or extract the project**

   ```bash
   cd CODE_WRITER
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Start the server**

   ```bash
   npm start
   ```

5. **Open in browser**

   Open: <http://localhost:3000>  
   Or open: <http://localhost:3000>

---

## Grammar Improvement API

The application can optionally improve your English input before translation using an external API.

### Free Option: LanguageTool

LanguageTool offers a free API with a basic quota:

1. **No API Key Needed** (for basic usage)
   - The app uses the free LanguageTool API by default
   - No configuration required

2. **With API Key** (for higher limits)
   - Sign up at: <https://languagetoolplus.com>
   - Get your API key
   - Add to `.env` file

### Alternative: Other Services

Update `.env` to use different providers:

```env
API_PROVIDER=quillbot
GRAMMAR_API_URL=https://api.quillbot.com/...
GRAMMAR_API_KEY=your_key
```

---

## Usage Guide

### Basic Workflow

1. **Enter English Commands**

   ```text
   create variable x value 10
   print x
   ```

2. **Click Grammar** (optional)

   Improves your English input

3. **Click Translate**

   Converts to selected language

4. **Select Language**

   Choose Python, Java, or C++

### Example Commands

```text
create variable name value "Alice"
print name
```

---

## Architecture

### Frontend

- **js/app.js** — Main orchestrator
- **js/parser.js** — Grammar rules
- **js/generator.js** — Code generation

### Backend

- **server.js** — Express server
- **api/grammar-api.js** — Grammar checking

### Configuration

- **.env** — API configuration
- **package.json** — Dependencies

---

## API Endpoints

### GET `/`

Serves the main HTML interface

### POST `/api/improve-grammar`

Improves English grammar

**Request:**

```json
{
  "text": "i have went to the store"
}
```

**Response:**

```json
{
  "success": true,
  "original": "i have went to the store",
  "improved": "I have gone to the store"
}
```

---

## Environmental Setup

### Windows

```powershell
npm install
npm start
```

### macOS / Linux

```bash
npm install
npm start
```

---

## Troubleshooting

### "Cannot find module 'express'"

```bash
npm install
```

### "Grammar API not responding"

- Check internet connection
- Verify `.env` configuration

### "Port 3000 already in use"

```bash
PORT=3001 npm start
```

---

## Development

### Testing

```bash
npm test
```

### File Structure

```text
CODE_WRITER/
├── index.html
├── server.js
├── package.json
├── .env
├── .env.example
├── css/style.css
├── js/
├── api/
└── tests/
```

---

## Security Notes

⚠️ **Never commit `.env` to version control!**

- Add `.env` to `.gitignore`
- Keep API keys private

---

## License

MIT

---

## Contributing

Contributions welcome!

---

## Support

For issues or questions:

1. Check `.env` configuration
2. Verify API key is valid
3. Check browser console for errors

---

**Happy coding!** 🚀
