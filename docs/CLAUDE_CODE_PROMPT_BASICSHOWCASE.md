# Instrucciones para Claude Code — `BasicShowcase.tsx`

## Contexto

Web en **Next.js (App Router, solo frontend)** que funciona como presentación interactiva de la librería **Motion**. Ruta única `/`, navegación por scroll vertical, **exclusivamente para escritorio**. Este componente es la **sección de ejemplos básicos** — el momento de la presentación en el que muestro a la clase los fundamentos de Motion con código propio a la vista. Es una pieza didáctica: el código tiene que leerse bien desde la última fila del aula.

## Stack

- Next.js 14+ (App Router)
- TypeScript estricto
- Tailwind CSS
- `motion` — importar siempre desde `motion/react`
- Fuente **Montserrat Alternates** ya configurada globalmente. Para títulos y destacados `font-weight: 900`. Para texto secundario `400`–`500`.

## Paleta

| Rol | Valor |
|---|---|
| Fondo | `#FFFFFF` |
| Texto principal | `#000000` |
| Acento | `#EAB308` |

El amarillo es **siempre** el color de destacado. Paleta rigurosamente monocroma blanco/negro con el amarillo como único quiebre cromático.

---

## ⚠️ Regla crítica — sobre `Lucas.tsx`

En `components/Lucas.tsx` ya existe un archivo con mi código. Contiene un componente padre que renderiza **5 divs hijos, uno debajo de otro**, cada uno implementando un ejemplo funcional y sencillo de Motion. El código está **a machete, sin estilos**, pero **funciona correctamente**.

### Instrucciones obligatorias sobre ese código

1. **No tocar la lógica de Motion bajo ningún concepto.** Nada de refactorizar hooks, cambiar valores de `transition`, modificar `variants`, reescribir callbacks, renombrar variables, ni "mejorar" nada. El código tiene que quedar reconocible para que yo pueda explicarlo en clase sin perderme.
2. **Detectar los 5 divs hijos** del componente padre en `Lucas.tsx`. Cada uno es un ejemplo independiente y se convertirá en un slide.
3. **Deducir el nombre/concepto de cada ejemplo a partir del código** (ej: si usa `whileHover`, el slide trata sobre hover; si usa `drag`, sobre drag; si usa `AnimatePresence`, sobre presencia; etc.). Generar un título corto en inglés en mayúsculas tipo `HOVER`, `DRAG`, `SPRING`, `GESTURE`, `LAYOUT`, `ANIMATE PRESENCE`, etc.
4. **Permitido añadir únicamente**:
   - Clases de Tailwind para estilizar el **contenedor externo** y los **elementos visuales** del ejemplo (colores, tamaños, tipografías, bordes, etc.).
   - Textos decorativos alrededor del ejemplo si hacen falta para la composición del slide.
5. **No permitido**:
   - Cambiar la estructura JSX de los ejemplos más allá de aplicar clases.
   - Alterar props de componentes `motion.*`.
   - Añadir hooks de Motion que yo no haya escrito.
   - Reemplazar `motion.div` por `motion.span` u otros cambios de elemento.
6. **Si un ejemplo no tiene estilos coherentes con la estética del componente**, ajustar solo las clases visuales, manteniendo el elemento y sus props de animación intactos.

### Cómo extraer los ejemplos

Claude Code debe leer `Lucas.tsx` y, o bien:
- Extraer cada uno de los 5 divs hijos en variables/componentes dentro de `BasicShowcase.tsx` manteniéndolos idénticos en lógica, o
- Importar `Lucas` y usar una técnica para renderizar solo el hijo N-ésimo de forma aislada en cada slide.

**Preferencia recomendada**: extraer cada hijo como una función interna `Example1()`, `Example2()`, etc. dentro de `BasicShowcase.tsx`, copiando el JSX **exactamente** como está en `Lucas.tsx`. Esto es más robusto y permite aplicar estilos visuales sin contaminar el archivo original de Lucas.

El archivo `Lucas.tsx` **se mantiene intacto** tras este proceso — no se modifica ni se borra.

---

## Arquitectura del componente

