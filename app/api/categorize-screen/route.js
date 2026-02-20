import { callAnthropic } from '../../../lib/anthropic';

export async function POST(request) {
  const { headline, body, topic } = await request.json();
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return Response.json(
      { category: "Default" },
      { status: 200 }
    );
  }

  const categories = ["Math", "Data", "Code", "History", "Science", "Business"];
  const prompt = `Categorize this learning screen into ONE category: ${categories.join(", ")}
Headline: ${headline}
Body: ${body}
Topic: ${topic}

Respond with ONLY the category name, nothing else.`;

  try {
    const payload = {
      max_tokens: 10,
      messages: [{ role: "user", content: prompt }],
    };
    const headers = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    };

    const data = await callAnthropic({ payload, headers, initialModel: "claude-3-opus-20240229" });
    const cat = (data?.content?.[0]?.text || "Default").trim();
    const category = categories.includes(cat) ? cat : "Default";

    return Response.json({ category });
  } catch (error) {
    console.error("Error categorizing screen:", error);
    return Response.json({ category: "Default" });
  }
}
