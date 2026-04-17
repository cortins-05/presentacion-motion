"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
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
  const controlsArr = useRef(
    Array.from({ length: GRID_COLS * GRID_ROWS }, () => ({ x: 0, y: 0 })),
  )
  const [, forceRender] = useState(0)
  const animControls = useRef(
    Array.from({ length: GRID_COLS * GRID_ROWS }, () => useAnimationControls()),
  )

  // We need stable controls — create them once with a custom hook wrapper.
  // Since hooks can't be called in a loop at runtime, we pre-create them via ref trick above
  // but that causes a lint issue. Let's use a different approach: animate manually.

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
      setDisplayValue(0)
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
   SLIDE 4 — 3D Card Flip Deck
   ═══════════════════════════════════════════════ */
const DECK_IMAGES = ["/img-1.jpg", "/img-2.jpg", "/img-3.jpg", "/img-4.jpg"]

function CardFlipDeck({ isActive }: SlideProps) {
  const [stack, setStack] = useState([0, 1, 2, 3])
  const [animating, setAnimating] = useState(false)
  const x = useMotionValue(0)
  const rotateZ = useTransform(x, [-300, 300], [-15, 15])
  const rotateY = useTransform(x, [-300, 300], [-25, 25])
  const shadow = useTransform(x, [-300, 0, 300], [
    "8px 8px 30px rgba(234,179,8,0.3)",
    "0px 4px 15px rgba(0,0,0,0.4)",
    "-8px 8px 30px rgba(234,179,8,0.3)",
  ])

  // Reset when becoming inactive
  useEffect(() => {
    if (!isActive) {
      setStack([0, 1, 2, 3])
      setAnimating(false)
      x.jump(0)
    }
  }, [isActive, x])

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (animating || !isActive) return
      const threshold = 120
      const shouldDismiss =
        Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 500

      if (shouldDismiss) {
        setAnimating(true)
        const dir = info.offset.x > 0 ? 1 : -1
        animate(x, dir * 1000, {
          type: "spring",
          stiffness: 200,
          damping: 30,
        }).then(() => {
          setStack((prev) => {
            const [top, ...rest] = prev
            return [...rest, top]
          })
          x.jump(0)
          setAnimating(false)
        })
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 })
      }
    },
    [animating, isActive, x],
  )

  return (
    <div className="flex h-full w-full items-center justify-center select-none">
      <div style={{ position: "relative", width: 480, height: 300, transformStyle: "preserve-3d", perspective: 1000 }}>
        {stack.map((cardIdx, stackPos) => {
          const isTop = stackPos === 0
          const offset = stackPos * 6
          const scale = 1 - stackPos * 0.04

          if (isTop) {
            return (
              <motion.div
                key={`card-${cardIdx}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragStart={(e) => {
                  e.stopPropagation()
                }}
                onDragEnd={handleDragEnd}
                style={{
                  x,
                  rotateZ,
                  rotateY,
                  boxShadow: shadow,
                  position: "absolute",
                  width: 480,
                  height: 300,
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "grab",
                  zIndex: 10 - stackPos,
                  top: offset,
                }}
              >
                <Image
                  src={DECK_IMAGES[cardIdx]}
                  alt={`Card ${cardIdx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  draggable={false}
                />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={`card-${cardIdx}`}
              initial={false}
              animate={{ scale, y: offset }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: "absolute",
                width: 480,
                height: 300,
                borderRadius: 20,
                overflow: "hidden",
                zIndex: 10 - stackPos,
              }}
            >
              <Image
                src={DECK_IMAGES[cardIdx]}
                alt={`Card ${cardIdx + 1}`}
                fill
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SLIDE 5 — Morphing Shape
   ═══════════════════════════════════════════════ */
const SHAPES = [
  {
    name: "CÍRCULO",
    clipPath: "circle(50% at 50% 50%)",
    color: "#EAB308",
  },
  {
    name: "CUADRADO",
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    color: "#FFFFFF",
  },
  {
    name: "TRIÁNGULO",
    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
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
      setShapeIdx(0)
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
            inset: 0,
            top: 20,
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
    </div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL — ProShowcase (Carousel)
   ═══════════════════════════════════════════════ */
const SLIDES = [MagneticCursor, StaggerGrid, LiquidProgress, CardFlipDeck, MorphingShape]
const TOTAL = SLIDES.length

export default function ProShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const trackX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const isDragging = useRef(false)

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // The track has TOTAL+2 slides: [clone-last, 0, 1, 2, 3, 4, clone-first]
  // Index 0 in track = clone of last slide
  // Indices 1..TOTAL = real slides
  // Index TOTAL+1 = clone of first slide
  const trackSlides = [SLIDES[TOTAL - 1], ...SLIDES, SLIDES[0]]

  // Position for real slide i: -(i+1)*containerWidth
  const goToSlide = useCallback(
    (slideIdx: number, instant?: boolean) => {
      const target = -(slideIdx + 1) * containerWidth
      if (instant) {
        trackX.jump(target)
      } else {
        animate(trackX, target, {
          type: "spring",
          stiffness: 300,
          damping: 35,
        })
      }
      setCurrentSlide(slideIdx)
    },
    [containerWidth, trackX],
  )

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false
      if (containerWidth === 0) return

      const currentX = trackX.get()
      const swipeThreshold = containerWidth * 0.15
      const velocityThreshold = 300

      let direction = 0
      if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
        direction = 1 // next
      } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
        direction = -1 // prev
      }

      let newSlide = currentSlide + direction
      // Clamp for now, handle loop after animation
      const clampedSlide = newSlide
      const target = -(clampedSlide + 1) * containerWidth

      animate(trackX, target, {
        type: "spring",
        stiffness: 300,
        damping: 35,
        onComplete: () => {
          // Handle infinite loop repositioning
          if (clampedSlide < 0) {
            // Went to clone-last, jump to real last
            trackX.jump(-(TOTAL) * containerWidth)
            setCurrentSlide(TOTAL - 1)
          } else if (clampedSlide >= TOTAL) {
            // Went to clone-first, jump to real first
            trackX.jump(-1 * containerWidth)
            setCurrentSlide(0)
          } else {
            setCurrentSlide(clampedSlide)
          }
        },
      })
    },
    [containerWidth, currentSlide, trackX],
  )

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Track */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => {
          isDragging.current = true
        }}
        onDragEnd={handleDragEnd}
        style={{
          x: trackX,
          display: "flex",
          width: `${(TOTAL + 2) * 100}vw`,
          height: "100%",
          cursor: "grab",
        }}
      >
        {trackSlides.map((SlideComponent, i) => {
          // Real slide index: i-1 (since index 0 is clone of last)
          const realIdx = i - 1
          const isClone = i === 0 || i === TOTAL + 1
          let activeIdx: number
          if (i === 0) activeIdx = TOTAL - 1
          else if (i === TOTAL + 1) activeIdx = 0
          else activeIdx = realIdx

          return (
            <div
              key={i}
              style={{
                width: "100vw",
                height: "100%",
                flexShrink: 0,
              }}
            >
              <SlideComponent isActive={!isClone && activeIdx === currentSlide} />
            </div>
          )
        })}
      </motion.div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {SLIDES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scaleX: i === currentSlide ? 1.8 : 1,
              backgroundColor: i === currentSlide ? "#EAB308" : "rgba(255,255,255,0.3)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 24,
              height: 2,
              borderRadius: 999,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
    </section>
  )
}
