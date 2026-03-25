// pages/index.jsx
import { useState, useRef } from "react";

const C = {
  burgundy: "#772135",
  dark:     "#5a1828",
  cream:    "#FAF6F0",
  warm:     "#FFFBF3",
  border:   "#E8D5C4",
  text:     "#2C1810",
  muted:    "#9B7B7B",
  gold:     "#C9A96E",
  green:    "#2D7A2D",
  amber:    "#B07D20",
  red:      "#C62828",
};

const STEPS = [
  "Detecting skin tone & texture",
  "Analyzing pores & sebum levels",
  "Mapping pigmentation patterns",
  "Assessing fine lines & aging markers",
  "Generating 5-year skin projection",
];

function scoreColor(s) {
  return s >= 70 ? C.green : s >= 45 ? C.amber : C.red;
}

function CircularScore({ score, size = 120, color, label, sub }) {
  const r = 40, circ = 2 * Math.PI * r;
  const col = color || scoreColor(score);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke={C.border} strokeWidth="7"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition:"stroke-dashoffset 1.3s cubic-bezier(.34,1.56,.64,1)" }}/>
        <text x="50" y="45" textAnchor="middle" fontSize="22" fontWeight="700"
          fill={C.text} style={{ fontFamily:"Playfair Display" }}>{score}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="9" fill={C.muted}
          style={{ fontFamily:"Montserrat" }}>/100</text>
      </svg>
      {label && <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:700, color:C.text,
        textAlign:"center", letterSpacing:".05em", textTransform:"uppercase" }}>{label}</div>}
      {sub && <div style={{ fontFamily:"Montserrat", fontSize:10, color:C.muted, textAlign:"center" }}>{sub}</div>}
    </div>
  );
}

function Badge({ level }) {
  const map = {
    Low:[C.green+"18",C.green], Moderate:["#FFF8E1",C.amber], High:["#FFEBEE",C.red],
    Excellent:["#EDF6FF","#1565C0"], Good:[C.green+"18",C.green], Dehydrated:["#FFEBEE",C.red],
    Normal:[C.green+"18",C.green], Sensitive:["#FFEBEE",C.red], Oily:["#FFF8E1",C.amber],
    Dry:["#FFEBEE",C.red], Combination:["#FFF8E1",C.amber],
  };
  const [bg, fg] = map[level] || ["#F5F5F5","#555"];
  return (
    <span style={{ background:bg, color:fg, padding:"3px 12px", borderRadius:20, fontSize:10,
      fontWeight:700, fontFamily:"Montserrat", letterSpacing:".07em", textTransform:"uppercase" }}>
      {level}
    </span>
  );
}

