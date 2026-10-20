import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView as useViewport, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

// ─── Links ───────────────────────────────────────────────
const WEB_URL = "https://app.soynuma.app";
const APP_STORE_URL = "https://apps.apple.com/us/app/numa-app/id6788907827";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.numa.mobile";

const INSTAGRAM_URL = "https://www.instagram.com/soynuma.app/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61594481690502";

const PRESS = [
  { name: "RadioViva FM", href: "https://radiovivafm.uy/numa/" },
  { name: "El País", href: "https://www.elpais.com.uy/bienestar/mente/dos-hermanos-uruguayos-unieron-la-programacion-y-la-psicopedagogia-para-crear-una-app-que-combate-la-soledad" },
  { name: "Buenas Noticias", href: "https://buenasnoticias.uy/noticia/numa-la-app-uruguaya-creada-por-dos-hermanos-que-busca-combatir-la-soledad-con-inteligencia-artificial" },
  { name: "El Telégrafo", href: null },
];

// ─── Hooks ───────────────────────────────────────────────
function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, seen];
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

// ─── Pieces ──────────────────────────────────────────────
const EASE = [0.2, 0.7, 0.2, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 20 };

// Entrada del hero: sube y aparece. Con movimiento reducido se muestra directo.
function useRise() {
  const reduced = useReducedMotion();
  return (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };
}

function Reveal({ children, delay = 0, className = "", ...rest }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Fondo de manchas: cada capa sube a distinta velocidad al bajar (profundidad).
function Aura() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const slow = useTransform(scrollY, [0, 4000], [0, -220]);
  const fast = useTransform(scrollY, [0, 4000], [0, -480]);
  return (
    <div className="aura" aria-hidden="true">
      <motion.div className="aura__layer" style={reduced ? undefined : { y: slow }}>
        <i className="aura__b aura__b--1" />
        <i className="aura__b aura__b--2" />
        <i className="aura__b aura__b--5" />
      </motion.div>
      <motion.div className="aura__layer" style={reduced ? undefined : { y: fast }}>
        <i className="aura__b aura__b--3" />
        <i className="aura__b aura__b--4" />
      </motion.div>
    </div>
  );
}

const HERO_WORDS = [
  { t: "Un" },
  { t: "espacio" },
  { t: "para" },
  { t: "escucharte.", accent: true },
];

// Título que entra palabra por palabra.
function HeroTitle() {
  const reduced = useReducedMotion();
  return (
    <h1 aria-label="Un espacio para escucharte.">
      {HERO_WORDS.map((w, i) => (
        <Fragment key={w.t}>
          <motion.span
            className={`word ${w.accent ? "accent" : ""}`}
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12 + i * 0.1, ease: EASE }}
          >
            {w.t}
          </motion.span>
          {i < HERO_WORDS.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}

function FloatBubble({ className, delay, dur, children }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`float-bubble ${className}`}
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: [8, -6] }}
      transition={{
        opacity: { duration: 0.9, delay },
        y: { duration: dur, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  );
}

// Panda del hero: sigue apenas al cursor y sube más lento que la página al bajar.
function HeroArt({ rise }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const follow = { stiffness: 60, damping: 18 };
  const x = useSpring(useTransform(mx, [-1, 1], [-12, 12]), follow);
  const y = useSpring(useTransform(my, [-1, 1], [-9, 9]), follow);
  const rotate = useSpring(useTransform(mx, [-1, 1], [-2.5, 2.5]), follow);
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 700], [0, -80]);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const h = (e) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", h, { passive: true });
    return () => window.removeEventListener("pointermove", h);
  }, [reduced, mx, my]);

  return (
    <motion.div className="hero__art" {...rise(0.16)}>
      <div className="hero__glow" aria-hidden="true" />
      <motion.div className="hero__mascot-wrap" style={reduced ? undefined : { y: lift }}>
        <motion.div style={reduced ? undefined : { x, y, rotate }}>
          <img className="hero__mascot" src="/brand/mascota.png" alt="Numa, el panda que te acompaña" width="420" height="523" />
        </motion.div>
      </motion.div>
      <FloatBubble className="float-bubble--a" delay={1.1} dur={5.5}>Hola, ¿cómo venís hoy?</FloatBubble>
      <FloatBubble className="float-bubble--b" delay={2.1} dur={7}>Contame, acá tengo todo el tiempo.</FloatBubble>
    </motion.div>
  );
}

