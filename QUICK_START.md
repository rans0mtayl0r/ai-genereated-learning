# 🚀 Quick Start (Copy & Paste)

## Option 1: Run Everything in Terminal

```bash
# Navigate to project
cd /workspaces/ai-genereated-learning

# Start dev server
npm run dev
```

Then open in browser: `http://localhost:3000`

Press `F12` to open DevTools and watch the console.

---

## Option 2: What to Test

### Test 1: Verify Diagnostics (Immediate)
1. Open http://localhost:3000
2. Press F12 (DevTools)
3. You should see:
   ```
   🔍 DIAGNOSTIC TEST STARTING
   1️⃣ Environment Variables:
      - NEXT_PUBLIC_ANTHROPIC_API_KEY exists: true
      - Key length: 212
   2️⃣ Testing API Connection:
      HTTP Status: 200 ✅
   ```

**Expected Result**: Green checkmarks, HTTP 200

---

### Test 2: Generate Curriculum (Main Feature)
1. Enter topic: `"Machine Learning Basics"`
2. Enter lens: `"For Non-Technical People"`
3. Click "Generate Curriculum"
4. Watch console for API response

**Expected Result**: Curriculum with 3-4 sections appears

---

### Test 3: Start Learning (Full Workflow)
1. Click "Start Learning" on a section
2. Type an answer to the question
3. Press Enter or click Next
4. Progress bar updates

**Expected Result**: Screen transitions, knowledge graph updates

---

## 🆘 If Something Breaks

### Error in Console?
Copy the error message and check:

| What You See | Likely Issue |
|---|---|
| `HTTP Status: 401` | API key is invalid |
| `HTTP Status: 429` | Rate limit - wait 1 minute |
| `❌ API Test Failed: fetch` | Network problem - check internet |
| `Cannot parse JSON` | Response format issue |
| No diagnostic output at all | Page not loading - try Ctrl+Shift+R |

### Quick Fixes
```bash
# Hard refresh
Ctrl+Shift+R  (Windows/Linux)
Cmd+Shift+R   (Mac)

# Restart dev server
# 1. Press Ctrl+C in terminal running npm run dev
# 2. Run: npm run dev
# 3. Refresh browser

# Clear everything
# In DevTools: Application > Storage > Clear Site Data
# Then refresh page
```

---

## 📊 Feature Checklist

Once running, you should see:

- [ ] **Home Screen**
  - [ ] Title: "🧠 Adaptive Learning Platform"
  - [ ] Two input fields (topic, lens)
  - [ ] "Generate Curriculum" button
  - [ ] Three pre-built tracks below

- [ ] **After Generating Outline**
  - [ ] Curriculum title appears
  - [ ] 3-4 sections listed
  - [ ] Estimated time shown
  - [ ] "Start Learning" buttons

- [ ] **Learning Screen**
  - [ ] One screen at a time
  - [ ] Question/content displayed
  - [ ] Input field for typing answer
  - [ ] Progress bar
  - [ ] Navigation buttons

- [ ] **Knowledge Base**
  - [ ] Neural network graph
  - [ ] Nodes for learned topics
  - [ ] Nodes colored by category
  - [ ] Edges showing relationships

---

## 💡 Pro Tips

### Good Topics to Try
- "Python for Data Science"
- "Web Development with React"
- "Statistical Analysis"
- "Database Design"

### Good Lenses to Try
- "For Complete Beginners"
- "For Visual Learners"
- "Focusing on Real-World Projects"
- "For Musicians"

---

## 📞 When Something Doesn't Work

Please provide:

1. What you were trying to do
2. What you see on the page
3. What's in the console (F12 → Console tab)
4. The exact error message (copy/paste)

Example message:
```
I entered "Machine Learning" and got:
- Failed to generate outline
- Console shows: HTTP Status: 401
- This means the API key is invalid
```

---

## 🎯 Success Indicators

✅ **Everything is working if you see:**
1. Diagnostic output in console on page load
2. HTTP Status: 200 in diagnostic test
3. Curriculum outline appears after entering a topic
4. Can click through learning screens
5. Progress bar updates as you complete screens

---

## Questions?

Check these files in the project:
- `TESTING_GUIDE.md` - Detailed step-by-step guide
- `CHANGES.md` - Technical details of what was fixed
- `README.md` - General project information
