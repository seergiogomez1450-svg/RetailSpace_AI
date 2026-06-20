// =============================================================================
// Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
// Copyright (c) 2026 ESIC
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * MAIN APP COORDINATOR - RetailSpace AI
 * Inicialización del mapa Leaflet, bindings del DOM, renderizados dinámicos y flujo de eventos.
 */

// Variables globales
let map = null;
let markersLayer = null;
let currentProperties = [];
let selectedPropertyId = null;
const agent = new RetailAgent();

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initChat();
    initFilters();
    initMapContextMenu();
    
    // Carga inicial por defecto: Madrid, Moda
    performSearch("madrid", "MODA", { maxBudget: null, sizeFilter: null });
});

/**
 * Inicializa el mapa interactivo de Leaflet con estilo oscuro.
 */
function initMap() {
    // Madrid coordenadas iniciales
    const initialLat = 40.4168;
    const initialLon = -3.7038;
    
    map = L.map("map", {
        zoomControl: false // Lo añadiremos abajo a la derecha
    }).setView([initialLat, initialLon], 14);

    // Capa de mapa oscura (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Añadir control de zoom abajo a la derecha
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
}

/**
 * Inicializa el agente de Chat y eventos de entrada.
 */
function initChat() {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatFeed = document.getElementById("chat-feed");
    
    // API settings elements
    const btnToggleSettings = document.getElementById("btn-toggle-settings");
    const apiSettingsPanel = document.getElementById("api-settings-panel");
    const geminiKeyInput = document.getElementById("gemini-key-input");
    const btnShowKey = document.getElementById("btn-show-key");
    const apiStatusBadge = document.getElementById("api-status-badge");

    // Load key from localStorage
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
        geminiKeyInput.value = savedKey;
        updateApiStatus(true);
    }

    // Toggle settings panel
    btnToggleSettings.addEventListener("click", () => {
        apiSettingsPanel.classList.toggle("active");
    });

    // Toggle password view
    btnShowKey.addEventListener("click", () => {
        const isPassword = geminiKeyInput.type === "password";
        geminiKeyInput.type = isPassword ? "text" : "password";
        btnShowKey.textContent = isPassword ? "🙈" : "👁️";
    });

    // Save key on input change
    geminiKeyInput.addEventListener("input", (e) => {
        const key = e.target.value.trim();
        if (key) {
            localStorage.setItem("gemini_api_key", key);
            updateApiStatus(true);
        } else {
            localStorage.removeItem("gemini_api_key");
            updateApiStatus(false);
        }
    });

    function updateApiStatus(connected) {
        if (connected) {
            apiStatusBadge.textContent = "🟢 Gemini Activo";
            apiStatusBadge.className = "status-badge status-connected";
        } else {
            apiStatusBadge.textContent = "🟡 Simulación Local";
            apiStatusBadge.className = "status-badge status-disconnected";
        }
    }
    
    // Añadir saludo inicial
    addChatBubble("bot", agent.getGreetingResponse());

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Limpiar input
        chatInput.value = "";

        // Mostrar burbuja del usuario
        addChatBubble("user", text);

        // Mostrar indicador de escritura
        const typingIndicator = addTypingIndicator();

        try {
            // Procesar con el agente (pasando la clave API)
            const apiKey = localStorage.getItem("gemini_api_key") || null;
            const result = await agent.processMessage(text, apiKey);
            
            // Eliminar indicador
            typingIndicator.remove();

            // Renderizar respuesta
            addChatBubble("bot", result.responseText);

            // Si el comando indica buscar locales
            if (result.command && result.command.action === "search") {
                const matchedProperties = await performSearch(
                    result.command.location,
                    result.command.category,
                    result.command.filters
                );

                if (matchedProperties && matchedProperties.length > 0) {
                    const topProps = [...matchedProperties].sort((a,b) => b.suitability - a.suitability).slice(0, 2);
                    const catLabel = RETAIL_CATEGORIES[result.command.category]?.label || "comercio";
                    let followUpMsg = `💡 **He encontrado ${matchedProperties.length} locales idóneos en la zona para ${catLabel}:**\n\n`;
                    topProps.forEach((p, idx) => {
                        followUpMsg += `${idx + 1}. **${p.name}** (${p.suitability}% Match) en ${p.address.split(",")[0]}. Alquiler: **${p.rent.toLocaleString()}€/mes**.\n`;
                    });
                    followUpMsg += `\n*Haz clic en el botón "Ver Análisis" de cualquiera de ellos en el panel lateral para ver el informe.*`;
                    
                    // Añadir burbuja de seguimiento con pequeño retardo
                    setTimeout(() => {
                        addChatBubble("bot", followUpMsg);
                    }, 800);
                } else {
                    setTimeout(() => {
                        addChatBubble("bot", `⚠️ No se han encontrado locales comerciales que coincidan con estos filtros en **${result.command.location}**. Intenta ampliar el presupuesto o cambiar de tamaño.`);
                    }, 800);
                }
            }
        } catch (error) {
            console.error("Error en flujo de chat:", error);
            typingIndicator.remove();
            addChatBubble("bot", "Vaya, he tenido un problema interno al procesar tu solicitud. ¿Podrías repetirla?");
        }
    });

    // Función global para sugerencias
    window.sendSuggestion = function(text) {
        chatInput.value = text;
        chatForm.dispatchEvent(new Event("submit"));
    };
}

