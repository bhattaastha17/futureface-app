// pages/api/analyze-skin.js
// Proxies the Claude Vision API call server-side so ANTHROPIC_API_KEY
// is never exposed to the browser.

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, mimeType, age } = req.body;

  if (!imageBase64 || !age) {
    return res.status(400).json({ error: "imageBase64 and age are required." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
  }

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
            { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: imageBase64 } },
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
