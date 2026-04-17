"use client"

import { useEffect, useRef, useState, useCallback, startTransition } from "react"
import Image from "next/image"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "motion/react"

/* ─────────────────── TIPOS ─────────────────── */
interface SlideProps {
  isActive: boolean
}

/* ═══════════════════════════════════════════════
   SLIDE 1 — Magnetic Cursor
   ═══════════════════════════════════════════════ */
function MagneticCursor({ isActive }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  const ringX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const ringY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  const rotateX = useTransform(springY, [-150, 150], [15, -15])
  const rotateY = useTransform(springX, [-150, 150], [-15, 15])

  const ringRotateX = useTransform(ringY, [-150, 150], [15, -15])
  const ringRotateY = useTransform(ringX, [-150, 150], [-15, 15])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseX.set(e.clientX - cx)
      mouseY.set(e.clientY - cy)
    },
    [mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      onMouseMove={isActive ? handleMouseMove : undefined}
      onMouseLeave={isActive ? handleMouseLeave : undefined}
      className="relative flex h-full w-full flex-col items-center justify-center select-none"
    >
      {/* Anillo exterior */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          rotateX: ringRotateX,
          rotateY: ringRotateY,
          transformPerspective: 800,
        }}
        className="pointer-events-none absolute"
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: "2px solid rgba(234,179,8,0.4)",
          }}
        />
      </motion.div>

      {/* Círculo principal */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          rotateX,
          rotateY,
          transformPerspective: 800,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "#EAB308",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mont-alternates)",
              fontWeight: 900,
              fontSize: "1.8rem",
              color: "#000",
            }}
          >
            motion
          </span>
        </div>
      </motion.div>

      {/* Texto inferior */}
      <p
        className="absolute bottom-16"
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        useMotionValue + useSpring
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SLIDE 2 — Stagger Grid Explosion
   ═══════════════════════════════════════════════ */
const GRID_COLS = 4
const GRID_ROWS = 3
const CARD_LABELS = [
  "Layout", "Spring", "Gesture", "Drag",
  "Scroll", "Exit", "SVG", "3D",
  "Keyframe", "Stagger", "Morph", "Physics",
]

