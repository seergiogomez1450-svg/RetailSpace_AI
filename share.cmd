@echo off
:: =============================================================================
:: Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
:: Copyright (c) 2026 ESIC
:: Licensed under the MIT License. See LICENSE for details.
:: Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
:: =============================================================================
echo Iniciando servidor local en el puerto 8000...

:: Iniciar el servidor local en segundo plano en el puerto 8000 usando Python
start /b python -m http.server 8000

echo Esperando a que el servidor local este listo...
timeout /t 2 /nobreak >nul

echo.
echo Conectando con la nube mediante tunel SSH (Sin dependencias de Node.js)...
echo =========================================================================
echo INSTRUCCIONES:
echo 1. Si la terminal le pregunta: "Are you sure you want to continue connecting (yes/no/[fingerprint])?"
echo    Escriba "yes" y pulse Enter.
echo 2. Busque una direccion URL que empiece por "https://" (ej. https://xxxx.localhost.run)
echo    en las lineas de abajo. ¡Esa sera su web en la nube!
echo =========================================================================
echo.

:: Lanzar tunel SSH gratuito usando localhost.run
ssh -R 80:localhost:8000 nokey@localhost.run
