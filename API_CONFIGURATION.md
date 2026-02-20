# Grammar API Configuration Guide

This document explains how to set up and configure the Grammar Improvement API for CODE_WRITER.

---

## Overview

The Grammar API feature allows you to improve English text before translating it to code. It's **completely optional** — the app works perfectly without it.

### Current Options

1. **LanguageTool** (Free) — Default, no setup required ⭐
2. **LanguageTool Plus** (Paid) — Higher limits, premium features
3. Other services — Can be integrated

---

## Option 1: Free LanguageTool (Recommended for Getting Started)

### No Configuration Needed! ✅

The app uses the free LanguageTool API by default:

- No API key required
- No configuration needed
- Rate limits: ~10-20 requests per minute per IP

### How It Works

1. You click "Grammar" button
2. Your text is sent to LanguageTool API
3. Corrections are returned and displayed
4. You can apply them or keep original text

### Limitations

- Rate limited (free tier)
- May be slow during peak times
- Basic error detection only

### When to Upgrade

If you hit rate limits or want advanced features, upgrade to LanguageTool Plus.

---

## Option 2: LanguageTool Plus (Recommended for Production)

This option provides:

- Higher rate limits (1000+ requests/day)
- Priority support
- Premium error rules

### Setup Steps

#### 1. Create Account

- Visit: <https://languagetoolplus.com>
- Click "Sign Up"
- Create free account
- Email verification

#### 2. Get API Key

- Log in to your dashboard
- Go to "Account" → "API Keys"
- Generate new API key
- Copy the key

#### 3. Update .env File

```env
API_PROVIDER=languagetool
GRAMMAR_API_KEY=YOUR_API_KEY_HERE
GRAMMAR_API_URL=https://api.languagetoolplus.com/v2/check
PORT=3000
NODE_ENV=development
```

Example with actual key:

```env
API_PROVIDER=languagetool
GRAMMAR_API_KEY=abc123def456xyz789...
GRAMMAR_API_URL=https://api.languagetoolplus.com/v2/check
PORT=3000
NODE_ENV=development
```

#### 4. Restart Server

```bash
npm start
```

#### 5. Test

- Click "Grammar" button
- See corrected text
- Should work faster than free tier

### Pricing

- **Free**: 10,000 requests/month
- **Pro**: $10/month for 50,000 requests
- **Enterprise**: Custom pricing

---

## Option 3: Other Grammar Services

### Quillbot API

```env
API_PROVIDER=quillbot
GRAMMAR_API_KEY=your_quillbot_key
GRAMMAR_API_URL=https://api.quillbot.com/check
```

**Setup:**

1. Visit: <https://quillbot.com/api>
2. Get API key
3. Add to `.env`

### Grammarly API

Grammarly requires OAuth setup. Not recommended for this project.

### Custom Service

You can integrate any grammar API that:

- Accepts POST requests
- Returns corrections in JSON
- Has text and language parameters

Update `api/grammar-api.js` to handle the response format.

---

## Offline Grammar Checking (No Internet)

If you don't want to use online APIs, the app includes a fallback:

```javascript
// In api/grammar-api.js
import { improveGrammarOffline } from "./grammar-api.js";
```

This does basic rule-based corrections without external API:

- Capitalizes "I"
- Fixes spacing issues
- No sophisticated grammar rules

**To use offline only:**

```env
# Comment out or leave empty
# GRAMMAR_API_KEY=
```

The app will automatically use offline fallback.

---

## Testing Your Setup

### Test 1: Free API

1. Leave `.env` empty except PORT
2. Start server: `npm start`
3. Type bad English: "i have went"
4. Click "Grammar"
5. Should show corrections ✅

### Test 2: With API Key

1. Add your API key to `.env`
2. Restart server
3. Click "Grammar" many times
4. Should work faster than free tier ✅

### Test 3: Offline Mode

1. Comment out API_KEY in `.env`
2. Click "Grammar"
3. Should still show basic corrections ✅

---

## Monitoring Usage

### LanguageTool Plus API

- Log in to dashboard
- Check usage statistics
- See remaining quota

### When You're Hitting Limits

If seeing errors like "Rate limit exceeded":

1. Upgrade plan
2. Wait before making more requests
3. Implement client-side caching
4. Switch to LanguageTool Plus

---

## Security Best Practices

### ✅ DO

- Keep `.env` file private
- Never commit `.env` to GitHub
- Use `.gitignore` to hide `.env`
- Regenerate keys if compromised
- Use environment variables in production

### ❌ DON'T

- Hardcode API keys in JavaScript
- Commit `.env` to version control
- Share `.env` content publicly
- Use test keys in production
- Log full API responses with keys

---

## Debugging

### API Not Responding

```javascript
// Check error in browser console (F12)
// Look for CORS errors or 403s
```

**Solutions:**

1. Verify API key is correct
2. Check internet connection
3. Try free tier (no key needed)
4. Check if service is down

### Rate Limiting

Error: "Too many requests"

**Solution:**

```env
# Upgrade to Plus tier
GRAMMAR_API_KEY=your_plus_key
```

### CORS Errors

Error: "No 'Access-Control-Allow-Origin' header"

**This should not happen** because the backend handles requests.

### Slow Responses

Might be:

1. Using free tier
2. Slow internet connection
3. LanguageTool service is busy

**Solution:** Use LanguageTool Plus for faster responses

---

## Integration into Your Workflow

### Step 1: User Types English

```text
"i have create a variable"
```

### Step 2: User Clicks Grammar

```text
Your app sends to API ↓
```

### Step 3: API Returns Corrections

```text
"I have created a variable"
```

### Step 4: User Reviews & Applies

```text
Improved text loaded into input ↓
```

### Step 5: User Translates to Code

```text
"I have created a variable" → Python code
```

---

## Cost Estimate

| Service | Cost | Requests/Month | Use Case |
| --- | --- | --- | --- |
| Free LanguageTool | $0 | 10,000 | Testing |
| LanguageTool Plus | $10 | 50,000 | Small projects |
| LanguageTool Plus+ | $25 | 250,000 | Medium projects |
| Enterprise | Custom | Unlimited | Large projects |

---

## Conclusion

1. **Just trying it out?** → Use free LanguageTool (no setup)
2. **Building a project?** → Use LanguageTool Plus ($10/month)
3. **No internet?** → Use offline fallback (built-in)
4. **Custom needs?** → Integrate your own service

Start with free, upgrade when you hit limits. That's it! 🚀

---

**Questions?** Check `.env.example` and README.md
