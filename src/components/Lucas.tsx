"use client"

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { motion, useMotionValue, animate } from "motion/react"

/* ═══════════════════════════════════════════════
   RESALTADO DE SINTAXIS (tokenizer)
   ═══════════════════════════════════════════════ */

type TokenType =
  | "motion-tag"
  | "tag"
  | "motion-prop"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "text"

interface Token {
  type: TokenType
  value: string
}

const MOTION_PROPS = new Set([
  "initial", "animate", "transition", "whileHover", "whileTap",
  "whileDrag", "drag", "dragConstraints", "exit", "mode",
  "key", "variants", "layout",
])

const KW = new Set([
  "const", "let", "var", "return", "function", "export",
  "default", "import", "from", "true", "false", "null", "Infinity",
])

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    /* whitespace */
    if (/\s/.test(line[i])) {
      let j = i
      while (j < line.length && /\s/.test(line[j])) j++
      tokens.push({ type: "text", value: line.slice(i, j) })
      i = j
      continue
    }

    /* comentario */
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", value: line.slice(i) })
      break
    }

    /* cadena con comillas dobles */
    if (line[i] === '"') {
      let j = i + 1
      while (j < line.length && line[j] !== '"') {
        if (line[j] === "\\") j++
        j++
      }
      tokens.push({ type: "string", value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    /* cadena con comillas simples */
    if (line[i] === "'") {
      let j = i + 1
      while (j < line.length && line[j] !== "'") {
        if (line[j] === "\\") j++
        j++
      }
      tokens.push({ type: "string", value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    /* etiqueta JSX  <Tag o </Tag */
    if (line[i] === "<" && i + 1 < line.length && /[A-Za-z/]/.test(line[i + 1])) {
      let j = i + 1
      if (line[j] === "/") j++
      const tagStart = j
      while (j < line.length && /[\w.]/.test(line[j])) j++
      const tagName = line.slice(tagStart, j)
      if (tagName) {
        tokens.push({ type: "text", value: line.slice(i, tagStart) })
        const isMotion = tagName.startsWith("motion") || tagName === "AnimatePresence"
        tokens.push({ type: isMotion ? "motion-tag" : "tag", value: tagName })
        i = j
        continue
      }
    }

    /* número (incluidos negativos) */
    if (
      /\d/.test(line[i]) ||
      (line[i] === "-" && i + 1 < line.length && /\d/.test(line[i + 1]))
    ) {
      let j = i
      if (line[j] === "-") j++
      while (j < line.length && /[\d.]/.test(line[j])) j++
      tokens.push({ type: "number", value: line.slice(i, j) })
      i = j
      continue
    }

    /* palabra */
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /[\w$]/.test(line[j])) j++
      const word = line.slice(i, j)
      if (MOTION_PROPS.has(word)) {
        tokens.push({ type: "motion-prop", value: word })
      } else if (KW.has(word)) {
        tokens.push({ type: "keyword", value: word })
      } else {
        tokens.push({ type: "text", value: word })
      }
      i = j
      continue
    }

    /* fallback: carácter suelto */
    tokens.push({ type: "text", value: line[i] })
    i++
  }

  return tokens
}

const TOKEN_STYLES: Record<TokenType, React.CSSProperties> = {
  "motion-tag": {
    color: "#EAB308",
    background: "rgba(234,179,8,0.12)",
    padding: "0 2px",
    borderRadius: 2,
  },
  tag: { color: "#E06C75" },
  "motion-prop": {
    color: "#EAB308",
    background: "rgba(234,179,8,0.12)",
    padding: "0 2px",
    borderRadius: 2,
  },
  keyword: { color: "#C678DD" },
  string: { color: "#98C379" },
  number: { color: "#D19A66" },
  comment: { color: "#5C6370", fontStyle: "italic" },
  text: { color: "#ABB2BF" },
}

function RenderTokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={TOKEN_STYLES[t.type]}>
          {t.value}
        </span>
      ))}
    </>
  )
}

/* ═══════════════════════════════════════════════
   PANEL DE BLOQUE DE CÓDIGO
   ═══════════════════════════════════════════════ */