- Nombre: `BasicShowcase`
- Client Component (`"use client"`)
- Ocupa exactamente `100vh × 100vw`
- `overflow: hidden`, fondo `#FFFFFF`
- Export: `export default function BasicShowcase()`

### Carousel horizontal con Motion puro

Sin librerías externas. Implementación idéntica en filosofía a la del componente `ProShowcase`:

1. **Track** con los 5 slides en fila horizontal más un clon del primero al final y un clon del último al principio (total 7 posiciones). Cada posición tiene `width: 100vw`.
2. **Estado** — `const [index, setIndex] = useState(1)` apuntando al primer slide real.
3. **Motion value** para el desplazamiento X: `const x = useMotionValue(-window.innerWidth)`.
4. **Drag horizontal**: `drag="x"`, `dragElastic: 0.15`.
5. **Al soltar (`onDragEnd`)**: si `Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500`, avanzar o retroceder un slide. Usar `animate(x, -index * window.innerWidth, { type: "spring", stiffness: 260, damping: 32 })`.
6. **Loop infinito sin salto visible**: al llegar a un clon, reposicionar con `x.set()` instantáneo tras `onAnimationComplete`.
7. **Indicador de slide**: 5 líneas finas en `position: absolute; bottom: 2.5rem` centradas. Cada línea `width: 32px; height: 2px; background: rgba(0,0,0,0.2)`. La activa: `background: #EAB308`, `scaleX: 1.4`. Transición: `{ duration: 0.35, ease: "easeOut" }`.

### Contrato de los slides

Cada slide recibe:

```ts
interface SlideProps {
  isActive: boolean;
  index: number;       // 1 al 5, para numeración visual
  title: string;       // nombre deducido del ejemplo
  children: ReactNode; // el ejemplo funcional de Lucas
  codeString: string;  // el string del código del ejemplo, para mostrarlo en la derecha
}
```

Cuando `isActive === false`, el slide simplemente sigue renderizado estáticamente (aquí no hay loops ni listeners que parar — el código es ejemplos puntuales, no loops infinitos como en `ProShowcase`). Sin embargo, si alguno de los ejemplos de Lucas tuviera un efecto en loop, debe respetar el `isActive` y pausarse.

---

## Layout de cada slide

División vertical exacta en dos mitades:

```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│     DEMO FUNCIONAL           │     CÓDIGO FUENTE            │
│     (mitad izquierda)        │     (mitad derecha)          │
│                              │                              │
│     Fondo blanco             │     Fondo #1e1e1e             │
│     Texto negro              │     Texto syntax-highlight    │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

- Cada mitad ocupa `50vw × 100vh`.
- Sin separador visible, la transición de color blanco → oscuro es el propio borde.

---

### Mitad izquierda — zona del ejemplo funcional

- **Fondo**: `#FFFFFF`.
- **Composición**: centrado vertical y horizontalmente. El ejemplo de Lucas se renderiza con sus estilos mínimos aplicados.
- **Header superior**:
  - En `position: absolute; top: 2.5rem; left: 3rem`.
  - Número del slide grande: `01`, `02`, `03`, `04`, `05`. Montserrat Alternates 900, `font-size: 3.5rem`, color negro, `line-height: 1`.
  - Debajo del número, línea fina amarilla de `40px × 3px`, `gap` de `12px`.
  - Debajo de la línea, el título en mayúsculas (deducido del código): Montserrat Alternates 900, `font-size: 1rem`, `letter-spacing: 0.3em`, color negro.
- **Footer inferior**:
  - En `position: absolute; bottom: 2.5rem; left: 3rem`.
  - Texto `INTERACT WITH THE DEMO ↓` o una instrucción adecuada según el ejemplo (deducir si es hover/click/drag y ajustar el texto: `HOVER OVER IT`, `CLICK TO ANIMATE`, `DRAG ME`, etc.). Montserrat Alternates 500, `font-size: 0.75rem`, `letter-spacing: 0.25em`, negro opacidad `0.5`.