/**
 * Inicializa los eventos de filtrado rápido lateral/superior.
 */
function initFilters() {
    const budgetRange = document.getElementById("filter-budget");
    const budgetVal = document.getElementById("filter-budget-val");
    const sizeSelect = document.getElementById("filter-size");
    const categorySelect = document.getElementById("filter-category");

    // Al cambiar presupuesto
    budgetRange.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        budgetVal.textContent = val === 12000 ? "Sin límite" : `${val.toLocaleString()} €`;
        applyActiveFilters();
    });

    // Al cambiar tamaño
    sizeSelect.addEventListener("change", () => {
        applyActiveFilters();
    });

    // Al cambiar categoría
    categorySelect.addEventListener("change", async () => {
        const selectedCat = categorySelect.value;
        // Lanzamos nueva consulta para la ubicación actual con la nueva categoría
        await performSearch(agent.currentLocation, selectedCat, {
            maxBudget: budgetRange.value === "12000" ? null : parseInt(budgetRange.value),
            sizeFilter: sizeSelect.value === "all" ? null : sizeSelect.value
        });
    });
}

/**
 * Inicializa el menú contextual en el mapa para subir locales comerciales manuales (clic derecho).
 */
function initMapContextMenu() {
    const modal = document.getElementById("add-property-modal");
    const form = document.getElementById("add-property-form");
    const cancelBtn = document.getElementById("btn-cancel-add");
    let clickCoords = null;

    map.on("contextmenu", (e) => {
        clickCoords = e.latlng;
        // Abrir el modal y precargar coordenadas
        document.getElementById("new-coords").value = `${clickCoords.lat.toFixed(6)}, ${clickCoords.lng.toFixed(6)}`;
        modal.classList.add("active");
    });

    cancelBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        form.reset();
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!clickCoords) return;

        const name = document.getElementById("new-name").value.trim();
        const type = document.getElementById("new-category").value;
        const size = parseInt(document.getElementById("new-size").value);
        const rent = parseInt(document.getElementById("new-rent").value);
        const traffic = document.getElementById("new-traffic").value;

        // Calcular Retail Score manual
        let suitability = 70;
        if (traffic === "Alto") suitability += 15;
        if (traffic === "Bajo") suitability -= 15;
        if (size >= 100 && size <= 200) suitability += 8;
        suitability = Math.max(45, Math.min(100, suitability));

        const newProperty = {
            id: `manual_${Date.now()}`,
            name: `[Añadido] ${name}`,
            lat: clickCoords.lat,
            lon: clickCoords.lng,
            city: agent.currentLocation,
            address: `Coordenadas: ${clickCoords.lat.toFixed(4)}, ${clickCoords.lng.toFixed(4)}`,
            type: type,
            size: size,
            rent: rent,
            traffic: traffic,
            competitors: 1,
            suitability: suitability,
            image: type === "RESTAURANTE" ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
            description: `Local subido manualmente por el usuario. Superficie de ${size}m² en zona de paso ${traffic}. Ideal para implantación rápida de negocio.`
        };

        // Agregar al inicio
        currentProperties.unshift(newProperty);
        modal.classList.remove("active");
        form.reset();

        // Actualizar visualizaciones
        renderPropertiesList(currentProperties);
        renderMapMarkers(currentProperties);

        // Notificar en el chat
        addChatBubble("bot", `¡He subido tu local **"${name}"** correctamente al mapa! He calculado su Retail Score en **${suitability}/100** debido a su tamaño de ${size}m² y tráfico peatonal ${traffic}.`);
    });
}

