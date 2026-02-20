export async function callAnthropic({ payload = {}, headers = {}, initialModel = null, candidates = [] } = {}) {
  // Local stub mode for offline testing / simulated user interaction
  const stubFlag = (typeof process !== 'undefined' && (process.env.ANTHROPIC_STUB === '1' || String(process.env.ANTHROPIC_STUB).toLowerCase() === 'true'));
  if (stubFlag) {
    // Try to infer intent from payload/messages
    const msg = (payload.messages && payload.messages[0] && payload.messages[0].content) || '';

    // Outline stub
    if (/microlearning curriculum|Create a microlearning curriculum/i.test(msg) || /Generate ONLY valid JSON.*title/i.test(payload.system || '')) {
      const outline = {
        title: 'LSAT Mastery',
        tagline: 'High-yield strategies for a perfect score',
        totalScreens: 12,
        estimatedMinutes: 30,
        sections: [
          { id: 's1', title: 'Foundations', tag: '01 / FOUND', screens: 4, theme: 'Core logic skills' },
          { id: 's2', title: 'Applied Techniques', tag: '02 / TECH', screens: 4, theme: 'Test strategies' },
          { id: 's3', title: 'Synthesis', tag: '03 / SYN', screens: 4, theme: 'Timed practice & review' }
        ]
      };
      return { content: [{ text: JSON.stringify(outline) }] };
    }

    // Screens stub
    if (/Generate \d+ microlearning screens/i.test(msg) || /Each screen teaches ONE concept/i.test(payload.system || '')) {
      const screens = {
        screens: [
          { id: 'screen-1', type: 'concept', tag: '01 / LOGIC', headline: 'Identify the conclusion', body: 'Look for indicator words and the main claim.', trend: 'AI-assisted item analysis (Feb 2026)', shortcut: 'Conclusion-first' , interaction: { type: 'type-answer', prompt: 'What is the main claim?', target: 'The main claim', hint: 'Look for therefore' }, infographic: { type: 'steps', data: {} } },
          { id: 'screen-2', type: 'interaction', tag: '01 / LOGIC', headline: 'Find the assumption', body: 'Spot the gap between evidence and conclusion.', trend: 'Focus on assumptions in modern LSAT prep', shortcut: 'Gap-spot', interaction: { type: 'multiple', prompt: 'Which option is an assumption?', target: null, hint: 'Unsupported presumption' }, infographic: { type: 'comparison', data: {} } }
        ]
      };
      return { content: [{ text: JSON.stringify(screens) }] };
    }

    // Categorize stub (return one of known categories)
    if (/Categorize this learning screen/i.test(msg)) {
      // pick category by simple keyword checks
      const text = msg;
      const categories = ['Math', 'Data', 'Code', 'History', 'Science', 'Business'];
      let pick = 'Math';
      if (/code|javascript|python/i.test(text)) pick = 'Code';
      else if (/data|statistics|analysis/i.test(text)) pick = 'Data';
      else if (/history|timeline/i.test(text)) pick = 'History';
      else if (/science|biology|chemistry/i.test(text)) pick = 'Science';
      else if (/business|market|product/i.test(text)) pick = 'Business';
      return { content: [{ text: pick }] };
    }

    // Default generic stub
    return { content: [{ text: JSON.stringify({ message: 'stub response' }) }] };
  }
  const apiUrl = "https://api.anthropic.com/v1/messages";

  const defaultCandidates = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet",
    "claude-3-5-haiku-20241022",
    "claude-3-5-haiku",
    "claude-3-opus-20240229",
    "claude-3-opus",
    "claude-3-sonnet-20240229",
    "claude-3-sonnet",
  ];

  // Build ordered list of models to try
  const seen = new Set();
  const models = [];
  if (initialModel) {
    models.push(initialModel);
    seen.add(initialModel);
  }
  for (const m of (candidates.length ? candidates : defaultCandidates)) {
    if (!seen.has(m)) {
      models.push(m);
      seen.add(m);
    }
  }

  for (const model of models) {
    try {
      const body = { ...payload, model };
      const res = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      // Try to parse response text safely
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = { raw: text }; }

      if (res.ok) {
        return data;
      }

      // If model not found, continue to next candidate
      if (res.status === 404 && data && data.error && data.error.type === 'not_found_error') {
        // try next model
        console.warn(`Model not found: ${model} (trying next)`);
        continue;
      }

      // For other non-ok responses, throw with details
      const err = new Error(`Anthropic API error: ${res.status}`);
      err.status = res.status;
      err.body = data;
      throw err;
    } catch (err) {
      // If network or non-model error, surface it
      if (err && err.status && err.status !== 404) throw err;
      // otherwise continue to next model candidate
      console.warn(`Attempt for model ${model} failed: ${err?.message || err}`);
    }
  }

  // If we get here, no model produced a successful response
  const e = new Error('No available Anthropic model accepted the request');
  e.type = 'model_not_found_all_candidates';
  throw e;
}

export default callAnthropic;