function CodeBlock({ code, slideIndex }: { code: string; slideIndex: number }) {
  const lines = code.split("\n")

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
        padding: "3rem 3.5rem",
      }}
    >
      {/* Puntos estilo Mac */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
        <span
          style={{
            marginLeft: 12,
            fontFamily: "var(--font-mont-alternates)",
            fontWeight: 400,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          example-{String(slideIndex).padStart(2, "0")}.tsx
        </span>
      </div>

      {/* separador */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />

      {/* cuerpo del código */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <pre
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "0.95rem",
            lineHeight: 1.7,
            margin: 0,
            color: "#ABB2BF",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "2rem",
                  textAlign: "right",
                  marginRight: "1.5rem",
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "0.85rem",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <code>
                <RenderTokens tokens={tokenizeLine(line)} />
              </code>
            </div>
          ))}
        </pre>
      </div>

      {/* pie de página */}
      <div
        style={{
          textAlign: "right",
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 400,
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        MOTION · REACT · TAILWIND
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   5 EJEMPLOS
   ═══════════════════════════════════════════════ */

interface ExampleProps {
  isActive: boolean
}

/* 1 — ANIMAR  (initial → animate) */
function ExampleAnimate({ isActive }: ExampleProps) {
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (isActive) setKey((k) => k + 1)
  }, [isActive])

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: 192,
        height: 192,
        background: "#EAB308",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 900,
          fontSize: "1.2rem",
          color: "#000",
          letterSpacing: "0.15em",
        }}
      >
        HOLA
      </span>
    </motion.div>
  )
}

/* 2 — HOVER  (whileHover + whileTap) */
function ExampleHover() {
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center rounded-2xl cursor-pointer"
      style={{
        width: 192,
        height: 192,
        background: "#EAB308",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 900,
          fontSize: "1.2rem",
          color: "#000",
          letterSpacing: "0.15em",
        }}
      >
        HOVER
      </span>
    </motion.div>
  )
}

/* 3 — ARRASTRAR */
function ExampleDrag() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileDrag={{ scale: 1.1 }}
      className="flex items-center justify-center rounded-2xl cursor-grab active:cursor-grabbing"
      style={{
        width: 192,
        height: 192,
        background: "#EAB308",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 900,
          fontSize: "1.2rem",
          color: "#000",
          letterSpacing: "0.15em",
        }}
      >
        ARRASTRA
      </span>
    </motion.div>
  )
}

/* 4 — KEYFRAMES  (valores en array + repetición) */
function ExampleKeyframes({ isActive }: ExampleProps) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ["10%", "50%", "10%", "50%", "10%"],
            }
          : { rotate: 0, borderRadius: "10%" }
      }
      transition={
        isActive
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5 }
      }
      className="flex items-center justify-center"
      style={{
        width: 192,
        height: 192,
        background: "#EAB308",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 900,
          fontSize: "1.2rem",
          color: "#000",
          letterSpacing: "0.15em",
        }}
      >
        BUCLE
      </span>
    </motion.div>
  )
}

/* 5 — LAYOUT  (animación automática de layout) */
function ExampleLayout() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer"
        style={{
          display: "flex",
          alignItems: expanded ? "flex-end" : "flex-start",
          justifyContent: expanded ? "flex-end" : "flex-start",
          width: 240,
          height: 240,
          padding: 16,
          borderRadius: 16,
          background: "rgba(0,0,0,0.04)",
          border: "1px dashed rgba(0,0,0,0.15)",
        }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: expanded ? 160 : 80,
            height: expanded ? 160 : 80,
            background: "#EAB308",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <motion.span
            layout
            style={{
              fontFamily: "var(--font-mont-alternates)",
              fontWeight: 900,
              fontSize: expanded ? "1.2rem" : "0.7rem",
              color: "#000",
              letterSpacing: "0.15em",
            }}
          >
            LAYOUT
          </motion.span>
        </motion.div>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 400,
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          color: "rgba(0,0,0,0.4)",
        }}
      >
        PULSA PARA ALTERNAR
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DATOS DE LAS DIAPOSITIVAS
   ═══════════════════════════════════════════════ */

interface SlideData {
  title: string
  instruction: string
  code: string
  Component: React.ComponentType<ExampleProps>
}

const SLIDES: SlideData[] = [
  {
    title: "ANIMAR",
    instruction: "OBSERVA LA ENTRADA →",
    code: `<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
/>`,
    Component: ExampleAnimate,
  },
  {
    title: "HOVER",
    instruction: "PASA EL RATÓN →",
    code: `<motion.div
  whileHover={{ scale: 1.2, rotate: 5 }}
  whileTap={{ scale: 0.9 }}
/>`,
    Component: ExampleHover,
  },
  {
    title: "ARRASTRAR",
    instruction: "ARRÁSTRALO →",
    code: `<motion.div
  drag
  dragConstraints={{
    left: -100, right: 100,
    top: -100, bottom: 100
  }}
  whileDrag={{ scale: 1.1 }}
/>`,
    Component: ExampleDrag,
  },
  {
    title: "KEYFRAMES",
    instruction: "OBSERVA EL BUCLE →",
    code: `<motion.div
  animate={{
    rotate: [0, 90, 180, 270, 360],
    borderRadius: ["10%", "50%", "10%"]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>`,
    Component: ExampleKeyframes,
  },
  {
    title: "LAYOUT",
    instruction: "PULSA LA CAJA →",
    code: `// Motion anima el cambio de layout
// automáticamente con la prop "layout"

<motion.div
  layout
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 30
  }}
  style={{ width: expanded ? 160 : 80 }}
/>`,
    Component: ExampleLayout,
  },
]

