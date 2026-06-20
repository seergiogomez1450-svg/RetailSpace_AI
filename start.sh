#!/bin/bash
# =============================================================================
# Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
# Copyright (c) 2026 ESIC
# Licensed under the MIT License. See LICENSE for details.
# Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
# =============================================================================

echo "Iniciando servidor local para RetailSpace AI..."

if command -v python3 &>/dev/null; then
    echo "Detectado Python 3. Iniciando servidor en http://localhost:8000..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8000/src/index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://localhost:8000/src/index.html"
    fi
    python3 -m http.server 8000
elif command -v python &>/dev/null; then
    echo "Detectado Python. Iniciando servidor en http://localhost:8000..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8000/src/index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://localhost:8000/src/index.html"
    fi
    python -m http.server 8000
elif command -v npx &>/dev/null; then
    echo "Detectado Node.js. Iniciando con npx serve..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:3000/src/index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://localhost:3000/src/index.html"
    fi
    npx -y serve -l 3000
else
    echo "No se detectó Python ni Node.js. Abriendo index.html directamente..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "src/index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "src/index.html"
    fi
fi
