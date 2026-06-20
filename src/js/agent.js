// =============================================================================
// Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
// Copyright (c) 2026 ESIC
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * AGENT SERVICE - RetailSpace AI
 * Intérprete conversacional y recomendador de locales comerciales del lado de cliente.
 */

class RetailAgent {
    constructor() {
        this.history = [];
        this.currentLocation = "madrid";
        this.currentCategory = "MODA";
    }

    /**
     * Procesa un mensaje del usuario y devuelve la respuesta del bot junto con los comandos de mapa si aplica.
     * @param {string} userMessage Mensaje ingresado por el usuario
     * @param {string|null} apiKey Clave API de Gemini
     * @returns {Promise<Object>} { responseText, command: { action, location, category, filters }, isRealAI }
     */
    async processMessage(userMessage, apiKey = null) {
        this.history.push({ role: "user", text: userMessage });
        const normalizedMsg = userMessage.toLowerCase().trim();

        // 1. Detección de Ubicación (Ciudades principales de España)
        let location = null;
        const cities = ["madrid", "barcelona", "valencia", "sevilla", "zaragoza", "malaga", "murcia", "palma", "bilbao", "alicante", "valladolid", "vigo", "gijon", "granada"];
        
        for (const city of cities) {
            const regex = new RegExp(`\\b${city}\\b`, "i");
            if (regex.test(normalizedMsg)) {
                location = city;
                this.currentLocation = city;
                break;
            }
        }

        // 2. Detección de Categoría Comercial
        let category = null;
        const categoriesMap = {
            RESTAURANTE: ["restaurante", "cafeteria", "bar", "cafe", "comida", "hosteleria", "bistro", "gourmet", "copas", "pub", "pizzeria", "hamburgueseria"],
            MODA: ["moda", "ropa", "boutique", "calzado", "zapatos", "vestir", "tienda", "accesorios", "joyeria", "outlet", "fashion"],
            ALIMENTACION: ["supermercado", "super", "alimentacion", "comestibles", "panaderia", "fruteria", "carniceria", "ultramarinos", "eco", "bio"],
            SERVICIOS: ["oficina", "despacho", "coworking", "peluqueria", "estetica", "clinica", "farmacia", "banco", "dentista", "gestoria", "servicios"],
            GIMNASIO: ["gimnasio", "gym", "gimnasios", "deporte", "fitness", "entrenamiento", "crossfit", "yoga", "pilates", "musculacion"]
        };

        for (const [catKey, keywords] of Object.entries(categoriesMap)) {
            for (const word of keywords) {
                const regex = new RegExp(`\\b${word}\\b`, "i");
                if (regex.test(normalizedMsg)) {
                    category = catKey;
                    this.currentCategory = catKey;
                    break;
                }
            }
            if (category) break;
        }

        // 3. Extracción de filtros de presupuesto/precio
        let maxBudget = null;
        const budgetRegex = /(?:menos de|maximo|máximo|presupuesto de|alquiler de|bajo|hasta|<|<=)\s*(\d+(?:\.\d+)?)\s*(?:€|euros|eur)?/i;
        const budgetMatch = normalizedMsg.match(budgetRegex);
        if (budgetMatch) {
            maxBudget = parseInt(budgetMatch[1].replace(".", ""));
        }

        // 4. Extracción de filtros de tamaño/superficie
        let sizeFilter = null; // 'grande', 'mediano', 'pequeño'
        let sizeValue = null;
        const sizeRegex = /(?:de|mas de|más de|menos de|sobre|unos)?\s*(\d+)\s*(?:m2|metros|m²)/i;
        const sizeMatch = normalizedMsg.match(sizeRegex);
        if (sizeMatch) {
            sizeValue = parseInt(sizeMatch[1]);
            if (sizeValue >= 150) sizeFilter = "grande";
            else if (sizeValue < 100) sizeFilter = "pequeño";
            else sizeFilter = "mediano";
        } else {
            if (/\b(grande|amplio|espacioso|grandes|anchos)\b/i.test(normalizedMsg)) {
                sizeFilter = "grande";
            } else if (/\b(pequeño|pequeños|pequeña|chico|reducido)\b/i.test(normalizedMsg)) {
                sizeFilter = "pequeño";
            } else if (/\b(mediano|medianos|estandar|normal)\b/i.test(normalizedMsg)) {
                sizeFilter = "mediano";
            }
        }

        // Formular comando de acción
        const command = {
            action: (location || category) ? "search" : "chat",
            location: location || this.currentLocation,
            category: category || this.currentCategory,
            filters: {
                maxBudget,
                sizeFilter
            }
        };

        // Si es solo una conversación general y no hay clave API
        if (!location && !category && this.history.length === 1 && !apiKey) {
            const responseText = this.getGreetingResponse();
            this.history.push({ role: "bot", text: responseText });
            return { responseText, command, isRealAI: false };
        }

        // Generar respuesta
        let responseText;
        let isRealAI = false;

        if (apiKey) {
            try {
                responseText = await this.queryGroqAPI(userMessage, apiKey, command);
                isRealAI = true;
            } catch (error) {
                console.error("Groq API error, falling back to local simulation:", error);
                responseText = "⚠️ *[Simulación Local - Error de API]* " + this.generateAIExplanation(command.location, command.category, command.filters);
            }
        } else {
            responseText = this.generateAIExplanation(command.location, command.category, command.filters);
        }

        this.history.push({ role: "bot", text: responseText });

        return { responseText, command, isRealAI };
    }

