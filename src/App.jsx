import { useState, useEffect, useRef } from "react";
import pandaImg from "./panda.png";

// ─── Data ────────────────────────────────────────────────
const CRISIS_STATS = [
  { number: "764", label: "personas se quitaron la vida en Uruguay en 2024", source: "MSP Uruguay, 2025" },
  { number: "7°", label: "lugar mundial en tasa de suicidio según la OMS", source: "OMS, 2025" },
  { number: "16", label: "uruguayos mueren por suicidio cada semana", source: "OPS, 2024" },
  { number: "2ª", label: "causa de muerte en jóvenes de 15 a 29 años", source: "MSP, 2023" },
];

const YOUTH_STATS = [
  { value: "1 de 4", text: "adolescentes dice sentirse triste o desesperado", emoji: "😞" },
  { value: "47%", text: "de los intentos de suicidio son jóvenes de 15 a 29", emoji: "📉" },
  { value: "33.2", text: "por 100k — tasa récord histórica en 20-24 años", emoji: "⚠️" },
  { value: "<20%", text: "recibe atención psicológica oportuna", emoji: "🚪" },
];

const GAP_ITEMS = [
  { icon: "🧠", title: "Sienten que algo anda mal", desc: "Ansiedad, tristeza, agotamiento emocional. Lo sienten pero no siempre lo nombran." },
  { icon: "🚫", title: "No buscan terapia", desc: "Por costo, por estigma, porque \"no es para tanto\", o simplemente porque no saben cómo empezar." },
  { icon: "📱", title: "Buscan en su teléfono", desc: "Googlear síntomas, Reddit, TikTok, IA genérica. Respuestas frías, genéricas, desconectadas." },
  { icon: "🕳️", title: "El vacío", desc: "No hay nada entre \"estoy mal\" y \"necesito un psicólogo\". Ese espacio intermedio no existe." },
];

const COMPARISON_FEATURES = [
  { feature: "Escucha antes de responder", numa: true, others: false },
  { feature: "Recuerda tu vida y tu historia", numa: true, others: false },
  { feature: "Tiene psicólogos detrás del diseño", numa: true, others: false },
  { feature: "Ejercicios validados por profesionales", numa: true, others: false },
  { feature: "Reacciona como persona, no como manual", numa: true, others: false },
  { feature: "Detecta crisis sin palabras exactas", numa: true, others: false },
  { feature: "Líneas de emergencia integradas", numa: true, others: false },
  { feature: "Listas de consejos automáticos", numa: false, others: true },
];

const CHAT_TONE = {
  numa: [
    { role: "user", text: "hola numa" },
    { role: "bot", text: "¡Ey! ¿Cómo te fue en la entrevista de ayer? Me quedé pensando en eso." },
    { role: "user", text: "bien! me llamaron para una segunda ronda" },
    { role: "bot", text: "¡Vamo! ¿Para cuándo es?" },
  ],
  chatgpt: [
    { role: "user", text: "hola" },
    { role: "bot", text: "¡Hola! ¿En qué puedo ayudarte hoy? 😊" },
    { role: "user", text: "tuve una entrevista ayer y me llamaron para una segunda ronda" },
    { role: "bot", text: "¡Felicitaciones! Eso es un gran logro. Aquí tienes algunos consejos para prepararte:\n\n1. Investiga más sobre la empresa\n2. Prepara preguntas para el entrevistador\n3. Practica tus respuestas\n4. Viste profesionalmente\n5. Llega con tiempo de anticipación" },
  ],
};

const CRISIS_DEMO = {
  numa: [
    { role: "user", text: "ya lo decidí, no tiene caso seguir" },
    { role: "bot", text: "Esperá. ¿Estás pensando en hacerte daño?\n\n¿Hay alguien con vos ahora?" },
    { role: "user", text: "no importa ya" },
    { role: "bot", text: "Sí importa. Estás acá hablándome y eso importa.\n\nNo tenés que manejar esto solo/a. Hay alguien que puede escucharte ahora mismo:\n\n📞 0800 0767 (gratuito, 24h)\n\nQuedate conmigo." },
  ],
  generic: [
    { role: "user", text: "ya lo decidí, no tiene caso seguir" },
    { role: "bot", text: "Entiendo que estás pasando por un momento difícil. Aquí hay algunos recursos que pueden ayudarte:\n\n1. Habla con un profesional\n2. Llama a una línea de crisis\n3. Practica autocuidado\n4. Busca apoyo en tu comunidad\n\nRecuerda: no estás solo. 💙" },
  ],
};

