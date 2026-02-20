/**
 * Grammar Client Module
 * Frontend module to communicate with the grammar improvement API
 */

/**
 * Improve English text grammar via API
 * @param {string} text - Text to improve
 * @returns {Promise<{ success: boolean, original: string, improved: string }>}
 */
export async function improveEnglish(text) {
  try {
    const response = await fetch("/api/improve-grammar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Grammar improvement failed:", error);
    return {
      success: false,
      original: text,
      improved: text,
      error: error.message,
    };
  }
}

/**
 * Show grammar suggestions in the UI
 * @param {HTMLElement} container - Container to display corrections
 * @param {Array} corrections - Array of correction objects
 */
export function displayCorrections(container, corrections) {
  if (!corrections || corrections.length === 0) {
    container.innerHTML = "<p>✅ No grammar issues found!</p>";
    return;
  }

  let html = "<div class='corrections-list'>";
  html += `<p><strong>Found ${corrections.length} issue(s):</strong></p>`;

  corrections.forEach((correction, index) => {
    html += `
      <div class="correction-item">
        <span class="correction-index">${index + 1}</span>
        <span class="original" style="color: #d32f2f;">
          "${correction.original}"
        </span>
        <span>→</span>
        <span class="suggested" style="color: #388e3c;">
          "${correction.suggested}"
        </span>
        <small>${correction.message}</small>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}
