# 🎨 Sistema de Diseño: RetailSpace AI

> **Fase:** `/spec` (Especificación Visual)
> **Estado:** Validado
> **Última Revisión:** 2026-06-19

---

```yaml
# ────────────────────────────────────────────────
# DESIGN TOKENS
# ────────────────────────────────────────────────
version: alpha
name: "RetailSpace AI Design"
description: "Estilo visual futurista, oscuro y sofisticado (glassmorphism) con acentos de color verde esmeralda y violeta para destacar la analítica y la inteligencia artificial."

# COLORES
colors:
  primary:      "#0B0F19"   # Fondo base oscuro profundo (Deep Slate)
  secondary:    "#161D30"   # Fondo secundario para paneles y tarjetas
  accent:       "#10B981"   # Verde esmeralda para puntos de locales comerciales recomendados y CTAs primarios
  accent-ai:    "#6366F1"   # Violeta/Indigo para la identidad del bot de IA
  neutral:      "#0F172A"   # Fondo del chat y áreas de menor jerarquía
  surface:      "rgba(30, 41, 59, 0.7)" # Superficies glassmorphic traslúcidas
  on-primary:   "#FFFFFF"   # Texto blanco puro para alta prioridad
  on-surface:   "#F8FAFC"   # Texto principal de interfaz (Slate 50)
  on-neutral:   "#94A3B8"   # Texto secundario o mutado (Slate 400)
  border:       "rgba(255, 255, 255, 0.08)" # Bordes ultra sutiles
  error:        "#EF4444"   # Rojo para alertas de error o alta competencia
  success:      "#10B981"   # Verde esmeralda para confirmaciones y alta idoneidad

# TIPOGRAFÍA
typography:
  heading:
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
    fontSize:   "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize:   "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
    fontSize:   "0.875rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  caption:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize:   "0.75rem"
    fontWeight: 400

# BORDES Y RADIOS
rounded:
  sm:   6px
  md:   12px
  lg:   20px
  full: 9999px

# ESPACIADO
spacing:
  xs:  6px
  sm:  12px
  md:  20px
  lg:  28px
  xl:  48px

# COMPONENTES
components:
  chat-bubble-user:
    backgroundColor: "{colors.accent-ai}"
    textColor:       "#FFFFFF"
    rounded:         "16px 16px 0px 16px"
  chat-bubble-bot:
    backgroundColor: "{colors.secondary}"
    textColor:       "{colors.on-surface}"
    rounded:         "16px 16px 16px 0px"
    border:          "1px solid {colors.border}"
  card-property:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.md}"
    border:          "1px solid {colors.border}"
    padding:         "{spacing.sm}"
    transition:      "transform 0.2s ease, border-color 0.2s ease"
  card-property-hover:
    border:          "1px solid {colors.accent}"
    transform:       "translateY(-2px)"
```

---

## Visión General

La interfaz está inspirada en los dashboards analíticos modernos de alta gama. El fondo oscuro reduce la fatiga visual y hace que los marcadores del mapa y las métricas de color verde esmeralda brillen con gran contraste. El uso de efectos traslúcidos (*glassmorphism*) mediante `backdrop-filter: blur(16px)` confiere al sistema una sensación de software premium, pulido y de vanguardia.

---

## 🎨 Colores e Identidad Visual

- **Fondo de Interfaz (Primary - `#0B0F19`):** Un tono gris azulado oscuro casi negro que sirve como lienzo limpio.
- **Identidad del Bot (Accent-AI - `#6366F1`):** Usado para los mensajes del Agente de IA, badges y elementos relacionados con las recomendaciones inteligentes.
- **Puntos recomendados y CTAs (Accent - `#10B981`):** Usado para destacar los inmuebles que tienen un excelente "Retail Score". También es el color para los botones de acción principal.
- **Efecto de Desenfoque (Glassmorphism):** Se aplica en la barra lateral del chat, en la tarjeta de detalles del inmueble seleccionado y en los controles superiores del mapa. Se logra mediante:
  ```css
  background: rgba(22, 29, 48, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```

---

## ✍️ Tipografía

- **Fuentes:** Se importarán las tipografías **Outfit** (para títulos, números, métricas e indicadores de score, aportando personalidad y modernidad) e **Inter** (para textos de lectura, mensajes de chat y explicaciones de la IA por su gran legibilidad en tamaños pequeños) desde Google Fonts.
- **Fallback:** En caso de no haber conexión, se utilizarán las fuentes del sistema correspondientes (`system-ui`).

---

## ✨ Movimiento e Interacción

- **Duración base:** `200ms` para efectos de *hover* en botones y tarjetas de inmuebles. `300ms` para transiciones como la apertura del panel de detalles y el colapso del chat.
- **Física de Transición:** Se aplicará `cubic-bezier(0.4, 0, 0.2, 1)` para lograr desplazamientos naturales de los paneles laterales y la aparición de los marcadores en el mapa.
- **Animación de Carga (Skeletons):** Las tarjetas de locales mostrarán un degradado animado pulsante (`animate-pulse`) mientras se obtienen los datos de la API Overpass:
  ```css
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  ```
