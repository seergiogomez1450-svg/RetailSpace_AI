# 🏗 Arquitectura Técnica: RetailSpace AI

> **Fase:** `/plan` (Planificación Técnica)
> **Estado:** Validado
> **Última Revisión:** 2026-06-19

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| **Frontend Core** | HTML5, CSS3, ES6 JavaScript | Arquitectura de ejecución directa en cliente sin dependencias pesadas de compilación. |
| **Visualización de Mapas**| Leaflet.js (v1.9.4) | Librería de mapas interactivos ligera, de código abierto, con excelente rendimiento móvil. |
| **Proveedor de Mapas** | CartoDB Positron / Dark Matter | Estilo visual minimalista y elegante que destaca los marcadores de locales comerciales. |
| **Datos Geográficos** | OpenStreetMap / Overpass API | Datos abiertos en tiempo real de comercios y locales existentes. |
| **Geocodificación** | Nominatim (OSM) | Resolución gratuita de nombres de ciudades/calles a coordenadas geográficas. |
| **Estilos y Componentes** | CSS Vanilla (Grid + Flexbox + Custom Properties) | Máximo rendimiento visual, sin frameworks CSS pesados. Implementación de Glassmorphism. |

---

## 📂 Estructura de Directorios

```text
Proyecto ESIC/
├── src/
│   ├── css/
│   │   └── styles.css       # Tokens de diseño, layouts y animaciones
│   ├── js/
│   │   ├── api.js           # Clientes para Overpass API y Nominatim Geocoding
│   │   ├── agent.js         # Intérprete conversacional y generador de sugerencias
│   │   ├── app.js           # Inicializador de Leaflet y eventos del UI
│   │   └── mockdata.js      # Plantillas de datos y generador de métricas comerciales
│   └── index.html           # Estructura del Dashboard de RetailSpace AI
├── tests/
│   └── app.test.js          # Pruebas de integración del parser de intenciones
├── docs/
│   ├── SPECIFICATIONS.md    # Especificaciones funcionales
│   ├── ARCHITECTURE.md      # Este archivo de arquitectura
│   └── DESIGN.md            # Tokens visuales y de diseño
├── project.config.md        # Identidad del proyecto
├── CHANGELOG.md             # Historial de cambios y versiones
└── README.md                # Fichero de documentación principal
```

---

## 🔑 Decisiones Técnicas Clave

### Aislamiento en Cliente (Zero-Backend)
Para maximizar la portabilidad y facilitar la ejecución del Proyecto ESIC sin necesidad de montar infraestructuras complejas, el 100% de la lógica se ejecuta en el navegador. Las consultas a Overpass API se realizan de forma directa y asíncrona.

### Motor de Inteligencia en Cliente (Semantic Agent)
El agente de IA interactivo interpretará las necesidades del usuario mediante un módulo analizador de lenguaje en client-side (`src/js/agent.js`) estructurado con:
- **Clasificador de Intenciones:** Expresiones regulares avanzadas y coincidencia léxica para identificar:
  - *Ubicación:* Ciudades (ej: "Madrid", "Barcelona", "Valencia").
  - *Giro Comercial:* Categorías de retail (Restaurante/Cafetería, Moda/Ropa, Supermercado/Alimentación, Oficina/Servicios).
  - *Requisitos Físicos:* Superficie (Grande, Mediano, Pequeño) y Presupuesto estimado.
- **Motor de Recomendación Dinámica:** Puntuará los inmuebles comerciales obtenidos de OpenStreetMap y justificará textualmente su selección mediante plantillas semánticas adaptativas.

### Enriquecimiento de Datos de Retail (Retail Simulation Engine)
OpenStreetMap proporciona la geolocalización, tipo de edificio y nombre del negocio anterior, pero carece de datos comerciales como precios y tráfico peatonal. El módulo `src/js/mockdata.js` enriquecerá los nodos recibidos mediante algoritmos deterministas:
- **Precio de Alquiler:** Calculado a partir de un valor base de m² escalado según el tipo de local y proximidad al centro urbano.
- **Tránsito Peatonal:** Estimado según la densidad de otros comercios en un radio de 100 metros (a mayor densidad de comercios en OSM, mayor tráfico peatonal simulado).
- **Competencia Directa:** Conteo de nodos cercanos con la misma actividad comercial.

---

## 🔗 Integraciones Externas

| Servicio | Propósito | Notas / Límites |
| --- | --- | --- |
| **Overpass API (OSM)** | Obtención de inmuebles comerciales | Servidores públicos y gratuitos de OpenStreetMap. Límite de tasa por IP suave, mitigado con caché interna en `sessionStorage`. |
| **Nominatim (OSM)** | Geocodificación de búsquedas | Límite estricto de 1 petición por segundo. Exige cabecera `User-Agent` descriptiva. |
| **Unsplash Source API** | Imágenes de locales según categoría | Carga de imágenes temáticas (ej: `/featured/?retail,shop,store`) dinámicas para los popups y tarjetas. |

---

## 🤖 Agent Harness (Arnés del Agente)

### 1. Gestión de Contexto
- **Contexto Estático:** La IA se apoya en `docs/SPECIFICATIONS.md`, `docs/ARCHITECTURE.md` y `docs/DESIGN.md` para garantizar la consistencia en el desarrollo de la UI y la integración de las APIs.
- **Contexto Dinámico:** Ficheros de mockdata locales actúan como base estructurada del simulador de datos de retail.

### 2. Guardrails de Seguridad
- **Sanitización de Inputs:** Todos los inputs que el usuario ingrese en el cuadro de chat pasarán por una función de limpieza de código (`XSS escape`) antes de ser incrustados en el DOM del chat o pasados a los filtros del mapa.
- **Manejo de Tiempos de Espera (Timeouts):** Las llamadas HTTP a Overpass y Nominatim tendrán un timeout estricto de 6 segundos. En caso de fallo, la aplicación cargará automáticamente un conjunto de locales preestablecidos de respaldo para que la experiencia de usuario nunca se rompa.
