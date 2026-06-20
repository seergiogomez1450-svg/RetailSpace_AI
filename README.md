# Proyecto ESIC

> Plataforma de desarrollo para el Proyecto ESIC

## 📑 Índice

- [Sobre el proyecto](#about)
- [Requisitos](#requirements)
- [Instalación](#installation)
- [Cómo ejecutar](#usage)
- [Cómo parar](#stop)
- [Estructura del proyecto](#structure)
- [Changelog](#changelog)
- [Licencia](#license)

---

<a name="about"></a>
## 📌 Sobre el proyecto

**Proyecto ESIC** es una plataforma interactiva que permite gestionar e implementar las funcionalidades requeridas para el Proyecto ESIC.

**Construido con:**
- HTML5 (Estructura semántica)
- CSS3 (Estilos modernos y responsivos)
- JavaScript (Lógica e interactividad)

---

<a name="requirements"></a>
## 🧰 Requisitos

- Un navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
- Servidor local (opcional, como la extensión Live Server de VS Code, Python `http.server` o Node `npx serve`)

---

<a name="installation"></a>
## ⚙️ Instalación

1. Descarga o clona los archivos del proyecto en tu entorno local.
2. Abre la carpeta del proyecto en tu editor de código preferido (ej. VS Code).
3. No se requieren dependencias externas adicionales en esta fase.

---

<a name="usage"></a>
## ▶️ Cómo ejecutar

Utiliza los scripts de inicio incluidos en la raíz del proyecto:

**Windows:**
```cmd
start.cmd
```

**macOS / Linux:**
```bash
./start.sh
```

Una vez iniciado, abre tu navegador en: `http://localhost:8000` (o el puerto configurado por tu servidor local).

---

<a name="stop"></a>
## ⏹ Cómo parar

Para detener el servidor local:

**Windows:**
```cmd
stop.cmd
```

**macOS / Linux:**
```bash
./stop.sh
```

---

<a name="structure"></a>
## 📂 Estructura del proyecto

```
/
├── src/              # Código fuente de la aplicación (HTML, CSS, JS)
├── tests/            # Pruebas unitarias y de integración
├── docs/             # Documentación del proyecto (especificaciones, arquitectura)
├── start.cmd         # Script de arranque para Windows
├── start.sh          # Script de arranque para macOS/Linux
├── stop.cmd          # Script de parada para Windows
├── stop.sh           # Script de parada para macOS/Linux
├── project.config.md # Configuración de identidad del proyecto
├── CHANGELOG.md      # Historial de versiones
└── README.md         # Este archivo de documentación
```

---

<a name="changelog"></a>
## 📋 Changelog

Consulta [CHANGELOG.md](./CHANGELOG.md) para ver el historial completo de versiones.

---

<a name="license"></a>
## 📄 Licencia

MIT — consulta el archivo [LICENSE](./LICENSE) para más detalles.

Copyright (c) 2026 ESIC

---

> 🛠️ Construido con **[dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)** — el framework SDD para desarrollo asistido por IA.
> Creado por [David Bueno Vallejo](https://github.com/davidbuenov) — libre y gratuito.
