// src/lib/chatbot-engine.ts
// ============================================================
// Motor de conversación del asistente virtual (vista ADMINISTRADOR).
// Estadísticas, rankings, comparaciones, evolución anual, perfiles
// de riesgo (modelo entrenado) y recomendaciones con impacto
// económico estimado. Todo respaldado en datos reales calculados
// del dataset — no se inventa ninguna cifra.
// ============================================================

import { clasificarIntencion, extraerEntidades, detectarDireccion, normalizar } from "./chatbot-nlp";
import { predecir } from "./prediccion";
import { COSTO_TRATAMIENTO } from "./prediction-config";
import {
  KPIS, POR_TRATAMIENTO, POR_DIA_SEMANA, POR_DISTRITO, POR_MES, POR_ANIO,
  POR_ANTICIPACION, POR_REPROGRAMADA, POR_ODONTOLOGO, POR_ESPECIALIDAD, POR_TURNO,
} from "./dashboard-data";

// ---------------------------------------------------------
// Registro de "dimensiones" analizables
// ---------------------------------------------------------
type DimensionKey =
  | "tratamiento" | "dia" | "mes" | "distrito"
  | "odontologo" | "especialidad" | "turno" | "anticipacion" | "reprogramada";

interface Fila { clave: string; tasa: number; extra?: string }
interface DimensionDef { emoji: string; nombre: string; filas: Fila[] }

const DIMENSIONES: Record<DimensionKey, DimensionDef> = {
  tratamiento: { emoji: "📋", nombre: "tratamiento", filas: POR_TRATAMIENTO.map(p => ({ clave: p.tratamiento, tasa: p.tasa })) },
  dia:         { emoji: "📅", nombre: "día",         filas: POR_DIA_SEMANA.map(p => ({ clave: p.dia, tasa: p.tasa })) },
  mes:         { emoji: "🗓️", nombre: "mes",         filas: POR_MES.map(p => ({ clave: p.mes, tasa: p.tasa })) },
  distrito:    { emoji: "📍", nombre: "distrito",    filas: POR_DISTRITO.map(p => ({ clave: p.distrito, tasa: p.tasa })) },
  odontologo:  { emoji: "🦷", nombre: "odontólogo",  filas: POR_ODONTOLOGO.map(p => ({ clave: p.nombre, tasa: p.tasa, extra: `${p.especialidad}, turno ${p.turno}` })) },
  especialidad:{ emoji: "🩺", nombre: "especialidad",filas: POR_ESPECIALIDAD.map(p => ({ clave: p.especialidad, tasa: p.tasa })) },
  turno:       { emoji: "🕒", nombre: "turno",       filas: POR_TURNO.map(p => ({ clave: p.turno, tasa: p.tasa })) },
  anticipacion:{ emoji: "⏱️", nombre: "rango de anticipación", filas: POR_ANTICIPACION.map(p => ({ clave: p.rango, tasa: p.tasa })) },
  reprogramada:{ emoji: "🔁", nombre: "estado de reprogramación", filas: POR_REPROGRAMADA.map(p => ({ clave: p.reprogramada, tasa: p.tasa })) },
};

function ordenar(filas: Fila[], direccion: "max" | "min"): Fila[] {
  return [...filas].sort((a, b) => (direccion === "max" ? b.tasa - a.tasa : a.tasa - b.tasa));
}

function detectarDimension(t: string, entidades: ReturnType<typeof extraerEntidades>): DimensionKey | null {
  if (entidades.odontologo) return "odontologo";
  if (entidades.tratamiento) return "tratamiento";
  if (entidades.dia) return "dia";
  if (entidades.distrito) return "distrito";
  if (t.includes("especialidad")) return "especialidad";
  if (t.includes("turno")) return "turno";
  if (t.includes("anticipacion")) return "anticipacion";
  if (t.includes("reprogramad")) return "reprogramada";
  if (t.includes("tratamiento")) return "tratamiento";
  if (t.includes("dia") || t.includes("día")) return "dia";
  if (t.includes("mes")) return "mes";
  if (t.includes("distrito")) return "distrito";
  if (t.includes("odontolog") || t.includes("doctor") || /\bdra?\.?\b/.test(t)) return "odontologo";
  return null;
}

// ---------------------------------------------------------
// Estado del chat
// ---------------------------------------------------------
export interface ChatState { ultimaDimension: DimensionKey | null }
export const ESTADO_INICIAL: ChatState = { ultimaDimension: null };

