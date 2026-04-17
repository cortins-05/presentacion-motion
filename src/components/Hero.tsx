"use client"

import { motion } from "motion/react"

const TITLE = "MOTION"

export default function Hero() {
  return (
    <main
      className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Contenido ligeramente por encima del centro */}
      <div className="flex flex-col items-center gap-6 -mt-16">

        {/* Título con efecto typewriter letra a letra */}
        <div className="flex">
          {TITLE.split("").map((char, i) => (
            <motion.span
              key={i}
              style={{
                fontFamily: "var(--font-mont-alternates)",
                fontSize: "9rem",
                fontWeight: 900,
                lineHeight: 1,
                color: "#EAB308",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Eslogan con fade-in sutil */}
        <motion.p
          className="text-center max-w-170"
          style={{
            fontFamily: "var(--font-mont-alternates)",
            fontSize: "1.1rem",
            fontWeight: 400,
            color: "rgba(255,255,255,0.75)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 1,
            ease: "easeOut",
          }}
        >
          Una librería de animación para interfaces web que transforma estados
          e interacciones en experiencias fluidas, naturales y listas para
          producción, reduciendo complejidad sin renunciar a control ni
          rendimiento.
        </motion.p>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
      >
        {/* Bounce continuo en elemento interior */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </main>
  )
}

