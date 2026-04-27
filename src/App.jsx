import { useState, useEffect, useRef } from "react";
import pandaImg from "./panda.png";

// ─── Data ────────────────────────────────────────────────
const CRISIS_STATS = [
  { number: "764", label: "personas se quitaron la vida en Uruguay en 2024", source: "MSP Uruguay, 2025" },
  { number: "7°", label: "lugar mundial en tasa de suicidio según la OMS", source: "OMS, 2025" },
  { number: "16", label: "uruguayos mueren por suicidio cada semana", source: "OPS, 2024" },
  { number: "2ª", label: "causa de muerte entre adultos menores de 45 años", source: "MSP, 2023" },
];

const YOUTH_STATS = [
  { value: "1 de 4", text: "personas dice sentirse triste o desesperada con frecuencia", emoji: "😞" },
  { value: "+30%", text: "aumento de consultas por ansiedad post-pandemia", emoji: "📉" },
  { value: "24/7", text: "la angustia no avisa — llega a cualquier hora y a cualquier edad", emoji: "⏰" },
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

const WEEK_MOODS = [
  { day: "M", emoji: "·", level: 0 },
  { day: "M", emoji: "🙂", level: 3 },
  { day: "J", emoji: "·", level: 0 },
  { day: "V", emoji: "🙂", level: 3 },
  { day: "S", emoji: "·", level: 0 },
  { day: "D", emoji: "·", level: 0 },
  { day: "L", emoji: "😄", level: 4 },
];

const RECURRING_TOPICS = [
  { icon: "💼", label: "Trabajo", count: "5x" },
  { icon: "😴", label: "Sueño", count: "3x" },
  { icon: "👨‍👩‍👧", label: "Familia", count: "2x" },
];

const NUMA_PATTERNS = [
  { icon: "📅", title: "Los viernes son tus mejores días", desc: "Después de hablar de 'trabajo', tu ánimo mejora notablemente." },
  { icon: "🌬️", title: "La respiración 4-7-8 te funciona", desc: "Es la práctica que más se correlaciona con tus días buenos." },
  { icon: "🌙", title: "Dormir poco te afecta al día siguiente", desc: "Detectado en 5 semanas seguidas. ¿Querés que te recuerde tu rutina de sueño?" },
];

const MONTH_MOMENTS = [
  { date: "12 ABR", title: "Conversación difícil", desc: "Hablaste con tu jefe. Tu ánimo mejoró los 4 días siguientes.", color: "#6EC177" },
  { date: "8 ABR", title: "Primera racha de 7 días", desc: "Completaste una semana entera de check-ins.", color: "#7B6BE8" },
  { date: "3 ABR", title: "Nueva práctica", desc: "Descubriste 'Lugar Seguro'. La hiciste 4 veces desde entonces.", color: "#5A8FB8" },
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

// ─── Phone carousel screens ──────────────────────────────
const PHONE_SCREENS = [
  {
    tab: "chat",
    title: "Recuerda quién sos",
    caption: "Numa arranca la conversación con tu contexto, no desde cero.",
    content: "chat_morning",
  },
  {
    tab: "chat",
    title: "Sugiere, no sermonea",
    caption: "Cuando detecta que algo pesa, ofrece una práctica corta — vos decidís.",
    content: "chat_breathing",
  },
  {
    tab: "estado",
    title: "Tu mes, sin calificarte",
    caption: "Racha, minutos y temas. Sin puntajes ni juicios sobre cómo te sentiste.",
    content: "estado",
  },
  {
    tab: "chat",
    title: "Reacciona como amigo",
    caption: "Celebra lo bueno, pregunta lo importante. Sin listas automáticas.",
    content: "chat_exam",
  },
];

function PhoneScreen({ content }) {
  if (content === "chat_morning") {
    return (
      <>
        <PhoneTabs active="chat" />
        <div style={PS.chatScroll}>
          <div style={PS.chatTime}>Hoy · 9:12</div>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>Buen día, Martín 🌿 ¿Cómo amaneciste hoy?</div>
          <div style={{ ...PS.bubble, ...PS.bubbleUser }}>Medio ansioso. Dormí mal otra vez pensando en la reunión.</div>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>Gracias por contarme. Es el cuarto día que mencionás la reunión — parece que te está pesando.</div>
        </div>
      </>
    );
  }
  if (content === "chat_breathing") {
    return (
      <>
        <PhoneTabs active="chat" />
        <div style={PS.chatScroll}>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>¿Querés que hagamos una respiración corta antes? Tengo 4-7-8 de 2 min, te ayudó bien la semana pasada.</div>
          <div style={PS.chipsRow}>
            <div style={PS.chip}>Sí, dale 🌿</div>
            <div style={PS.chip}>Prefiero hablar</div>
            <div style={PS.chip}>Ahora no</div>
          </div>
          <div style={{ ...PS.bubble, ...PS.bubbleUser }}>Dale, mejor respirar.</div>
          <div style={PS.exerciseCard}>
            <div style={PS.exerciseIcon}>🌬️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#2d3a32" }}>Respiración 4-7-8</div>
              <div style={{ fontSize: 11.5, color: "#6a7a6d", marginTop: 2 }}>2 minutos · Ansiedad</div>
            </div>
            <div style={{ color: "#6EC177", fontSize: 18 }}>›</div>
          </div>
        </div>
      </>
    );
  }
  if (content === "chat_exam") {
    return (
      <>
        <PhoneTabs active="chat" />
        <div style={PS.chatScroll}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src={pandaImg} alt="" style={{ width: 70, borderRadius: 14 }} />
          </div>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>Che, ¿cómo estás? ¿Qué onda?</div>
          <div style={{ ...PS.bubble, ...PS.bubbleUser }}>tuve el examen hoy</div>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>¿Cómo te fue? ¿Te sentiste bien preparado?</div>
          <div style={{ ...PS.bubble, ...PS.bubbleUser }}>me fue re bien</div>
          <div style={{ ...PS.bubble, ...PS.bubbleBot }}>¡Genial! Me alegra mucho. ¿Qué te pareció el examen? ¿Más fácil o más difícil de lo que esperabas?</div>
        </div>
      </>
    );
  }
  // estado
  return (
    <>
      <PhoneTabs active="estado" />
      <div style={PS.chatScroll}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1f2a22", letterSpacing: -.5 }}>Tu estado</div>
        <div style={{ fontSize: 12, color: "#6a7a6d", marginTop: 2, marginBottom: 14 }}>Tu historia de abril</div>
        <div style={PS.ringsRow}>
          {[
            { value: "28", label: "RACHA", color: "#6EC177" },
            { value: "142", label: "MIN", color: "#5A8FB8" },
            { value: "12", label: "TEMAS", color: "#7B6BE8" },
          ].map((r, i) => (
            <div key={i} style={PS.ringCard}>
              <div style={{ ...PS.ring, borderColor: `${r.color}55`, borderTopColor: r.color }} />
              <div style={PS.ringInner}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1f2a22" }}>{r.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#6a7a6d", letterSpacing: 1 }}>{r.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={PS.numaNoto}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "#a8c4ad", letterSpacing: 1.5, marginBottom: 6 }}>NUMA NOTÓ</div>
          <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
            Los viernes aparecen como tus mejores días. Y después de hablar de 'trabajo', notamos un alivio en tu tono.
          </div>
        </div>
        <div style={PS.momentsBox}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "#6a7a6d", letterSpacing: 1.5, marginBottom: 10 }}>MOMENTOS DE ESTE MES</div>
          <div style={PS.tlItem}>
            <div style={{ ...PS.tlDotSm, background: "#6EC177" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#6EC177", fontWeight: 700 }}>12 ABR</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1f2a22" }}>Conversación difícil</div>
              <div style={{ fontSize: 11, color: "#6a7a6d", marginTop: 2 }}>Hablaste con tu jefe.</div>
            </div>
          </div>
          <div style={PS.tlItem}>
            <div style={{ ...PS.tlDotSm, background: "#7B6BE8" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#7B6BE8", fontWeight: 700 }}>8 ABR</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1f2a22" }}>Primera racha de 7 días</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PhoneTabs({ active }) {
  const tabs = [
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "estado", icon: "📊", label: "Mi estado" },
    { id: "fb", icon: "💭", label: "Feedback" },
  ];
  return (
    <div style={PS.tabBar}>
      {tabs.map(t => (
        <div key={t.id} style={{ ...PS.tab, ...(active === t.id ? PS.tabOn : {}) }}>
          <span style={{ fontSize: 11 }}>{t.icon}</span>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % PHONE_SCREENS.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  const screen = PHONE_SCREENS[idx];

  return (
    <div style={PS.wrap} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={PS.phone}>
        <div style={PS.notch} />
        <div style={PS.statusBar}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 4 }}><span>📶</span><span>🔋</span></span>
        </div>
        <div key={idx} style={PS.screen}>
          <PhoneScreen content={screen.content} />
        </div>
      </div>

      <div style={PS.meta}>
        <div style={PS.metaTitle}>{screen.title}</div>
        <div style={PS.metaCaption}>{screen.caption}</div>
        <div style={PS.dots}>
          {PHONE_SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{ ...PS.dot, ...(i === idx ? PS.dotOn : {}) }}
              aria-label={`Pantalla ${i + 1}`}
            />
          ))}
        </div>
        <div style={PS.arrows}>
          <button style={PS.arrow} onClick={() => setIdx((idx - 1 + PHONE_SCREENS.length) % PHONE_SCREENS.length)}>←</button>
          <span style={PS.counter}>{idx + 1} / {PHONE_SCREENS.length}</span>
          <button style={PS.arrow} onClick={() => setIdx((idx + 1) % PHONE_SCREENS.length)}>→</button>
        </div>
      </div>
    </div>
  );
}

// Parallax pandas flotando en el fondo
const BG_PANDAS = [
  { size: 70,  startTop: 12,  amplitudeX: 40, speedX: 0.18, speedY: 0.35, phase: 0,   opacity: 0.09, rotSpeed: 0.03 },
  { size: 120, startTop: 38,  amplitudeX: 60, speedX: 0.12, speedY: 0.22, phase: 2.1, opacity: 0.07, rotSpeed: 0.02 },
  { size: 55,  startTop: 62,  amplitudeX: 90, speedX: 0.24, speedY: 0.45, phase: 4.3, opacity: 0.10, rotSpeed: 0.05 },
  { size: 95,  startTop: 85,  amplitudeX: 50, speedX: 0.15, speedY: 0.28, phase: 1.2, opacity: 0.08, rotSpeed: 0.04 },
  { size: 45,  startTop: 110, amplitudeX: 70, speedX: 0.28, speedY: 0.5,  phase: 3.5, opacity: 0.11, rotSpeed: 0.06 },
  { size: 80,  startTop: 135, amplitudeX: 55, speedX: 0.16, speedY: 0.3,  phase: 5.1, opacity: 0.08, rotSpeed: 0.025 },
  { size: 60,  startTop: 160, amplitudeX: 75, speedX: 0.22, speedY: 0.4,  phase: 0.8, opacity: 0.09, rotSpeed: 0.045 },
];

function BackgroundPandas({ scrollY }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden", mixBlendMode: "screen" }}>
      {BG_PANDAS.map((p, i) => {
        const baseLeft = (i % 2 === 0 ? 0.18 : 0.78) * vw;
        const wiggle = Math.sin(scrollY * 0.005 + p.phase) * p.amplitudeX;
        const x = baseLeft + wiggle - p.size / 2;
        const y = p.startTop * (typeof window !== "undefined" ? window.innerHeight : 800) / 100 - scrollY * p.speedY;
        const rot = Math.sin(scrollY * p.rotSpeed + p.phase) * 18;
        return (
          <img
            key={i}
            src={pandaImg}
            alt=""
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`,
              opacity: p.opacity,
              borderRadius: p.size * 0.22,
              filter: "blur(0.5px)",
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
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
      <BackgroundPandas scrollY={scrollY} />

      {/* NAV */}
      <nav style={{ ...S.nav, background: scrollY > 50 ? "rgba(10,10,12,.88)" : "transparent", backdropFilter: scrollY > 50 ? "blur(16px)" : "none" }}>
        <span style={S.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>🐼 Numa</span>
        <div style={S.navLinks}>
          <a onClick={() => scrollTo("funciones")} style={S.navLink}>Funciones</a>
          <a onClick={() => scrollTo("diferente")} style={S.navLink}>Diferente</a>
          <a onClick={() => scrollTo("estado")} style={S.navLink}>Mi Estado</a>
          <a onClick={() => scrollTo("crisis")} style={S.navLink}>La Crisis</a>
          <a onClick={() => scrollTo("seguridad")} style={S.navLink}>Seguridad</a>
        </div>
        <a href="https://web-production-3f4e4.up.railway.app/" target="_blank" rel="noopener noreferrer" style={S.navCTA}>
          Ir a Numa →
        </a>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroContent}>
          <img src={pandaImg} alt="Numa" style={{ width: 100, height: "auto", borderRadius: 24, marginBottom: 20, animation: "float 4s ease-in-out infinite" }} />
          <div style={S.heroTag}>Compañero emocional para toda edad</div>
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
          <a href="https://web-production-3f4e4.up.railway.app/" target="_blank" rel="noopener noreferrer" style={S.heroCTA}>
            Conoce a Numa →
          </a>
          <div style={S.heroCTASub}>Gratis · Disponible ahora</div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* FUNCIONES — QUÉ OFRECE NUMA                           */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="funciones" style={{ ...S.sec, background: "linear-gradient(180deg,#0a0a0c 0%,#0c1410 60%,#0a0a0c 100%)", maxWidth: "100%", padding: "90px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={S.tag}>LO QUE OFRECE NUMA</div>
          <h2 style={S.title}>
            Tu compañero emocional,<br />
            <span style={S.hl}>disponible las 24 horas</span>
          </h2>
          <p style={S.sub}>
            Numa no es una app de meditación ni un chatbot de lista de tips.<br />
            Es un espacio que te acompaña, te conoce y aprende con vos.
          </p>

          <div style={S.featGrid}>
            {[
              {
                icon: "🐼",
                title: "Compañero 24/7",
                desc: "Numa está cuando más lo necesitás — a las 3 AM, antes de una reunión difícil, o simplemente cuando querés hablar sin juzgar.",
                color: "#6EC177",
              },
              {
                icon: "🌬️",
                title: "Ejercicios de respiración",
                desc: "Técnicas validadas por psicólogos como 4-7-8 y respiración cuadrada. Numa las sugiere en el momento justo según cómo te sentís.",
                color: "#5A8FB8",
              },
              {
                icon: "🧘",
                title: "Meditaciones guiadas",
                desc: "Prácticas cortas y accesibles de mindfulness diseñadas por profesionales. Desde 2 minutos para cuando no tenés tiempo ni energía.",
                color: "#7B6BE8",
              },
              {
                icon: "💬",
                title: "Frases que acompañan",
                desc: "No son citas genéricas de Pinterest. Son mensajes seleccionados por psicólogos para el momento específico que estás viviendo.",
                color: "#E8A55D",
              },
              {
                icon: "📊",
                title: "IA que trackea tu mes",
                desc: "Numa analiza cómo te fuiste sintiendo semana a semana. Ves un resumen de tus días buenos, difíciles y los temas que más aparecieron.",
                color: "#6EC177",
              },
              {
                icon: "🔍",
                title: "Patrones que detecta por vos",
                desc: "Sin que tengas que hacer nada, Numa conecta lo que decís con cómo te sentís. \"Los viernes son tus mejores días\" — ese tipo de insight.",
                color: "#5A8FB8",
              },
              {
                icon: "🔒",
                title: "Datos 100% privados",
                desc: "Tus conversaciones son tuyas. No se usan para entrenar modelos, no se venden, no se comparten. Lo que le decís a Numa, queda en Numa.",
                color: "#E85D5D",
              },
            ].map((f, i) => (
              <div key={i} style={{ ...S.featCard, borderColor: `${f.color}22` }}>
                <div style={{ ...S.featIcon, background: `${f.color}12`, color: f.color }}>{f.icon}</div>
                <div style={S.featTitle}>{f.title}</div>
                <div style={S.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a href="https://web-production-3f4e4.up.railway.app/" target="_blank" rel="noopener noreferrer" style={S.heroCTA}>
              Probá Numa gratis →
            </a>
            <div style={S.heroCTASub}>Sin descarga · Listo en segundos</div>
          </div>
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
      {/* CAPTURAS DE LA APP                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="capturas" style={{ ...S.sec, background: "#0a0a0c" }}>
        <div style={{ ...S.tag, color: "#6EC177" }}>ASÍ SE USA</div>
        <h2 style={S.title}>
          Capturas reales<br />
          del <span style={S.hl}>uso diario</span>
        </h2>
        <p style={S.sub}>
          Así se ve Numa cuando lo abrís a las 3 AM, antes de una reunión,<br />
          o el domingo mirando tu mes.
        </p>
        <PhoneCarousel />
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PILAR 2 — MI ESTADO                                    */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="estado" style={{ ...S.sec, background: "linear-gradient(180deg,#0a0a0c 0%,#0c1410 50%,#0a0a0c 100%)" }}>
        <div style={{ ...S.tag, color: "#6EC177" }}>PILAR 2 — MI ESTADO</div>
        <h2 style={S.title}>
          Numa no solo escucha.<br />
          También <span style={S.hl}>te muestra cómo estuviste</span>.
        </h2>
        <p style={S.sub}>
          Cada conversación deja una huella. Numa la transforma en algo visible:<br />
          cómo te sentiste cada día, qué temas volvieron, qué patrones aparecen.
        </p>

        {/* Mock dashboard */}
        <div style={S.estadoMock}>
          <div style={S.estadoHeader}>
            <span style={S.estadoTab}>💬 Chat</span>
            <span style={{ ...S.estadoTab, ...S.estadoTabOn }}>📊 Mi estado</span>
            <span style={S.estadoTab}>💭 Feedback</span>
          </div>

          <div style={S.estadoBlock}>
            <div style={S.estadoBlockTitle}>Tu estado</div>
            <div style={S.estadoBlockSub}>Últimos 30 días</div>
            <div style={S.estadoNote}>
              Este mes tuviste más días buenos que difíciles. El tema que más apareció fue <strong style={{ color: "#6EC177" }}>'trabajo'</strong>.
            </div>
          </div>

          {/* Week mood */}
          <div style={S.estadoCard}>
            <div style={S.estadoCardTitle}>ESTA SEMANA</div>
            <div style={S.weekRow}>
              {WEEK_MOODS.map((d, i) => (
                <div key={i} style={S.weekCol}>
                  <div style={{ ...S.weekDot, background: d.level ? "#6EC177" : "rgba(255,255,255,.08)", transform: d.level ? `scale(${0.7 + d.level * 0.12})` : "scale(.5)" }} />
                  <div style={S.weekDay}>{d.day}</div>
                  <div style={{ fontSize: 13, marginTop: 2, opacity: d.level ? 1 : 0 }}>{d.emoji}</div>
                </div>
              ))}
            </div>
            <div style={S.weekLegend}>
              <span>😔 Difícil</span><span>🙂 Normal</span><span>😄 Bueno</span>
            </div>
          </div>

          {/* Recurring topics */}
          <div style={S.estadoCard}>
            <div style={S.estadoCardTitle}>TEMAS RECURRENTES</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RECURRING_TOPICS.map((t, i) => (
                <div key={i} style={S.topicChip}>
                  <span>{t.icon}</span>
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                  <span style={S.topicCount}>{t.count}</span>
                </div>
              ))}
            </div>
            <div style={S.estadoQuote}>
              "Está pasando por un momento difícil con su jefe en el trabajo, pero hoy habló con él y se sintió un poco mejor."
            </div>
          </div>
        </div>

        {/* Patterns */}
        <div style={{ marginTop: 56 }}>
          <h3 style={S.demoH}>Patrones que Numa detecta por vos</h3>
          <p style={S.demoP}>
            Sin que tengas que hacer nada. Numa conecta lo que decís, lo que hacés y cómo te sentís.
          </p>
          <div style={S.patternsGrid}>
            {NUMA_PATTERNS.map((p, i) => (
              <div key={i} style={S.patternCard}>
                <div style={S.patternBadge}>NUMA NOTÓ</div>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
                <div style={S.patternTitle}>{p.title}</div>
                <div style={S.patternDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Month timeline */}
        <div style={{ marginTop: 56 }}>
          <h3 style={S.demoH}>Momentos que importan</h3>
          <p style={S.demoP}>
            Numa marca lo significativo: rachas, conversaciones difíciles, prácticas nuevas.
          </p>
          <div style={S.timeline}>
            {MONTH_MOMENTS.map((m, i) => (
              <div key={i} style={S.tlRow}>
                <div style={S.tlSide}>
                  <div style={{ ...S.tlDot, background: m.color }} />
                  {i < MONTH_MOMENTS.length - 1 && <div style={S.tlLine} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.tlDate}>{m.date}</div>
                  <div style={S.tlTitle}>{m.title}</div>
                  <div style={S.tlDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PILAR 3 — LA CRISIS                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="crisis" style={{ ...S.sec, background: "linear-gradient(180deg,#0a0a0c 0%,#1a0a0a 50%,#0a0a0c 100%)" }}>
        <div style={{ ...S.tag, color: "#E85D5D" }}>PILAR 3 — EL PROBLEMA</div>
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
          <span style={S.youthTag}>UN PROBLEMA TRANSVERSAL</span>
          <h3 style={S.youthTitle}>No discrimina edad: afecta a adolescentes, adultos y mayores</h3>
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
          <h3 style={{ ...S.demoH, marginBottom: 32 }}>El camino de alguien que sufre en silencio</h3>
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
        <div style={{ marginTop: 36, position: "relative", zIndex: 1 }}>
          <a href="https://web-production-3f4e4.up.railway.app/" target="_blank" rel="noopener noreferrer" style={{ ...S.heroCTA, fontSize: 18, padding: "18px 44px" }}>
            Conoce a Numa →
          </a>
          <div style={{ ...S.heroCTASub, marginTop: 12 }}>Gratis · Disponible ahora</div>
        </div>
        <div style={{ marginTop: 32, padding: "12px 22px", display: "inline-block", background: "rgba(110,193,119,.08)", border: "1px solid rgba(110,193,119,.2)", borderRadius: 12, fontSize: 14, color: "#ccc", position: "relative", zIndex: 1 }}>
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

  sec: { padding: "90px 24px", maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 },
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

  // ── Mi estado
  estadoMock: { maxWidth: 520, margin: "0 auto", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  estadoHeader: { display: "flex", gap: 6, padding: 4, background: "rgba(110,193,119,.06)", borderRadius: 12 },
  estadoTab: { flex: 1, textAlign: "center", padding: "8px 10px", fontSize: 12, color: "#888", borderRadius: 9, fontWeight: 600 },
  estadoTabOn: { background: "#fff", color: "#1a1a1a", boxShadow: "0 1px 4px rgba(0,0,0,.15)" },
  estadoBlock: { padding: "4px 4px" },
  estadoBlockTitle: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -.5 },
  estadoBlockSub: { fontSize: 12, color: "#6EC177", marginTop: 2, marginBottom: 12 },
  estadoNote: { background: "#2d3a32", color: "#fff", padding: "14px 16px", borderRadius: 12, fontSize: 13, lineHeight: 1.55 },
  estadoCard: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "16px 18px" },
  estadoCardTitle: { fontSize: 11, fontWeight: 700, color: "#6EC177", letterSpacing: 1.5, marginBottom: 14 },
  weekRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "6px 4px 4px", height: 80 },
  weekCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 },
  weekDot: { width: 14, height: 14, borderRadius: "50%", transition: "transform .3s" },
  weekDay: { fontSize: 11, color: "#888", fontWeight: 600, marginTop: 4 },
  weekLegend: { display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10.5, color: "#888" },
  topicChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "rgba(110,193,119,.08)", border: "1px solid rgba(110,193,119,.18)", borderRadius: 20, fontSize: 12.5, color: "#ddd" },
  topicCount: { fontSize: 10, color: "#6EC177", fontWeight: 700, padding: "1px 6px", background: "rgba(110,193,119,.15)", borderRadius: 8 },
  estadoQuote: { fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 14, lineHeight: 1.55, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,.06)" },

  patternsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 },
  patternCard: { background: "rgba(110,193,119,.04)", border: "1px solid rgba(110,193,119,.15)", borderRadius: 14, padding: "20px 18px", position: "relative" },
  patternBadge: { display: "inline-block", fontSize: 9.5, fontWeight: 800, color: "#6EC177", letterSpacing: 1.8, padding: "3px 8px", background: "rgba(110,193,119,.1)", borderRadius: 6, marginBottom: 10 },
  patternTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.35 },
  patternDesc: { fontSize: 12.5, color: "#aaa", lineHeight: 1.55 },

  heroCTA: { display: "inline-block", marginTop: 32, padding: "16px 40px", background: "#6EC177", color: "#0a1a0c", fontSize: 16, fontWeight: 800, borderRadius: 50, textDecoration: "none", letterSpacing: -.3, boxShadow: "0 0 32px rgba(110,193,119,.35)", transition: "transform .2s, box-shadow .2s" },
  heroCTASub: { marginTop: 10, fontSize: 12, color: "#666", letterSpacing: .5 },

  navCTA: { padding: "7px 16px", background: "#6EC177", color: "#0a1a0c", fontSize: 12.5, fontWeight: 700, borderRadius: 20, textDecoration: "none", letterSpacing: -.2, whiteSpace: "nowrap" },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 },
  featCard: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "24px 20px", transition: "transform .2s" },
  featIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 },
  featTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.3 },
  featDesc: { fontSize: 13, color: "#999", lineHeight: 1.6 },

  timeline: { maxWidth: 480, margin: "0 auto" },
  tlRow: { display: "flex", gap: 14, paddingBottom: 4 },
  tlSide: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 },
  tlDot: { width: 11, height: 11, borderRadius: "50%", flexShrink: 0 },
  tlLine: { width: 2, flex: 1, background: "rgba(255,255,255,.08)", marginTop: 4, minHeight: 36 },
  tlDate: { fontSize: 10.5, color: "#6EC177", fontWeight: 700, letterSpacing: 1.2, marginBottom: 4 },
  tlTitle: { fontSize: 14.5, fontWeight: 700, color: "#fff", marginBottom: 4 },
  tlDesc: { fontSize: 12.5, color: "#999", lineHeight: 1.5, marginBottom: 18 },
};

// Phone carousel styles
const PS = {
  wrap: { display: "flex", gap: 48, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 20 },
  phone: { width: 280, height: 580, borderRadius: 42, background: "#1a1a1c", padding: 10, boxShadow: "0 25px 60px rgba(0,0,0,.5), 0 0 0 2px rgba(255,255,255,.04)", position: "relative", flexShrink: 0 },
  notch: { position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 90, height: 22, background: "#000", borderRadius: 14, zIndex: 3 },
  statusBar: { position: "absolute", top: 18, left: 20, right: 20, display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "#1f2a22", zIndex: 2, padding: "0 8px" },
  screen: { width: "100%", height: "100%", borderRadius: 34, background: "linear-gradient(180deg,#dfe9dc 0%,#e8efe5 40%,#d8e3d4 100%)", overflow: "hidden", display: "flex", flexDirection: "column", paddingTop: 48, animation: "fadeIn .4s ease" },

  tabBar: { display: "flex", gap: 4, padding: 4, margin: "0 16px 14px", background: "rgba(255,255,255,.45)", borderRadius: 18 },
  tab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 4px", fontSize: 11, fontWeight: 600, color: "#6a7a6d", borderRadius: 14 },
  tabOn: { background: "#fff", color: "#1f2a22", boxShadow: "0 1px 3px rgba(0,0,0,.08)" },

  chatScroll: { flex: 1, padding: "0 16px 16px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 },
  chatTime: { textAlign: "center", fontSize: 10, color: "#6a7a6d", margin: "4px 0" },
  bubble: { padding: "10px 14px", borderRadius: 16, fontSize: 12.5, lineHeight: 1.45, maxWidth: "85%" },
  bubbleBot: { background: "#fff", color: "#1f2a22", alignSelf: "flex-start", borderBottomLeftRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,.04)" },
  bubbleUser: { background: "#4b5f52", color: "#fff", alignSelf: "flex-end", borderBottomRightRadius: 4 },

  chipsRow: { display: "flex", gap: 6, flexWrap: "wrap", padding: "2px 0" },
  chip: { padding: "6px 10px", background: "#fff", border: "1px solid #c8d4c6", borderRadius: 20, fontSize: 11, color: "#2d3a32", fontWeight: 500 },

  exerciseCard: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,.06)" },
  exerciseIcon: { width: 34, height: 34, borderRadius: 10, background: "#e8efe5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },

  ringsRow: { display: "flex", gap: 8, background: "#fff", padding: "14px 10px", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,.05)", marginBottom: 12 },
  ringCard: { flex: 1, position: "relative", height: 70, display: "flex", alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", inset: 0, margin: "auto", width: 66, height: 66, borderRadius: "50%", border: "4px solid", transform: "rotate(-45deg)" },
  ringInner: { position: "relative", textAlign: "center", zIndex: 1 },

  numaNoto: { background: "#2d3a32", borderRadius: 14, padding: "14px 14px", marginBottom: 12 },
  momentsBox: { background: "#fff", borderRadius: 14, padding: "14px 14px", boxShadow: "0 1px 3px rgba(0,0,0,.05)" },
  tlItem: { display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" },
  tlDotSm: { width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 },

  meta: { maxWidth: 300 },
  metaTitle: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -.5, marginBottom: 8 },
  metaCaption: { fontSize: 14, color: "#aaa", lineHeight: 1.55, marginBottom: 20 },
  dots: { display: "flex", gap: 8, marginBottom: 16 },
  dot: { width: 26, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s" },
  dotOn: { background: "#6EC177", width: 40 },
  arrows: { display: "flex", alignItems: "center", gap: 14 },
  arrow: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#ccc", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  counter: { fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: 1 },
};