// ── Upload Screen ─────────────────────────────────────────────────────────────
function UploadScreen({ onFile, fileRef }) {
  const [drag, setDrag] = useState(false);
  return (
    <div style={{ textAlign:"center", animation:"fadeUp .6s ease both", maxWidth:640, margin:"0 auto" }}>
      <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:700, color:C.burgundy,
        letterSpacing:".18em", textTransform:"uppercase", marginBottom:12 }}>
        Powered by AI Vision
      </div>
      <h1 style={{ fontFamily:"Playfair Display", fontSize:"clamp(32px,5vw,52px)",
        color:C.text, lineHeight:1.15, marginBottom:16 }}>
        Discover Your<br/>
        <em style={{ color:C.burgundy }}>Skin&apos;s True Story</em>
      </h1>
      <p style={{ color:C.muted, fontSize:15, lineHeight:1.7, maxWidth:460, margin:"0 auto 44px" }}>
        Upload a clear, well-lit selfie. Our AI analyzes 6 key skin markers, compares your skin
        age to your real age, and simulates your skin 5 years into the future.
      </p>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${drag ? C.burgundy : C.border}`, borderRadius:24,
          padding:"56px 40px", cursor:"pointer",
          background: drag ? "rgba(119,33,53,.04)" : C.warm,
          transition:"all .2s ease", maxWidth:440, margin:"0 auto 40px" }}>
        <div style={{ fontSize:52, marginBottom:18 }}></div>
        <div style={{ fontFamily:"Playfair Display", fontSize:20, color:C.text, marginBottom:8 }}>
          Upload Your Selfie
        </div>
        <div style={{ color:C.muted, fontSize:13 }}>Drag &amp; drop or click to browse</div>
        <div style={{ color:C.muted, fontSize:11, marginTop:6 }}>JPG · PNG · WEBP · HEIC</div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="user"
        style={{ display:"none" }} onChange={e => onFile(e.target.files[0])} />
      <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"10px 24px", marginBottom:36 }}>
        {["Acne Cause Detection","Wrinkle Risk","Pigmentation Score",
          "Hydration Score","Skin Age Comparison","5-Year Simulation"].map(f => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:6,
            color:C.muted, fontSize:12, fontFamily:"Montserrat" }}>
            <span style={{ color:C.burgundy, fontSize:10 }}>✦</span> {f}
          </div>
        ))}
      </div>
      <div style={{ fontFamily:"Montserrat", fontSize:10, color:C.muted }}>
         Your photo is analyzed privately and never stored.
      </div>
    </div>
  );
}

// ── Age Screen ────────────────────────────────────────────────────────────────
function AgeScreen({ imgSrc, age, setAge, error, onBack, onAnalyze }) {
  return (
    <div style={{ maxWidth:460, margin:"0 auto", textAlign:"center", animation:"fadeUp .5s ease both" }}>
      <div style={{ width:110, height:110, borderRadius:"50%", overflow:"hidden",
        margin:"0 auto 28px", border:`3px solid ${C.burgundy}`,
        boxShadow:"0 8px 24px rgba(119,33,53,.18)" }}>
        <img src={imgSrc} alt="selfie" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
      </div>
      <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:700, color:C.burgundy,
        letterSpacing:".15em", textTransform:"uppercase", marginBottom:10 }}>Almost There</div>
      <h2 style={{ fontFamily:"Playfair Display", fontSize:30, color:C.text, marginBottom:10 }}>
        How old are you?
      </h2>
      <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, marginBottom:32 }}>
        We use your age to compare your biological skin age against your real age and
        personalize your 5-year forecast.
      </p>
      <input
        type="number" value={age}
        onChange={e => setAge(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onAnalyze()}
        placeholder="e.g. 28"
        style={{ width:"100%", padding:"16px 20px", borderRadius:14, fontSize:18,
          border:`1.5px solid ${error ? C.red : C.border}`,
          background:C.warm, color:C.text, fontFamily:"Playfair Display",
          outline:"none", textAlign:"center", marginBottom:10,
          boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}
      />
      {error && <div style={{ color:C.red, fontSize:12, fontFamily:"Montserrat", marginBottom:10 }}>{error}</div>}
      <button onClick={onAnalyze} className="ff-btn"
        style={{ width:"100%", padding:"17px", borderRadius:14, border:"none",
          background:`linear-gradient(135deg,${C.burgundy},${C.dark})`, color:"#fff",
          fontSize:13, fontWeight:700, fontFamily:"Montserrat", letterSpacing:".1em",
          textTransform:"uppercase", boxShadow:"0 6px 20px rgba(119,33,53,.35)", marginBottom:14 }}>
        Analyze My Skin →
      </button>
      <button onClick={onBack}
        style={{ background:"none", border:"none", color:C.muted, fontSize:13,
          cursor:"pointer", fontFamily:"Montserrat" }}>
        ← Use a different photo
      </button>
    </div>
  );
}

// ── Analyzing Screen ──────────────────────────────────────────────────────────
function AnalyzingScreen({ imgSrc, progress, stepIdx }) {
  return (
    <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center" }}>
      <div style={{ position:"relative", width:220, height:260, margin:"0 auto 40px",
        borderRadius:20, overflow:"hidden", boxShadow:"0 12px 40px rgba(119,33,53,.2)" }}>
        <img src={imgSrc} alt="scanning" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(119,33,53,.12)" }}/>
        <div style={{ position:"absolute", left:0, right:0, height:3,
          background:`linear-gradient(transparent,${C.gold},${C.burgundy},${C.gold},transparent)`,
          animation:"scanline 2.2s linear infinite", filter:"blur(1px)" }}/>
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
          <div key={`${v}${h}`} style={{ position:"absolute", [v]:14, [h]:14, width:22, height:22,
            borderTop:    v==="top"    ? `2px solid ${C.gold}` : "none",
            borderBottom: v==="bottom" ? `2px solid ${C.gold}` : "none",
            borderLeft:   h==="left"   ? `2px solid ${C.gold}` : "none",
            borderRight:  h==="right"  ? `2px solid ${C.gold}` : "none" }}/>
        ))}
        <div style={{ position:"absolute", bottom:0, left:0, right:0,
          background:"linear-gradient(transparent,rgba(44,24,16,.75))", padding:"24px 16px 14px" }}>
          <div style={{ fontFamily:"Montserrat", fontSize:10, color:"rgba(255,255,255,.8)",
            animation:"pulse 1.5s ease infinite" }}>● ANALYZING</div>
        </div>
      </div>
      <h2 style={{ fontFamily:"Playfair Display", fontSize:26, color:C.text, marginBottom:6 }}>
        Analyzing Your Skin
      </h2>
      <p style={{ color:C.muted, fontSize:13, marginBottom:28, fontFamily:"Montserrat" }}>
        {STEPS[stepIdx]}
      </p>
      <div style={{ background:C.border, borderRadius:20, height:5, marginBottom:28, overflow:"hidden" }}>
        <div style={{ height:"100%", background:`linear-gradient(90deg,${C.burgundy},${C.gold})`,
          borderRadius:20, width:`${progress}%`, transition:"width .9s ease" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
        {STEPS.map((step, i) => {
          const done = i < stepIdx, active = i === stepIdx, pending = i > stepIdx;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
              opacity:pending ? .3 : 1, transition:"opacity .4s" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? C.burgundy : active ? "transparent" : C.border,
                border: active ? `2px solid ${C.burgundy}` : "none",
                animation: active ? "glow 1.8s ease infinite" : "none",
                transition:"background .3s" }}>
                {done   && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
                {active && <div style={{ width:8, height:8, borderRadius:"50%",
                  background:C.burgundy, animation:"pulse 1s ease infinite" }}/>}
              </div>
              <span style={{ fontFamily:"Montserrat", fontSize:13,
                color: active ? C.text : C.muted, fontWeight: active ? 600 : 400 }}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ analysis, imgSrc, userAge, onReset }) {
  const diff    = analysis.skinAge - userAge;
  const diffTxt = diff > 0 ? `+${diff} yrs older` : diff < 0 ? `${Math.abs(diff)} yrs younger` : "Matches your age";
  const diffCol = diff > 3 ? C.red : diff < -3 ? C.green : C.amber;

  const metrics = [
    { key:"acne",         label:"Acne Health",    icon:"", data:analysis.acne,         badge:analysis.acne?.riskLevel },
    { key:"wrinkle",      label:"Wrinkle Health",  icon:"", data:analysis.wrinkle,      badge:analysis.wrinkle?.riskLevel },
    { key:"pigmentation", label:"Even Tone",       icon:"", data:analysis.pigmentation, badge:analysis.pigmentation?.riskLevel },
    { key:"hydration",    label:"Hydration",       icon:"", data:analysis.hydration,    badge:analysis.hydration?.level },
  ];

  const simNodes = [
    { year:"Now",     icon:"", text:"Your current skin condition as analyzed.",  label:"",             highlight:false },
    { year:"1 Year",  icon:"", text:analysis.futureSimulation?.year1,            label:"Without care", highlight:false },
    { year:"3 Years", icon:"", text:analysis.futureSimulation?.year3,            label:"Without care", highlight:false },
    { year:"5 Years", icon:"", text:analysis.futureSimulation?.year5,            label:"Without care", highlight:false },
    { year:"5 Years", icon:"", text:analysis.futureSimulation?.withCare,         label:"With Future Face", highlight:true },
  ];

  return (
    <div style={{ animation:"fadeUp .6s ease both" }}>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:28,
        alignItems:"start", marginBottom:32 }}>
        <div style={{ position:"relative", width:150, height:190, borderRadius:18,
          overflow:"hidden", boxShadow:"0 10px 36px rgba(119,33,53,.18)", flexShrink:0 }}>
          <img src={imgSrc} alt="your skin" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0,
            background:"linear-gradient(transparent,rgba(44,24,16,.75))", padding:"24px 12px 12px" }}>
            <div style={{ color:"rgba(255,255,255,.7)", fontFamily:"Montserrat", fontSize:9,
              fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>Skin Type</div>
            <div style={{ color:"#fff", fontFamily:"Playfair Display", fontSize:15 }}>{analysis.skinType}</div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily:"Montserrat", fontSize:10, fontWeight:700, color:C.burgundy,
            letterSpacing:".16em", textTransform:"uppercase", marginBottom:6 }}>Your Skin Report</div>
          <h2 style={{ fontFamily:"Playfair Display", fontSize:"clamp(22px,3vw,32px)",
            color:C.text, lineHeight:1.2, marginBottom:18 }}>
            Your skin score is{" "}
            <span style={{ color:C.burgundy }}>{analysis.overallScore}</span>
            <span style={{ fontSize:16, color:C.muted }}>/100</span>
          </h2>
          <div style={{ background:C.warm, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"Montserrat", fontSize:10, fontWeight:700, color:C.muted,
              letterSpacing:".1em", textTransform:"uppercase", marginBottom:14 }}>
              Skin Age vs Real Age
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ textAlign:"center", minWidth:52 }}>
                <div style={{ fontFamily:"Playfair Display", fontSize:40, fontWeight:700,
                  color:diffCol, lineHeight:1 }}>{analysis.skinAge}</div>
                <div style={{ fontFamily:"Montserrat", fontSize:10, color:C.muted, marginTop:4 }}>Skin Age</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ height:4, background:C.border, borderRadius:4, position:"relative", margin:"0 0 8px" }}>
                  <div style={{ position:"absolute", left:"50%", top:-2, height:8, borderRadius:4,
                    background:diffCol, width:`${Math.min(Math.abs(diff)*4,50)}%`,
                    transform: diff < 0 ? "translateX(-100%)" : "none", transition:"width 1s ease" }}/>
                </div>
                <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:700,
                  color:diffCol, textAlign:"center" }}>{diffTxt}</div>
              </div>
              <div style={{ textAlign:"center", minWidth:52 }}>
                <div style={{ fontFamily:"Playfair Display", fontSize:40, fontWeight:700,
                  color:C.text, lineHeight:1 }}>{userAge}</div>
                <div style={{ fontFamily:"Montserrat", fontSize:10, color:C.muted, marginTop:4 }}>Real Age</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ff-hover" style={{ background:C.warm, borderRadius:18, padding:"22px 18px",
          border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.04)",
          textAlign:"center", flexShrink:0 }}>
          <CircularScore score={analysis.overallScore} size={140} color={C.burgundy}
            label="Overall Health" sub="Composite Score"/>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",
        gap:16, marginBottom:28 }}>
        {metrics.map(({ key, label, icon, data, badge }) => (
          <div key={key} className="ff-hover" style={{ background:C.warm, borderRadius:18, padding:20,
            border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:20 }}>{icon}</span>
              <Badge level={badge}/>
            </div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <CircularScore score={data?.score ?? 0} size={100}/>
            </div>
            <div style={{ fontFamily:"Montserrat", fontSize:12, fontWeight:700, color:C.text, marginBottom:6 }}>{label}</div>
            <p style={{ fontFamily:"Montserrat", fontSize:11, color:C.muted, lineHeight:1.6 }}>{data?.description}</p>
            {key === "acne" && data?.causes?.length > 0 && (
              <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:5 }}>
                {data.causes.map((c, i) => (
                  <span key={i} style={{ background:"rgba(119,33,53,.07)", color:C.burgundy,
                    borderRadius:10, padding:"2px 9px", fontSize:10, fontFamily:"Montserrat", fontWeight:500 }}>{c}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background:C.warm, borderRadius:20, padding:28, border:`1px solid ${C.border}`,
        marginBottom:28, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
        <div style={{ fontFamily:"Montserrat", fontSize:10, fontWeight:700, color:C.burgundy,
          letterSpacing:".16em", textTransform:"uppercase", marginBottom:4 }}>AI Prediction</div>
        <h3 style={{ fontFamily:"Playfair Display", fontSize:24, color:C.text, marginBottom:24 }}>
          5-Year Skin Simulation
        </h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
          {simNodes.map((node, i) => (
            <div key={i} style={{ borderRadius:16, padding:18, position:"relative",
              background: node.highlight ? "linear-gradient(145deg,rgba(119,33,53,.06),rgba(201,169,110,.1))" : "rgba(0,0,0,.025)",
              border:`1.5px solid ${node.highlight ? C.burgundy : C.border}` }}>
              {node.highlight && (
                <div style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)",
                  background:C.burgundy, color:"#fff", fontSize:8, fontWeight:700,
                  padding:"2px 10px", borderRadius:10, fontFamily:"Montserrat",
                  letterSpacing:".07em", whiteSpace:"nowrap" }}>BEST OUTCOME</div>
              )}
              <div style={{ fontSize:22, marginBottom:10 }}>{node.icon}</div>
              <div style={{ fontFamily:"Playfair Display", fontSize:17,
                color: node.highlight ? C.burgundy : C.text, marginBottom:2 }}>{node.year}</div>
              {node.label && (
                <div style={{ fontFamily:"Montserrat", fontSize:9, color:C.muted, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{node.label}</div>
              )}
              <p style={{ fontFamily:"Montserrat", fontSize:11, color:C.muted, lineHeight:1.6 }}>{node.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:`linear-gradient(140deg,${C.burgundy} 0%,${C.dark} 100%)`,
        borderRadius:20, padding:28, marginBottom:28, color:"#fff" }}>
        <div style={{ fontFamily:"Montserrat", fontSize:10, fontWeight:700, letterSpacing:".16em",
          textTransform:"uppercase", opacity:.65, marginBottom:6 }}>Personalized for You</div>
        <h3 style={{ fontFamily:"Playfair Display", fontSize:24, marginBottom:24 }}>
          Your Skincare Recommendations
        </h3>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {analysis.recommendations?.map((rec, i) => (
            <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,.15)",
                flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"Playfair Display", fontSize:14, fontWeight:700, color:"#fff" }}>{i+1}</div>
              <p style={{ fontFamily:"Montserrat", fontSize:13, lineHeight:1.7, opacity:.9, paddingTop:5 }}>{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(119,33,53,.04)", borderRadius:14, padding:"14px 18px",
        marginBottom:28, border:"1px solid rgba(119,33,53,.12)" }}>
        <p style={{ fontFamily:"Montserrat", fontSize:11, color:C.muted, lineHeight:1.6, textAlign:"center" }}>
          ⚕️ <strong>Disclaimer:</strong> This analysis is for informational purposes only and is
          not a medical diagnosis. Please consult a licensed dermatologist for clinical concerns.
        </p>
      </div>

      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <a href="https://futureface.ca/shop/" target="_blank" rel="noopener noreferrer" className="ff-btn"
          style={{ background:`linear-gradient(135deg,${C.burgundy},${C.dark})`, color:"#fff",
            padding:"15px 32px", borderRadius:14, fontFamily:"Montserrat", fontSize:13,
            fontWeight:700, textDecoration:"none", letterSpacing:".08em",
            textTransform:"uppercase", boxShadow:"0 6px 20px rgba(119,33,53,.35)" }}>
          Shop Future Face Products →
        </a>
        <button onClick={onReset} className="ff-btn"
          style={{ background:"none", border:`1.5px solid ${C.border}`, color:C.muted,
            padding:"15px 28px", borderRadius:14, fontFamily:"Montserrat", fontSize:13, cursor:"pointer" }}>
          Analyze Another Photo
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FutureFaceSkinAnalysis() {
  const [phase,    setPhase]    = useState("upload");
  const [imgSrc,   setImgSrc]   = useState(null);
  const [fileObj,  setFileObj]  = useState(null);
  const [age,      setAge]      = useState("");
  const [ageError, setAgeError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stepIdx,  setStepIdx]  = useState(0);
  const fileRef = useRef(null);

  // ✅ Compress to Blob — no base64, no 413 errors on mobile
  const loadFile = (file) => {
  if (!file?.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // 🔥 MUCH smaller size
      const MAX = 256;

      let w = img.width;
      let h = img.height;

      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      // 🔥 MORE compression
      const compressed = canvas.toDataURL("image/jpeg", 0.3);

      const base64 = compressed.split(",")[1];

      // 🚨 HARD CHECK
      if (base64.length > 2_500_000) {
        alert("Image too large. Please upload a smaller image.");
        return;
      }

      setImgSrc(compressed);
      setImgB64(base64);
      setImgType("image/jpeg");
      setPhase("age");
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
};
  // ✅ Send as FormData — bypasses Vercel 4.5MB JSON body limit
  const handleAnalyze = async () => {
    const n = parseInt(age);
    if (!age || isNaN(n) || n < 10 || n > 100) {
      setAgeError("Please enter a valid age between 10 and 100.");
      return;
    }
    setAgeError("");
    setPhase("analyzing"); setProgress(0); setStepIdx(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStepIdx(i);
        setProgress(Math.round(((i + 1) / STEPS.length) * 88));
      }, i * 1300);
    });

    try {
      const formData = new FormData();
      formData.append("image", fileObj);
      formData.append("age", n);

      const res = await fetch("/api/analyze-skin", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { result } = await res.json();
      setAnalysis(result);
      setProgress(100);
      setTimeout(() => setPhase("results"), 700);
    } catch (err) {
      setAgeError(`Analysis failed: ${err.message}`);
      setPhase("age");
    }
  };

  const reset = () => {
    setPhase("upload"); setImgSrc(null); setFileObj(null);
    setAge(""); setAnalysis(null); setAgeError("");
  };

  const phases = ["upload","age","analyzing","results"];

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"Montserrat, sans-serif",
      display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"18px clamp(20px,4vw,48px)", display:"flex", alignItems:"center",
        justifyContent:"space-between", borderBottom:`1px solid ${C.border}`,
        background:C.warm, position:"sticky", top:0, zIndex:10 }}>
        <div style={{ fontFamily:"Playfair Display", fontSize:22, fontWeight:700,
          color:C.burgundy, letterSpacing:".02em" }}>Future Face</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {phase !== "upload" && (
            <div style={{ display:"flex", gap:6 }}>
              {phases.map((p, i) => (
                <div key={p} style={{ width:6, height:6, borderRadius:"50%",
                  background: phases.indexOf(phase) >= i ? C.burgundy : C.border,
                  transition:"background .3s" }}/>
              ))}
            </div>
          )}
          <div style={{ background:C.burgundy, color:"#fff", padding:"4px 14px", borderRadius:20,
            fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>
            AI Skin Analysis
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:"clamp(32px,5vw,64px) clamp(16px,4vw,48px)",
        maxWidth:960, width:"100%", margin:"0 auto" }}>
        {phase === "upload"    && <UploadScreen onFile={loadFile} fileRef={fileRef}/>}
        {phase === "age"       && <AgeScreen imgSrc={imgSrc} age={age} setAge={setAge}
                                    error={ageError} onBack={reset} onAnalyze={handleAnalyze}/>}
        {phase === "analyzing" && <AnalyzingScreen imgSrc={imgSrc} progress={progress} stepIdx={stepIdx}/>}
        {phase === "results"   && <ResultsScreen analysis={analysis} imgSrc={imgSrc}
                                    userAge={parseInt(age)} onReset={reset}/>}
      </div>
    </div>
  );
}