interface Resultado { respuesta: string; nuevoEstado: ChatState }

export function procesarMensaje(texto: string, estado: ChatState = ESTADO_INICIAL): Resultado {
  const t = normalizar(texto);
  const entidades = extraerEntidades(texto);

  // ----------------------------------------------------------------
  // PRIORIDAD MÁXIMA: si el mensaje menciona 2+ valores de la MISMA
  // dimensión (ej. dos tratamientos), es una comparación explícita.
  // Esto se evalúa ANTES de clasificar la intención, porque palabras
  // como "compara" pueden clasificar como "ranking" y nunca llegar a
  // revisar si en realidad el usuario quería comparar 2 elementos.
  // ----------------------------------------------------------------
  if (entidades.tratamientos.length >= 2) {
    return { respuesta: responderComparacion("tratamiento", entidades.tratamientos), nuevoEstado: { ultimaDimension: "tratamiento" } };
  }
  if (entidades.distritos.length >= 2) {
    return { respuesta: responderComparacion("distrito", entidades.distritos), nuevoEstado: { ultimaDimension: "distrito" } };
  }
  if (entidades.odontologos.length >= 2) {
    return { respuesta: responderComparacion("odontologo", entidades.odontologos), nuevoEstado: { ultimaDimension: "odontologo" } };
  }
  if (entidades.dias.length >= 2) {
    return { respuesta: responderComparacion("dia", entidades.dias), nuevoEstado: { ultimaDimension: "dia" } };
  }

  const intencion = clasificarIntencion(texto);

  switch (intencion) {
    case "saludo":
      return {
        respuesta:
          "¡Hola! 👋 Soy el asistente del panel de Arte Dental. Puedo darte estadísticas, rankings, comparaciones, " +
          "evolución anual, perfiles de riesgo o recomendaciones con impacto estimado. ¿Qué necesitas revisar?",
        nuevoEstado: ESTADO_INICIAL,
      };

    case "despedida":
      return { respuesta: "¡Gracias por usar el asistente! Que tengas un buen día. 🦷", nuevoEstado: ESTADO_INICIAL };

    case "ayuda":
      return {
        respuesta:
          "Puedo ayudarte con:\n" +
          "• 📊 Resumen ejecutivo — \"dame un resumen\"\n" +
          "• 📈 Estadísticas — \"¿qué odontólogo tiene menos inasistencias?\"\n" +
          "• 🏆 Rankings — \"ranking de tratamientos\"\n" +
          "• ⚖️ Comparaciones — \"compara Ortodoncia con Endodoncia\"\n" +
          "• 📉 Evolución — \"¿ha mejorado la inasistencia por año?\"\n" +
          "• 🎯 Riesgo — \"muéstrame las citas con mayor riesgo\"\n" +
          "• 💡 Recomendaciones — \"¿cuánto recuperaría si reduzco la inasistencia?\"",
        nuevoEstado: ESTADO_INICIAL,
      };

    case "resumen_ejecutivo":
      return { respuesta: responderResumenEjecutivo(), nuevoEstado: estado };

    case "consultar_evolucion":
      return { respuesta: responderEvolucionAnual(), nuevoEstado: estado };

    case "consultar_ranking": {
      const dim = detectarDimension(t, entidades) ?? estado.ultimaDimension;
      if (!dim) {
        return {
          respuesta: "¿Ranking de qué? Puedo ordenar por: tratamiento, día, mes, distrito, odontólogo, especialidad, turno o anticipación.",
          nuevoEstado: estado,
        };
      }
      return { respuesta: responderRanking(dim), nuevoEstado: { ultimaDimension: dim } };
    }

    case "consultar_estadisticas": {
      const dim = detectarDimension(t, entidades) ?? estado.ultimaDimension;
      if (!dim) {
        // Caso especial: preguntan por el % de ASISTENCIA puntualmente (no inasistencia)
        const mencionaAsistencia = t.includes("asistencia") && !t.includes("inasistencia");
        if (mencionaAsistencia) {
          return { respuesta: responderPorcentajeAsistencia(), nuevoEstado: estado };
        }
        return { respuesta: responderResumenGeneral(), nuevoEstado: estado };
      }

      const direccion = detectarDireccion(t);
      const valorEspecifico = entidades.odontologo ?? entidades.tratamiento ?? entidades.dia ?? entidades.distrito;
      return {
        respuesta: responderValorDimension(dim, direccion, valorEspecifico),
        nuevoEstado: { ultimaDimension: dim },
      };
    }

    case "consultar_riesgo_citas":
      return { respuesta: responderCitasRiesgo(), nuevoEstado: estado };

    case "solicitar_recomendaciones":
      return { respuesta: responderRecomendaciones(t), nuevoEstado: estado };

    default:
      return {
        respuesta:
          "No estoy seguro de haber entendido 🤔. Prueba con algo como:\n" +
          "• \"¿Cuál es el mes con más inasistencias?\"\n" +
          "• \"¿Qué odontólogo tiene menos inasistencias?\"\n" +
          "• \"Compara Ortodoncia con Endodoncia\"\n" +
          "• \"Muéstrame las citas con mayor riesgo.\"\n" +
          "O escribe \"ayuda\" para ver todas las opciones.",
        nuevoEstado: estado,
      };
  }
}

