/**
 * CODE_WRITER Backend Server
 * Provides API endpoints for grammar improvement and code translation
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { improveGrammar } from "./api/grammar-api.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve static files (HTML, CSS, JS)

/**
 * GET /
 * Serve the main index.html file
 */
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

/**
 * POST /api/improve-grammar
 * Improve English grammar of the input text
 * 
 * Request body: { text: string }
 * Response: { success: boolean, original: string, improved: string, corrections?: Array }
 */
app.post("/api/improve-grammar", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid input: 'text' field is required",
      });
    }

    // If no API key configured, return original text
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        original: text,
        improved: text,
        message: "Gemini API key not configured. Add GEMINI_API_KEY to .env file.",
      });
    }

    const result = await improveGrammar(text);
    res.json(result);
  } catch (error) {
    console.error("Grammar API error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Grammar improvement failed",
    });
  }
});

/**
 * POST /api/translate
 * Placeholder for future code translation API endpoint
 */
app.post("/api/translate", (req, res) => {
  res.json({
    message: "Translation API endpoint (coming soon)",
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CODE_WRITER server running at http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT} in your browser`);
  console.log(
    `🔑 Gemini AI Grammar: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Not configured (add GEMINI_API_KEY to .env)"
    }`
  );
});
