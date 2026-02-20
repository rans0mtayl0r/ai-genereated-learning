import { callAnthropic } from '../../../lib/anthropic';

const SYSTEM_OUTLINE = `You are a learning experience designer creating microlearning curricula. 
Generate ONLY valid JSON, no markdown, no backticks, no extra text.
Use the Vice magazine voice: intelligent, direct, no corporate speak, treats adult learners like adults.
Each section should flow logically, building from foundations to applications to synthesis.
Include contemporary (Feb 2026) examples and applications throughout.`;

export async function POST(request) {
  const { topic, lens } = await request.json();
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const prompt = `You are an expert curriculum designer. Create a microlearning curriculum for:
Topic: ${topic}
Optional Lens: ${lens || 'None - teach generally'}

Generate ONLY valid JSON with NO markdown formatting, NO backticks, NO extra text:
{
  "title": "Punchy title (max 5 words)",
  "tagline": "One sentence description",
  "totalScreens": 12,
  "estimatedMinutes": 25,
  "sections": [
    {
      "id": "s1",
      "title": "Section title",
      "tag": "01 / LABEL",
      "screens": 4,
      "theme": "What this section teaches"
    }
  ]
}

Rules:
- Include 3-4 sections
- Each section 3-5 screens
- Start with foundations, progress to applications
- If lens provided, weave it throughout as context
- Make it punchy and relevant`;

  try {
    const payload = {
      max_tokens: 1024,
      system: SYSTEM_OUTLINE,
      messages: [{ role: "user", content: prompt }],
    };
    const headers = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    };

    const data = await callAnthropic({ payload, headers, initialModel: "claude-3-opus-20240229" });

    const text = data?.content?.[0]?.text;
    if (!text) {
      return Response.json(
        { error: "Empty response from API" },
        { status: 400 }
      );
    }

    // Clean the response
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[\s\n]*{/, "{")
      .trim();

    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch (error) {
    console.error("Error generating outline:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
