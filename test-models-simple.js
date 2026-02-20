#!/usr/bin/env node

/**
 * Simple model test without dotenv dependency
 */

// Read .env.local directly
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const envLines = envContent.split('\n').filter(line => line && !line.startsWith('#'));

const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  env[key.trim()] = valueParts.join('=').trim();
});

const apiKey = env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("❌ ANTHROPIC_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("✅ Found API key in .env.local");
console.log(`Key starts with: ${apiKey.substring(0, 20)}...`);

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
      const errorMsg = data.error?.message || JSON.stringify(data);
      console.log(`   Error: ${errorMsg}`);
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
  console.log("\n🧪 Testing Anthropic API Models");
  console.log("================================\n");

  // Try different model names - updated for Feb 2026
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
  let succeeded = false;

  for (const model of modelsToTest) {
    results[model] = await testModel(model);
    if (results[model]) {
      succeeded = true;
      console.log(`\n✅ Model "${model}" works!`);
      console.log("Update the API routes to use: " + model);
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