/**
 * Realiza la búsqueda de locales comerciales consultando la API o el fallback.
 */
async function performSearch(city, category, filters) {
    showLoadingSkeletons(true);
    
    // Sincronizar selectores del UI
    document.getElementById("filter-category").value = category;
    if (filters.maxBudget) {
        document.getElementById("filter-budget").value = filters.maxBudget;
        document.getElementById("filter-budget-val").textContent = `${filters.maxBudget.toLocaleString()} €`;
    }
    if (filters.sizeFilter) {
        document.getElementById("filter-size").value = filters.sizeFilter;
    }

    try {
        // 1. Geocodificación de la ciudad
        const geo = await geocodeLocation(city);
        
        let targetLat = 40.4168; // Default Madrid
        let targetLon = -3.7038;

        if (geo) {
            targetLat = geo.lat;
            targetLon = geo.lon;
            map.setView([targetLat, targetLon], 14.5);
        } else {
            console.warn(`[App] No se geocodificó "${city}". Usando fallback estático.`);
        }

        // 2. Carga de inmuebles (Overpass API con fallback)
        let properties = [];
        try {
            properties = await fetchCommercialProperties(targetLat, targetLon, category);
        } catch (apiError) {
            console.warn("[App] Overpass falló o no se geocodificó. Cargando locales comerciales de prueba locales.");
            
            // Intentar filtrar si ya existen en el listado estático
            properties = FALLBACK_PROPERTIES.filter(p => p.city === city.toLowerCase() && p.type === category);
            if (properties.length === 0) {
                properties = FALLBACK_PROPERTIES.filter(p => p.type === category);
            }
        }

        // Guardar global
        currentProperties = properties;
        
        // Aplicar filtros activos del DOM
        return applyActiveFilters();

    } catch (error) {
        console.error("[App Critical] Error al realizar la búsqueda:", error);
        showLoadingSkeletons(false);
        addChatBubble("bot", "Vaya, parece que no he podido conectar correctamente con los servidores de datos comerciales. He activado los locales de prueba locales.");
    }
}

/**
 * Aplica los filtros actuales de la UI sobre la lista cargada.
 */
function applyActiveFilters() {
    const budgetVal = parseInt(document.getElementById("filter-budget").value);
    const sizeFilter = document.getElementById("filter-size").value;
    
    let filtered = [...currentProperties];

    // Filtrar por presupuesto
    if (budgetVal < 12000) {
        filtered = filtered.filter(p => p.rent <= budgetVal);
    }

    // Filtrar por tamaño
    if (sizeFilter === "grande") {
        filtered = filtered.filter(p => p.size >= 150);
    } else if (sizeFilter === "pequeño") {
        filtered = filtered.filter(p => p.size < 100);
    } else if (sizeFilter === "mediano") {
        filtered = filtered.filter(p => p.size >= 100 && p.size < 150);
    }

    showLoadingSkeletons(false);
    renderPropertiesList(filtered);
    renderMapMarkers(filtered);
    return filtered;
}

