import { score } from "./modeloArbol";
import { ENCODERS } from "./encoders";

// ---- Tipos ----
export interface DatosPaciente {
  edad: number;
  sexo: string;            // "M" o "F"
  distrito: string;
  tratamiento: string;
  costo: number;
  especialidad: string;
  turno: string;           // "Mañana" o "Tarde"
  mes: number;             // 1 = Enero … 12 = Diciembre
  diaSemana: string;       // En inglés: "Monday", "Tuesday"...
  diasAnticipacion: number;
  reprogramada: string;    // "Sí" o "No"
}

export interface ResultadoPrediccion {
  prediccion: 0 | 1;
  etiqueta: string;
  probabilidadAsistir: number;
  probabilidadNoAsistir: number;
  nivelRiesgo: "bajo" | "medio" | "alto";
}

// ---- Helper: normalizar texto removiendo acentos ----
/**
 * Normaliza un string:
 * 1. Remueve acentos (á → a, é → e, ñ → n, etc.)
 * 2. Convierte a minúsculas
 * 3. Elimina espacios extra
 * 
 * Ejemplo:
 * "Odontopediatría" → "odontopediatria"
 * "Mañana" → "manana"
 */
function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    // Remover acentos usando normalize + regex
    .normalize("NFD")           // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Eliminar marcas diacríticas
    .replace(/\s+/g, " ");      // Normalizar espacios
}

// ---- Helper: codificar una categoría (MEJORADO) ----
/**
 * Busca el valor en el encoder de forma flexible:
 * - Insensible a mayúsculas/minúsculas
 * - Insensible a acentos
 * - Insensible a espacios extras
 */
function cod(campo: string, valor: string): number {
  const mapa = ENCODERS[campo];
  if (!mapa) {
    throw new Error(`Campo no encontrado en encoders: "${campo}"`);
  }

  const valorNormalizado = normalizarTexto(valor);

  // Buscar en el mapa con normalización flexible
  for (const [clave, codigo] of Object.entries(mapa)) {
    if (normalizarTexto(clave) === valorNormalizado) {
      return codigo;
    }
  }

  // Si no encuentra, mostrar error con opciones disponibles
  const opciones = Object.keys(mapa).join(", ");
  throw new Error(
    `Valor "${valor}" no reconocido en "${campo}".\nOpciones válidas: ${opciones}`
  );
}

// ---- Función principal de predicción ----
export function predecir(datos: DatosPaciente): ResultadoPrediccion {
  // Construir el vector de entrada en el MISMO ORDEN que las FEATURES del Colab:
  // [Edad, Sexo_cod, Distrito_cod, Tratamiento_cod, Costo,
  //  Especialidad_cod, Turno_cod, Mes, Dia_semana_cod,
  //  Dias_anticipacion, Reprogramada_cod]

  const entrada: number[] = [
    datos.edad,                                   // [0]  Edad
    cod("Sexo", datos.sexo),                      // [1]  Sexo_cod
    cod("Distrito", datos.distrito),              // [2]  Distrito_cod
    cod("Tratamiento", datos.tratamiento),        // [3]  Tratamiento_cod
    datos.costo,                                  // [4]  Costo
    cod("Especialidad", datos.especialidad),      // [5]  Especialidad_cod
    cod("Turno", datos.turno),                    // [6]  Turno_cod
    datos.mes,                                    // [7]  Mes
    cod("Dia_semana_num", datos.diaSemana),       // [8]  Dia_semana_num
    datos.diasAnticipacion,                       // [9]  Dias_anticipacion
    cod("Reprogramada", datos.reprogramada),      // [10] Reprogramada_cod
  ];

  // Ejecutar el modelo (retorna [prob_NoAsistio, prob_Asistio])
  const probs = score(entrada);
  const probAsistir = Math.round(probs[1] * 100);
  const probNoAsistir = Math.round(probs[0] * 100);
  const prediccion = probs[1] >= probs[0] ? 1 : 0;

  const nivelRiesgo: "bajo" | "medio" | "alto" =
    probNoAsistir < 30 ? "bajo" :
    probNoAsistir < 60 ? "medio" : "alto";

  const etiqueta =
    prediccion === 1
      ? "✅ El paciente asistirá a su cita"
      : "⚠️ Riesgo: el paciente podría no asistir";

  return {
    prediccion,
    etiqueta,
    probabilidadAsistir: probAsistir,
    probabilidadNoAsistir: probNoAsistir,
    nivelRiesgo,
  };
}