// ---------------------------------------------------------
// Respuestas
// ---------------------------------------------------------
function responderValorDimension(dim: DimensionKey, direccion: "max" | "min", valorEspecifico?: string): string {
  const def = DIMENSIONES[dim];

  if (valorEspecifico) {
    const fila = def.filas.find((f) => normalizar(f.clave).includes(normalizar(valorEspecifico)));
    if (fila) {
      return `${def.emoji} La tasa de inasistencia para ${def.nombre} "${fila.clave}"${fila.extra ? ` (${fila.extra})` : ""} es ${fila.tasa}%.`;
    }
  }

  const [top] = ordenar(def.filas, direccion);
  const calif = direccion === "max" ? "mayor" : "menor";
  return `${def.emoji} El ${def.nombre} con ${calif} tasa de inasistencia es "${top.clave}"${top.extra ? ` (${top.extra})` : ""}, con ${top.tasa}%.`;
}

function responderRanking(dim: DimensionKey): string {
  const def = DIMENSIONES[dim];
  const ordenado = ordenar(def.filas, "max");
  const lineas = ordenado.map((f, i) => `${i + 1}. ${f.clave}${f.extra ? ` (${f.extra})` : ""} — ${f.tasa}%`);
  return `${def.emoji} Ranking completo por ${def.nombre} (de mayor a menor inasistencia):\n\n${lineas.join("\n")}`;
}

function responderComparacion(dim: DimensionKey, valores: string[]): string {
  const def = DIMENSIONES[dim];
  const [a, b] = valores;
  const filaA = def.filas.find((f) => normalizar(f.clave).includes(normalizar(a)));
  const filaB = def.filas.find((f) => normalizar(f.clave).includes(normalizar(b)));
  if (!filaA || !filaB) return `No encontré datos para comparar "${a}" y "${b}".`;

  const diferencia = Math.abs(filaA.tasa - filaB.tasa).toFixed(1);
  const mayor = filaA.tasa >= filaB.tasa ? filaA : filaB;

  return (
    `${def.emoji} Comparación de ${def.nombre}:\n\n` +
    `• ${filaA.clave}: ${filaA.tasa}%\n` +
    `• ${filaB.clave}: ${filaB.tasa}%\n\n` +
    `"${mayor.clave}" tiene ${diferencia} puntos más de inasistencia que la otra opción.`
  );
}

function responderResumenGeneral(): string {
  return (
    `📊 Estadísticas generales:\n` +
    `• Tasa de inasistencia global: ${KPIS.tasaInasistenciaGlobal}%\n` +
    `• Total de citas registradas: ${KPIS.totalCitas.toLocaleString()}\n` +
    `• Total de inasistencias: ${KPIS.totalInasistencias.toLocaleString()}\n` +
    `• Ingreso perdido estimado: S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}\n\n` +
    `Puedes preguntarme por tratamiento, día, mes, distrito, odontólogo, especialidad, turno — o pedirme que compare dos.`
  );
}

function responderPorcentajeAsistencia(): string {
  const asistencia = (100 - KPIS.tasaInasistenciaGlobal).toFixed(1);
  return `✅ El porcentaje de asistencia actual es ${asistencia}% (inasistencia: ${KPIS.tasaInasistenciaGlobal}%), sobre un total de ${KPIS.totalCitas.toLocaleString()} citas registradas.`;
}

