#!/bin/bash
# =============================================================================
# Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
# Copyright (c) 2026 ESIC
# Licensed under the MIT License. See LICENSE for details.
# Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
# =============================================================================

echo "Iniciando servidor local en el puerto 8000..."

# Iniciar servidor local en segundo plano usando Python
python3 -m http.server 8000 &
SERVER_PID=$!

# Esperar 2 segundos
sleep 2

echo ""
echo "Conectando con la nube mediante tunel SSH (Sin dependencias de Node.js)..."
echo "========================================================================="
echo "INSTRUCCIONES:"
echo "1. Si la terminal le pregunta: 'Are you sure you want to continue connecting (yes/no/[fingerprint])?'"
echo "   Escriba 'yes' y pulse Enter."
echo "2. Busque una direccion URL que empiece por 'https://' (ej. https://xxxx.localhost.run)"
echo "   en las lineas de abajo. ¡Esa sera su web en la nube!"
echo "========================================================================="
echo ""

# Lanzar tunel SSH
ssh -R 80:localhost:8000 nokey@localhost.run

# Al terminar el tunel, detener el servidor local
kill $SERVER_PID
echo "Servidor local detenido."
