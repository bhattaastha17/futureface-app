// pages/api/analyze-skin.js
// Handles FormData (multipart) instead of JSON — avoids Vercel 4.5MB body limit

import { IncomingForm } from "formidable";
import fs from "fs";

const PROMPT = (age) => `You are an expert AI dermatologist for Future Face (futureface.ca), a premium science-based skincare brand.

Analyze this selfie for a ${age}-year-old. Return ONLY raw valid JSON — no markdown, no backticks, no explanation text. Exact structure:

{
  "skinAge": <integer>,
  "skinType": "<Dry|Oily|Combination|Normal|Sensitive>",
  "overallScore": <integer 0-100>,
  "acne": {
    "score": <integer 0-100, 100 = no acne>,
    "riskLevel": "<Low|Moderate|High>",
    "causes": ["<cause 1>","<cause 2>"],
    "description": "<1 insightful sentence>"
  },
  "wrinkle": {
    "score": <integer 0-100, 100 = no wrinkles>,
    "riskLevel": "<Low|Moderate|High>",
    "description": "<1 insightful sentence>"
  },
  "pigmentation": {
    "score": <integer 0-100, 100 = perfectly even tone>,
    "riskLevel": "<Low|Moderate|High>",
    "description": "<1 insightful sentence>"
  },
  "hydration": {
    "score": <integer 0-100, 100 = perfectly hydrated>,
    "level": "<Dehydrated|Low|Moderate|Good|Excellent>",
    "description": "<1 insightful sentence>"
  },
  "futureSimulation": {
    "year1": "<skin in 1 year without any skincare - 1 sentence>",
    "year3": "<skin in 3 years without any skincare - 1 sentence>",
    "year5": "<skin in 5 years without any skincare - 1 sentence>",
    "withCare": "<skin in 5 years with Future Face products and proper daily care - 1 optimistic sentence>"
  },
  "recommendations": ["<specific actionable tip>","<specific actionable tip>","<specific actionable tip>"]
}`;

export const config = {
  api: {
    bodyParser: false, // ✅ required for FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set." });
  }

  // ── Parse FormData ──────────────────────────────────────────────────────────
  const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 });

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const age       = Array.isArray(fields.age)   ? fields.age[0]   : fields.age;
  const imageFile = Array.isArray(files.image)  ? files.image[0]  : files.image;

  if (!imageFile || !age) {
    return res.status(400).json({ error: "image and age are required." });
  }

  // ── Read file → base64 ──────────────────────────────────────────────────────
  const imageBuffer  = fs.readFileSync(imageFile.filepath);
  const imageBase64  = imageBuffer.toString("base64");
  const mimeType     = imageFile.mimetype || "image/jpeg";

  // ── Call Claude ─────────────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text",  text: PROMPT(age) },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Claude API error", detail });
    }

    const data   = await response.json();
    const raw    = (data.content || []).map((b) => b.text || "").join("");
    const clean  = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return res.status(200).json({ result });
  } catch (err) {
    console.error("analyze-skin error:", err);
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}