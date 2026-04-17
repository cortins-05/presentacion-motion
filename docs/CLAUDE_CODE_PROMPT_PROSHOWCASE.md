# Instrucciones para Claude Code — ProShowcase.tsx

## Contexto del proyecto

Estoy haciendo una web en **Next.js (solo frontend, sin backend)** que sirve como presentación interactiva de la librería **Motion** para React. La web es una única ruta `/`, pensada exclusivamente para **pantallas de escritorio** (no responsive). La navegación es mediante **scroll vertical** a través de secciones.

Este componente es la **sección final de la web** — el cierre de la presentación. Su propósito es demostrar el poder máximo de Motion con 5 ejemplos profesionales y sorprendentes, sin mostrar código, solo la experiencia visual pura.

---

## Stack y dependencias relevantes

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `motion` (importar **siempre** desde `motion/react`)
- Fuente: **Montserrat Alternates** — ya importada y configurada globalmente. Usarla en títulos y textos destacados con `font-weight` 800 o 900.

---

## Paleta de colores

| Rol | Valor |
|---|---|
| Fondo del componente | `#000000` (negro puro) |
| Texto principal | `#FFFFFF` (blanco) |
| Color de acento | `#EAB308` (amarillo — Tailwind `yellow-500`) |

---

## Descripción general del componente

- Nombre del componente: `ProShowcase`
- Ocupa **exactamente `100vh`** — fullscreen.
- Es un **carousel horizontal** implementado con **Motion puro** (`drag`, `useMotionValue`, `useAnimationControls`) — sin librerías externas de carousel.
- Navegación **solo por swipe/drag** (sin botones, sin flechas). Pensado para pizarra táctil.
- **Loop infinito real**: al llegar al último slide y hacer swipe, vuelve al primero (y viceversa) con transición fluida, sin salto brusco.
- Cada slide ocupa el **100% del ancho y alto** del componente.
- **Indicador de slide:** 5 líneas pequeñas y finas en la parte inferior central. La activa en amarillo (`#EAB308`) con un leve `scaleX` mayor, las demás en blanco con opacidad `0.3`. Animadas con Motion.
- Client Component: `"use client"` al inicio del archivo.
- Exportar como `export default function ProShowcase()`.

---

## Arquitectura del carousel

Usar un contenedor externo con `overflow: hidden` y dentro un track con todos los slides en fila horizontal. La navegación se gestiona con `useMotionValue` para el `x` del track, aplicando `useSpring` o `animate` con spring físico al soltar el drag. Detectar la dirección y velocidad del gesto (`velocity`) para decidir si avanzar o retroceder. El loop infinito se implementa clonando el primer y último slide en los extremos y reposicionando el track de forma silenciosa (sin transición) cuando se alcanza un clon.

---

## Los 5 slides — descripción detallada

---

### Slide 1 — Magnetic Cursor

**Concepto:** Un elemento circular en el centro que reacciona al cursor como si fuera magnético — se deforma, inclina y atrae hacia el puntero con inercia física real.

**Layout:** Centrado vertical y horizontalmente. Texto descriptivo en la parte inferior.

**Implementación:**
- Capturar posición del cursor con `useMotionValue` (`mouseX`, `mouseY`) relativa al centro del elemento mediante un listener en `mousemove`.
- Aplicar `useSpring` con `stiffness: 150, damping: 15` para el movimiento del círculo principal.
- Rotación 3D con `useTransform` sobre la distancia al cursor: `rotateX` y `rotateY` máximo ±15 grados, aplicados al elemento con `style={{ transformPerspective: 800 }}`.
- **Círculo principal:** `200px`, fondo amarillo `#EAB308`, texto `motion` en negro con Montserrat Alternates 900, `border-radius: 50%`.
- **Anillo exterior:** mismo centro, `260px`, borde `2px solid #EAB308` con opacidad `0.4`, sigue al cursor con spring más lento (`stiffness: 80, damping: 20`) dando sensación de desfase visual.
- Al salir el cursor del slide (`onMouseLeave`), ambos elementos vuelven suavemente a `x: 0, y: 0, rotateX: 0, rotateY: 0`.
- Texto inferior: `useMotionValue + useSpring` en blanco, `font-size: 0.75rem`, Montserrat Alternates, opacidad `0.5`.

