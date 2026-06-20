// =============================================================================
// Proyecto ESIC — Plataforma de desarrollo para el Proyecto ESIC
// Copyright (c) 2026 ESIC
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * MOCKDATA - RetailSpace AI
 * Dataset de locales comerciales de respaldo (Offline Fallback) y motor de simulación retail.
 */

// Categorías de negocio soportadas
const RETAIL_CATEGORIES = {
    RESTAURANTE: { id: "RESTAURANTE", label: "Restauración & Cafetería", icon: "🍔", osmTags: ["restaurant", "cafe", "fast_food", "bar", "pub"] },
    MODA: { id: "MODA", label: "Moda & Accesorios", icon: "👕", osmTags: ["clothes", "shoes", "boutique", "jewelry", "bag"] },
    ALIMENTACION: { id: "ALIMENTACION", label: "Supermercado & Alimentación", icon: "🛒", osmTags: ["supermarket", "convenience", "bakery", "butcher", "greengrocer"] },
    SERVICIOS: { id: "SERVICIOS", label: "Oficina, Salud & Servicios", icon: "💼", osmTags: ["office", "hairdresser", "bank", "pharmacy", "dry_cleaning"] },
    GIMNASIO: { id: "GIMNASIO", label: "Gimnasios & Deporte", icon: "💪", osmTags: ["fitness_centre", "sports_centre", "gym"] }
};

// Índices estimados de precio medio del alquiler de locales según Idealista (€/m²)
const IDEALISTA_CITY_INDEX = {
    madrid: 38,
    barcelona: 36,
    valencia: 24,
    sevilla: 22,
    zaragoza: 18,
    malaga: 26,
    murcia: 14,
    palma: 28,
    bilbao: 25,
    alicante: 18,
    valladolid: 15,
    vigo: 16,
    gijon: 14,
    granada: 17
};

// Generador dinámico de enlaces de búsqueda para Idealista
function getIdealistaLink(city) {
    const cleanCity = (city || "madrid").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    return `https://www.idealista.com/alquiler-locales/${cleanCity}/`;
}

// Generador dinámico de enlaces de búsqueda para Yaencontre
function getYaencontreLink(city) {
    const cleanCity = (city || "madrid").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    return `https://www.yaencontre.com/alquiler/locales/municipio-${cleanCity}`;
}

// Imágenes reales de Unsplash para locales comerciales por categoría (tiendas y locales reales y únicos)
const RETAIL_IMAGES = {
    MODA: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1481437156560-3205a6a55735?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1567401893930-7bec75177659?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1528255915607-9012fda0f838?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1532453288457-8a1ad07c2438?auto=format&fit=crop&w=600&q=80"
    ],
    RESTAURANTE: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=80"
    ],
    ALIMENTACION: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=600&q=80"
    ],
    SERVICIOS: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1521737711867-e3b90473bd58?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"
    ],
    GIMNASIO: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571731979149-75be743135ee?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=600&q=80"
    ]
};