/**
 * Renderiza los locales comerciales en la barra lateral.
 */
function renderPropertiesList(properties) {
    const container = document.getElementById("properties-list-container");
    container.innerHTML = "";

    if (properties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>⚠️ No se encontraron locales que cumplan los filtros activos en esta zona.</p>
                <small>Intenta subir el presupuesto o ampliar el rango de tamaño comercial.</small>
            </div>
        `;
        return;
    }

    properties.forEach(p => {
        const card = document.createElement("div");
        card.className = `property-card ${selectedPropertyId === p.id ? "active" : ""}`;
        card.dataset.id = p.id;
        
        // Score Badge Color
        let scoreClass = "score-high";
        if (p.suitability < 85 && p.suitability >= 70) scoreClass = "score-medium";
        if (p.suitability < 70) scoreClass = "score-low";

        card.innerHTML = `
            <div class="property-card-img" style="background-image: url('${p.image}')">
                <span class="suitability-badge ${scoreClass}">${p.suitability}% Match</span>
            </div>
            <div class="property-card-content">
                <h3>${escapeHTML(p.name)}</h3>
                <p class="prop-address">${escapeHTML(p.address)}</p>
                <div class="prop-tags">
                    <span class="tag-size">📏 ${p.size} m²</span>
                    <span class="tag-traffic">🚶 Tránsito: ${p.traffic}</span>
                </div>
                <div class="prop-footer">
                    <span class="prop-rent">${p.rent.toLocaleString()} € <small>/mes</small></span>
                    <button class="btn-select-prop" onclick="focusProperty('${p.id}')">Ver Análisis</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Dibuja los marcadores interactivos en el mapa Leaflet.
 */
function renderMapMarkers(properties) {
    markersLayer.clearLayers();

    properties.forEach(p => {
        // Icono flotante personalizado y glowing
        const isSelected = selectedPropertyId === p.id;
        const color = p.suitability >= 85 ? "#10B981" : p.suitability >= 70 ? "#6366F1" : "#EF4444";
        const glowingClass = p.suitability >= 85 ? "glow-green" : "glow-blue";
        
        const customIcon = L.divIcon({
            className: "custom-marker-container",
            html: `
                <div class="custom-map-marker ${glowingClass} ${isSelected ? 'marker-selected' : ''}" style="background-color: ${color}">
                    <span class="marker-score">${p.suitability}</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker([p.lat, p.lon], { icon: customIcon });

        // Popup personalizado
        marker.bindPopup(`
            <div class="map-popup-content">
                <strong>${escapeHTML(p.name)}</strong><br>
                <span>Alquiler: ${p.rent.toLocaleString()}€/mes</span><br>
                <span>Superficie: ${p.size}m²</span><br>
                <button class="btn-popup-info" onclick="focusProperty('${p.id}')">Analizar en Dashboard</button>
            </div>
        `);

        marker.on("click", () => {
            focusProperty(p.id);
        });

        markersLayer.addLayer(marker);
    });
}

/**
 * Centra y enfoca una propiedad en el mapa y en el listado lateral, abriendo el panel de detalles.
 */
window.focusProperty = function(id) {
    selectedPropertyId = id;
    const prop = currentProperties.find(p => p.id === id);
    if (!prop) return;

    // Centrar mapa
    map.panTo([prop.lat, prop.lon]);

    // Actualizar visualizaciones del listado
    document.querySelectorAll(".property-card").forEach(card => {
        if (card.dataset.id === id) card.classList.add("active");
        else card.classList.remove("active");
    });

    // Re-renderizar marcadores para aplicar clase de seleccionado
    renderMapMarkers(currentProperties.filter(p => {
        // Aplicamos los filtros del DOM
        const budgetVal = parseInt(document.getElementById("filter-budget").value);
        const sizeFilter = document.getElementById("filter-size").value;
        let show = true;
        if (budgetVal < 12000 && p.rent > budgetVal) show = false;
        if (sizeFilter === "grande" && p.size < 150) show = false;
        if (sizeFilter === "pequeño" && p.size >= 100) show = false;
        if (sizeFilter === "mediano" && (p.size < 100 || p.size >= 150)) show = false;
        return show;
    }));

    // Abrir Panel de Análisis detallado
    showPropertyDetailsPanel(prop);
};

/**
 * Muestra el panel con las métricas analíticas detalladas.
 */
function showPropertyDetailsPanel(prop) {
    const panel = document.getElementById("analysis-details-panel");
    
    // Generar indicador de competencia
    let compText = "Baja competencia directa en la zona.";
    let compClass = "comp-low";
    if (prop.competitors > 5) {
        compText = "Alta competencia directa detectada en el sector.";
        compClass = "comp-high";
    } else if (prop.competitors >= 3) {
        compText = "Competencia equilibrada en la zona.";
        compClass = "comp-medium";
    }

    // Calcular comparación de mercado con Idealista y Yaencontre
    const displayCity = prop.city || agent.currentLocation || "madrid";
    const cityKey = displayCity.toLowerCase();
    const baseIdealistaM2 = IDEALISTA_CITY_INDEX[cityKey] || 20;
    
    // Generar una variación determinista reproducible basada en la id del local
    const seedNum = parseInt(prop.id.replace(/\D/g, "")) || 42;
    const randomFactor = 0.85 + ((seedNum % 31) / 100); // 0.85 a 1.15
    const idealistaM2 = Math.floor(baseIdealistaM2 * randomFactor);
    const idealistaReferenceRent = idealistaM2 * prop.size;

    // Calcular diferencia porcentual
    const pctDiff = Math.round(((prop.rent - idealistaReferenceRent) / idealistaReferenceRent) * 100);
    let diffText = "";
    let diffClass = "";
    if (pctDiff > 5) {
        diffText = `📈 ${pctDiff}% por encima de la media de mercado`;
        diffClass = "diff-above";
    } else if (pctDiff < -5) {
        diffText = `📉 ${Math.abs(pctDiff)}% por debajo de la media de mercado (Oportunidad)`;
        diffClass = "diff-below";
    } else {
        diffText = `⚖️ En línea con la media de mercado`;
        diffClass = "diff-equal";
    }

    // Generar enlaces
    const idealistaLink = getIdealistaLink(displayCity);
    const yaencontreLink = getYaencontreLink(displayCity);

    panel.innerHTML = `
        <div class="panel-detail-header">
            <h2>📊 Informe de Geomarketing AI</h2>
            <button class="btn-close-panel" onclick="closeDetailsPanel()">&times;</button>
        </div>
        <div class="panel-detail-scroll">
            <div class="detail-hero" style="background-image: url('${prop.image}')"></div>
            <div class="detail-body">
                <h3>${escapeHTML(prop.name)}</h3>
                <p class="detail-address">📍 ${escapeHTML(prop.address)}</p>
                
                <div class="detail-score-circle">
                    <span class="detail-score-num">${prop.suitability}</span>
                    <span class="detail-score-label">Retail Match</span>
                </div>

                <div class="detail-description">
                    <h4>Análisis de Idoneidad Conversacional</h4>
                    <p>${escapeHTML(prop.description)}</p>
                </div>

                <div class="detail-metrics-grid">
                    <div class="metric-box">
                        <span class="m-val">💶 ${prop.rent.toLocaleString()} €</span>
                        <span class="m-lbl">Renta Mensual</span>
                    </div>
                    <div class="metric-box">
                        <span class="m-val">📐 ${prop.size} m²</span>
                        <span class="m-lbl">Superficie</span>
                    </div>
                    <div class="metric-box">
                        <span class="m-val">🚶 ${prop.traffic}</span>
                        <span class="m-lbl">Tráfico Peatonal</span>
                    </div>
                    <div class="metric-box">
                        <span class="m-val">👥 ${prop.competitors}</span>
                        <span class="m-lbl">Competidores (OSM)</span>
                    </div>
                </div>

                <!-- COMPARATIVA DE MERCADO (IDEALISTA / YAENCONTRE) -->
                <div class="detail-analysis-card real-estate-compare">
                    <h4>Comparativa de Mercado</h4>
                    <div class="compare-row">
                        <span class="compare-label">Índice Idealista medio:</span>
                        <span class="compare-value">${idealistaM2} €/m²</span>
                    </div>
                    <div class="compare-row">
                        <span class="compare-label">Precio mercado estimado:</span>
                        <span class="compare-value">${idealistaReferenceRent.toLocaleString()} €/mes</span>
                    </div>
                    <div class="compare-diff-badge ${diffClass}">
                        ${diffText}
                    </div>
                    
                    <div class="compare-actions">
                        <a href="${idealistaLink}" target="_blank" class="btn-compare btn-idealista">
                            <span class="btn-icon">🔍</span> Ver en Idealista
                        </a>
                        <a href="${yaencontreLink}" target="_blank" class="btn-compare btn-yaencontre">
                            <span class="btn-icon">🏠</span> Ver en Yaencontre
                        </a>
                    </div>
                </div>

                <div class="detail-analysis-card">
                    <h4>Competencia y Entorno</h4>
                    <div class="comp-badge ${compClass}">${compText}</div>
                    <p style="margin-top: 10px; font-size: 0.85rem; color: var(--on-neutral);">
                        El análisis geoespacial muestra un ratio de ${prop.competitors} competidores activos del mismo giro en un radio de 200m. 
                        Recomendamos este local por su excelente tasa de conversión peatonal simulada.
                    </p>
                </div>
            </div>
        </div>
    `;
    panel.classList.add("active");
}

/**
 * Cierra el panel de detalles.
 */
window.closeDetailsPanel = function() {
    document.getElementById("analysis-details-panel").classList.remove("active");
    selectedPropertyId = null;
    // Restaurar marcadores
    renderMapMarkers(currentProperties);
    // Quitar active del listado
    document.querySelectorAll(".property-card").forEach(c => c.classList.remove("active"));
};

/**
 * Agrega una burbuja de mensaje al feed del chat.
 */
function addChatBubble(role, text) {
    const feed = document.getElementById("chat-feed");
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    
    // Si es el bot, soportar formateo markdown sencillo
    if (role === "bot") {
        bubble.innerHTML = formatMarkdown(text);
    } else {
        bubble.textContent = text;
    }
    
    feed.appendChild(bubble);
    feed.scrollTop = feed.scrollHeight;
}

/**
 * Añade el indicador de escritura ("escribiendo...").
 */
function addTypingIndicator() {
    const feed = document.getElementById("chat-feed");
    const indicator = document.createElement("div");
    indicator.className = "chat-bubble chat-bubble-bot typing-indicator";
    indicator.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    feed.appendChild(indicator);
    feed.scrollTop = feed.scrollHeight;
    return indicator;
}

/**
 * Formateo ultra básico de markdown para las burbujas del bot.
 */
function formatMarkdown(text) {
    let html = text;
    // Negrita
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Títulos de nivel 3
    html = html.replace(/### (.*?)\n/g, '<h4>$1</h4>');
    // Viñetas
    html = html.replace(/-\s(.*?)\n/g, '<li>$1</li>');
    // Saltos de línea
    html = html.replace(/\n/g, '<br>');
    return html;
}

/**
 * Controla la visualización de skeletons de carga.
 */
function showLoadingSkeletons(show) {
    const container = document.getElementById("properties-list-container");
    if (show) {
        container.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }
}

/**
 * Sanitiza cadenas de texto frente a inyecciones XSS.
 */
function escapeHTML(str) {
    if (!str) return "";
    return str.toString()
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
