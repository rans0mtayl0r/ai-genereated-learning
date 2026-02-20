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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return Response.json({ category: "Default" });
    }

    const data = await response.json();
    const cat = (data.content?.[0]?.text || "Default").trim();
    const category = categories.includes(cat) ? cat : "Default";
    
    return Response.json({ category });
  } catch (error) {
    console.error("Error categorizing screen:", error);
    return Response.json({ category: "Default" });
  }
}
