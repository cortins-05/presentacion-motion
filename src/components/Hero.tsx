"use client"

import { motion } from "motion/react"
import { FaReact, FaVuejs } from "react-icons/fa"
import { IoLogoJavascript } from "react-icons/io5"

const TITLE = "MOTION"

const FRAMEWORKS = [
  { name: "React", icon: FaReact, color: "#61DAFB" },
  { name: "JavaScript", icon: IoLogoJavascript, color: "#F7DF1E" },
  { name: "Vue", icon: FaVuejs, color: "#42B883" },
]

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

        {/* Compatibilidad con frameworks */}
        <motion.div
          className="flex items-center gap-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
        >
          {FRAMEWORKS.map((fw, i) => (
            <motion.div
              key={fw.name}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + i * 0.15, duration: 0.5, ease: "easeOut" }}
              whileHover={{
                borderColor: fw.color + "40",
                backgroundColor: fw.color + "08",
                scale: 1.03,
              }}
              style={{ cursor: "default" }}
            >
              <fw.icon size={20} color={fw.color} />
              <span
                style={{
                  fontFamily: "var(--font-mont-alternates)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {fw.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
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

