@echo off
:: =============================================================================
:: Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
:: Copyright (c) 2026 ESIC
:: Licensed under the MIT License. See LICENSE for details.
:: Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
:: =============================================================================
echo Deteniendo servidor local de RetailSpace AI...

:: Detener servidor Python o Node en el puerto 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul
:: Detener en el puerto 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

echo Servidores locales detenidos.