    /**
     * Realiza una consulta directa a la API de Groq conservando el contexto.
     */
    async queryGroqAPI(userMessage, apiKey, detectedCommand) {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        
        const cityName = detectedCommand.location.charAt(0).toUpperCase() + detectedCommand.location.slice(1);
        const catLabel = RETAIL_CATEGORIES[detectedCommand.category]?.label || "comercio";
        
        let systemInstructionText = `Eres un consultor experto en geomarketing y locales comerciales en España para la plataforma RetailSpace AI.
Ayuda al usuario a evaluar locales y zonas para su negocio de forma profesional, concisa y atractiva. Usa formato Markdown con emojis de forma moderada.

INFORMACIÓN DEL ENTORNO ACTUAL:
- Ciudad seleccionada en el mapa: ${cityName}
- Categoría comercial: ${catLabel}
`;
        
        if (detectedCommand.filters.maxBudget) {
            systemInstructionText += `- Presupuesto máximo del usuario: ${detectedCommand.filters.maxBudget}€/mes\n`;
        }
        if (detectedCommand.filters.sizeFilter) {
            systemInstructionText += `- Tamaño del local requerido: ${detectedCommand.filters.sizeFilter}\n`;
        }
        
        systemInstructionText += `\nInstrucciones adicionales:
1. Si el usuario te pregunta por locales o zonas, da un análisis útil e inteligente del sector de ${catLabel} en ${cityName}.
2. Sé natural y conversacional. No inventes datos exactos de locales individuales, pero sí da pautas útiles sobre las zonas comerciales principales.
3. Responde siempre en español.`;

        // Mapear historial de chat al formato de OpenAI (roles: system, user, assistant)
        const messages = [
            {
                role: "system",
                content: systemInstructionText
            }
        ];

        // Mapear los últimos 10 mensajes del historial (excluyendo el bot typing indicator o mensajes vacíos)
        const historySlice = this.history.slice(-10);
        for (const msg of historySlice) {
            const role = msg.role === "bot" ? "assistant" : "user";
            messages.push({
                role: role,
                content: msg.text
            });
        }

        const requestBody = {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        if (!responseText) {
            throw new Error("No response text returned from Groq API");
        }

        return responseText;
    }

    /**
     * Saludo inicial del agente conversacional.
     */
    getGreetingResponse() {
        return `¡Hola! Soy tu asesor inmobiliario inteligente de **RetailSpace AI**. 
        
Estoy diseñado específicamente para ayudarte a encontrar locales comerciales óptimos para tu negocio en España utilizando datos reales del sector.

**¿Cómo te puedo ayudar hoy?** Puedes pedirme cosas como:
- *"Busco un local amplio en Madrid para abrir una tienda de ropa con presupuesto de 5000€"*
- *"Quiero un local de restauración en Barcelona con mucho paso peatonal"*
- *"¿Qué locales hay para un supermercado en Valencia?"*`;
    }

    /**
     * Genera la justificación y análisis de geomarketing de la IA.
     */
    generateAIExplanation(city, category, filters) {
        const catLabel = RETAIL_CATEGORIES[category]?.label || "comercio";
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        
        let response = `### 🔍 Análisis de Ubicación y Retail para **${cityName}**\n\n`;
        response += `He procesado tu solicitud para buscar locales de **${catLabel}**. He mapeado el entorno comercial en OpenStreetMap y evaluado los locales más prometedores aplicando nuestra fórmula de **Retail Score**.\n\n`;

        // Justificación por filtros
        if (filters.maxBudget) {
            response += `- **Presupuesto Máximo:** Filtrando locales con alquiler menor a **${filters.maxBudget.toLocaleString()}€/mes**.\n`;
        }
        if (filters.sizeFilter) {
            const sizeLabel = filters.sizeFilter === "grande" ? "más de 150m²" : filters.sizeFilter === "pequeño" ? "menos de 100m²" : "entre 100m² y 150m²";
            response += `- **Superficie requerida:** Locales de tamaño **${filters.sizeFilter}** (${sizeLabel}).\n`;
        }

        response += `\n**Locales Recomendados en el Mapa:**\n`;
        
        if (category === "RESTAURANTE") {
            response += `1. **Ejes de alto tránsito:** Te recomiendo priorizar locales con fachada visible y tránsito peatonal **Alto**. La hostelería requiere alta visibilidad de paso.\n`;
            response += `2. **Indicador de Competencia:** He analizado los restaurantes cercanos en el mapa. Un nivel de competencia moderado (3-6 locales) indica una zona gastronómica consolidada, lo cual es positivo.`;
        } else if (category === "MODA") {
            response += `1. **Zonas Prime:** Para moda, los locales esquineros son ideales. Busca en el mapa los marcadores destacados en **verde intenso** (Retail Score > 90).\n`;
            response += `2. **Afluencia Turística:** En las capitales analizadas, la moda se beneficia de la cercanía a plazas y vías principales peatonales.`;
        } else if (category === "ALIMENTACION") {
            response += `1. **Accesibilidad:** Los supermercados o tiendas de alimentación requieren facilidad de carga/descarga y superficies amplias (>150m²).\n`;
            response += `2. **Densidad Residencial:** El mapa destaca zonas rodeadas de edificios residenciales para captar compra recurrente diaria.`;
        } else if (category === "GIMNASIO") {
            response += `1. **Dimensiones y Techos:** Los centros de deporte y gimnasios requieren locales amplios (generalmente >200m²) y alturas de techo generosas.\n`;
            response += `2. **Aislamiento y Licencias:** Es clave verificar los requisitos de insonorización acústica y licencias deportivas para evitar molestias a vecinos.`;
        } else {
            response += `1. **Sinergia Comercial:** Para oficinas y servicios, se recomiendan locales cercanos a hubs corporativos, bancos o estaciones de metro.\n`;
            response += `2. **Coste Eficiente:** Priorizamos locales medianos con alquileres moderados pero buena comunicación de transporte.`;
        }

        response += `\n\n*He actualizado el mapa interactivo y el listado de locales destacados. Haz clic en cualquiera de ellos para ver el desglose detallado de su Retail Score e idoneidad.*`;

        return response;
    }
}
