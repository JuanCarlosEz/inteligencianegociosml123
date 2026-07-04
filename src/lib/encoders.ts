// src/lib/encoders.ts
// Generado desde Python — REORDENADO POR DISTANCIA DESDE HUANCAYO
// Números bajos = Más cercanos al centro
// Números altos = Más lejanos

export const ENCODERS: Record<string, Record<string, number>> = {
  "Sexo": {
    "F": 0,
    "M": 1
  },

  // DISTRITOS ORDENADOS POR DISTANCIA DESDE HUANCAYO (Centro)
  "Distrito": {
    // CENTRO (0-2) - Mismo Huancayo y adyacentes
    "Huancayo": 0,           // Centro principal
    "El Tambo": 1,           // Adyacente norte
    "Chilca": 2,             // Adyacente este

    // MUY CERCANOS (3-8) - Radio 5-10 km
    "Chupaca": 3,            // Sur, cercano
    "Sapallanga": 4,         // Sur, cercano
    "Sicaya": 5,             // Este, cercano
    "Concepcion": 6,         // Noroeste, cercano
    "Pilcomayo": 7,          // Norte, cercano
    "Huancán": 8,            // Este, cercano (con tilde)

    // CERCANOS (9-15) - Radio 10-20 km
    "San Jeronimo": 9,       // Sur, cercano
    "Sincos": 10,            // Sur, cercano
    "Santa Rosa": 11,        // Este, cercano
    "Molinos": 12,           // Noroeste, cercano
    "Muquiyauyo": 13,        // Norte, cercano
    "Acolla": 14,            // Norte
    "Jauja": 15,             // Noroeste (cabecera del valle)

    // INTERMEDIOS (16-25) - Radio 20-40 km
    "Sausa": 16,             // Noroeste
    "Marco": 17,             // Noroeste
    "Mito": 18,              // Noroeste
    "Masma": 19,             // Noreste
    "Masma Chicche": 20,     // Noreste
    "El Mantaro": 21,        // Noreste
    "Hualhuas": 22,          // Este
    "Pariahuanca": 23,       // Este
    "Ingenio": 24,           // Noroeste
    "Chongos Bajo": 25,      // Sureste

    // LEJANOS (26-35) - Radio 40-60 km
    "Orcotuna": 26,          // Este, lejano
    "San Agustín": 27,       // Sur
    "San Agustín De Cajas": 28, // Sur
    "Pucará": 29,            // Sur
    "Quilcas": 30,           // Sur
    "Acobamba": 31,          // Norte alto
    "Apata": 32,             // Noreste
    "Canchayllo": 33,        // Noreste, serranía
    "Chacapampa": 34,        // Noreste, serranía
    "Chicche": 35,           // Noreste, serranía

    // MUY LEJANOS (36-50) - Radio 60+ km / Sierra alta
    "Chupuro": 36,           // Noreste, sierra
    "Colca": 37,             // Norte, sierra
    "Cullhuas": 38,          // Noroeste, sierra
    "Huertas": 39,           // Noroeste, sierra
    "Janjaillo": 40,         // Noroeste, sierra
    "Julcán": 41,            // Noreste, sierra (con tilde)
    "Leonor Ordóñez": 42,    // Noreste, sierra (con tilde)
    "Llocllapampa": 43,      // Noreste, sierra
    "Monobamba": 44,         // Noroeste, sierra
    "Nueve De Julio": 45,    // Noroeste, sierra
    "Paca": 46,              // Noroeste, sierra
    "Pancán": 47,            // Noreste, sierra (con tilde)
    "Parco": 48,             // Noroeste, sierra
    "Pomucocha": 49,         // Noreste, sierra
    "Ricán": 50,            // Noreste, sierra (con tilde)

    // EXTREMADAMENTE LEJANOS (51-61) - Límites provincia
    "Tunan Marca": 51,       // Noroeste extremo
    "Viques": 52,            // Sur extremo
    "Yauli": 53,             // Sureste extremo
    "Yauyos": 54,            // Sur extremo
    
    // Duplicados sin tildes (compatibilidad con Python)
    "Huancan": 8,            // Duplicado (sin tilde)
    "Julcan": 41,            // Duplicado (sin tilde)
    "Leonor Ordonez": 42,    // Duplicado (sin tilde)
    "Pancan": 47,            // Duplicado (sin tilde)
    "Rican": 50             // Duplicado (sin tilde)
  },

  "Tratamiento": {
    "Blanqueamiento Dental": 0,
    "Consulta General": 1,
    "Curación Dental": 2,
    "Endodoncia": 3,
    "Extracción Dental": 4,
    "Implante Dental": 5,
    "Limpieza Dental": 6,
    "Ortodoncia": 7
  },

  "Especialidad": {
    "Endodoncia": 0,
    "Odontopediatría": 1,
    "Ortodoncia": 2,
    "Rehabilitación Oral": 3
  },

  "Turno": {
    "Mañana": 0,
    "Tarde": 1
  },

  "Dia_semana_num": {
    "Lunes": 0,
    "Martes": 1,
    "Miércoles": 2,
    "Jueves": 3,
    "Viernes": 4,
    "Sábado": 5,
    "Domingo": 6
  },

  "Reprogramada": {
    "No": 0,
    "Sí": 1
  }
};