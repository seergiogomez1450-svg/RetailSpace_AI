// =============================================================================
// Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
// Copyright (c) 2026 ESIC
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * UNIT TESTS - RetailSpace AI
 * Suite de pruebas sencillas para validar el motor de intenciones de IA y el simulador de métricas.
 */

// Función de ayuda para aserciones
function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ FALLÓ: ${message}`);
    }
    console.log(`✅ PASÓ: ${message}`);
}

async function runTests() {
    const resultsContainer = document.getElementById("test-results");
    resultsContainer.innerHTML = "";
    
    let passedCount = 0;
    let failedCount = 0;

    const addLog = (text, isError = false) => {
        const div = document.createElement("div");
        div.style.padding = "8px 12px";
        div.style.marginBottom = "5px";
        div.style.borderRadius = "4px";
        div.style.backgroundColor = isError ? "#EF444420" : "#10B98120";
        div.style.border = `1px solid ${isError ? "#EF4444" : "#10B981"}`;
        div.style.color = isError ? "#EF4444" : "#10B981";
        div.style.fontSize = "0.9rem";
        div.textContent = text;
        resultsContainer.appendChild(div);
    };

    // --- TEST 1: Inicialización del Agente ---
    try {
        const agent = new RetailAgent();
        assert(agent !== null, "El Agente de Retail se inicializa correctamente.");
        assert(agent.currentLocation === "madrid", "La ubicación por defecto del Agente es 'madrid'.");
        passedCount++;
        addLog("Test 1: Inicialización de Agente - CORRECTO");
    } catch (e) {
        failedCount++;
        addLog(`Test 1: Inicialización de Agente - FALLÓ: ${e.message}`, true);
    }

    // --- TEST 2: Clasificador de Intenciones (Parser Semántico) ---
    try {
        const agent = new RetailAgent();
        
        // Simular mensaje con ubicación y categoría
        const result1 = await agent.processMessage("Busco un local para un restaurante italiano en Barcelona");
        assert(result1.command.action === "search", "Detecta correctamente acción de búsqueda.");
        assert(result1.command.location === "barcelona", "Extrae correctamente la ciudad 'barcelona'.");
        assert(result1.command.category === "RESTAURANTE", "Asocia 'restaurante' con la categoría 'RESTAURANTE'.");
        
        // Simular mensaje con presupuesto
        const result2 = await agent.processMessage("Quiero una tienda de ropa en Valencia con alquiler menos de 4000 euros");
        assert(result2.command.location === "valencia", "Extrae la ciudad 'valencia'.");
        assert(result2.command.category === "MODA", "Asocia 'ropa' con la categoría 'MODA'.");
        assert(result2.command.filters.maxBudget === 4000, "Extrae el presupuesto de 4000€.");

        // Simular mensaje con gimnasio
        const result3 = await agent.processMessage("Busco local para un gimnasio de crossfit en Madrid");
        assert(result3.command.location === "madrid", "Extrae la ciudad 'madrid' para el gimnasio.");
        assert(result3.command.category === "GIMNASIO", "Asocia 'gimnasio' y 'crossfit' con la categoría 'GIMNASIO'.");
        
        passedCount++;
        addLog("Test 2: Parser Conversacional (Intenciones) - CORRECTO");
    } catch (e) {
        failedCount++;
        addLog(`Test 2: Parser Conversacional (Intenciones) - FALLÓ: ${e.message}`, true);
    }

    // --- TEST 3: Simulador de Retail (Enriquecimiento OSM) ---
    try {
        // Simular un nodo crudo de OSM
        const dummyNode = {
            id: 99999,
            lat: 40.4168,
            lon: -3.7038,
            tags: {
                name: "Zara Kids",
                shop: "clothes"
            }
        };

        const prop = simulatePropertyFromOSM(dummyNode, "MODA");
        
        assert(prop.id === "osm_99999", "Asigna el ID formateado correcto.");
        assert(prop.size >= 50 && prop.size <= 300, "Simula un tamaño de superficie dentro del rango.");
        assert(prop.rent > 0, "Simula un coste de alquiler mayor a 0.");
        assert(prop.suitability >= 40 && prop.suitability <= 100, "Calcula el Retail Match Score entre 40 y 100.");
        assert(prop.image.includes("unsplash.com"), "Asigna una URL de imagen dinámica del banco.");

        passedCount++;
        addLog("Test 3: Motor de Simulación (Retail Enriquecimiento) - CORRECTO");
    } catch (e) {
        failedCount++;
        addLog(`Test 3: Motor de Simulación - FALLÓ: ${e.message}`, true);
    }

    // --- TEST 4: Generadores de Enlaces Inmobiliarios (Idealista / Yaencontre) ---
    try {
        const linkIdealista = getIdealistaLink("Málaga");
        assert(linkIdealista === "https://www.idealista.com/alquiler-locales/malaga/", "Idealista sanitiza correctamente acentos y espacios.");

        const linkYaencontre = getYaencontreLink("Barcelona");
        assert(linkYaencontre === "https://www.yaencontre.com/alquiler/locales/municipio-barcelona", "Yaencontre genera URLs válidas.");

        passedCount++;
        addLog("Test 4: Enlaces Comparativos Inmobiliarios - CORRECTO");
    } catch (e) {
        failedCount++;
        addLog(`Test 4: Enlaces Comparativos Inmobiliarios - FALLÓ: ${e.message}`, true);
    }

    // --- TEST 5: Parseo de Medidas y Tamaños Numéricos ---
    try {
        const agent = new RetailAgent();
        const result = await agent.processMessage("Busco local de 220 metros para un gimnasio en Madrid");
        assert(result.command.filters.sizeFilter === "grande", "Identifica local de 220 metros como 'grande'.");

        const resultSmall = await agent.processMessage("Quiero una peluqueria de 80 m2 en Barcelona");
        assert(resultSmall.command.filters.sizeFilter === "pequeño", "Identifica local de 80 m2 como 'pequeño'.");

        passedCount++;
        addLog("Test 5: Parser de Tamaños Numéricos - CORRECTO");
    } catch (e) {
        failedCount++;
        addLog(`Test 5: Parser de Tamaños Numéricos - FALLÓ: ${e.message}`, true);
    }

    // Actualizar Resumen
    document.getElementById("test-summary").innerHTML = `
        <strong>Resumen de ejecución:</strong> 
        <span style="color:#10B981">${passedCount} Pasados</span> | 
        <span style="color:#EF4444">${failedCount} Fallados</span>
    `;
}
