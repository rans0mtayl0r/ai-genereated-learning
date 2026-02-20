# Still experiencing issues, adding this note until my credits refresh.
#!/usr/bin/env python3
"""
Test Anthropic API models
Reads API key from .env.local and tests which models are available
"""

import json
import os
import re
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

# Read .env.local
env_file = Path(__file__).parent / ".env.local"
if not env_file.exists():
    print("❌ .env.local not found")
    exit(1)

api_key = None
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if line.startswith("ANTHROPIC_API_KEY="):
            api_key = line.split("=", 1)[1]
            break

if not api_key:
    print("❌ ANTHROPIC_API_KEY not found in .env.local")
    exit(1)

print("✅ Found API key")
print(f"   Starts with: {api_key[:20]}...")

models_to_test = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet",
    "claude-opus",
    "claude-3-5-haiku-20241022",
    "claude-3-5-haiku",
    "claude-3-opus-20240229",
    "claude-3-opus",
    "claude-3-sonnet-20240229",
    "claude-3-sonnet",
]

print("\n🧪 Testing Anthropic API Models")
print("=" * 50)

results = {}
for model in models_to_test:
    print(f"\n📝 Testing: {model}")
    
    data = {
        "model": model,
        "max_tokens": 100,
        "messages": [
            {
                "role": "user",
                "content": "Say OK"
            }
        ]
    }
    
    try:
        req = Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps(data).encode(),
            headers={
                "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            method="POST"
        )
        
        response = urlopen(req, timeout=10)
        result = json.loads(response.read().decode())
        
        if response.status == 200:
            print(f"   ✅ SUCCESS")
            results[model] = "✅"
        else:
            print(f"   ❌ HTTP {response.status}")
            results[model] = "❌"
            
    except URLError as e:
        error_msg = e.read().decode() if hasattr(e, 'read') else str(e)
        print(f"   ❌ Request failed: {e.code if hasattr(e, 'code') else 'unknown'}")
        
        # Try to parse error from response
        try:
            error_data = json.loads(error_msg)
            if 'error' in error_data:
                print(f"      {error_data['error'].get('message', error_msg)}")
        except:
            print(f"      {error_msg[:100]}")
        
        results[model] = "❌"
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results[model] = "❌"

print("\n" + "=" * 50)
print("\nSummary:")
for model, status in results.items():
    print(f"  {status} {model}")

if all(v == "❌" for v in results.values()):
    print("\n❌ No models worked!")
else:
    print("\n✅ Some models worked!")