const FALLBACK_PROPERTIES = [
    // MADRID
    {
        id: "m1",
        name: "Local Gran Vía Premium",
        lat: 40.4201,
        lon: -3.7038,
        city: "madrid",
        address: "Calle Gran Vía, 32, 28013 Madrid",
        type: "MODA",
        size: 240,
        rent: 8500,
        traffic: "Alto",
        competitors: 8,
        suitability: 96,
        image: RETAIL_IMAGES.MODA[0],
        description: "Espectacular local comercial esquinero en plena Gran Vía con alto flujo de peatones turístico y residencial. Perfecto para flagship store de moda."
    },
    {
        id: "m2",
        name: "Espacio Foodies Fuencarral",
        lat: 40.4245,
        lon: -3.7012,
        city: "madrid",
        address: "Calle de Fuencarral, 45, 28004 Madrid",
        type: "RESTAURANTE",
        size: 110,
        rent: 4200,
        traffic: "Alto",
        competitors: 5,
        suitability: 92,
        image: RETAIL_IMAGES.RESTAURANTE[0],
        description: "Local acondicionado para hostelería con salida de humos en calle Fuencarral. Zona peatonal de tendencia con flujo constante de público joven."
    },
    {
        id: "m3",
        name: "Local Gourmet Salamanca",
        lat: 40.4289,
        lon: -3.6845,
        city: "madrid",
        address: "Calle de Serrano, 60, 28001 Madrid",
        type: "ALIMENTACION",
        size: 180,
        rent: 6800,
        traffic: "Medio",
        competitors: 2,
        suitability: 88,
        image: RETAIL_IMAGES.ALIMENTACION[0],
        description: "Local comercial de techos altos en Barrio de Salamanca. Ideal para tienda de alimentación gourmet, bodega o delicatessen por su nivel socioeconómico alto."
    },
    {
        id: "m4",
        name: "Oficina Boutique Chueca",
        lat: 40.4228,
        lon: -3.6975,
        city: "madrid",
        address: "Calle de las Infantas, 18, 28004 Madrid",
        type: "SERVICIOS",
        size: 85,
        rent: 1900,
        traffic: "Medio",
        competitors: 4,
        suitability: 85,
        image: RETAIL_IMAGES.SERVICIOS[0],
        description: "Local a pie de calle adaptado como oficina o centro de estética. Gran visibilidad en zona dinámica y de fácil acceso."
    },

    // BARCELONA
    {
        id: "b1",
        name: "Local Esquina Paseo de Gracia",
        lat: 41.3912,
        lon: 2.1648,
        city: "barcelona",
        address: "Passeig de Gràcia, 45, 08007 Barcelona",
        type: "MODA",
        size: 310,
        rent: 11000,
        traffic: "Alto",
        competitors: 12,
        suitability: 98,
        image: RETAIL_IMAGES.MODA[1],
        description: "Ubicación prime indiscutible en el eje comercial del Paseo de Gracia. Fachada acristalada en chaflán típico del Eixample barcelonés."
    },
    {
        id: "b2",
        name: "Bistro Rambla de Catalunya",
        lat: 41.3895,
        lon: 2.1610,
        city: "barcelona",
        address: "Rambla de Catalunya, 62, 08007 Barcelona",
        type: "RESTAURANTE",
        size: 140,
        rent: 5500,
        traffic: "Alto",
        competitors: 6,
        suitability: 95,
        image: RETAIL_IMAGES.RESTAURANTE[1],
        description: "Local en planta baja comercial con licencia C3 de restauración. Terraza autorizada y paso continuo turístico y corporativo."
    },
    {
        id: "b3",
        name: "Eco-Market Eixample",
        lat: 41.3942,
        lon: 2.1565,
        city: "barcelona",
        address: "Carrer de Còrsega, 302, 08008 Barcelona",
        type: "ALIMENTACION",
        size: 200,
        rent: 3200,
        traffic: "Medio",
        competitors: 3,
        suitability: 89,
        image: RETAIL_IMAGES.ALIMENTACION[1],
        description: "Espacio diáfano ideal para supermercado de barrio o tienda de alimentación saludable. Dispone de zona de almacén trasera y muelle de descarga."
    },

    // VALENCIA
    {
        id: "v1",
        name: "Flagship Shop Colón",
        lat: 39.4678,
        lon: -0.3725,
        city: "valencia",
        address: "Carrer de Colón, 18, 46004 València",
        type: "MODA",
        size: 220,
        rent: 5200,
        traffic: "Alto",
        competitors: 5,
        suitability: 94,
        image: RETAIL_IMAGES.MODA[2],
        description: "Local en el principal eje comercial de Valencia. Fachada espectacular y paso de peatones consolidado."
    },
    {
        id: "v2",
        name: "Restaurante Ruzafa Cool",
        lat: 39.4625,
        lon: -0.3752,
        city: "valencia",
        address: "Carrer de Sueca, 24, 46006 València",
        type: "RESTAURANTE",
        size: 130,
        rent: 2100,
        traffic: "Medio",
        competitors: 7,
        suitability: 91,
        image: RETAIL_IMAGES.RESTAURANTE[2],
        description: "Ubicado en el epicentro de la gastronomía y ocio nocturno en Ruzafa. Totalmente acondicionado y con encanto histórico."
    },
    // GIMNASIOS
    {
        id: "m_gym1",
        name: "Gimnasio Fitness Center Gran Vía",
        lat: 40.4215,
        lon: -3.7028,
        city: "madrid",
        address: "Calle de Gran Vía, 48, 28013 Madrid",
        type: "GIMNASIO",
        size: 450,
        rent: 9200,
        traffic: "Alto",
        competitors: 3,
        suitability: 96,
        image: RETAIL_IMAGES.GIMNASIO[0],
        description: "Local comercial de grandes dimensiones ideal para gimnasio boutique, estudio de pilates o box de crossfit en pleno centro de Madrid."
    },
    {
        id: "b_gym1",
        name: "CrossFit Eixample Hub",
        lat: 41.3920,
        lon: 2.1612,
        city: "barcelona",
        address: "Carrer de Balmes, 120, 08008 Barcelona",
        type: "GIMNASIO",
        size: 380,
        rent: 6200,
        traffic: "Medio",
        competitors: 2,
        suitability: 93,
        image: RETAIL_IMAGES.GIMNASIO[1],
        description: "Amplio local comercial con techos altos de más de 4 metros, perfecto para actividades de fitness y deporte con excelente ventilación y espacio diáfano."
    }
];

