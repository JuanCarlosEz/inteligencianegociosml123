// src/lib/chatbot-nlp.ts
// ============================================================
// PROCESAMIENTO DE LENGUAJE NATURAL — Clasificación de texto
// ============================================================
// Clasificador de intención basado en reglas y palabras clave
// (bag-of-words con normalización de acentos/mayúsculas).
// Orientado a un usuario ADMINISTRADOR/RECEPCIÓN: todas las
// consultas son sobre inasistencias agregadas de la clínica.
//
// El puntaje de cada intención pesa las coincidencias según la
// cantidad de palabras de la frase clave (no solo la cantidad de
// coincidencias). Esto evita que palabras genéricas de una sola
// palabra (ej. "inasistencia") le ganen a frases específicas de
// otra intención (ej. "que puedo hacer" para recomendaciones).
// ============================================================

export type Intencion =
  | "saludo"
  | "despedida"
  | "ayuda"
  | "consultar_estadisticas"
  | "consultar_riesgo_citas"
  | "solicitar_recomendaciones"
  | "desconocido";

export interface EntidadesDetectadas {
  dia?: string;
  tratamiento?: string;
  distrito?: string;
  odontologo?: string;
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

const ODONTOLOGOS = [
  "María López", "Carlos Pérez", "Ana Torres", "Luis Ramírez",
];

/** Quita acentos y pasa a minúsculas, para comparar de forma flexible. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const PALABRAS_CLAVE: Record<Exclude<Intencion, "desconocido">, string[]> = {
  saludo: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal", "hey"],
  despedida: ["chau", "adios", "gracias", "hasta luego", "nos vemos", "bye"],
  ayuda: ["ayuda", "que puedes hacer", "opciones", "menu", "como funciona", "que haces"],

  consultar_estadisticas: [
    "estadistica", "estadisticas", "datos", "tasa de inasistencia", "cuanto",
    "cuantos", "cuantos pacientes", "faltaron", "cual tratamiento", "que dia",
    "que mes", "distrito", "reporte", "porcentaje", "porcentaje de asistencia",
    "asistencia", "inasistencia", "odontologo", "doctor", "dra", "dr",
    "quien tiene mas", "anticipacion", "reprogramad", "impacto",
    "ingreso perdido", "especialidad", "turno",
  ],

  consultar_riesgo_citas: [
    "citas con mayor riesgo", "mayor riesgo", "alto riesgo", "citas en riesgo",
    "pacientes en riesgo", "quienes van a faltar", "proximas citas riesgosas",
    "muestrame las citas", "citas riesgosas", "perfil de riesgo",
  ],

  solicitar_recomendaciones: [
    "que puedo hacer para reducir", "como puedo reducir", "recomendacion",
    "recomendaciones", "que puedo hacer", "como reducir", "sugerencia",
    "consejo", "como mejorar", "que acciones", "para reducir la inasistencia",
  ],
};

/**
 * Calcula el puntaje de una intención sumando, por cada palabra clave que
 * aparece en el texto, la cantidad de palabras que tiene esa frase.
 * Así una frase específica de 3 palabras pesa más que una palabra genérica
 * suelta, evitando falsos positivos por solapamiento de vocabulario.
 */
function calcularPuntaje(textoNormalizado: string, keywords: string[]): number {
  return keywords.reduce((acc, kw) => {
    const kwNorm = normalizar(kw);
    if (textoNormalizado.includes(kwNorm)) {
      return acc + kwNorm.split(/\s+/).length;
    }
    return acc;
  }, 0);
}

/** Detecta la intención con mayor puntaje ponderado de palabras clave. */
export function clasificarIntencion(texto: string): Intencion {
  const t = normalizar(texto);
  let mejor: Intencion = "desconocido";
  let mejorPuntaje = 0;

  (Object.keys(PALABRAS_CLAVE) as Array<Exclude<Intencion, "desconocido">>).forEach((intencion) => {
    const puntaje = calcularPuntaje(t, PALABRAS_CLAVE[intencion]);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = intencion;
    }
  });

  return mejor;
}

/** Extrae día, tratamiento, distrito y odontólogo mencionados, para filtrar estadísticas. */
export function extraerEntidades(texto: string): EntidadesDetectadas {
  const t = normalizar(texto);
  const entidades: EntidadesDetectadas = {};

  const dia = DIAS.find((d) => t.includes(normalizar(d)));
  if (dia) entidades.dia = dia;

  const tratamiento = TRATAMIENTOS.find((tr) => t.includes(normalizar(tr)));
  if (tratamiento) entidades.tratamiento = tratamiento;

  const distrito = DISTRITOS.find((d) => t.includes(normalizar(d)));
  if (distrito) entidades.distrito = distrito;

  const odontologo = ODONTOLOGOS.find((o) => t.includes(normalizar(o)));
  if (odontologo) entidades.odontologo = odontologo;

  return entidades;
}