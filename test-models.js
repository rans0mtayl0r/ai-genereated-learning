#!/usr/bin/env node

/**
 * Direct Anthropic API test
 * This tests the actual Anthropic API to see what models are available
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("❌ ANTHROPIC_API_KEY not set");
  process.exit(1);
}

async function testModel(modelName) {
  console.log(`\n📝 Testing model: ${modelName}`);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2024-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Say 'OK' only",
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`   ❌ Failed: ${response.status}`);
      console.log(`   Error: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }

    const reply = data.content?.[0]?.text;
    console.log(`   ✅ Success! Response: ${reply}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🧪 Testing Anthropic API Models");
  console.log("================================\n");

  // Try different model names
  const modelsToTest = [
    "claude-3-5-sonnet",
    "claude-3-5-sonnet-20241022",
    "claude-opus",
    "claude-3-5-haiku",
    "claude-3-5-haiku-20241022",
    "claude-3-opus",
    "claude-3-opus-20240229",
    "claude-3-sonnet",
    "claude-3-sonnet-20240229",
  ];

  const results = {};
  let succeeded = false;

  for (const model of modelsToTest) {
    results[model] = await testModel(model);
    if (results[model]) {
      succeeded = true;
      console.log(`\n✅ Model "${model}" works!`);
      console.log("\nUpdate the API routes to use: " + model);
      break;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Summary:");
  Object.entries(results).forEach(([model, success]) => {
    console.log(`  ${success ? "✅" : "❌"} ${model}`);
  });

  if (!succeeded) {
    console.log("\n❌ None of the models worked!");
    console.log("This could mean:");
    console.log("1. API key is invalid or has no access");
    console.log("2. API has changed or models are unavailable");
    console.log("3. Network/auth issue with Anthropic API");
  } else {
    console.log("\n✅ Found working model!");
  }
}

main().catch(console.error);