/**
 * Genera métricas de simulación comercial para un nodo crudo obtenido de la API Overpass.
 * @param {Object} node Nodo de OSM
 * @param {string} selectedCategory Categoría comercial deseada ("RESTAURANTE", "MODA", etc.)
 * @returns {Object} Local comercial simulado con datos enriquecidos
 */
function simulatePropertyFromOSM(node, selectedCategory) {
    // Generar datos reproducibles a partir del ID del nodo
    const seed = node.id || Math.floor(Math.random() * 1000000);
    const random = (s) => {
        let x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    // Calcular superficie estimada (m²)
    const baseSize = 50;
    const extraSize = Math.floor(random(seed + 1) * 250); // 0 a 250 m2
    const size = baseSize + extraSize;

    // Calcular precio de alquiler estimado (Basado en superficie y un precio base)
    // El precio del m² varía entre 15€ y 60€ según categoría y zona
    const rentPerM2 = 15 + Math.floor(random(seed + 2) * 45);
    const rent = Math.floor(size * rentPerM2);

    // Calcular nivel de tráfico peatonal (según tipo y aleatorio)
    const trafficSeed = random(seed + 3);
    let traffic = "Medio";
    if (trafficSeed > 0.65) traffic = "Alto";
    else if (trafficSeed < 0.25) traffic = "Bajo";

    // Calcular competidores estimados en el entorno
    const competitors = Math.floor(random(seed + 4) * 8) + 1;

    // Determinar la categoría exacta y el nombre comercial
    let type = selectedCategory || "MODA";
    let typeName = node.tags.name || node.tags.shop || node.tags.amenity || "Local Comercial";
    
    // Capitalizar nombre
    typeName = typeName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const name = typeName.length > 30 ? typeName.substring(0, 27) + "..." : typeName;

    // Calcular el "Retail Suitability Score" (Idoneidad)
    // Se premia el tráfico alto, el tamaño equilibrado y se penaliza levemente la competencia extrema
    let suitability = 75;
    if (traffic === "Alto") suitability += 15;
    if (traffic === "Bajo") suitability -= 15;
    if (size >= 100 && size <= 200) suitability += 5; // tamaño óptimo para la mayoría
    suitability -= Math.min(competitors * 1.5, 10); // penalización suave por competencia
    suitability = Math.max(40, Math.min(100, Math.floor(suitability))); // acotar entre 40 y 100

    // Generar imagen Unsplash dinámica según categoría (determinística usando el seed)
    const images = RETAIL_IMAGES[type] || RETAIL_IMAGES.MODA;
    const imageUrl = images[seed % images.length];

    // Dirección aproximada
    const address = node.tags["addr:street"] 
        ? `${node.tags["addr:street"]} ${node.tags["addr:housenumber"] || ""}`.trim()
        : `Coordenadas: ${node.lat.toFixed(4)}, ${node.lon.toFixed(4)}`;

    // Descripción generada por IA
    const catLabel = RETAIL_CATEGORIES[type]?.label || "Retail";
    const description = `Excelente local comercial catalogado originalmente en OSM. Acondicionado con una superficie de ${size}m² en zona de tráfico peatonal ${traffic}. Muy adecuado para actividades comerciales de tipo ${catLabel}.`;

    return {
        id: `osm_${node.id}`,
        name: `Local comercial: ${name}`,
        lat: node.lat,
        lon: node.lon,
        city: "", // Se rellena externamente
        address: address,
        type: type,
        size: size,
        rent: rent,
        traffic: traffic,
        competitors: competitors,
        suitability: suitability,
        image: imageUrl,
        description: description
    };
}
