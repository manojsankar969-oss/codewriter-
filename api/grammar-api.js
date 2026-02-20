/**
 * Grammar Correction API Module
 * Uses Google Gemini AI to correct and improve English sentences
 * for better code translation accuracy.
 */

/**
 * Improve English grammar using Google Gemini AI
 * 
 * @param {string} text - Text to improve
 * @returns {Promise<{ success: boolean, original: string, improved: string, corrections?: Array }>}
 */
export async function improveGrammar(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        original: text,
        improved: text,
        error: "GEMINI_API_KEY not configured in .env",
      };
    }

    const prompt = `You are a grammar correction assistant for an English-to-code translator app called CodeWriter Pro. 

The user writes English commands to generate programming code. Your job is to correct their grammar, spelling, and sentence structure so the commands are clearer and easier to parse.

IMPORTANT RULES:
1. Fix spelling mistakes, grammatical errors, and unclear phrasing.
2. Keep programming keywords and variable names UNCHANGED (e.g. "x", "counter", "greet", "nums").
3. Keep the command structure intact — do NOT add extra sentences or explanations.
4. Return ONLY the corrected text, nothing else.
5. If the text is already correct, return it exactly as-is.

Also provide a JSON array of corrections in this format:
[{"original": "wrong text", "suggested": "correct text", "message": "explanation"}]

Respond in this exact JSON format:
{
  "improved": "the corrected text here",
  "corrections": [{"original": "...", "suggested": "...", "message": "..."}]
}

User input to correct:
"""
${text}
"""`;

    const attempts = [
      { model: "gemini-2.0-flash", api: "v1beta" },
      { model: "gemini-1.5-flash", api: "v1beta" },
      { model: "gemini-pro", api: "v1" },
    ];
    let lastError = null;

    for (const { model, api } of attempts) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${api}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          lastError = `${model}: HTTP ${response.status}`;
          console.warn(`Model ${model} (${api}) failed: ${response.status}`);
          continue; // try next model
        }

        const data = await response.json();

        // Extract the response text
        const responseText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!responseText) {
          lastError = `${model}: empty response`;
          continue;
        }

        // Parse the JSON response — strip markdown code fences if present
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
        }

        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          // If JSON parsing fails, use the raw text as improved version
          parsed = { improved: jsonStr, corrections: [] };
        }

        const improved = parsed.improved || text;
        const corrections = parsed.corrections || [];

        return {
          success: true,
          original: text,
          improved,
          corrections_count: corrections.length,
          corrections: corrections.slice(0, 10),
        };
      } catch (modelError) {
        lastError = `${model}: ${modelError.message}`;
        console.warn(`Model ${model} error:`, modelError.message);
        continue;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError}`);
  } catch (error) {
    console.error("Gemini Grammar API error:", error.message);

    return {
      success: false,
      original: text,
      improved: text,
      error: error.message,
      message: "Grammar correction failed. Returning original text.",
    };
  }
}