---

### Slide 2 — Stagger Grid Explosion

**Concepto:** Una cuadrícula de tarjetas que al hacer hover se repelen desde el punto de entrada — las más cercanas huyen más, las lejanas menos. Al salir, todas vuelven con spring.

**Layout:** Grid centrado en el slide, con un título en la parte superior.

**Implementación:**
- Grid de **4 columnas × 3 filas = 12 tarjetas**, `gap: 12px`, tarjetas de tamaño fijo (~`160px × 100px`).
- Cada tarjeta tiene `background: rgba(255,255,255,0.06)`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 12px`.
- Cada tarjeta es un `motion.div` con su propio `useAnimationControls()`.
- Al hacer `onHoverStart` en una tarjeta, calcular el vector normalizado desde esa tarjeta hacia cada una de las demás usando sus índices en el grid (columna, fila). Desplazar cada tarjeta proporcionalmente: las más cercanas hasta `70px`, las más lejanas casi `0px` (usar distancia euclídea para ponderar).
- `animate(controls, { x, y }, { type: "spring", stiffness: 200, damping: 18 })`.
- Al `onHoverEnd`, animar todas de vuelta a `{ x: 0, y: 0 }`.
- Contenido de cada tarjeta: número `01`–`12` en amarillo Montserrat Alternates 900 (`font-size: 1.5rem`) y debajo un texto pequeño en blanco con opacidad `0.3`.
- Título del slide en la parte superior: `Stagger Grid` en blanco Montserrat Alternates 800.

---

### Slide 3 — Liquid Progress

**Concepto:** Una barra de progreso que avanza sola con física líquida. Al llegar al 100% hace overshoot con bounce, el contador numérico va sincronizado con el movimiento real, y al terminar se reinicia en loop.

**Layout:** Centrado vertical y horizontalmente, minimalista. Solo la barra, el número y una etiqueta.

**Implementación:**
- Usar `useMotionValue(0)` para el progreso y `useSpring` con `stiffness: 40, damping: 12` — esto genera el efecto líquido con overshoot natural al llegar al destino.
- Al montar el componente (y cuando `isActive` pasa a `true`), lanzar un `animate` del motion value de `0` a `100` con duración `2.5s` y easing `easeInOut`.
- La barra de progreso es un `motion.div` cuyo `scaleX` se obtiene con `useTransform(springValue, [0, 100], [0, 1])`. Usar `transformOrigin: "left"`.
- La barra: altura `6px`, fondo amarillo `#EAB308`, ancho total `500px`, sobre una base `rgba(255,255,255,0.1)`, `border-radius: 999px`.
- El contador numérico: `useTransform(springValue, v => Math.round(v))` mostrado con `useMotionTemplate` como `` `${value}%` ``. Fuente Montserrat Alternates 900, `font-size: 6rem`, color blanco.
- Al llegar al 100% (detectar con `onChange` en el spring value), esperar `1.2s` y reiniciar: hacer fade out de todo, resetear el value a `0` sin transición, y volver a lanzar la animación. Loop infinito.
- Etiqueta pequeña debajo de la barra: `Cargando experiencia...` en blanco opacidad `0.4`, Montserrat Alternates.

---

### Slide 4 — 3D Card Flip Deck

**Concepto:** Un mazo de 4 tarjetas apiladas con perspectiva 3D. Al hacer swipe/drag sobre el mazo, la tarjeta superior rota en 3D y se descarta, revelando la siguiente. La sombra dinámica responde a la inclinación.

**Imágenes:** Hay 4 imágenes en `/public` con los nombres `img-1.jpg`, `img-2.jpg`, `img-3.jpg`, `img-4.jpg`. Son imágenes horizontales. Usarlas en el anverso de cada tarjeta sin repetirlas. Usar el componente `Image` de Next.js con `fill` y `object-fit: cover`.

**Layout:** Mazo centrado en el slide. Las tarjetas apiladas con un offset visual (las de debajo ligeramente visibles por abajo y por los lados, escala decreciente).