// ─── Poses del panda ─────────────────────────────────────
// Las animaciones infinitas solo corren mientras la pose está en pantalla.
const pose = (name) => `/brand/poses/${name}.webp`;
const LOOP = { repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };

// Colgado de la "v" de "vos": cuelga de una barra bajo la palabra y se balancea.
function HangingPanda() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useViewport(ref, { margin: "0px 0px -10% 0px" });
  return (
    <motion.span
      ref={ref}
      className="hang__panda"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: -22 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.25 }}
    >
      <motion.img
        src={pose("colgado")}
        alt=""
        width="560"
        height="847"
        loading="lazy"
        decoding="async"
        style={{ transformOrigin: "50% 3%" }}
        animate={inView && !reduced ? { rotate: [-4, 4] } : { rotate: 0 }}
        transition={inView && !reduced ? { duration: 3.4, ...LOOP } : { duration: 0.4 }}
      />
    </motion.span>
  );
}

// Asomado sobre el borde de las tarjetas: sube al entrar y mueve apenas la cabeza.
function PeekingPanda() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useViewport(ref, { margin: "0px 0px -15% 0px" });
  return (
    <motion.div
      ref={ref}
      className="peek"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 46 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
    >
      <motion.img
        src={pose("asomado")}
        alt=""
        width="720"
        height="733"
        loading="lazy"
        decoding="async"
        style={{ transformOrigin: "50% 90%" }}
        animate={inView && !reduced ? { rotate: [-2.5, 2.5] } : { rotate: 0 }}
        transition={inView && !reduced ? { duration: 4.2, ...LOOP } : { duration: 0.4 }}
      />
    </motion.div>
  );
}

// Con el celular, en la esquina del chat de ejemplo.
function ChatPanda() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useViewport(ref, { margin: "0px 0px -10% 0px" });
  return (
    <motion.div
      ref={ref}
      className="chat-panda"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
      animate={inView || reduced ? { opacity: 1, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.9 }}
    >
      <motion.img
        src={pose("celular")}
        alt=""
        width="640"
        height="802"
        loading="lazy"
        decoding="async"
        animate={inView && !reduced ? { y: [0, -6], rotate: [-2, 2] } : { y: 0, rotate: 0 }}
        transition={inView && !reduced ? { duration: 3.2, ...LOOP } : { duration: 0.4 }}
      />
    </motion.div>
  );
}

// Abrazando un corazón, sentado sobre el panel de privacidad: late despacio.
function HeartPanda() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useViewport(ref, { margin: "0px 0px -10% 0px" });
  return (
    <motion.div
      ref={ref}
      className="sit"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.3 }}
    >
      <motion.img
        src={pose("corazon")}
        alt=""
        width="640"
        height="798"
        loading="lazy"
        decoding="async"
        style={{ transformOrigin: "50% 100%" }}
        animate={inView && !reduced ? { scale: [1, 1.04, 1, 1.025, 1] } : { scale: 1 }}
        transition={inView && !reduced ? { duration: 2.8, times: [0, 0.14, 0.3, 0.44, 1], repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
      />
    </motion.div>
  );
}

