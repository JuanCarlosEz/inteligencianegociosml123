// src/lib/chatbot-nlp.ts
// ============================================================
// PROCESAMIENTO DE LENGUAJE NATURAL — Clasificación de texto
// ============================================================
// Clasificador de intención por PALABRAS COMPLETAS (tokens, no
// subcadenas). Gana la intención cuya frase clave coincidente es
// MÁS ESPECÍFICA (más palabras) — así una frase de 2-3 palabras
// siempre supera a una palabra genérica suelta de la misma u otra
// intención, sin necesidad de eliminar las palabras sueltas (que
// SÍ hacen falta para cubrir preguntas cortas como "¿qué mes...?").
// ============================================================

export type Intencion =
  | "saludo"
  | "despedida"
  | "ayuda"
  | "resumen_ejecutivo"
  | "consultar_ranking"
  | "consultar_evolucion"
  | "consultar_estadisticas"
  | "consultar_riesgo_citas"
  | "solicitar_recomendaciones"
  | "desconocido";

export interface EntidadesDetectadas {
  dia?: string;
  tratamiento?: string;
  distrito?: string;
  odontologo?: string;
  tratamientos: string[];
  distritos: string[];
  dias: string[];
  odontologos: string[];
}

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const TRATAMIENTOS = [
  "Ortodoncia", "Blanqueamiento Dental", "Limpieza Dental", "Extracción Dental",
  "Consulta General", "Curación Dental", "Endodoncia", "Implante Dental",
];

const DISTRITOS = [
  "El Tambo", "Sapallanga", "Ingenio", "Huancán", "Huancayo",
  "Chilca", "San Agustín de Cajas", "Pilcomayo",
];

const ODONTOLOGOS = ["María López", "Carlos Pérez", "Ana Torres", "Luis Ramírez"];

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenizar(texto: string): string[] {
  return normalizar(texto)
    .replace(/[¿?¡!.,;:]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function contieneFraseCompleta(tokensTexto: string[], frase: string): boolean {
  const tokensFrase = tokenizar(frase);
  if (tokensFrase.length === 0) return false;
  for (let i = 0; i <= tokensTexto.length - tokensFrase.length; i++) {
    let coincide = true;
    for (let j = 0; j < tokensFrase.length; j++) {
      if (tokensTexto[i + j] !== tokensFrase[j]) { coincide = false; break; }
    }
    if (coincide) return true;
  }
  return false;
}

const PALABRAS_CLAVE: Record<Exclude<Intencion, "desconocido">, string[]> = {
  saludo: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal", "hey", "saludos"],
  despedida: ["chau", "adios", "gracias", "hasta luego", "nos vemos", "bye", "eso es todo"],
  ayuda: ["ayuda", "que puedes hacer", "opciones", "menu", "como funciona", "que haces", "que sabes hacer", "en que me ayudas"],

  resumen_ejecutivo: [
    "resumen ejecutivo", "resumen", "briefing", "panorama general", "dame un resumen",
    "informe rapido", "vista general", "dame un panorama", "resumeme",
  ],

  consultar_ranking: [
    "ranking", "compara", "comparame", "todos los odontologos", "todas las especialidades",
    "lista completa", "ordename", "muestrame todos", "todos los tratamientos",
    "todos los distritos", "compara odontologos", "comparar", "ordenar de mayor a menor",
    "clasificacion completa", "listame",
  ],

  consultar_evolucion: [
    "evolucion", "ha mejorado", "ha empeorado", "tendencia", "por año", "ano a ano",
    "compara los años", "como ha cambiado", "historico anual", "a lo largo del tiempo",
    "ha aumentado", "ha disminuido", "evolucion anual",
  ],

  // Frases específicas primero (pesan más), palabras sueltas después
  // (necesarias para cubrir preguntas cortas tipo "¿qué mes...?").
  consultar_estadisticas: [
    "tasa de inasistencia", "porcentaje de asistencia", "porcentaje de inasistencia",
    "cuantos pacientes", "cuantas citas", "cuantos faltaron", "cual tratamiento",
    "que dia", "que mes", "que distrito", "reporte de", "quien tiene mas inasistencias",
    "quien tiene menos inasistencias", "dias de anticipacion", "citas reprogramadas",
    "impacto economico", "ingreso perdido", "que especialidad", "que turno",
    "cual es la tasa", "cual es el porcentaje",
    // palabras sueltas (cobertura general)
    "estadisticas", "estadistica", "datos", "reporte", "tasa", "porcentaje",
    "asistencia", "asistencias", "inasistencia", "inasistencias",
    "tratamiento", "dia", "mes", "distrito", "odontologo", "doctor", "dra", "dr",
    "especialidad", "turno", "anticipacion", "reprogramada", "reprogramadas",
    "cuantos", "cuanto", "faltaron", "falto",
  ],

  consultar_riesgo_citas: [
    "citas con mayor riesgo", "mayor riesgo", "alto riesgo", "citas en riesgo",
    "pacientes en riesgo", "quienes van a faltar", "proximas citas riesgosas",
    "muestrame las citas", "citas riesgosas", "perfil de riesgo", "perfiles de riesgo",
    "que citas debo priorizar", "a quien debo llamar",
  ],

  solicitar_recomendaciones: [
    "que puedo hacer para reducir", "como puedo reducir", "recomendacion",
    "recomendaciones", "que puedo hacer", "como reducir", "sugerencia", "sugerencias",
    "consejo", "consejos", "como mejorar", "que acciones", "para reducir la inasistencia",
    "cuanto recuperaria", "cuanto ahorraria", "cuanto ganaria", "que estrategia",
    "que politica deberia aplicar", "como bajar la inasistencia",
  ],
};

function puntajeIntencion(tokensTexto: string[], keywords: string[]): number {
  let mejor = 0;
  for (const kw of keywords) {
    if (contieneFraseCompleta(tokensTexto, kw)) {
      const largo = tokenizar(kw).length;
      if (largo > mejor) mejor = largo;
    }
  }
  return mejor;
}

export function clasificarIntencion(texto: string): Intencion {
  const tokens = tokenizar(texto);
  let mejor: Intencion = "desconocido";
  let mejorPuntaje = 0;

  (Object.keys(PALABRAS_CLAVE) as Array<Exclude<Intencion, "desconocido">>).forEach((intencion) => {
    const puntaje = puntajeIntencion(tokens, PALABRAS_CLAVE[intencion]);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = intencion;
    }
  });

  return mejor;
}

export function extraerEntidades(texto: string): EntidadesDetectadas {
  const t = normalizar(texto);

  const dias = DIAS.filter((d) => t.includes(normalizar(d)));
  const tratamientos = TRATAMIENTOS.filter((tr) => t.includes(normalizar(tr)));
  const distritos = DISTRITOS.filter((d) => t.includes(normalizar(d)));
  const odontologos = ODONTOLOGOS.filter((o) => t.includes(normalizar(o)));

  return {
    dia: dias[0], tratamiento: tratamientos[0], distrito: distritos[0], odontologo: odontologos[0],
    dias, tratamientos, distritos, odontologos,
  };
}

export function detectarDireccion(texto: string): "max" | "min" {
  const t = normalizar(texto);
  const indicadoresMin = ["menos", "menor", "mejor", "mas bajo", "minimo"];
  return indicadoresMin.some((k) => t.includes(normalizar(k))) ? "min" : "max";
}
