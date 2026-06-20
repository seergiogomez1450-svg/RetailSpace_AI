#!/bin/bash
# =============================================================================
# Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
# Copyright (c) 2026 ESIC
# Licensed under the MIT License. See LICENSE for details.
# Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
# =============================================================================

echo "Deteniendo servidor local de RetailSpace AI..."

# Buscar proceso escuchando en el puerto 8000 o 3000 y matarlo
PID_8000=$(lsof -t -i:8000)
if [ ! -z "$PID_8000" ]; then
    kill -9 $PID_8000
    echo "Detenido servidor en puerto 8000."
fi

PID_3000=$(lsof -t -i:3000)
if [ ! -z "$PID_3000" ]; then
    kill -9 $PID_3000
    echo "Detenido servidor en puerto 3000."
fi

echo "Servidores locales detenidos."