const TOTAL = SLIDES.length

/* ═══════════════════════════════════════════════
   LAYOUT DE DIAPOSITIVA  (demo izq. · código dcha.)
   ═══════════════════════════════════════════════ */

function SlideLayout({
  isActive,
  index,
  title,
  instruction,
  code,
  children,
}: {
  isActive: boolean
  index: number
  title: string
  instruction: string
  code: string
  children: ReactNode
}) {
  return (
    <div
      style={{ width: "100vw", height: "100%", flexShrink: 0, display: "flex" }}
      role="group"
      aria-label={`Slide ${index}: ${title}`}
    >
      {/* ── Mitad izquierda — Demo ── */}
      <div
        style={{
          width: "50%",
          height: "100%",
          background: "#FFFFFF",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* cabecera: número + línea amarilla + título */}
        <div style={{ position: "absolute", top: "2.5rem", left: "3rem" }}>
          <motion.div
            animate={isActive ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              style={{
                fontFamily: "var(--font-mont-alternates)",
                fontWeight: 900,
                fontSize: "3.5rem",
                lineHeight: 1,
                color: "#000",
              }}
            >
              {String(index).padStart(2, "0")}
            </span>
          </motion.div>

          <div style={{ width: 40, height: 3, background: "#EAB308", marginTop: 12 }} />

          <motion.div
            animate={isActive ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              style={{
                fontFamily: "var(--font-mont-alternates)",
                fontWeight: 900,
                fontSize: "1rem",
                letterSpacing: "0.3em",
                color: "#000",
                display: "block",
                marginTop: 12,
              }}
            >
              {title}
            </span>
          </motion.div>
        </div>

        {/* área de demo (centrada) */}
        <motion.div
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          style={{
            width: 420,
            height: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </motion.div>

        {/* instrucción inferior */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "3rem",
            fontFamily: "var(--font-mont-alternates)",
            fontWeight: 400,
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          {instruction}
        </div>
      </div>

      {/* ── Mitad derecha — Código ── */}
      <motion.div
        animate={isActive ? { x: 0, opacity: 1 } : { x: 30, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "50%", height: "100%" }}
      >
        <CodeBlock code={code} slideIndex={index} />
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CARRUSEL PRINCIPAL  (mismo patrón que ProShowcase)
   ═══════════════════════════════════════════════ */

export default function Lucas() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const trackX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const isAnimating = useRef(false)

  /* medir contenedor */
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        setContainerWidth(w)
        trackX.jump(-currentSlide * w)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToSlide = useCallback(
    (idx: number) => {
      if (containerWidth === 0 || isAnimating.current) return
      isAnimating.current = true
      animate(trackX, -idx * containerWidth, {
        type: "spring",
        stiffness: 300,
        damping: 35,
        onComplete: () => {
          isAnimating.current = false
        },
      })
      setCurrentSlide(idx)
    },
    [containerWidth, trackX],
  )

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % TOTAL)
  }, [currentSlide, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + TOTAL) % TOTAL)
  }, [currentSlide, goToSlide])

  /* navegación por teclado */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      else if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "#FFFFFF" }}
      role="region"
      aria-roledescription="carousel"
    >
      {/* Pista */}
      <motion.div
        style={{
          x: trackX,
          display: "flex",
          width: `${TOTAL * 100}vw`,
          height: "100%",
        }}
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === currentSlide
          return (
            <SlideLayout
              key={i}
              isActive={isActive}
              index={i + 1}
              title={slide.title}
              instruction={slide.instruction}
              code={slide.code}
            >
              <slide.Component isActive={isActive} />
            </SlideLayout>
          )
        })}
      </motion.div>

      {/* ◀ Botón anterior (lado blanco) */}
      <motion.button
        onClick={goPrev}
        whileHover={{ scale: 1.15, backgroundColor: "rgba(234,179,8,0.25)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          position: "absolute",
          left: 24,
          top: "50%",
          translateY: "-50%",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#000",
        }}
        aria-label="Slide anterior"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      {/* ▶ Botón siguiente (lado oscuro) */}
      <motion.button
        onClick={goNext}
        whileHover={{ scale: 1.15, backgroundColor: "rgba(234,179,8,0.25)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          position: "absolute",
          right: 24,
          top: "50%",
          translateY: "-50%",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
        }}
        aria-label="Slide siguiente"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.button>

      {/* Indicadores (centrados en la mitad izquierda) */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "25%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goToSlide(i)}
            animate={{
              scaleX: i === currentSlide ? 1.4 : 1,
              backgroundColor: i === currentSlide ? "#EAB308" : "rgba(0,0,0,0.2)",
            }}
            whileHover={{
              backgroundColor: i === currentSlide ? "#EAB308" : "rgba(0,0,0,0.4)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              width: 32,
              height: 2,
              borderRadius: 999,
              transformOrigin: "center",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}