function responderResumenEjecutivo(): string {
  const [tTrat] = ordenar(DIMENSIONES.tratamiento.filas, "max");
  const [tDia] = ordenar(DIMENSIONES.dia.filas, "max");
  const [tOdont] = ordenar(DIMENSIONES.odontologo.filas, "max");

  return (
    `📊 RESUMEN EJECUTIVO — Inasistencia Arte Dental\n\n` +
    `• Tasa de inasistencia global: ${KPIS.tasaInasistenciaGlobal}% (${KPIS.totalInasistencias.toLocaleString()} de ${KPIS.totalCitas.toLocaleString()} citas)\n` +
    `• Ingreso perdido estimado: S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}\n` +
    `• Tratamiento de mayor riesgo: ${tTrat.clave} (${tTrat.tasa}%)\n` +
    `• Día de mayor riesgo: ${tDia.clave} (${tDia.tasa}%)\n` +
    `• Odontólogo con más inasistencia en su agenda: ${tOdont.clave} (${tOdont.tasa}%)\n\n` +
    `Escribe "recomendaciones" para acciones concretas, o "citas con mayor riesgo" para un ranking de perfiles priorizados.`
  );
}

function responderEvolucionAnual(): string {
  const lineas = POR_ANIO.map((p) => `${p.anio}: ${p.tasa}%`);
  const maximo = [...POR_ANIO].sort((a, b) => b.tasa - a.tasa)[0];
  const minimo = [...POR_ANIO].sort((a, b) => a.tasa - b.tasa)[0];
  const inicio = POR_ANIO[0];
  const fin = POR_ANIO[POR_ANIO.length - 1];
  const diferencia = (fin.tasa - inicio.tasa).toFixed(1);
  const direccionTexto = Number(diferencia) > 0 ? "ha subido" : Number(diferencia) < 0 ? "ha bajado" : "se mantiene igual";

  return (
    `📉 Evolución de la inasistencia por año:\n\n${lineas.join("\n")}\n\n` +
    `De ${inicio.anio} a ${fin.anio}, la tasa ${direccionTexto} ${Math.abs(Number(diferencia))} puntos. ` +
    `El peor año fue ${maximo.anio} (${maximo.tasa}%) y el mejor fue ${minimo.anio} (${minimo.tasa}%). ` +
    `No se observa una tendencia sostenida de mejora o deterioro — fluctúa año a año.`
  );
}

// ---------------------------------------------------------
// Perfiles de cita con mayor riesgo (usa el modelo entrenado real)
// ---------------------------------------------------------
function responderCitasRiesgo(): string {
  const topTratamientos = ordenar(DIMENSIONES.tratamiento.filas, "max").slice(0, 2);
  const topDias = ordenar(DIMENSIONES.dia.filas, "max").slice(0, 2);
  const topDistritos = ordenar(DIMENSIONES.distrito.filas, "max").slice(0, 2);

  const combinaciones: { tratamiento: string; dia: string; distrito: string; odontologo: string; especialidad: string; turno: string }[] = [];

  for (const od of POR_ODONTOLOGO) {
    for (const t of topTratamientos) {
      for (const d of topDias) {
        for (const dist of topDistritos) {
          combinaciones.push({
            tratamiento: t.clave, dia: d.clave, distrito: dist.clave,
            odontologo: od.nombre, especialidad: od.especialidad, turno: od.turno,
          });
        }
      }
    }
  }

  const evaluadas = combinaciones.map((c) => {
    const costo = COSTO_TRATAMIENTO[c.tratamiento] ?? 100;
    const resultado = predecir({
      edad: 35, sexo: "M", distrito: c.distrito, tratamiento: c.tratamiento, costo,
      especialidad: c.especialidad, turno: c.turno, mes: new Date().getMonth() + 1,
      diaSemana: c.dia, diasAnticipacion: 5, reprogramada: "No",
    });
    return { ...c, resultado };
  });

  const top5 = evaluadas.sort((a, b) => b.resultado.probabilidadNoAsistir - a.resultado.probabilidadNoAsistir).slice(0, 5);
  const lineas = top5.map((item, i) =>
    `${i + 1}. ${item.odontologo} — ${item.tratamiento} — ${item.dia} — ${item.distrito} — ${item.resultado.probabilidadNoAsistir}% de no asistir [${item.resultado.nivelRiesgo.toUpperCase()}]`
  );

  return (
    `🎯 Perfiles de cita con mayor riesgo estimado (combinando datos históricos con el modelo):\n\n${lineas.join("\n")}\n\n` +
    `_Nota: son combinaciones de factores reales, no citas ya agendadas — tu histórico no incluye citas futuras pendientes. ` +
    `Para evaluar un paciente puntual, usa la pestaña "Predicción"._`
  );
}

