export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return Response.json({
      status: "error",
      message: "API key not configured",
    });
  }

  // Test different model names
  const modelsToTest = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet",
    "claude-opus",
    "claude-3-5-haiku-20241022",
    "claude-3-5-haiku",
    "claude-3-opus-20240229",
    "claude-3-opus",
    "claude-3-sonnet-20240229",
    "claude-3-sonnet",
  ];

  const results = {};

  for (const model of modelsToTest) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2024-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 50,
          messages: [
            {
              role: "user",
              content: "Say OK",
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        results[model] = {
          status: "✅ SUCCESS",
          message: "Model works!",
        };
      } else {
        results[model] = {
          status: "❌ FAILED",
          statusCode: response.status,
          error: data.error?.message || JSON.stringify(data),
        };
      }
    } catch (error) {
      results[model] = {
        status: "❌ ERROR",
        error: error.message,
      };
    }
  }

  return Response.json({
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey?.substring(0, 20) + "...",
    modelTests: results,
  });
}