// ─── Components ──────────────────────────────────────────

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target);
    if (isNaN(num)) { setCount(target); return; }
    let s = 0;
    const step = Math.ceil(num / (duration / 30));
    const t = setInterval(() => { s += step; if (s >= num) { setCount(num); clearInterval(t); } else setCount(s); }, 30);
    return () => clearInterval(t);
  }, [visible, target, duration]);

  return <span ref={ref}>{typeof count === "number" ? count : target}</span>;
}

function ChatDemo({ conversations, tabs }) {
  const [active, setActive] = useState(0);
  const keys = Object.keys(conversations);

  return (
    <div style={S.chatWrap}>
      <div style={S.chatTabs}>
        {keys.map((k, i) => (
          <button key={k} onClick={() => setActive(i)} style={{ ...S.chatTab, ...(active === i ? { ...S.chatTabOn, borderColor: i === 0 ? "#6EC177" : "#888" } : {}) }}>
            {tabs[i]}
          </button>
        ))}
      </div>
      <div style={S.chatBody}>
        {conversations[keys[active]].map((msg, i) => (
          <div key={i} style={{ ...S.bubble, ...(msg.role === "user" ? S.bubbleUser : S.bubbleBot) }}>
            <div style={S.bubbleRole}>{msg.role === "user" ? "Usuario" : tabs[active]}</div>
            <div style={{ whiteSpace: "pre-line", lineHeight: 1.55 }}>{msg.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Main ────────────────────────────────────────────────
export default function App() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={S.root}>
      {/* NAV */}
      <nav style={{ ...S.nav, background: scrollY > 50 ? "rgba(10,10,12,.88)" : "transparent", backdropFilter: scrollY > 50 ? "blur(16px)" : "none" }}>
        <span style={S.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>🐼 Numa</span>
        <div style={S.navLinks}>
          <a onClick={() => scrollTo("diferente")} style={S.navLink}>Diferente</a>
          <a onClick={() => scrollTo("crisis")} style={S.navLink}>La Crisis</a>
          <a onClick={() => scrollTo("seguridad")} style={S.navLink}>Seguridad</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroContent}>
          <img src={pandaImg} alt="Numa" style={{ width: 100, height: "auto", borderRadius: 24, marginBottom: 20, animation: "float 4s ease-in-out infinite" }} />
          <div style={S.heroTag}>Compañero emocional para jóvenes</div>
          <h1 style={S.heroTitle}>
            Hay un espacio vacío entre{" "}
            <span style={S.hl}>"estoy mal"</span> y{" "}
            <span style={S.hl}>"necesito un psicólogo"</span>
          </h1>
          <p style={S.heroSub}>
            Numa llena ese espacio. No es terapia. No es un chatbot genérico.<br />
            Es un compañero que escucha de verdad — entrenado por psicólogos,<br />
            diseñado para los que no tienen dónde ir.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PILAR 1 — DIFERENTE                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="diferente" style={{ ...S.sec, background: "#0a0a0c" }}>
        <div style={S.tag}>PILAR 1 — LA DIFERENCIA</div>
        <h2 style={S.title}>
          No es otro chatbot con tips.<br />
          Es un <span style={S.hl}>compañero de verdad</span>.
        </h2>
        <p style={S.sub}>
          Hay apps de meditación, hay ChatGPT, hay foros. Ninguno escucha.<br />
          Numa fue entrenado por psicólogos para reaccionar como persona.
        </p>

        {/* Panda + intro */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 48 }}>
          <img src={pandaImg} alt="Numa" style={{ width: 140, borderRadius: 28, animation: "float 5s ease-in-out infinite" }} />
          <div style={{ maxWidth: 380 }}>
            <p style={{ fontSize: 15, color: "#ccc", lineHeight: 1.7 }}>
              Numa recuerda tu historia, tu nombre, tus problemas.
              Si ayer tuviste una entrevista importante, hoy te pregunta cómo te fue.
            </p>
            <p style={{ fontSize: 15, color: "#ccc", lineHeight: 1.7, marginTop: 10 }}>
              No te tira una lista de tips. <strong style={{ color: "#6EC177" }}>Reacciona como un amigo.</strong>
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={S.compTable}>
          <div style={S.compHead}>
            <div style={S.compFH}>Característica</div>
            <div style={S.compNH}>🐼 Numa</div>
            <div style={S.compOH}>Otras apps / IAs</div>
          </div>
          {COMPARISON_FEATURES.map((f, i) => (
            <div key={i} style={{ ...S.compRow, background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent" }}>
              <div style={S.compF}>{f.feature}</div>
              <div style={S.compN}>{f.numa ? "✅" : "—"}</div>
              <div style={S.compO}>{f.others ? "⚠️" : "❌"}</div>
            </div>
          ))}
        </div>

        {/* Chat Demo */}
        <div style={{ marginTop: 56 }}>
          <h3 style={S.demoH}>Mirá la diferencia en acción</h3>
          <p style={S.demoP}>El mismo usuario saluda. Mirá cómo responde cada uno.</p>
          <ChatDemo conversations={CHAT_TONE} tabs={["🐼 Numa", "🤖 ChatGPT"]} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PILAR 2 — LA CRISIS                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="crisis" style={{ ...S.sec, background: "linear-gradient(180deg,#0a0a0c 0%,#1a0a0a 50%,#0a0a0c 100%)" }}>
        <div style={{ ...S.tag, color: "#E85D5D" }}>PILAR 2 — EL PROBLEMA</div>
        <h2 style={S.title}>
          Uruguay tiene una crisis<br />
          de salud mental <span style={{ color: "#E85D5D" }}>silenciosa</span>
        </h2>
        <p style={S.sub}>
          No es una opinión. Son números oficiales del Ministerio de Salud Pública,<br />
          la OMS y UNICEF. Y la tendencia sigue subiendo.
        </p>

        {/* Big Numbers */}
        <div style={S.statsGrid}>
          {CRISIS_STATS.map((s, i) => (
            <div key={i} style={S.statCard}>
              <div style={S.statNum}>
                {!isNaN(parseInt(s.number)) ? <AnimatedCounter target={s.number} /> : s.number}
              </div>
              <div style={S.statLabel}>{s.label}</div>
              <div style={S.statSrc}>{s.source}</div>
            </div>
          ))}
        </div>

        {/* Youth */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={S.youthTag}>FOCO: JÓVENES</span>
          <h3 style={S.youthTitle}>La franja que más sufre es la que menos ayuda recibe</h3>
        </div>
        <div style={S.youthGrid}>
          {YOUTH_STATS.map((s, i) => (
            <div key={i} style={S.youthCard}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
              <div style={S.youthVal}>{s.value}</div>
              <div style={S.youthTxt}>{s.text}</div>
            </div>
          ))}
        </div>

        {/* Gap Timeline */}
        <div style={{ marginTop: 56 }}>
          <h3 style={{ ...S.demoH, marginBottom: 32 }}>El camino de un joven que sufre en silencio</h3>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            {GAP_ITEMS.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 24, alignItems: "flex-start" }}>
                <div style={{ fontSize: 26, minWidth: 36, textAlign: "center", paddingTop: 2 }}>{it.icon}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20, paddingTop: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E85D5D", flexShrink: 0 }} />
                  {i < GAP_ITEMS.length - 1 && <div style={{ width: 2, height: 36, background: "rgba(232,93,93,.2)", marginTop: 3 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{it.title}</div>
                  <div style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>{it.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={S.gapCTA}>
            <div style={{ fontSize: 26, color: "#6EC177", marginBottom: 6 }}>↓</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6EC177", marginBottom: 6 }}>Numa llena ese vacío</div>
            <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>
              Un espacio accesible, inmediato y diseñado por profesionales<br />
              para acompañar antes de que sea demasiado tarde.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SEGURIDAD                                             */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="seguridad" style={{ ...S.sec, background: "linear-gradient(180deg,#0a0a0c,#0a0c15)" }}>
        <div style={{ ...S.tag, color: "#E8A55D" }}>SEGURIDAD</div>
        <h2 style={S.title}>
          Cuando la conversación se pone <span style={{ color: "#E8A55D" }}>oscura</span>,<br />
          Numa no improvisa
        </h2>
        <p style={S.sub}>
          Psicólogos diseñaron cada respuesta de crisis. Numa detecta señales<br />
          implícitas — no espera a que digan "me quiero matar" para actuar.
        </p>

        <div style={S.safetyGrid}>
          {[
            { icon: "🛡️", t: "Detección multicapa", d: "4 niveles de alerta: método suicida, ideación, autolesión, desborde emocional. Frases como \"ya lo decidí\" o \"no tiene caso seguir\" activan el protocolo." },
            { icon: "👩‍⚕️", t: "Respuestas de psicólogos", d: "Cada respuesta de crisis fue escrita y validada por profesionales. No es IA improvisando — son protocolos reales." },
            { icon: "📞", t: "Líneas de emergencia", d: "Integración directa con 0800 0767 (Uruguay), 135 (Argentina), 024 (España) y más. Gratuitas, 24 horas." },
            { icon: "📋", t: "Registro de crisis", d: "Cada episodio crítico se registra para que el equipo profesional pueda dar seguimiento." },
          ].map((c, i) => (
            <div key={i} style={S.safetyCard}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{c.t}</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>{c.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <h3 style={S.demoH}>Así responde Numa en una crisis real</h3>
          <p style={S.demoP}>
            "ya lo decidí, no tiene caso seguir" — sin la palabra "suicidio".<br />
            Mirá cómo reacciona cada uno.
          </p>
          <ChatDemo conversations={CRISIS_DEMO} tabs={["🐼 Numa", "🤖 App genérica"]} />
        </div>
      </section>

      {/* ═══ CIERRE ═══ */}
      <section style={{ textAlign: "center", padding: "90px 24px 50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,93,93,.08) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <img src={pandaImg} alt="Numa" style={{ width: 80, borderRadius: 20, marginBottom: 24, position: "relative", zIndex: 1, animation: "float 4s ease-in-out infinite" }} />
        <h2 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 900, lineHeight: 1.3, letterSpacing: -1, color: "#fff", position: "relative", zIndex: 1 }}>
          764 personas. 16 por semana.<br />
          <span style={{ color: "#6EC177" }}>Una cada 11 horas.</span>
        </h2>
        <p style={{ fontSize: 15, color: "#999", lineHeight: 1.7, marginTop: 18, position: "relative", zIndex: 1 }}>
          No podemos esperar. Numa no reemplaza la terapia,<br />
          pero puede ser lo primero que encuentre alguien<br />
          que busca ayuda a las 3 de la mañana.
        </p>
        <div style={{ marginTop: 28, padding: "12px 22px", display: "inline-block", background: "rgba(110,193,119,.08)", border: "1px solid rgba(110,193,119,.2)", borderRadius: 12, fontSize: 14, color: "#ccc", position: "relative", zIndex: 1 }}>
          📞 Línea de crisis Uruguay: <strong>0800 0767</strong> (gratuito, 24h)
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 12, color: "#666", flexWrap: "wrap", gap: 6 }}>
        <span>🐼 Numa — Compañero emocional digital</span>
        <span style={{ opacity: .4 }}>Proyecto en fase MVP · Presentación para incubadora</span>
      </footer>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────
const S = {
  root: { fontFamily: "'DM Sans',sans-serif", background: "#0a0a0c", color: "#e8e8e8", minHeight: "100vh", overflowX: "hidden" },
  hl: { color: "#6EC177" },

  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", transition: "all .3s" },
  navLogo: { fontSize: 17, fontWeight: 700, letterSpacing: -.5, cursor: "pointer" },
  navLinks: { display: "flex", gap: 20 },
  navLink: { color: "#999", textDecoration: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "color .2s" },

  hero: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", padding: "110px 24px 70px" },
  heroGlow: { position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,193,119,.12) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 700 },
  heroTag: { display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(110,193,119,.1)", border: "1px solid rgba(110,193,119,.2)", fontSize: 11, fontWeight: 600, color: "#6EC177", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 },
  heroTitle: { fontSize: "clamp(26px,4.5vw,44px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: -1.5, marginBottom: 18, color: "#fff" },
  heroSub: { fontSize: "clamp(13px,1.8vw,16px)", color: "#999", lineHeight: 1.7 },

  sec: { padding: "90px 24px", maxWidth: 880, margin: "0 auto" },
  tag: { fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#6EC177", marginBottom: 14, textAlign: "center" },
  title: { fontSize: "clamp(22px,3.8vw,38px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, textAlign: "center", marginBottom: 14, color: "#fff" },
  sub: { fontSize: "clamp(13px,1.6vw,15px)", color: "#888", lineHeight: 1.7, textAlign: "center", maxWidth: 580, margin: "0 auto 44px" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 56 },
  statCard: { background: "rgba(232,93,93,.06)", border: "1px solid rgba(232,93,93,.15)", borderRadius: 14, padding: "24px 18px", textAlign: "center" },
  statNum: { fontSize: 42, fontWeight: 900, color: "#E85D5D", letterSpacing: -2, lineHeight: 1 },
  statLabel: { fontSize: 12.5, color: "#ccc", marginTop: 8, lineHeight: 1.4 },
  statSrc: { fontSize: 10, color: "#666", marginTop: 6, fontStyle: "italic" },

  youthTag: { display: "inline-block", padding: "4px 12px", borderRadius: 6, background: "rgba(232,165,93,.12)", color: "#E8A55D", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 },
  youthTitle: { fontSize: "clamp(18px,2.8vw,26px)", fontWeight: 700, color: "#fff", lineHeight: 1.3 },
  youthGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 },
  youthCard: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "22px 16px", textAlign: "center" },
  youthVal: { fontSize: 26, fontWeight: 900, color: "#E8A55D", letterSpacing: -1 },
  youthTxt: { fontSize: 12, color: "#aaa", marginTop: 4, lineHeight: 1.4 },

  gapCTA: { textAlign: "center", marginTop: 32, padding: "28px 22px", background: "rgba(110,193,119,.06)", border: "1px solid rgba(110,193,119,.15)", borderRadius: 14 },

  compTable: { borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", maxWidth: 680, margin: "0 auto" },
  compHead: { display: "grid", gridTemplateColumns: "1fr 90px 90px", background: "rgba(255,255,255,.04)", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.08)" },
  compFH: { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  compNH: { fontSize: 11, fontWeight: 700, color: "#6EC177", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  compOH: { fontSize: 11, fontWeight: 700, color: "#888", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  compRow: { display: "grid", gridTemplateColumns: "1fr 90px 90px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,.04)" },
  compF: { fontSize: 13.5, color: "#ccc" },
  compN: { textAlign: "center", fontSize: 15 },
  compO: { textAlign: "center", fontSize: 15 },

  chatWrap: { maxWidth: 500, margin: "0 auto", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)" },
  chatTabs: { display: "flex", borderBottom: "1px solid rgba(255,255,255,.08)" },
  chatTab: { flex: 1, padding: "11px 14px", background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "#888", fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all .2s" },
  chatTabOn: { color: "#fff", background: "rgba(255,255,255,.03)" },
  chatBody: { padding: "18px 14px", maxHeight: 400, overflowY: "auto" },
  bubble: { padding: "10px 14px", borderRadius: 13, marginBottom: 8, maxWidth: "85%", fontSize: 13, lineHeight: 1.5 },
  bubbleUser: { background: "rgba(110,193,119,.1)", border: "1px solid rgba(110,193,119,.15)", marginLeft: "auto", borderBottomRightRadius: 4 },
  bubbleBot: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderBottomLeftRadius: 4 },
  bubbleRole: { fontSize: 10, fontWeight: 700, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 },

  demoH: { fontSize: "clamp(17px,2.3vw,22px)", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 6 },
  demoP: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: 24, lineHeight: 1.5 },

  safetyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 },
  safetyCard: { background: "rgba(232,165,93,.05)", border: "1px solid rgba(232,165,93,.12)", borderRadius: 14, padding: "22px 18px" },
};