// ---------------------------------------------------------
// Recomendaciones con impacto económico estimado
// ---------------------------------------------------------
// Si la pregunta es específicamente "¿cuánto...?" (recuperaría/
// ahorraría/ganaría), la respuesta abre con el número exacto que
// se pidió, y recién después lista las recomendaciones. Si la
// pregunta es genérica ("dame recomendaciones"), abre directo con
// la lista.
function responderRecomendaciones(textoNormalizado: string): string {
  const [tTrat] = ordenar(DIMENSIONES.tratamiento.filas, "max");
  const [tDia] = ordenar(DIMENSIONES.dia.filas, "max");
  const [tDist] = ordenar(DIMENSIONES.distrito.filas, "max");
  const [tOdont] = ordenar(DIMENSIONES.odontologo.filas, "max");
  const [tMes] = ordenar(DIMENSIONES.mes.filas, "max");
  const [tTurno] = ordenar(DIMENSIONES.turno.filas, "max");
  const [tAnticipacion] = ordenar(DIMENSIONES.anticipacion.filas, "max");
  const [tEspecialidad] = ordenar(DIMENSIONES.especialidad.filas, "max");

  const valorPorPunto = KPIS.ingresoPerdidoEstimado / KPIS.tasaInasistenciaGlobal;
  const metaReduccion = 5;
  const gananciaEstimada = Math.round(valorPorPunto * metaReduccion);
  const nuevaTasa = (KPIS.tasaInasistenciaGlobal - metaReduccion).toFixed(1);

  const listaRecomendaciones =
    `1. "${tTrat.clave}" tiene la mayor inasistencia (${tTrat.tasa}%): recordatorio reforzado 24-48h antes, ` +
    `y considerar un depósito de garantía reembolsable para este tratamiento específico.\n` +
    `2. Los ${tDia.clave} concentran más ausencias (${tDia.tasa}%): prioriza llamadas de confirmación ese día.\n` +
    `3. El turno ${tTurno.clave} tiene más inasistencia (${tTurno.tasa}%): revisa si hay conflicto de horario laboral.\n` +
    `4. Anticipar la reserva con "${tAnticipacion.clave}" concentra más riesgo (${tAnticipacion.tasa}%): un recordatorio ` +
    `a mitad de camino entre la reserva y la cita puede ayudar.\n` +
    `5. ${tDist.clave} tiene la mayor inasistencia por zona (${tDist.tasa}%): evalúa si el traslado influye.\n` +
    `6. ${tOdont.clave} (${tOdont.extra}) tiene la mayor inasistencia en su agenda (${tOdont.tasa}%): revisar su carga horaria.\n` +
    `7. La especialidad "${tEspecialidad.clave}" concentra más inasistencia (${tEspecialidad.tasa}%): reforzar el seguimiento post-reserva.\n` +
    `8. ${tMes.clave} es históricamente el mes de mayor riesgo (${tMes.tasa}%): considera overbooking preventivo controlado.`;

  const respuestaImpacto =
    `📈 Reducir la inasistencia global ${metaReduccion} puntos (de ${KPIS.tasaInasistenciaGlobal}% a ${nuevaTasa}%) ` +
    `recuperaría aproximadamente S/ ${gananciaEstimada.toLocaleString()} en ingresos ` +
    `(estimación proporcional al ingreso perdido actual de S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}; no es un valor garantizado).`;

  const preguntaPorMonto = ["cuanto", "recuperaria", "ahorraria", "ganaria"].some((k) => textoNormalizado.includes(k));

  if (preguntaPorMonto) {
    return `${respuestaImpacto}\n\n💡 Para lograrlo, estas son las recomendaciones específicas:\n\n${listaRecomendaciones}`;
  }

  return `💡 Recomendaciones basadas en tus datos actuales:\n\n${listaRecomendaciones}\n\n${respuestaImpacto}`;
}