// Saludando: alterna dos cuadros (brazo arriba / a medias) y descansa entre saludos.
const WAVE = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0];
function WavingPanda() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useViewport(ref, { margin: "0px 0px -10% 0px" });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % WAVE.length), 380);
    return () => clearInterval(id);
  }, [reduced, inView]);
  const raised = reduced ? true : WAVE[step] === 1;
  return (
    <div ref={ref} className="wave" aria-hidden="true">
      <img src={pose("saludo-a")} alt="" width="560" height="603" loading="lazy" decoding="async" style={{ opacity: raised ? 1 : 0 }} />
      <img src={pose("saludo-b")} alt="" width="560" height="603" loading="lazy" decoding="async" style={{ opacity: raised ? 0 : 1 }} />
    </div>
  );
}

// Tarjeta: entra en cascada y se levanta apenas al pasar el mouse.
function FeatureCard({ icon, title, text, i }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="card"
      initial={reduced ? false : "hidden"}
      whileInView="show"
      whileHover={reduced ? undefined : "hover"}
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: i * 0.09, ease: EASE } },
        hover: { y: -6, transition: SPRING },
      }}
    >
      <motion.span className="card__icon" variants={{ hover: { scale: 1.1, rotate: -4, transition: SPRING } }}>
        <Icon name={icon} />
      </motion.span>
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <polygon fill="#2FCBC5" points="3.5,2.2 3.5,21.8 13,12" />
      <polygon fill="#7FE3A6" points="3.5,2.2 13,12 16.4,9.64" />
      <polygon fill="#F59DA5" points="3.5,21.8 13,12 16.4,14.36" />
      <polygon fill="#FFD66B" points="16.4,9.64 20.5,12 16.4,14.36 13,12" />
    </svg>
  );
}

function StoreButtons({ align = "start" }) {
  return (
    <div className={`stores stores--${align}`}>
      <a className="store" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Descargar Numa en el App Store">
        <AppleIcon />
        <span className="store__txt">
          <small>Descargá en el</small>
          <strong>App Store</strong>
        </span>
      </a>
      <a className="store" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Descargar Numa en Google Play">
        <PlayIcon />
        <span className="store__txt">
          <small>Disponible en</small>
          <strong>Google Play</strong>
        </span>
      </a>
    </div>
  );
}

const ICONS = {
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  wind: "M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7",
  chart: "M5 20V11M12 20V4M19 20v-7",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  phone: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 5.9 10.5 8v2H8v3.5h2.5V20H14v-6.5h2.4l.6-3.5H14V8.7c0-.5.2-.7.7-.7z" />
    </svg>
  );
}

function PhoneFrame({ src, alt, className = "", style }) {
  return (
    <motion.figure className={`phone ${className}`} style={style}>
      <img src={src} alt={alt} loading="lazy" />
    </motion.figure>
  );
}

// Los dos teléfonos llegan desde abajo y se acomodan al pasar por pantalla.
function ExercisePhones() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -30]);
  const yFront = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -60]);
  const rBack = useTransform(scrollYProgress, [0, 0.5, 1], [-8, -4, -2]);
  const rFront = useTransform(scrollYProgress, [0, 0.5, 1], [7, 3, 1]);
  return (
    <Reveal ref={ref} className="ex__phones" delay={80}>
      <PhoneFrame
        src="/app/ejercicios.jpg"
        alt="Pantalla de ejercicios de la app: respiración, meditación, yoga y lecturas."
        className="phone--back"
        style={reduced ? { rotate: -4 } : { y: yBack, rotate: rBack }}
      />
      <PhoneFrame
        src="/app/respiracion-478.jpg"
        alt="Ejercicio de respiración 4-7-8 dentro de la app."
        className="phone--front"
        style={reduced ? { rotate: 3 } : { y: yFront, rotate: rFront }}
      />
    </Reveal>
  );
}

// ─── Chat demo (aparece de a poco, como en la app) ───────
const CHAT = [
  { role: "user", text: "hola numa" },
  { role: "numa", text: "¡Ey! ¿Cómo te fue en la entrevista de ayer? Me quedé pensando en eso." },
  { role: "user", text: "bien! me llamaron para una segunda ronda" },
  { role: "numa", text: "¡Vamo! ¿Para cuándo es?" },
];