- **Zona de interacción**: el ejemplo de Lucas se renderiza en el centro de la mitad izquierda, con un área dedicada aproximada de `420px × 420px` con `display: flex; align-items: center; justify-content: center`. Aquí se aplican las clases Tailwind que estilicen visualmente los elementos internos del ejemplo (colores, tamaños) **sin tocar las props de Motion**.

---

### Mitad derecha — zona del código

- **Fondo**: `#1e1e1e` (editor oscuro).
- **Padding**: `3rem 3.5rem`.
- **Composición**: centrado vertical, código alineado a la izquierda.

#### Barra superior (estilo editor)

- Altura `40px`, alineada a la izquierda del bloque.
- Tres puntos estilo macOS: `12px × 12px` cada uno, `border-radius: 50%`, colores:
  - `#FF5F56` (rojo)
  - `#FFBD2E` (amarillo, no confundir con nuestro accent)
  - `#27C93F` (verde)
- Gap entre puntos: `8px`.
- A la derecha de los puntos, nombre del archivo: `example-0X.tsx` donde `X` es el número de slide. Color `rgba(255,255,255,0.4)`, Montserrat Alternates 500, `font-size: 0.75rem`, `letter-spacing: 0.1em`.
- Debajo de la barra, línea horizontal `1px` de separación con color `rgba(255,255,255,0.08)`.

#### Bloque de código

- **Fuente**: monoespaciada. Usar `font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace`.
- `font-size: 0.95rem`, `line-height: 1.7`.
- **Numeración de líneas** en la columna izquierda del bloque: color `rgba(255,255,255,0.25)`, `font-size: 0.85rem`, alineadas a la derecha, separadas del código por `1.5rem`.

#### Syntax highlighting

