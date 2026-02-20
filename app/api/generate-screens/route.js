import { callAnthropic } from '../../../lib/anthropic';

const SYSTEM_SCREENS = `You are a learning content creator building microlearning screens.
Generate ONLY valid JSON, no markdown, no backticks, no extra text.
Each screen teaches ONE concept. Vice voice: punchy, direct, no fluff.
Include a "trend" field with how this applies in Feb 2026.
Include a "shortcut" field with the mental model or memory device.`;

export async function POST(request) {
  const { topic, lens, sectionTitle, startIdx, count } = await request.json();
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const prompt = `Generate ${count} microlearning screens.
Topic: ${topic}
Lens: ${lens || 'General'}
Section: ${sectionTitle}
Screen numbers: ${startIdx + 1} to ${startIdx + count}

Return ONLY this JSON:
{
  "screens": [
    {
      "id": "screen-${startIdx + 1}",
      "type": "concept|interaction|shortcut|visualization",
      "tag": "01 / TOPIC",
      "headline": "Max 8 words punchy direct",
      "body": "2-3 sentences Vice voice",
      "trend": "How this applies Feb 2026",
      "shortcut": "Mental model or memory device",
      "interaction": {
        "type": "type-answer|reveal|multiple",
        "prompt": "What should user do",
        "target": "correct answer or null",
        "hint": "Single word hint"
      },
      "infographic": {
        "type": "flow|comparison|formula|steps",
        "data": {}
      }
    }
  ]
}

Rules:
- ONE concept per screen
- Interaction required before proceeding
- Include Feb 2026 trend for each
- Include mental shortcut for each
- Direct, Vice voice throughout`;

  try {
    const payload = {
      max_tokens: 2048,
      system: SYSTEM_SCREENS,
      messages: [{ role: "user", content: prompt }],
    };
    const headers = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    };

    const data = await callAnthropic({ payload, headers, initialModel: "claude-3-opus-20240229" });
    const text = data?.content?.[0]?.text || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned || "{}");

    return Response.json({ screens: parsed.screens || [] });
  } catch (error) {
    console.error("Error generating screens:", error);
    return Response.json(
      { error: error.message, screens: [] },
      { status: 500 }
    );
  }
}