function ChatDemo() {
  const [ref, seen] = useInView({ threshold: 0.35 });
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      setShown(CHAT.length);
      return;
    }
    const timers = [];
    let t = 500;
    CHAT.forEach((m, i) => {
      if (m.role === "numa") {
        timers.push(setTimeout(() => setTyping(true), t));
        t += 1300;
        timers.push(setTimeout(() => { setTyping(false); setShown(i + 1); }, t));
        t += 900;
      } else {
        timers.push(setTimeout(() => setShown(i + 1), t));
        t += 800;
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [seen, reduced]);

  return (
    <div className="chat" ref={ref} role="img" aria-label="Ejemplo de una charla con Numa: Numa le pregunta a la persona cómo le fue en la entrevista de ayer.">
      <div className="chat__head">
        <img src="/brand/mascota.png" alt="" width="40" height="50" />
        <div>
          <strong>Numa</strong>
          <span>Charla nueva</span>
        </div>
      </div>
      <div className="chat__body" aria-hidden="true">
        {CHAT.slice(0, shown).map((m, i) => (
          <div key={i} className={`bubble bubble--${m.role}`}>{m.text}</div>
        ))}
        {typing && (
          <div className="bubble bubble--numa bubble--typing"><i /><i /><i /></div>
        )}
      </div>
      <div className="chat__input" aria-hidden="true">Escribile a Numa…</div>
    </div>
  );
}

// ─── Respiración 4-7-8 ───────────────────────────────────
const PHASES = [
  { key: "in", label: "Inhalá", secs: 4 },
  { key: "hold", label: "Retené", secs: 7 },
  { key: "out", label: "Soltalo lento", secs: 8 },
];

function BreathingDemo() {
  const reduced = usePrefersReducedMotion();
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(PHASES[0].secs);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        setPhase((p) => {
          const next = (p + 1) % PHASES.length;
          setLeft(PHASES[next].secs);
          return next;
        });
        return l;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const p = PHASES[phase];
  const expanded = running && (p.key === "in" || p.key === "hold");
  const scale = reduced ? 1 : expanded ? 1 : 0.64;
  const dur = running && p.key !== "hold" && !reduced ? p.secs : 0.6;

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      setPhase(0);
      setLeft(PHASES[0].secs);
      setRunning(true);
    }
  };

  return (
    <div className="breath">
      <motion.img
        className="breath__panda"
        src={pose("meditando")}
        alt=""
        aria-hidden="true"
        width="320"
        height="393"
        loading="lazy"
        decoding="async"
        style={{ transformOrigin: "50% 100%" }}
        animate={reduced ? undefined : running ? { scale: expanded ? 1.08 : 0.96 } : { scale: [1, 1.035] }}
        transition={running ? { duration: dur, ease: "easeInOut" } : { duration: 3.6, ...LOOP }}
      />
      <div className="breath__stage">
        <div className="breath__halo" style={{ transform: `scale(${scale})`, transitionDuration: `${dur}s` }} />
        <div className="breath__circle" style={{ transform: `scale(${scale})`, transitionDuration: `${dur}s` }}>
          <span className="breath__label" aria-live="polite">
            {running ? p.label : "Respiremos juntos"}
          </span>
          {running && <span className="breath__count">{left}</span>}
        </div>
      </div>
      <button type="button" className="btn btn--soft" onClick={toggle}>
        {running ? "Pausar" : "Probar la técnica 4-7-8"}
      </button>
      <p className="breath__note">Inhalá 4 segundos, retené 7 y soltalo en 8. La exhalación larga ayuda al cuerpo a bajar un cambio.</p>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const rise = useRise();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <Aura />
      {/* NAV */}
      <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
        <div className="wrap nav__in">
          <a href="#top" className="nav__logo" aria-label="Numa, volver arriba">
            <img src="/brand/wordmark.png" alt="Numa" width="96" height="26" />
          </a>
          <nav className="nav__links" aria-label="Secciones">
            <a href="#acompana">Cómo te acompaña</a>
            <a href="#ejercicios">Ejercicios</a>
            <a href="#privacidad">Privacidad</a>
            <a href="#nosotros">Quiénes somos</a>
          </nav>
          <a className="btn btn--solid btn--sm" href="#descargar">
            Ir a Numa
          </a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero wrap">
          <div className="hero__copy">
            <motion.p className="chip" {...rise(0.04)}>
              <span className="chip__dot" />
              Ya disponible en iOS y Android
            </motion.p>
            <HeroTitle />
            <motion.p className="lead" {...rise(0.5)}>
              Numa te acompaña a poner en palabras lo que sentís, reconocer tus emociones y conocerte mejor.
              Sin juicios, a la hora que sea.
            </motion.p>
            <motion.div {...rise(0.62)}>
              <StoreButtons />
              <p className="hero__web">
                ¿Preferís no descargar nada?{" "}
                <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="link">
                  Conoce a Numa desde el navegador →
                </a>
              </p>
            </motion.div>
          </div>

          <HeroArt rise={rise} />
        </section>

        {/* CÓMO TE ACOMPAÑA */}
        <section id="acompana" className="sec wrap">
          <Reveal className="sec__head">
            <p className="eyebrow">Cómo te acompaña</p>
            <h2 className="hang-title">
              Alguien que se acuerda de <span className="accent hang">vos<HangingPanda /></span>
            </h2>
            <p className="sub">
              Numa no es una lista de consejos. Es un lugar tranquilo para charlar, respirar y entender un poco mejor cómo venís.
            </p>
          </Reveal>

          <div className="cards-wrap">
            <PeekingPanda />
            <div className="cards">
            {[
              { icon: "heart", title: "Se acuerda de vos", text: "Recuerda tu nombre, tu historia y lo que te importa. Si ayer tenías algo importante, hoy te pregunta cómo te fue." },
              { icon: "wind", title: "Ejercicios para cada momento", text: "Respiración, meditación, yoga y lecturas. Numa te sugiere uno cuando charlan y lo sentís necesario." },
              { icon: "lock", title: "Es privado", text: "Lo que charlás es tuyo. No vendemos, usamos ni compartimos tu información." },
              { icon: "chart", title: "Tu ritmo, a la vista", text: "Mirá cómo venís sintiéndote semana a semana y qué temas aparecen más seguido." },
            ].map((c, i) => (
              <FeatureCard key={c.title} i={i} {...c} />
            ))}
            </div>
          </div>
        </section>

        {/* CHARLA */}
        <section className="sec wrap split">
          <Reveal className="split__copy">
            <p className="eyebrow">Una charla de verdad</p>
            <h2>Numa no reacciona como una <span className="accent">IA genérica</span> más</h2>
            <p className="sub">
              Numa recuerda lo que le contaste y te lo devuelve con cuidado. Sin respuestas armadas ni listas de tips: solo alguien que se queda a escucharte.
            </p>
            <ul className="ticks">
              <li>Responde como una persona, no como un manual.</li>
              <li>Está disponible las 24 horas, todos los días.</li>
              <li>Un espacio privado, donde nadie te juzga.</li>
            </ul>
          </Reveal>
          <Reveal className="split__art" delay={120}>
            <div className="chat-wrap">
              <ChatDemo />
              <ChatPanda />
            </div>
          </Reveal>
        </section>

        {/* EJERCICIOS */}
        <section id="ejercicios" className="sec wrap">
          <Reveal className="sec__head">
            <p className="eyebrow">Ejercicios</p>
            <h2>Un respiro cuando lo <span className="accent">necesitás</span></h2>
            <p className="sub">
              Prácticas cortas para calmar el cuerpo y encontrar tu centro, con sonidos de fondo para acompañar.
            </p>
          </Reveal>

          <div className="ex">
            <ExercisePhones />
            <Reveal className="ex__demo" delay={160}>
              <div className="panel">
                <BreathingDemo />
              </div>
              <div className="pills" aria-label="Tipos de ejercicios">
                <span>Respiración</span>
                <span>Meditación</span>
                <span>Yoga</span>
                <span>Lecturas</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PRIVACIDAD Y AYUDA */}
        <section id="privacidad" className="sec wrap">
          <Reveal className="sec__head">
            <p className="eyebrow">Privacidad y cuidado</p>
            <h2>Tu espacio es privado. Y no estás <span className="accent">solo/a</span></h2>
          </Reveal>

          <div className="duo">
            <Reveal className="panel panel--lock" delay={60}>
              <HeartPanda />
              <span className="card__icon"><Icon name="lock" /></span>
              <h3>Lo que charlás queda con Numa</h3>
              <p>
                Tus conversaciones se manejan con privacidad: no se venden ni se comparten. Podés escribir con tranquilidad.
              </p>
              <p>
                Numa no reemplaza la terapia ni a las personas. Busca acompañarte y, cuando hace falta, orientarte hacia ayuda humana.
              </p>
            </Reveal>
            <Reveal className="panel panel--help" delay={140}>
              <h3>Si necesitás hablar con alguien ahora</h3>
              <ul className="lines">
                <li>
                  <span>Línea Vida (Uruguay)</span>
                  <a href="tel:08000767">0800 0767</a>
                </li>
                <li>
                  <span>Apoyo emocional (Uruguay)</span>
                  <a href="tel:08001920">0800 1920</a>
                </li>
                <li>
                  <span>Emergencias (Uruguay)</span>
                  <a href="tel:911">911</a>
                </li>
              </ul>
              <p className="panel__foot">También: Argentina 135 · España 024 · México 800 290 0024. Gratuitas, las 24 horas.</p>
            </Reveal>
          </div>
        </section>

        {/* NOSOTROS */}
        <section id="nosotros" className="sec wrap">
          <Reveal className="about">
            <img className="about__mascot" src={pose("mate")} alt="" width="640" height="801" loading="lazy" decoding="async" />
            <div>
              <p className="eyebrow">Quiénes somos</p>
              <h2>Hecha en Uruguay, por dos <span className="accent">hermanos</span></h2>
              <p className="sub">
                Shaiel desarrolló la tecnología y Giuliana, psicopedagoga, aporta la mirada psicopedagógica. Juntos crearon Numa para que
                cuidar tu bienestar emocional sea algo simple, humano y cercano.
              </p>
              <p className="press">
                <span>Charlamos con</span>
                {PRESS.map((p) =>
                  p.href ? (
                    <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
                  ) : (
                    <b key={p.name}>{p.name}</b>
                  ),
                )}
              </p>
              <p className="thanks">Y gracias al CIE de ORT Uruguay, que nos acompaña en la incubación.</p>
            </div>
          </Reveal>
        </section>

        {/* CIERRE */}
        <section id="descargar" className="wrap closing-wrap">
          <Reveal className="closing">
            <WavingPanda />
            <h2>Para sentirte mejor, el primer paso es poder escucharte.</h2>
            <p>Numa te espera, a la hora que sea.</p>
            <StoreButtons align="center" />
            <a className="btn btn--ghost" href={WEB_URL} target="_blank" rel="noopener noreferrer">
              Conoce a Numa desde el navegador
            </a>
          </Reveal>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__in">
          <img src="/brand/wordmark.png" alt="Numa" width="76" height="21" />
          <div className="social">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Numa en Instagram">
              <InstagramIcon />
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Numa en Facebook">
              <FacebookIcon />
            </a>
          </div>
          <p>Numa no reemplaza la atención profesional. Si estás en peligro, llamá al 911.</p>
          <p className="foot__copy">© 2026 Numa · Hecho en Uruguay</p>
        </div>
      </footer>
    </>
  );
}