**Implementación:**
- Array de 4 tarjetas, cada una con su imagen (`img-1.jpg` … `img-4.jpg`).
- La tarjeta activa (índice 0 del stack) es draggable (`drag="x"`).
- Usar `useMotionValue` para `x` y `useTransform` para calcular `rotateZ` (inclinación leve según posición x, máx ±15°) y `rotateY` (flip 3D, máx ±25°).
- La sombra (`boxShadow`) también varía con `useTransform` — más intensa cuando más inclinada.
- Al soltar con suficiente velocidad o desplazamiento (`>120px`), la tarjeta vuela fuera de pantalla (`animate` a `x: ±1000, opacity: 0`) y pasa al final del stack. La siguiente tarjeta hace una entrada desde escala `0.9` a `1` con spring.
- Cada tarjeta tiene `border-radius: 20px`, `overflow: hidden`, tamaño `480px × 300px`.
- El reverso de la tarjeta (visible durante el flip): fondo negro con el número de imagen en amarillo centrado, Montserrat Alternates 900.
- `style={{ transformPerspective: 1000 }}` en el contenedor del mazo.
- Cuando el stack se agota (4 swipes), las tarjetas vuelven a aparecer en orden con una animación de entrada escalonada (stagger).
- **Importante:** el drag de este slide interno no debe propagar el evento al carousel padre. Usar `e.stopPropagation()` en `onDragStart` del mazo.

---

### Slide 5 — Morphing Shape

**Concepto:** Una figura geométrica hace loop infinito entre 4 formas distintas con transiciones de `clipPath` completamente fluidas. El color del shape y el nombre de la forma cambian sincronizados.

**Layout:** Centrado. La figura ocupa un área prominente (~`300px × 300px`). Nombre de la forma actual debajo, animado con fade entre cambios.

**Implementación:**
- Definir 4 formas mediante valores de `clipPath` en porcentajes:
  - **Círculo:** `circle(50% at 50% 50%)`
  - **Cuadrado:** `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
  - **Triángulo:** `polygon(50% 0%, 100% 100%, 0% 100%)`
  - **Estrella:** `polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`
- Usar `animate` de Motion con `clipPath` como propiedad animable. Transición: `type: "spring", stiffness: 60, damping: 12` para que el morphing sea orgánico con ligero overshoot.
- Colores del shape en cada forma:
  - Círculo → `#EAB308` (amarillo)
  - Cuadrado → `#FFFFFF` (blanco)
  - Triángulo → `rgba(234,179,8,0.7)`
  - Estrella → `rgba(255,255,255,0.9)`
- El cambio de forma ocurre cada `2s` automáticamente en loop, usando `useEffect` con `setInterval` (limpiar en el cleanup). Solo cuando `isActive === true`.
- El nombre de la forma (`CÍRCULO`, `CUADRADO`, `TRIÁNGULO`, `ESTRELLA`) aparece debajo con fade-out/fade-in sincronizado al cambio. Montserrat Alternates 900, color amarillo `#EAB308`, `font-size: 1rem`, `letter-spacing: 0.3em`.
- Detrás del shape, un reflejo del mismo shape desplazado `+20px` en Y y con opacidad `0.15`, animado con `0.3s` de delay respecto al principal para dar profundidad.

---

## Requisitos técnicos generales

- Usar **exclusivamente la API de `motion/react`**: `motion.div`, `useMotionValue`, `useSpring`, `useTransform`, `useAnimationControls`, `animate`, `useMotionTemplate`.
- Cada slide es un componente hijo separado definido en el mismo archivo como función interna o en archivos separados dentro de la misma carpeta: `MagneticCursor`, `StaggerGrid`, `LiquidProgress`, `CardFlipDeck`, `MorphingShape`.
- Cada slide recibe una prop `isActive: boolean`. Cuando `isActive` es `false`, el slide debe **detener todos sus loops, intervals y listeners** (cleanup en `useEffect`) para no consumir recursos innecesariamente.
- TypeScript estricto — tipar correctamente props, refs y motion values.
- No usar `whileInView` — las animaciones se controlan exclusivamente con la prop `isActive`.
- El drag del carousel y el drag interno del Slide 4 no deben interferir — gestionar la propagación correctamente.
- No añadir padding o margin global que pueda romper el encaje con las otras secciones del scroll.
