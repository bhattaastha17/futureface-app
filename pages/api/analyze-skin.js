// pages/api/analyze-skin.js

import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // ✅ REQUIRED for FormData
  },
};

const PROMPT = (age) => `You are an expert AI dermatologist for Future Face (futureface.ca)...

Analyze this selfie for a ${age}-year-old. Return ONLY raw valid JSON — no markdown, no backticks, no explanation text.

{
  "skinAge": <integer>,
  "skinType": "<Dry|Oily|Combination|Normal|Sensitive>",
  "overallScore": <integer 0-100>,
  "acne": {
    "score": <integer 0-100>,
    "riskLevel": "<Low|Moderate|High>",
    "causes": ["<cause 1>","<cause 2>"],
    "description": "<1 sentence>"
  },
  "wrinkle": {
    "score": <integer 0-100>,
    "riskLevel": "<Low|Moderate|High>",
    "description": "<1 sentence>"
  },
  "pigmentation": {
    "score": <integer 0-100>,
    "riskLevel": "<Low|Moderate|High>",
    "description": "<1 sentence>"
  },
  "hydration": {
    "score": <integer 0-100>,
    "level": "<Dehydrated|Low|Moderate|Good|Excellent>",
    "description": "<1 sentence>"
  },
  "futureSimulation": {
    "year1": "<1 sentence>",
    "year3": "<1 sentence>",
    "year5": "<1 sentence>",
    "withCare": "<1 sentence>"
  },
  "recommendations": ["<tip>","<tip>","<tip>"]
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    // ✅ Parse FormData
    const form = formidable({ multiples: false });

    const [fields, files] = await form.parse(req);

    const file = files.image?.[0];
    const age = fields.age?.[0];

    if (!file || !age) {
      return res.status(400).json({ error: "Image and age required" });
    }

    // ✅ Convert file → base64 (server-side only)
    const fileBuffer = fs.readFileSync(file.filepath);
    const base64 = fileBuffer.toString("base64");

    // ✅ Call Claude Vision
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: file.mimetype || "image/jpeg",
                  data: base64,
                },
              },
              {
                type: "text",
                text: PROMPT(age),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Claude API error", detail: errText });
    }

    const data = await response.json();

    const raw = (data.content || []).map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      console.error("Invalid JSON from Claude:", clean);
      return res.status(500).json({ error: "Invalid AI response" });
    }

    return res.status(200).json({ result });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}