**Opción técnica recomendada**: usar la librería [`shiki`](https://shiki.matsu.io/) (oficial, moderna, ligera, usada por muchos frameworks para SSR/SSG syntax highlighting) con tema `"vitesse-dark"` o `"github-dark"`. Alternativa si da problemas en Next.js: usar `react-syntax-highlighter` con tema `vscDarkPlus`.

Si ninguna encaja, implementar un highlight manual con los colores siguientes (paleta tipo `One Dark`):

| Token | Color |
|---|---|
| Keyword (`const`, `return`, `function`, `export`) | `#C678DD` |
| Nombre de componente / JSX tag (`motion.div`) | `#E06C75` |
| Prop / atributo (`initial`, `animate`) | `#D19A66` |
| String | `#98C379` |
| Número | `#D19A66` |
| Comment | `#5C6370` italic |
| Punctuation (`{`, `}`, `(`, `)`) | `#ABB2BF` |
| Variable / identificador | `#E5C07B` |
| Texto normal | `#ABB2BF` |

**Importante**: las props clave de Motion (`animate`, `initial`, `transition`, `whileHover`, `whileTap`, `drag`, `variants`, `exit`) deben destacarse visualmente. Una opción elegante: aplicarles un `background: rgba(234,179,8,0.12)` sutil y color `#EAB308` — esto hace que el código "hable el idioma" de nuestra presentación y la clase identifica a primera vista qué es Motion y qué no.

#### Extracción del código a mostrar

El `codeString` que se muestra debe ser **literalmente el JSX del ejemplo de Lucas correspondiente**, sin añadir imports ni wrappers. Formato limpio y bien indentado. Ejemplo:

```tsx
<motion.div
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  className="..."
>
  Click me
</motion.div>
```

Para obtener estos strings:
- Opción A (recomendada): definir manualmente en `BasicShowcase.tsx` un array con los 5 códigos como template literals, cada uno copiado a mano desde `Lucas.tsx`. Esto garantiza control total sobre el formato mostrado.
- Opción B: leer el contenido del archivo en build-time (no runtime). Más frágil, no recomendado.

Usar la opción A.

#### Footer del bloque de código

En la parte inferior del bloque (`position: absolute; bottom: 2.5rem; right: 3.5rem`), mostrar una cita o tag relevante. Ejemplos:
- `FRAMER MOTION · REACT · TAILWIND` en `color: rgba(255,255,255,0.3)`, Montserrat Alternates 500, `font-size: 0.7rem`, `letter-spacing: 0.3em`.

---

## Animación de entrada del slide activo

Cuando un slide pasa a ser `isActive`, debe animar su contenido para darle vida:

- **Mitad izquierda**: el número grande (`01`, `02`...) entra con `x: -30 → 0` y `opacity: 0 → 1`, duración `0.6s`, `ease: [0.22, 1, 0.36, 1]`.
- **Mitad izquierda**: el título (`HOVER`, `DRAG`...) entra con `y: 15 → 0` y `opacity: 0 → 1`, delay `0.15s`, duración `0.5s`.
- **Mitad izquierda**: el ejemplo funcional aparece con `opacity: 0 → 1` y `scale: 0.95 → 1`, delay `0.3s`, duración `0.5s`, ease out.
- **Mitad derecha (código)**: aparece con `x: 30 → 0` y `opacity: 0 → 1`, duración `0.6s`, delay `0.1s`. Las líneas de código pueden entrar con un `staggerChildren` opcional de `0.02s` por línea para un efecto de "tipeo" muy sutil.

Al desactivarse (`isActive: false`), los elementos no necesitan animar salida: simplemente el carousel se desplaza y el siguiente slide toma protagonismo.

---

## Estilización de los ejemplos de Lucas

Como el código de Lucas está sin estilos, hay que vestirlo dentro de la estética de este componente **sin modificar las props de Motion**. Aplicar Tailwind en:

- El `className` de cada `motion.*` para: dimensiones, colores de fondo, bordes, tipografía interna, padding, border-radius.
- Si hay botones, inputs u otros elementos dentro del ejemplo, estilizarlos consistentemente.

### Estética recomendada para los ejemplos

- Elementos protagonistas del ejemplo: fondo **amarillo** `#EAB308` con texto negro. Esto hace que la parte interactiva destaque sobre el fondo blanco del slide.
- Bordes: `rounded-2xl` o `rounded-full` según el ejemplo.
- Sombra sutil: `shadow-[0_8px_24px_rgba(0,0,0,0.08)]`.
- Tipografía dentro del ejemplo: Montserrat Alternates 900 si es un texto destacado, 500 si es secundario.
- Tamaños: los elementos interactivos deben ser grandes y visibles (`w-48 h-48` mínimo para cajas, `px-8 py-4` mínimo para botones).
- Si el ejemplo requiere texto, mantenerlo corto y en mayúsculas con `letter-spacing` amplio.

Esto hace que los 5 slides se sientan visualmente coherentes aunque los ejemplos sean distintos.

---

## Requisitos técnicos globales

- **Única dependencia de animación**: `motion/react`. Nada más.
- **TypeScript estricto**: tipar props, motion values, refs. Nada de `any`.
- **No modificar `Lucas.tsx`** bajo ningún concepto — es un archivo fuente que yo sigo editando.
- **Sin `whileInView`** en ningún sitio — la activación de cada slide se controla por la prop `isActive`.
- **Propagación de gestos**: si alguno de los ejemplos de Lucas usa `drag`, añadir manejo para que el drag del ejemplo no se confunda con el drag del carousel. Si pasa, envolver ese slide en un `div` que detenga la propagación del puntero sobre la zona del ejemplo únicamente.
- **Rendimiento**: los slides inactivos pueden permanecer renderizados (son ligeros), pero no deben correr animaciones en bucle.
- **Sin padding ni margin global** que rompan el encaje con el resto del scroll de la web.
- **Accesibilidad**: `role="region"` en el contenedor, `aria-roledescription="carousel"`, cada slide con `role="group"` y `aria-label` descriptivo.

---

## Filosofía de ejecución

Este componente es **didáctico**. La clase tiene que poder mirar la demo de la izquierda, leer el código de la derecha, y hacer la conexión mental inmediata entre "qué veo" y "qué hace que lo vea". El código debe respirar — no lo comprimas, que se vea cada prop de Motion destacada en amarillo para que incluso desde lejos se identifique el patrón. Y sobre todo: **el código es mío y tiene que seguir siendo mío**. Estilízalo, enmárcalo, resáltalo, pero no lo reescribas.
