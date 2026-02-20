'use client';

import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES + FONTS
═══════════════════════════════════════════════════════════════════ */
function createStyleElement() {
  if (typeof document === "undefined") {
    console.log("[styles] Skipping: SSR environment");
    return;
  }
  
  if (document.getElementById("alp-styles")) {
    console.log("[styles] Already injected");
    return;
  }
  
  try {
    const s = document.createElement("style");
    s.id = "alp-styles";
    s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Courier+Prime:wght@400;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a14;color:#f5f5f8;line-height:1.6;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
    h1,h2,h3,h4,h5,h6{font-weight:700;line-height:1.3;letter-spacing:-0.01em}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#12121f}::-webkit-scrollbar-thumb{background:#3a3a52;border-radius:2px}
    input,textarea{font-family:'Courier Prime','IBM Plex Mono',monospace;background:#1a1a2e;border:2px solid #2d2d45;color:#f5f5f8;padding:12px;border-radius:6px;font-size:14px;line-height:1.5}
    input:focus,textarea:focus{outline:none;border-color:#00d9ff;box-shadow:0 0 0 3px rgba(0,217,255,0.1)}
    input::placeholder,textarea::placeholder{color:#787894}
    button{transition:all 0.2s ease}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
    @keyframes pop{0%{transform:scale(0.95)}100%{transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes stroke-dash{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}
    .slide-up{animation:slideUp .4s cubic-bezier(.16,1,.3,1) both}
    .fade-in{animation:fadeIn .3s ease}
    .pop{animation:pop .25s ease}
    .shake{animation:shake .3s ease}
    .pulse{animation:pulse 1.5s ease-in-out infinite}
    svg .animated-stroke{stroke-dasharray:300;animation:stroke-dash 2s ease-in-out}
  `;
    document.head.appendChild(s);
    console.log("[styles] Injected successfully");
  } catch (e) {
    console.error("[styles] Error injecting styles:", e);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS - COOL COLORS, HIGH CONTRAST
═══════════════════════════════════════════════════════════════════ */
const T = {
  bg:"#0a0a14", s1:"#12121f", s2:"#1a1a2e", s3:"#242438",
  border:"#2d2d45", border2:"#3a3a52",
  text:"#f5f5f8", sub:"#b0b0c8", muted:"#787894", dim:"#464660",
  accent:"#00d9ff", accentSoft:"#0099cc", success:"#00d97e", warning:"#00b4cc",
};

const KB_COLORS = {
  Math:"#00d9ff", Data:"#00d97e", Code:"#0099cc", History:"#00b4cc", Science:"#7b68ee", Business:"#00d9ff", Default:"#787894"
};

/* ═══════════════════════════════════════════════════════════════════
   KNOWLEDGE BASE STORAGE
═══════════════════════════════════════════════════════════════════ */
const KB = {
  saveNode: (node) => {
    try {
      const nodes = JSON.parse(localStorage.getItem("kb:nodes") || "[]");
      const existing = nodes.findIndex(n => n.id === node.id);
      if (existing >= 0) nodes[existing] = node;
      else nodes.push(node);
      localStorage.setItem("kb:nodes", JSON.stringify(nodes));
    } catch(e) { console.error("KB save error:", e); }
  },
  getNodes: () => {
    try { return JSON.parse(localStorage.getItem("kb:nodes") || "[]"); }
    catch(e) { return []; }
  },
  getByCategory: (cat) => {
    return KB.getNodes().filter(n => n.category === cat);
  },
  getTrendTopics: () => {
    const nodes = KB.getNodes();
    const topics = {};
    nodes.forEach(n => {
      topics[n.topic] = (topics[n.topic] || 0) + 1;
    });
    return topics;
  }
};

/* ═══════════════════════════════════════════════════════════════════
   ANTHROPIC API HELPERS
═══════════════════════════════════════════════════════════════════ */

async function generateOutline(topic, lens) {
  console.group("📚 Generate Outline");
  console.log("Topic:", topic);
  console.log("Lens:", lens);
  
  try {
    const response = await fetch("/api/generate-outline", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic, lens }),
    });
    
    console.log("📡 Response status:", response.status);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    const parsed = await response.json();
    console.log("✅ Successfully parsed:", parsed.title);
    console.groupEnd();
    return parsed;
    
  } catch(e) {
    console.error("❌ Error:", e.message);
    console.groupEnd();
    alert(`Failed to generate outline:\n\n${e.message}`);
    return null;
  }
}

async function generateScreens(topic, lens, sectionTitle, startIdx, count) {
  try {
    const response = await fetch("/api/generate-screens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic, lens, sectionTitle, startIdx, count }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const { screens } = await response.json();
    return screens || [];
  } catch(e) {
    console.error("Screen generation failed:", e);
    return [];
  }
}

async function categorizeScreen(screen, topic) {
  try {
    const response = await fetch("/api/categorize-screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        headline: screen.headline,
        body: screen.body,
        topic,
      }),
    });

    const { category } = await response.json();
    return category || "Default";
  } catch(e) {
    return "Default";
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SVG INFOGRAPHICS
═══════════════════════════════════════════════════════════════════ */
function InfographicFlow({ data }) {
  const steps = data?.steps || [];
  const w = 380, h = 240;
  const boxWidth = 100, boxHeight = 50, spacing = 50;
  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto" }}>
      {steps.map((step, i) => {
        const x = 30 + i * (boxWidth + spacing);
        const y = 95;
        return (
          <g key={i} className="slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <rect x={x} y={y} width={boxWidth} height={boxHeight} fill={`${T.accent}20`} stroke={T.accent} rx={4} />
            <text x={x + boxWidth/2} y={y + 28} fill={T.accent} fontSize={12} textAnchor="middle" fontFamily="Barlow Condensed">{step}</text>
            {i < steps.length - 1 && (
              <g>
                <line x1={x + boxWidth + 10} y1={y + boxHeight/2} x2={x + boxWidth + 30} y2={y + boxHeight/2} stroke={T.border2} strokeWidth={2} markerEnd="url(#arrow)" />
              </g>
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill={T.accent} />
        </marker>
      </defs>
    </svg>
  );
}

function InfographicComparison({ data }) {
  const { before = "Before", after = "After" } = data || {};
  const w = 340, h = 180;
  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto" }}>
      <g className="pop">
        <rect x={20} y={40} width={140} height={100} fill={`#ff000010`} stroke="#555" rx={6} />
        <text x={90} y={60} fill={T.sub} fontSize={13} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700">❌ {before}</text>
        <text x={90} y={100} fill={T.muted} fontSize={11} textAnchor="middle" fontFamily="Barlow">Slow, error-prone</text>
      </g>
      <g style={{ animationDelay: "0.1s" }} className="pop">
        <line x1={170} y1={90} x2={200} y2={90} stroke={T.accent} strokeWidth={2} markerEnd="url(#arrow2)" />
      </g>
      <g style={{ animationDelay: "0.2s" }} className="pop">
        <rect x={210} y={40} width={140} height={100} fill={`${T.accent}10`} stroke={T.accent} rx={6} />
        <text x={280} y={60} fill={T.accent} fontSize={13} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700">✓ {after}</text>
        <text x={280} y={100} fill={T.muted} fontSize={11} textAnchor="middle" fontFamily="Barlow">Fast, accurate</text>
      </g>
      <defs>
        <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill={T.accent} />
        </marker>
      </defs>
    </svg>
  );
}

function InfographicSteps({ data }) {
  const items = data?.items || [];
  const w = 360, h = 40 + items.length * 45;
  return (
    <svg width={w} height={h} style={{ display: "block", margin: "40px auto" }}>
      {items.map((item, i) => (
        <g key={i} className="fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
          <circle cx={30} cy={35 + i * 45} r={16} fill={T.accent} />
          <text x={30} y={41} fill={T.bg} fontSize={14} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight="700">{i + 1}</text>
          <text x={60} y={41} fill={T.text} fontSize={12} fontFamily="Barlow">{item}</text>
        </g>
      ))}
    </svg>
  );
}

function InfographicFormula({ data }) {
  const { formula = "", explanation = "" } = data || {};
  return (
    <div style={{ padding: "30px", margin: "20px 0", border: `1px solid ${T.border2}`, borderRadius: "8px", background: T.s1 }}>
      <div style={{ fontSize: "18px", fontFamily: "IBM Plex Mono", color: T.accent, textAlign: "center", marginBottom: "15px" }}>
        {formula}
      </div>
      <div style={{ fontSize: "12px", color: T.muted, textAlign: "center" }}>{explanation}</div>
    </div>
  );
}

function Infographic({ type, data }) {
  if (!type) return null;
  if (type === "flow") return <InfographicFlow data={data} />;
  if (type === "comparison") return <InfographicComparison data={data} />;
  if (type === "steps") return <InfographicSteps data={data} />;
  if (type === "formula") return <InfographicFormula data={data} />;
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   KNOWLEDGE GRAPH VISUALIZATION
═══════════════════════════════════════════════════════════════════ */
function KnowledgeGraph() {
  const nodes = KB.getNodes();
  const categories = {};
  
  nodes.forEach(n => {
    const cat = n.category || "Default";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(n);
  });

  const w = 600, h = 400;
  const centerX = w / 2, centerY = h / 2, radius = 120;
  
  let nodePositions = {};
  let idx = 0;
  Object.entries(categories).forEach(([cat, catNodes]) => {
    const angle = (idx * 2 * Math.PI) / Object.keys(categories).length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions[cat] = { x, y, color: KB_COLORS[cat] || KB_COLORS.Default };
    
    catNodes.forEach((n, i) => {
      const subAngle = angle + (i + 1) * 0.3;
      const subX = x + 60 * Math.cos(subAngle);
      const subY = y + 60 * Math.sin(subAngle);
      nodePositions[n.id] = { x: subX, y: subY, color: KB_COLORS[cat] || KB_COLORS.Default };
    });
    idx++;
  });

  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto", background: T.s1, borderRadius: "8px" }}>
      {/* Edges */}
      {Object.entries(categories).map(([cat, catNodes]) =>
        catNodes.map((n, i) => {
          const pos = nodePositions[n.id];
          const catPos = nodePositions[cat];
          if (!pos || !catPos) return null;
          return (
            <line key={`edge-${n.id}`} x1={catPos.x} y1={catPos.y} x2={pos.x} y2={pos.y} stroke={T.border2} strokeWidth={1} />
          );
        })
      )}
      
      {/* Category nodes (large) */}
      {Object.entries(nodePositions).map(([key, pos]) => {
        if (key.startsWith("s-")) return null; // skip individual nodes for larger view
        const isCat = !key.includes("-");
        if (!isCat) return null;
        return (
          <g key={key}>
            <circle cx={pos.x} cy={pos.y} r={12} fill={pos.color} opacity={0.8} />
            <text x={pos.x} y={pos.y + 3} fill={T.bg} fontSize={10} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700">
              {key.charAt(0).toUpperCase()}
            </text>
          </g>
        );
      })}
      
      {/* Individual screen nodes (small) */}
      {nodes.map((n) => {
        const pos = nodePositions[n.id];
        if (!pos) return null;
        return (
          <circle key={n.id} cx={pos.x} cy={pos.y} r={6} fill={pos.color} opacity={0.5} />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTERACTION HANDLERS
═══════════════════════════════════════════════════════════════════ */
function InteractionZone({ screen, onComplete }) {
  const [response, setResponse] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [shaking, setShaking] = useState(false);
  const ref = useRef();

  const interaction = screen.interaction || {};
  const isCorrect = (val) => {
    if (!interaction.target) return true;
    const normalized = (s) => s.toLowerCase().trim().replace(/[^\w]/g, "");
    return normalized(val) === normalized(interaction.target);
  };

  const handleSubmit = async () => {
    if (!response.trim()) return;
    
    if (isCorrect(response)) {
      onComplete(screen);
    } else {
      setAttempts(attempts + 1);
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
      
      if (attempts + 1 >= 3) {
        setRevealed(true);
      }
    }
  };

  return (
    <div className={shaking ? "shake" : ""} style={{ marginTop: "30px" }}>
      <label style={{ display: "block", marginBottom: "10px", fontSize: "12px", color: T.sub, fontFamily: "Barlow Condensed", fontWeight: "700" }}>
        {interaction.prompt}
      </label>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          ref={ref}
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={interaction.hint || "Type here..."}
          style={{ flex: 1, borderColor: revealed ? T.accent : T.border }}
          disabled={revealed}
        />
        <button
          onClick={handleSubmit}
          disabled={revealed}
          style={{
            padding: "10px 20px",
            background: revealed ? T.dim : T.accent,
            color: T.bg,
            border: "none",
            borderRadius: "6px",
            fontFamily: "Barlow Condensed",
            fontWeight: "700",
            cursor: revealed ? "default" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {revealed ? "✓ Revealed" : "Submit"}
        </button>
      </div>
      
      {revealed && (
        <div style={{ marginTop: "15px", padding: "12px", background: T.s2, borderRadius: "6px", borderLeft: `3px solid ${T.accent}`, fontSize: "12px", color: T.text }}>
          <strong>Answer:</strong> {interaction.target}
          {screen.shortcut && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${T.border}` }}>
              <strong>💡 Mental Model:</strong> {screen.shortcut}
            </div>
          )}
          {screen.trend && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${T.border}` }}>
              <strong>📡 RIGHT NOW (Feb 2026):</strong> {screen.trend}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCREEN COMPONENTS
═══════════════════════════════════════════════════════════════════ */
function HomeScreen({ onSelectTrack, onCustomTopic }) {
  const [topic, setTopic] = useState("");
  const [lens, setLens] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustom = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    onCustomTopic(topic, lens);
  };

  return (
    <div className="slide-up" style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 40px" }}>
      <h1 style={{ fontSize: "48px", fontFamily: "Barlow Condensed", fontWeight: "900", marginBottom: "16px", lineHeight: "1.2" }}>
        Learn anything.<br />Build muscle memory.
      </h1>
      <p style={{ fontSize: "14px", color: T.sub, marginBottom: "60px", lineHeight: "1.6" }}>
        Enter any topic. Optional lens. AI builds your personalized curriculum. Forced interactions lock it in. Feb 2026 examples show you what's real.
      </p>

      <div>
        <h3 style={{ fontSize: "13px", fontFamily: "Barlow Condensed", fontWeight: "700", color: T.muted, marginBottom: "16px", textTransform: "uppercase" }}>
          Build your own
        </h3>
        <input
          type="text"
          placeholder="E.g., options trading, machine learning, medieval architecture"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustom()}
          style={{ width: "100%", marginBottom: "12px" }}
        />
        <input
          type="text"
          placeholder="Optional lens (e.g., hip hop industry, for beginners, in Japanese)"
          value={lens}
          onChange={(e) => setLens(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustom()}
          style={{ width: "100%", marginBottom: "16px" }}
        />
        <button
          onClick={handleCustom}
          disabled={!topic.trim() || loading}
          style={{
            width: "100%",
            padding: "14px",
            background: !topic.trim() || loading ? T.dim : T.accent,
            color: T.bg,
            border: "none",
            borderRadius: "6px",
            fontFamily: "Barlow Condensed",
            fontWeight: "700",
            fontSize: "14px",
            cursor: !topic.trim() || loading ? "default" : "pointer",
          }}
        >
          {loading ? "Generating outline..." : "Generate Curriculum"}
        </button>
      </div>

      <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: "13px", fontFamily: "Barlow Condensed", fontWeight: "700", color: T.muted, marginBottom: "16px", textTransform: "uppercase" }}>
          Or explore pre-built tracks
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {[
            { id: "math", label: "Math Foundations", icon: "∑" },
            { id: "sql", label: "SQL for Analytics", icon: "⌘" },
            { id: "combo", label: "Math Meets Data", icon: "◈" },
          ].map(track => (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              style={{
                padding: "20px",
                background: T.s2,
                border: `1px solid ${T.border2}`,
                borderRadius: "8px",
                color: T.text,
                fontFamily: "Barlow Condensed",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = T.accent; e.target.style.background = `${T.accent}10`; }}
              onMouseLeave={(e) => { e.target.style.borderColor = T.border2; e.target.style.background = T.s2; }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{track.icon}</div>
              {track.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutlineScreen({ outline, topic, lens, onStart, onBack }) {
  return (
    <div className="slide-up" style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 40px" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: T.sub,
          fontFamily: "Barlow Condensed",
          cursor: "pointer",
          marginBottom: "30px"
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: "32px", fontFamily: "Barlow Condensed", fontWeight: "900", marginBottom: "8px" }}>
        {outline.title}
      </h2>
      <p style={{ fontSize: "13px", color: T.sub, marginBottom: "8px" }}>{topic} {lens && `• ${lens}`}</p>
      <p style={{ fontSize: "14px", color: T.text, marginBottom: "40px" }}>{outline.tagline}</p>

      <div style={{ display: "grid", gap: "20px", marginBottom: "40px" }}>
        {outline.sections.map((section, i) => (
          <div key={section.id} style={{ padding: "20px", background: T.s2, borderRadius: "8px", borderLeft: `3px solid ${T.accent}` }}>
            <div style={{ fontSize: "12px", color: T.muted, fontFamily: "IBM Plex Mono", marginBottom: "6px" }}>{section.tag}</div>
            <h3 style={{ fontSize: "16px", fontFamily: "Barlow Condensed", fontWeight: "700", marginBottom: "6px" }}>{section.title}</h3>
            <p style={{ fontSize: "12px", color: T.sub, marginBottom: "8px" }}>{section.theme}</p>
            <div style={{ fontSize: "11px", color: T.muted }}>~{section.screens} screens</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px", color: T.muted, marginBottom: "30px", padding: "16px", background: T.s1, borderRadius: "8px" }}>
        <div>📚 Total: ~{outline.totalScreens} screens</div>
        <div>⏱️ ~{outline.estimatedMinutes} minutes</div>
      </div>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "16px",
          background: T.accent,
          color: T.bg,
          border: "none",
          borderRadius: "6px",
          fontFamily: "Barlow Condensed",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Start Learning →
      </button>
    </div>
  );
}

function LearningScreen({ screen, outline, allScreens, currentIdx, onComplete, onNavigate, onViewKB }) {
  const total = allScreens.length;
  const progress = ((currentIdx + 1) / total) * 100;
  const [answered, setAnswered] = useState(false);

  const handleComplete = async (completedScreen) => {
    const category = await categorizeScreen(completedScreen, "current-topic");
    const node = {
      id: `${Date.now()}`,
      ...completedScreen,
      category,
      completedAt: new Date().toISOString()
    };
    KB.saveNode(node);
    setAnswered(true);
    setTimeout(() => onComplete(), 500);
  };

  return (
    <div className="slide-up" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 40px", borderBottom: `1px solid ${T.border}`, background: T.s1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: T.muted, fontFamily: "IBM Plex Mono" }}>
              {currentIdx + 1} / {total}
            </span>
            <button
              onClick={onViewKB}
              style={{
                background: "none",
                border: "none",
                color: T.sub,
                fontFamily: "Barlow Condensed",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Knowledge Base
            </button>
          </div>
          <div style={{ height: "4px", background: T.s2, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: T.accent, width: `${progress}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "60px 40px", maxWidth: "700px", margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: "12px", color: T.muted, fontFamily: "IBM Plex Mono", marginBottom: "20px", textTransform: "uppercase" }}>
          {screen.tag}
        </div>
        <h2 style={{ fontSize: "32px", fontFamily: "Barlow Condensed", fontWeight: "900", marginBottom: "24px", lineHeight: "1.2" }}>
          {screen.headline}
        </h2>
        <div style={{ fontSize: "14px", color: T.text, marginBottom: "30px", lineHeight: "1.7" }}>
          {screen.body}
        </div>

        {screen.infographic && (
          <div style={{ margin: "40px 0" }}>
            <Infographic type={screen.infographic.type} data={screen.infographic.data} />
          </div>
        )}

        {!answered && screen.interaction && (
          <InteractionZone screen={screen} onComplete={handleComplete} />
        )}

        {answered && (
          <div style={{ marginTop: "40px", padding: "20px", background: `${T.accent}20`, borderRadius: "8px", border: `1px solid ${T.accent}` }}>
            <div style={{ fontSize: "14px", color: T.accent, fontFamily: "Barlow Condensed", fontWeight: "700", marginBottom: "10px" }}>
              ✓ Concept locked in
            </div>
            <div style={{ fontSize: "12px", color: T.sub }}>Now saved to your knowledge base and growing your neural network...</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding: "30px 40px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", gap: "12px" }}>
          <button
            onClick={() => onNavigate(-1)}
            disabled={currentIdx === 0}
            style={{
              flex: 1,
              padding: "12px",
              background: currentIdx === 0 ? T.dim : T.s2,
              color: currentIdx === 0 ? T.muted : T.text,
              border: `1px solid ${T.border2}`,
              borderRadius: "6px",
              fontFamily: "Barlow Condensed",
              cursor: currentIdx === 0 ? "default" : "pointer"
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => onNavigate(1)}
            disabled={!answered || currentIdx === total - 1}
            style={{
              flex: 1,
              padding: "12px",
              background: (!answered || currentIdx === total - 1) ? T.dim : T.accent,
              color: T.bg,
              border: "none",
              borderRadius: "6px",
              fontFamily: "Barlow Condensed",
              cursor: (!answered || currentIdx === total - 1) ? "default" : "pointer"
            }}
          >
            {currentIdx === total - 1 ? "✓ Complete" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseScreen({ onBack }) {
  const nodes = KB.getNodes();
  const [filter, setFilter] = useState("");
  const categories = [...new Set(nodes.map(n => n.category || "Default"))];

  const filtered = filter ? nodes.filter(n => (n.category || "Default") === filter) : nodes;

  return (
    <div className="slide-up" style={{ minHeight: "100vh", padding: "40px", background: T.bg }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: T.sub,
            fontFamily: "Barlow Condensed",
            cursor: "pointer",
            marginBottom: "30px",
            fontSize: "14px"
          }}
        >
          ← Back to Learning
        </button>

        <h2 style={{ fontSize: "32px", fontFamily: "Barlow Condensed", fontWeight: "900", marginBottom: "12px" }}>
          Knowledge Base
        </h2>
        <p style={{ fontSize: "13px", color: T.sub, marginBottom: "40px" }}>
          {nodes.length} screens learned. Neural network is growing.
        </p>

        {/* Neural Network Graph */}
        <div style={{ marginBottom: "50px", padding: "20px", background: T.s1, borderRadius: "8px" }}>
          <h3 style={{ fontSize: "14px", fontFamily: "Barlow Condensed", fontWeight: "700", marginBottom: "20px" }}>Neural Network</h3>
          <KnowledgeGraph />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("")}
            style={{
              padding: "8px 14px",
              background: !filter ? T.accent : T.s2,
              color: !filter ? T.bg : T.text,
              border: "none",
              borderRadius: "4px",
              fontFamily: "Barlow Condensed",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            All ({nodes.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "8px 14px",
                background: filter === cat ? T.accent : T.s2,
                color: filter === cat ? T.bg : T.text,
                border: "none",
                borderRadius: "4px",
                fontFamily: "Barlow Condensed",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              {cat} ({nodes.filter(n => (n.category || "Default") === cat).length})
            </button>
          ))}
        </div>

        {/* Nodes List */}
        <div style={{ display: "grid", gap: "12px" }}>
          {filtered.map(node => (
            <div key={node.id} style={{ padding: "16px", background: T.s2, borderRadius: "6px", borderLeft: `3px solid ${KB_COLORS[node.category] || KB_COLORS.Default}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontFamily: "Barlow Condensed", fontWeight: "700", flex: 1 }}>{node.headline}</h4>
                <span style={{ fontSize: "11px", color: T.muted, fontFamily: "IBM Plex Mono" }}>{node.category || "Default"}</span>
              </div>
              <p style={{ fontSize: "12px", color: T.sub, marginBottom: "10px" }}>{node.body}</p>
              {node.shortcut && (
                <div style={{ fontSize: "11px", padding: "8px", background: T.s3, borderRadius: "4px", color: T.muted, marginBottom: "8px", borderLeft: `2px solid ${T.accent}` }}>
                  <strong>Mental Model:</strong> {node.shortcut}
                </div>
              )}
              {node.trend && (
                <div style={{ fontSize: "11px", padding: "8px", background: T.s3, borderRadius: "4px", color: T.muted, borderLeft: `2px solid ${T.accent}` }}>
                  <strong>Feb 2026:</strong> {node.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: T.muted }}>
            No nodes yet. Complete some screens to build your knowledge base.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("home");
  const [topic, setTopic] = useState("");
  const [lens, setLens] = useState("");
  const [outline, setOutline] = useState(null);
  const [screens, setScreens] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [loadingScreens, setLoadingScreens] = useState(false);

  // Inject styles on client mount
  useEffect(() => {
    console.log("[App] Mount");
    try {
      createStyleElement();
    } catch (e) {
      console.error("[App] Error in createStyleElement:", e);
    }
  }, []);

  const handleSelectTrack = (trackId) => {
    // For pre-built tracks, you could hardcode screens or generate them
    // For now, we'll redirect to custom with a topic
    const tracks = {
      math: { topic: "Linear Algebra, Complex Numbers & Probability Theory", lens: "Mathematical Foundations" },
      sql: { topic: "SQL for Data Analysis", lens: "From Excel to Databases" },
      combo: { topic: "Math + Data Analytics Combined", lens: "Real-World Business Insights" }
    };
    const t = tracks[trackId];
    handleCustomTopic(t.topic, t.lens);
  };

  const handleCustomTopic = async (t, l) => {
    setTopic(t);
    setLens(l);
    setLoadingOutline(true);
    setView("outline");
    
    const generatedOutline = await generateOutline(t, l);
    setOutline(generatedOutline);
    setLoadingOutline(false);
  };

  const handleStartLearning = async () => {
    setView("learning");
    setLoadingScreens(true);
    setCurrentIdx(0);
    
    // Generate screens for the first section
    if (outline && outline.sections && outline.sections.length > 0) {
      const firstSection = outline.sections[0];
      const generatedScreens = await generateScreens(topic, lens, firstSection.title, 0, firstSection.screens);
      setScreens(generatedScreens);
    }
    
    setLoadingScreens(false);
  };

  const handleNavigate = async (direction) => {
    const newIdx = currentIdx + direction;
    if (newIdx < 0 || newIdx >= screens.length) return;
    
    setCurrentIdx(newIdx);
    
    // Pre-generate next section if approaching end of current
    if (newIdx === screens.length - 3 && outline) {
      // Find which section we're in and generate the next one
      let screensCount = 0;
      for (let i = 0; i < outline.sections.length; i++) {
        if (screensCount + outline.sections[i].screens > newIdx) {
          // We're in section i, generate section i+1
          if (i + 1 < outline.sections.length) {
            const nextSection = outline.sections[i + 1];
            const nextScreens = await generateScreens(
              topic,
              lens,
              nextSection.title,
              screensCount + outline.sections[i].screens,
              nextSection.screens
            );
            setScreens(s => [...s, ...nextScreens]);
          }
          break;
        }
        screensCount += outline.sections[i].screens;
      }
    }
  };

  const current = screens[currentIdx];

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh" }}>
      {view === "home" && <HomeScreen onSelectTrack={handleSelectTrack} onCustomTopic={handleCustomTopic} />}
      
      {view === "outline" && (
        loadingOutline ? (
          <div style={{ padding: "100px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: T.sub, fontFamily: "Barlow Condensed", fontWeight: "700" }}>Generating outline...</div>
            <div className="pulse" style={{ marginTop: "20px", fontSize: "40px" }}>∑</div>
          </div>
        ) : outline ? (
          <OutlineScreen
            outline={outline}
            topic={topic}
            lens={lens}
            onStart={handleStartLearning}
            onBack={() => setView("home")}
          />
        ) : (
          <div style={{ padding: "100px 40px", textAlign: "center", color: T.accent }}>
            Failed to generate outline. Please try again.
          </div>
        )
      )}

      {view === "learning" && current && (
        <LearningScreen
          screen={current}
          outline={outline}
          allScreens={screens}
          currentIdx={currentIdx}
          onComplete={() => handleNavigate(1)}
          onNavigate={handleNavigate}
          onViewKB={() => setView("knowledge-base")}
        />
      )}

      {view === "knowledge-base" && (
        <KnowledgeBaseScreen onBack={() => setView("learning")} />
      )}
    </div>
  );
}
