#!/usr/bin/env node

/**
 * Test script to verify the API routes are working correctly
 * Run with: node test-api.js
 */

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("❌ ANTHROPIC_API_KEY not set in environment");
  process.exit(1);
}

console.log("🧪 Testing API routes...\n");

async function testGenerateOutline() {
  console.log("1️⃣  Testing /api/generate-outline...");
  try {
    const response = await fetch("http://localhost:3000/api/generate-outline", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        topic: "machine learning",
        lens: "for beginners",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("   ❌ Failed:", response.status, error.error);
      return false;
    }

    const data = await response.json();
    console.log("   ✅ Success!");
    console.log("   Generated outline:", data.title);
    console.log("   Sections:", data.sections?.length || 0);
    return true;
  } catch (error) {
    console.error("   ❌ Error:", error.message);
    return false;
  }
}

async function testGenerateScreens() {
  console.log("\n2️⃣  Testing /api/generate-screens...");
  try {
    const response = await fetch("http://localhost:3000/api/generate-screens", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        topic: "Python basics",
        lens: "for beginners",
        sectionTitle: "Foundations",
        startIdx: 0,
        count: 2,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("   ❌ Failed:", response.status, error.error);
      return false;
    }

    const data = await response.json();
    console.log("   ✅ Success!");
    console.log("   Generated screens:", data.screens?.length || 0);
    if (data.screens?.[0]) {
      console.log("   First screen headline:", data.screens[0].headline);
    }
    return true;
  } catch (error) {
    console.error("   ❌ Error:", error.message);
    return false;
  }
}

async function testCategorizeScreen() {
  console.log("\n3️⃣  Testing /api/categorize-screen...");
  try {
    const response = await fetch("http://localhost:3000/api/categorize-screen", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        headline: "Understanding Recursion",
        body: "Recursion is when a function calls itself to solve smaller versions of the same problem.",
        topic: "Computer Science",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("   ❌ Failed:", response.status, error.error);
      return false;
    }

    const data = await response.json();
    console.log("   ✅ Success!");
    console.log("   Category:", data.category);
    return true;
  } catch (error) {
    console.error("   ❌ Error:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("Make sure the dev server is running: npm run dev\n");

  const results = [];
  results.push(await testGenerateOutline());
  results.push(await testGenerateScreens());
  results.push(await testCategorizeScreen());

  console.log("\n" + "═".repeat(50));
  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("✅ All tests passed!");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed");
    process.exit(1);
  }
}

// Wait a moment for server to start, then run tests
setTimeout(runTests, 1000);
