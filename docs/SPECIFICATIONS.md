# 📋 Especificaciones: RetailSpace AI

> **Fase:** `/spec` (Especificación)
> **Estado:** Validado
> **Última Revisión:** 2026-06-19

---

## 🎯 1. Contexto y Objetivos

- **Problema:** Encontrar el local comercial (retail) perfecto para un negocio es un proceso lento y fragmentado. Las plataformas inmobiliarias convencionales ofrecen filtros rígidos (precio, metros cuadrados) pero no evalúan las necesidades estratégicas de un negocio (ej. "quiero montar una cafetería de especialidad con mucho paso peatonal"). Además, cruzar datos de ubicación con el entorno comercial real requiere herramientas caras de geomarketing.
- **Objetivo (Éxito):** Crear una aplicación web interactiva en HTML/CSS/JS que integre un agente conversacional de IA y un mapa interactivo. El agente procesará las necesidades de negocio del usuario, consultará datos comerciales de ubicaciones reales (a través de la API pública y gratuita de OpenStreetMap/Overpass) y sugerirá locales comerciales ideales, mostrando sus métricas comerciales simuladas de viabilidad (paso peatonal, precio estimado, idoneidad de negocio).

## 👥 2. Usuarios y Escenarios

- **Perfil de Usuario:** Emprendedores de retail, dueños de franquicias, pequeños comerciantes y analistas de expansión inmobiliaria.
- **Escenarios Clave:**
  - *Escenario A:* Un emprendedor quiere abrir una librería-cafetería en Madrid. Le pregunta a la IA por un local con un flujo alto de peatones y un tamaño mediano. La IA busca locales reales catalogados como edificios comerciales/tiendas en OpenStreetMap, estima su alquiler y le muestra las mejores opciones sobre el mapa con una estimación de tráfico y competencia cercana.
  - *Escenario B:* Una marca de ropa busca locales esquineros amplios en Valencia. El usuario escribe su solicitud, el mapa se centra en la ubicación seleccionada y la interfaz muestra de forma dinámica las tarjetas de los inmuebles destacados por la IA.

## ✨ 3. Funcionalidades Principales (Requisitos)

- [ ] **Funcionalidad A: Interfaz de Usuario Premium (Dashboard Inmobiliario)**
  - Un diseño web responsivo e inmersivo (con tema oscuro premium, glassmorphism, y animaciones de carga).
  - Un panel lateral izquierdo para el chat del Agente de IA y un panel lateral derecho/central con el mapa interactivo y listado de fichas de inmuebles.
- [ ] **Funcionalidad B: Chat Conversacional con el Agente de IA (Simulado y Contextual)**
  - Un bot de IA integrado que procesa lenguaje natural (ej. "Busco un local para un restaurante italiano en Barcelona con alquiler menor a 3.000€").
  - El bot analiza la intención del usuario, extrae la zona y tipo de retail, y realiza la consulta para actualizar el mapa.
  - El bot devuelve explicaciones detalladas y razonadas de por qué los locales sugeridos encajan con las necesidades expresadas.
- [ ] **Funcionalidad C: Integración de Datos Reales con Overpass API (OpenStreetMap)**
  - Consumo dinámico de la API Overpass de OpenStreetMap mediante fetches en Javascript para obtener nodos y polígonos comerciales reales en España (`shop=*`, `building=retail`, `building=commercial`).
  - Geocodificación inicial para centrar el mapa dinámicamente según la ciudad seleccionada.
- [ ] **Funcionalidad D: Mapa Interactivo con Leaflet.js**
  - Renderizado de mapa interactivo utilizando Leaflet.js y capas estéticas gratuitas (ej. CartoDB Positron o Dark Matter).
  - Marcadores interactivos para cada local que, al hacer clic, muestran un popup flotante con detalles y foto del local (usando imágenes estéticas de Unsplash generadas dinámicamente).
- [ ] **Funcionalidad E: Motor de Métricas de Geomarketing (Retail Score)**
  - Enriquecimiento dinámico en cliente de los datos de OSM con métricas críticas para retail:
    - *Retail Suitability Score:* Puntuación del 1 al 100 basada en el tipo de negocio.
    - *Foot Traffic Estimat:* Tráfico peatonal estimado (Alto, Medio, Bajo) según cercanía a vías principales u otros comercios.
    - *Alquiler estimado:* Calculado por m² estimado según la zona.

## 🏗️ 4. Propuesta de Solución Técnica (Resumen)

- **Enfoque:** Aplicación web cliente ("Single Page Application") estructurada en HTML5, CSS3 moderno y Vanilla Javascript. Se utilizará **Leaflet.js** para la visualización del mapa. El procesamiento del lenguaje natural del chat se gestionará mediante un motor semántico e interpretador de intenciones en cliente, garantizando respuestas rápidas y fluidas sin necesidad de API keys del lado del usuario final.
- **Dependencias Críticas:**
  - *Leaflet.js (CSS + JS)* vía CDN para mapas.
  - *Overpass API* (Servidores públicos de OSM) para datos de inmuebles comerciales en tiempo real.
  - *Nominatim API* para geocodificación gratuita de direcciones y ciudades.
- **Sistema de Diseño:** Consultar `docs/DESIGN.md` para las definiciones de tokens visuales y animaciones.

## 🚫 5. Fuera de Alcance (Out of Scope)

- Base de datos persistente para guardar búsquedas de usuarios en el servidor (todo se almacena en `localStorage` del navegador del cliente).
- Pasarela de pagos para el listado de inmuebles.
- API keys de OpenAI/Gemini obligatorias (toda la simulación conversacional y consulta semántica ocurre de forma autónoma en el frontend usando plantillas conversacionales inteligentes enriquecidas, permitiendo opcionalmente configurar una API Key en el panel si el usuario desea usar un modelo de lenguaje real en la nube).

## ⚠️ 6. Riesgos y Mitigación

- **Riesgo: Tiempos de carga elevados en la API Overpass al buscar áreas muy grandes.**
  - *Mitigación:* Limitar las búsquedas a un radio máximo de 1.500 metros alrededor del centro de la ciudad seleccionada o de las coordenadas geocodificadas, y añadir un indicador visual de carga ("skeleton loaders").
- **Riesgo: Bloqueos por exceso de peticiones (Rate Limiting) en las APIs públicas.**
  - *Mitigación:* Cachear los resultados de Overpass en `sessionStorage` para que si el usuario realiza la misma búsqueda consecutivamente, la carga sea instantánea.
- **Riesgo de seguridad/datos:**
  - *Mitigación:* Sanitizar todos los inputs del chat del usuario antes de procesarlos o renderizarlos en pantalla para evitar ataques XSS.

## ❓ 7. Preguntas Abiertas

- [x] ¿Debería el usuario poder añadir sus propios locales al mapa de forma manual? *(Decisión: Sí, una funcionalidad secundaria para simular "subir mi local para análisis" mediante clic derecho en el mapa).*
- [x] ¿Cómo resolveremos las imágenes de los locales? *(Decisión: Usaremos URLs dinámicas del banco de imágenes gratuitas Unsplash parametrizadas por tipo de tienda para que se vean fotos reales e impactantes).*

## 🧪 8. Criterios de Evaluación y Evals (No Deterministas)

- [ ] **Rendimiento del Parser Semántico:** El motor conversacional debe clasificar correctamente el 90% de las intenciones de búsqueda de retail (comida, moda, servicios, oficinas) en español.
- [ ] **Velocidad de Carga del Mapa:** Renderizado de locales en el mapa en menos de 2.5 segundos tras recibir la respuesta de Overpass API.