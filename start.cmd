@echo off
:: =============================================================================
:: Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
:: Copyright (c) 2026 ESIC
:: Licensed under the MIT License. See LICENSE for details.
:: Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
:: =============================================================================
echo Iniciando servidor local para RetailSpace AI...

:: Intentar con Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Detectado Python. Iniciando servidor HTTP en http://localhost:8000 ...
    start "" http://localhost:8000/src/index.html
    python -m http.server 8000
    goto end
)

:: Intentar con Node/npx
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Detectado Node.js. Iniciando servidor con npx serve...
    start "" http://localhost:3000/src/index.html
    npx -y serve -l 3000
    goto end
)

:: Fallback abrir archivo directamente
echo No se detecto Python ni Node.js. Abriendo index.html directamente en el navegador...
start "" "src/index.html"

:end