function StaggerGrid({ isActive }: SlideProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleHoverStart = useCallback(
    (hoveredIdx: number) => {
      if (!isActive) return
      const hCol = hoveredIdx % GRID_COLS
      const hRow = Math.floor(hoveredIdx / GRID_COLS)

      for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
        if (i === hoveredIdx) continue
        const col = i % GRID_COLS
        const row = Math.floor(i / GRID_COLS)
        const dx = col - hCol
        const dy = row - hRow
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist === 0) continue
        const force = Math.max(0, 70 - dist * 20)
        const nx = (dx / dist) * force
        const ny = (dy / dist) * force
        const el = cardRefs.current[i]
        if (el) {
          animate(el, { x: nx, y: ny }, { type: "spring", stiffness: 200, damping: 18 })
        }
      }
    },
    [isActive],
  )

  const handleHoverEnd = useCallback(() => {
    for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
      const el = cardRefs.current[i]
      if (el) {
        animate(el, { x: 0, y: 0 }, { type: "spring", stiffness: 200, damping: 18 })
      }
    }
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 select-none">
      <h2
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 800,
          fontSize: "2rem",
          color: "#fff",
        }}
      >
        Stagger Grid
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 160px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 100px)`,
          gap: 12,
        }}
      >
        {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
          <motion.div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            onHoverStart={() => handleHoverStart(i)}
            onHoverEnd={handleHoverEnd}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mont-alternates)",
                fontWeight: 900,
                fontSize: "1.5rem",
                color: "#EAB308",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              {CARD_LABELS[i]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SLIDE 3 — Liquid Progress
   ═══════════════════════════════════════════════ */
function LiquidProgress({ isActive }: SlideProps) {
  const progress = useMotionValue(0)
  const springProgress = useSpring(progress, { stiffness: 40, damping: 12 })
  const scaleX = useTransform(springProgress, [0, 100], [0, 1])
  const displayNum = useTransform(springProgress, (v) => Math.round(v))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const unsub = displayNum.on("change", (v) => setDisplayValue(v))
    return unsub
  }, [displayNum])

  useEffect(() => {
    if (!isActive) {
      progress.jump(0)
      startTransition(() => setDisplayValue(0))
      return
    }

    let cancelled = false

    const runCycle = () => {
      if (cancelled) return
      progress.jump(0)
      const controls = animate(progress, 100, {
        duration: 2.5,
        ease: "easeInOut",
      })

      // When spring settles near 100, wait then restart
      const timeout = setTimeout(() => {
        if (!cancelled) runCycle()
      }, 4200) // 2.5s anim + ~0.5s spring settle + 1.2s pause

      return () => {
        controls.stop()
        clearTimeout(timeout)
      }
    }

    const cleanup = runCycle()
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [isActive, progress])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 select-none">
      {/* Contador */}
      <span
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 900,
          fontSize: "6rem",
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {displayValue}%
      </span>

      {/* Barra */}
      <div
        style={{
          width: 500,
          height: 6,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            scaleX,
            transformOrigin: "left",
            height: "100%",
            background: "#EAB308",
            borderRadius: 999,
          }}
        />
      </div>

      {/* Etiqueta */}
      <p
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Cargando experiencia...
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SLIDE 4 — Expanding Gallery
   ═══════════════════════════════════════════════ */
const GALLERY_IMAGES = ["/img-1.jpg", "/img-2.jpg", "/img-3.jpg", "/img-4.jpg"]
const GALLERY_LABELS = ["Landscape", "Nature", "Journey", "Wonder"]

function ExpandingGallery({ isActive }: SlideProps) {
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (!isActive) {
      startTransition(() => setExpanded(null))
    }
  }, [isActive])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 select-none">
      <h2
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontWeight: 800,
          fontSize: "2rem",
          color: "#fff",
        }}
      >
        Gallery
      </h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          height: 340,
          alignItems: "center",
          perspective: 800,
        }}
      >
        {GALLERY_IMAGES.map((src, i) => {
          const isExpanded = expanded === i
          return (
            <motion.div
              key={i}
              onClick={() => setExpanded(isExpanded ? null : i)}
              animate={{
                width: isExpanded ? 420 : expanded !== null ? 80 : 180,
                rotateY: isExpanded ? 0 : expanded !== null ? (i < expanded ? 8 : -8) : 0,
                opacity: expanded !== null && !isExpanded ? 0.6 : 1,
              }}
              whileHover={expanded === null ? { scale: 1.04, y: -6 } : {}}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 28,
              }}
              style={{
                height: 340,
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Image
                src={src}
                alt={GALLERY_LABELS[i]}
                fill
                style={{ objectFit: "cover" }}
                draggable={false}
              />
              {/* Overlay gradient */}
              <motion.div
                animate={{
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                }}
              />
              {/* Label */}
              <motion.div
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  y: isExpanded ? 0 : 20,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: isExpanded ? 0.15 : 0,
                }}
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 24,
                  right: 24,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mont-alternates)",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                    color: "#fff",
                  }}
                >
                  {GALLERY_LABELS[i]}
                </span>
                <div
                  style={{
                    width: 40,
                    height: 3,
                    background: "#EAB308",
                    borderRadius: 999,
                    marginTop: 8,
                  }}
                />
              </motion.div>
              {/* Index badge */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mont-alternates)",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: "#EAB308",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p
        style={{
          fontFamily: "var(--font-mont-alternates)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Click to expand
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SLIDE 5 — Morphing Shape
   ═══════════════════════════════════════════════ */
// All shapes use polygon() with exactly 10 points so CSS can interpolate between them
const SHAPES = [
  {
    name: "CÍRCULO",
    clipPath:
      "polygon(50% 0%, 79% 10%, 98% 35%, 98% 65%, 79% 90%, 50% 100%, 21% 90%, 2% 65%, 2% 35%, 21% 10%)",
    color: "#EAB308",
  },
  {
    name: "CUADRADO",
    clipPath:
      "polygon(0% 0%, 33% 0%, 67% 0%, 100% 0%, 100% 50%, 100% 100%, 67% 100%, 33% 100%, 0% 100%, 0% 50%)",
    color: "#FFFFFF",
  },
  {
    name: "TRIÁNGULO",
    clipPath:
      "polygon(50% 0%, 63% 25%, 75% 50%, 88% 75%, 100% 100%, 67% 100%, 33% 100%, 0% 100%, 17% 67%, 33% 33%)",
    color: "rgba(234,179,8,0.7)",
  },
  {
    name: "ESTRELLA",
    clipPath:
      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    color: "rgba(255,255,255,0.9)",
  },
]

function MorphingShape({ isActive }: SlideProps) {
  const [shapeIdx, setShapeIdx] = useState(0)

  useEffect(() => {
    if (!isActive) {
      startTransition(() => setShapeIdx(0))
      return
    }
    const interval = setInterval(() => {
      setShapeIdx((prev) => (prev + 1) % SHAPES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isActive])

  const shape = SHAPES[shapeIdx]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 select-none">
      <div className="relative" style={{ width: 300, height: 300 }}>
        {/* Reflejo */}
        <motion.div
          animate={{
            clipPath: shape.clipPath,
            backgroundColor: shape.color,
          }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 12,
            delay: 0.3,
          }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 20,
            width: 300,
            height: 300,
            opacity: 0.15,
          }}
        />
        {/* Shape principal */}
        <motion.div
          animate={{
            clipPath: shape.clipPath,
            backgroundColor: shape.color,
          }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 12,
          }}
          style={{
            position: "absolute",
            inset: 0,
          }}
        />
      </div>

      {/* Nombre de la forma */}
      <AnimatePresence mode="wait">
        <motion.span
          key={shape.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: "var(--font-mont-alternates)",
            fontWeight: 900,
            fontSize: "1rem",
            color: "#EAB308",
            letterSpacing: "0.3em",
          }}
        >
          {shape.name}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL — ProShowcase (Carousel)
   ═══════════════════════════════════════════════ */
const SLIDES = [MagneticCursor, StaggerGrid, LiquidProgress, ExpandingGallery, MorphingShape]
const TOTAL = SLIDES.length

export default function ProShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const trackX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const isAnimating = useRef(false)

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        setContainerWidth(w)
        // Re-sync track on resize
        trackX.jump(-currentSlide * w)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToSlide = useCallback(
    (slideIdx: number) => {
      if (containerWidth === 0 || isAnimating.current) return
      isAnimating.current = true
      const target = -slideIdx * containerWidth
      animate(trackX, target, {
        type: "spring",
        stiffness: 300,
        damping: 35,
        onComplete: () => { isAnimating.current = false },
      })
      setCurrentSlide(slideIdx)
    },
    [containerWidth, trackX],
  )

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % TOTAL)
  }, [currentSlide, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + TOTAL) % TOTAL)
  }, [currentSlide, goToSlide])

  // Keyboard navigation
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
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Track */}
      <motion.div
        style={{
          x: trackX,
          display: "flex",
          width: `${TOTAL * 100}vw`,
          height: "100%",
        }}
      >
        {SLIDES.map((SlideComponent, i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100%",
              flexShrink: 0,
            }}
          >
            <SlideComponent isActive={i === currentSlide} />
          </div>
        ))}
      </motion.div>

      {/* Botón Anterior */}
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
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
        }}
        aria-label="Slide anterior"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      {/* Botón Siguiente */}
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

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goToSlide(i)}
            animate={{
              scaleX: i === currentSlide ? 1.8 : 1,
              backgroundColor: i === currentSlide ? "#EAB308" : "rgba(255,255,255,0.3)",
            }}
            whileHover={{
              backgroundColor: i === currentSlide ? "#EAB308" : "rgba(255,255,255,0.5)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 24,
              height: 4,
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
