const logger = require('../../utils/logger');
const env = require('../../config/env');

/**
 * Modular AI Provider supporting Google Gemini API with seamless fallback.
 */
class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || null;
    this.model = 'gemini-1.5-flash';
  }

  /**
   * Check if live Gemini API is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Call Gemini API to generate structured content
   * @param {string} prompt - The prompt text
   * @param {string} [systemInstruction] - Optional system instructions
   * @returns {Promise<string|null>} - Raw text response or null on fallback
   */
  async generateText(prompt, systemInstruction = '') {
    if (!this.isConfigured()) {
      logger.info('[AI PROVIDER] No GEMINI_API_KEY configured. Using deterministic domain heuristics.');
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`[AI PROVIDER] Gemini API request failed (${response.status}): ${errorText}`);
        return null;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return candidate || null;
    } catch (err) {
      logger.warn(`[AI PROVIDER] Gemini request exception: ${err.message}. Gracefully falling back.`);
      return null;
    }
  }
}

module.exports = new AIProvider();
