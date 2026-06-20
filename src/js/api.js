// =============================================================================
// Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
// Copyright (c) 2026 ESIC
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * API SERVICE - RetailSpace AI
 * Conectores para Nominatim (Geocoding) y Overpass API (OpenStreetMap Data) con caché.
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_BASE_URL = "https://overpass-api.de/api/interpreter";
const NETWORK_TIMEOUT_MS = 6000; // Timeout de 6 segundos

/**
 * Realiza una petición con control de timeout.
 */
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = NETWORK_TIMEOUT_MS } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

/**
 * Geocodifica el nombre de una ciudad o dirección usando la API de Nominatim.
 * @param {string} query Ciudad o dirección
 * @returns {Promise<Object>} Coordenadas {lat, lon, name} o null
 */
async function geocodeLocation(query) {
    const cacheKey = `geo_${query.toLowerCase().trim()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        console.log(`[API Cache] Coordenadas encontradas para: ${query}`);
        return JSON.parse(cached);
    }

    try {
        const url = `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=1`;
        console.log(`[API Call] Geocodificando en Nominatim: ${url}`);
        
        const response = await fetchWithTimeout(url, {
            headers: {
                "User-Agent": "RetailSpaceAI/1.0 (seerg@esic.edu)"
            }
        });

        if (!response.ok) throw new Error("Error en la respuesta del servidor de geocodificación");
        
        const data = await response.json();
        if (data && data.length > 0) {
            const result = {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            return result;
        }
        return null;
    } catch (error) {
        console.error("[API Error] Fallo al geocodificar la ubicación:", error);
        return null; // El orquestador activará el fallback
    }
}

/**
 * Consulta la API Overpass para descargar locales comerciales en base a la ubicación y categoría.
 * @param {number} lat Latitud
 * @param {number} lon Longitud
 * @param {string} category Categoría de retail ("RESTAURANTE", "MODA", etc.)
 * @returns {Promise<Array>} Listado de nodos crudos descargados
 */
async function fetchCommercialProperties(lat, lon, category) {
    const cacheKey = `overpass_${lat.toFixed(4)}_${lon.toFixed(4)}_${category}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        console.log(`[API Cache] Locales cargados de caché para la zona: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        return JSON.parse(cached);
    }

    // Traducir categoría a tags de OpenStreetMap
    const mapping = RETAIL_CATEGORIES[category] || RETAIL_CATEGORIES.MODA;
    const tags = mapping.osmTags;
    
    // Crear consulta Overpass.
    // Buscaremos locales comerciales y tiendas en un radio de 1200 metros alrededor de las coordenadas.
    let filterString = "";
    if (category === "RESTAURANTE") {
        filterString = `node["amenity"~"restaurant|cafe|fast_food|bar"](around:1200, ${lat}, ${lon});`;
    } else if (category === "MODA") {
        filterString = `node["shop"~"clothes|shoes|boutique|jewelry|bag"](around:1200, ${lat}, ${lon});`;
    } else if (category === "ALIMENTACION") {
        filterString = `node["shop"~"supermarket|convenience|bakery|butcher|greengrocer"](around:1200, ${lat}, ${lon});`;
    } else if (category === "GIMNASIO") {
        filterString = `node["leisure"~"fitness_centre|sports_centre|gym"](around:1200, ${lat}, ${lon});`;
    } else {
        filterString = `
            node["shop"~"hairdresser|laundry|dry_cleaning|optician"](around:1200, ${lat}, ${lon});
            node["office"](around:1200, ${lat}, ${lon});
        `;
    }

    const query = `[out:json][timeout:15];
        (
            ${filterString}
        );
        out body 15;`; // Limitar a un máximo de 15 locales para optimizar peso

    try {
        console.log(`[API Call] Solicitando locales a Overpass...`);
        const response = await fetchWithTimeout(OVERPASS_BASE_URL, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (!response.ok) throw new Error("Error en el servidor Overpass");
        
        const data = await response.json();
        const nodes = data.elements || [];
        
        // Formatear los nodos de OSM usando nuestro motor de simulación en mockdata.js
        const properties = nodes.map(node => {
            const prop = simulatePropertyFromOSM(node, category);
            return prop;
        });

        sessionStorage.setItem(cacheKey, JSON.stringify(properties));
        return properties;
    } catch (error) {
        console.error("[API Error] Fallo al consultar Overpass API:", error);
        throw error; // Lanzar para que el orquestador aplique fallback
    }
}
