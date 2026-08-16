// src/lib/gemini.js
// Thin wrapper around the Gemini API (generativelanguage.googleapis.com).
// Requires VITE_GEMINI_API_KEY to be set in your .env file (see .env.example).
// Get a free key at https://aistudio.google.com/apikey

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

class GeminiError extends Error {}

async function callGemini({ contents, systemInstruction, generationConfig }) {
  if (!API_KEY) {
    throw new GeminiError(
      "Missing VITE_GEMINI_API_KEY. Add your Gemini API key to a .env file (see .env.example) and restart the dev server."
    );
  }

  const res = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      generationConfig,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || "";
    } catch {
      /* ignore parse failure */
    }
    throw new GeminiError(detail || `Gemini API request failed (${res.status})`);
  }

  const data = await res.json();

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new GeminiError(`Request was blocked (${blockReason}). Please try a different image or message.`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";
  if (!text) {
    throw new GeminiError("Gemini returned an empty response. Please try again.");
  }
  return text;
}

const CHAT_SYSTEM_INSTRUCTION = `You are Sage, the friendly AI skincare guide inside the DermaCare app.
You help users understand skin concerns, ingredients, routines, and when to see a dermatologist in person.
Keep replies concise (2-5 short sentences, occasionally a short bullet list), warm, and practical.
Never diagnose a medical condition with certainty — describe possibilities and always recommend an in-person
dermatologist visit for anything that looks serious, persistent, or is spreading quickly, or for prescription
medication questions. You are not a substitute for professional medical care.`;

/**
 * Send a chat message, given prior turns, and get Sage's reply.
 * @param {{role: 'user'|'assistant', text: string}[]} history
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function sendChatMessage(history, message) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const text = await callGemini({
    contents,
    systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    generationConfig: { temperature: 0.7, maxOutputTokens: 350 },
  });

  return text.trim();
}

const ANALYSIS_PROMPT = `You are a skincare analysis assistant embedded in the DermaCare app.
Look carefully at the attached photo of a person's skin (face or affected area) and produce a
structured, general-wellness assessment. This is NOT a medical diagnosis.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "condition": string,               // short headline, e.g. "Mild Acne with Some Redness"
  "confidence": number,              // 0-100, your confidence in this general read
  "severity": "mild" | "moderate" | "significant",
  "urgency": "low" | "medium" | "high",
  "concerns": string[],              // 3-5 short, specific observations
  "recommendations": string[],       // 3-6 short, actionable, general skincare tips
  "disclaimer": string               // one sentence reminding this isn't a medical diagnosis
}
If the image does not clearly show skin, set "condition" to "Unable to analyse image" and explain why
in the first item of "concerns", leave other arrays short, and set confidence to 0.`;

/**
 * Analyse a skin photo with Gemini vision and return a structured result.
 * @param {string} base64Data - raw base64 (no data: prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<object>}
 */
export async function analyzeSkinImage(base64Data, mimeType) {
  const contents = [
    {
      role: "user",
      parts: [{ text: ANALYSIS_PROMPT }, { inlineData: { mimeType, data: base64Data } }],
    },
  ];

  const raw = await callGemini({
    contents,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(raw);
  } catch {
    throw new GeminiError("Couldn't parse the analysis result. Please try again.");
  }
}

export { GeminiError };
