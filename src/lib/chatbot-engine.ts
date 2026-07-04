// src/lib/chatbot-engine.ts
// ============================================================
// Motor de conversación del asistente virtual (vista ADMINISTRADOR).
// Responde con estadísticas agregadas de inasistencia, un ranking
// de perfiles de cita con mayor riesgo (usando el modelo entrenado)
// y recomendaciones accionables para el personal de la clínica.
// ============================================================

import { clasificarIntencion, extraerEntidades } from "./chatbot-nlp";
import { predecir } from "./prediccion";
import { COSTO_TRATAMIENTO } from "./prediction-config";
import {
  KPIS,
  POR_TRATAMIENTO,
  POR_DIA_SEMANA,
  POR_DISTRITO,
  POR_MES,
  POR_ANTICIPACION,
  POR_REPROGRAMADA,
  POR_ODONTOLOGO,
  POR_ESPECIALIDAD,
  POR_TURNO,
} from "./dashboard-data";

// Ya no hay flujos de varios turnos (no se le pide datos "de su
// cita" a un paciente). Mantenemos ChatState solo por compatibilidad.
export interface ChatState {
  esperando: null;
  intentoActivo: null;
}

export const ESTADO_INICIAL: ChatState = {
  esperando: null,
  intentoActivo: null,
};

interface Resultado {
  respuesta: string;
  nuevoEstado: ChatState;
}

/** Punto de entrada: procesa un mensaje del administrador y devuelve la respuesta. */
export function procesarMensaje(texto: string): Resultado {
  const intencion = clasificarIntencion(texto);
  const entidades = extraerEntidades(texto);

  switch (intencion) {
    case "saludo":
      return {
        respuesta:
          "¡Hola! 👋 Soy el asistente del panel de Arte Dental. Puedo darte estadísticas de inasistencia, " +
          "mostrarte perfiles de cita con mayor riesgo o darte recomendaciones. ¿Qué necesitas revisar?",
        nuevoEstado: ESTADO_INICIAL,
      };

    case "despedida":
      return {
        respuesta: "¡Gracias por usar el asistente! Que tengas un buen día. 🦷",
        nuevoEstado: ESTADO_INICIAL,
      };

    case "ayuda":
      return {
        respuesta:
          "Puedo ayudarte con:\n" +
          "• 📊 Estadísticas — ej. \"¿cuál es el porcentaje de asistencia?\"\n" +
          "• 🦷 Por tratamiento/día/mes/distrito/odontólogo/especialidad/turno\n" +
          "• 🎯 Perfiles de riesgo — ej. \"muéstrame las citas con mayor riesgo\"\n" +
          "• 💡 Recomendaciones — ej. \"¿qué puedo hacer para reducir la inasistencia?\"",
        nuevoEstado: ESTADO_INICIAL,
      };

    case "consultar_estadisticas":
      return { respuesta: responderEstadisticas(texto, entidades), nuevoEstado: ESTADO_INICIAL };

    case "consultar_riesgo_citas":
      return { respuesta: responderCitasRiesgo(), nuevoEstado: ESTADO_INICIAL };

    case "solicitar_recomendaciones":
      return { respuesta: responderRecomendaciones(), nuevoEstado: ESTADO_INICIAL };

    default:
      return {
        respuesta:
          "No estoy seguro de haber entendido 🤔. Prueba con algo como:\n" +
          "• \"¿Cuántos pacientes faltaron este mes?\"\n" +
          "• \"Muéstrame las citas con mayor riesgo.\"\n" +
          "O escribe \"ayuda\" para ver todas las opciones.",
        nuevoEstado: ESTADO_INICIAL,
      };
  }
}

// ---------------------------------------------------------
// Estadísticas (leen directamente del dashboard)
// ---------------------------------------------------------
function responderEstadisticas(
  texto: string,
  entidades: ReturnType<typeof extraerEntidades>
): string {
  const t = texto.toLowerCase();

  // Odontólogo específico mencionado (ej. "inasistencia de Carlos Pérez")
  if (entidades.odontologo) {
    const item = POR_ODONTOLOGO.find((o) => o.nombre.includes(entidades.odontologo!));
    if (item) {
      return `🦷 ${item.nombre} (${item.especialidad}, turno ${item.turno}) tiene una tasa de inasistencia de ${item.tasa}%.`;
    }
  }
  if (t.includes("odontolog") || t.includes("doctor") || /\bdra?\.?\b/.test(t)) {
    const top = [...POR_ODONTOLOGO].sort((a, b) => b.tasa - a.tasa)[0];
    return (
      `🦷 El odontólogo con mayor tasa de inasistencia de sus pacientes es ${top.nombre} ` +
      `(${top.especialidad}), con ${top.tasa}%.`
    );
  }

  if (t.includes("especialidad")) {
    const top = [...POR_ESPECIALIDAD].sort((a, b) => b.tasa - a.tasa)[0];
    return `🩺 La especialidad con mayor inasistencia es "${top.especialidad}", con ${top.tasa}%.`;
  }

  if (t.includes("turno")) {
    const top = [...POR_TURNO].sort((a, b) => b.tasa - a.tasa)[0];
    return `🕒 El turno ${top.turno} tiene la mayor tasa de inasistencia, con ${top.tasa}%.`;
  }

  // Tratamiento específico mencionado
  if (entidades.tratamiento) {
    const item = POR_TRATAMIENTO.find((p) => p.tratamiento === entidades.tratamiento);
    if (item) return `📋 La tasa de inasistencia en "${item.tratamiento}" es ${item.tasa}%.`;
  }
  if (t.includes("tratamiento")) {
    const top = [...POR_TRATAMIENTO].sort((a, b) => b.tasa - a.tasa)[0];
    return `📋 El tratamiento con mayor tasa de inasistencia es "${top.tratamiento}", con ${top.tasa}%.`;
  }

  // Día específico mencionado
  if (entidades.dia) {
    const item = POR_DIA_SEMANA.find((p) => p.dia === entidades.dia);
    if (item) return `📅 La tasa de inasistencia los días ${item.dia} es ${item.tasa}%.`;
  }
  if (t.includes("dia") || t.includes("día")) {
    const top = [...POR_DIA_SEMANA].sort((a, b) => b.tasa - a.tasa)[0];
    return `📅 El día con más inasistencia es ${top.dia}, con ${top.tasa}%.`;
  }

  // Distrito específico mencionado
  if (entidades.distrito) {
    const item = POR_DISTRITO.find((p) => p.distrito === entidades.distrito);
    if (item) return `📍 La tasa de inasistencia en ${item.distrito} es ${item.tasa}%.`;
  }
  if (t.includes("distrito")) {
    const top = [...POR_DISTRITO].sort((a, b) => b.tasa - a.tasa)[0];
    return `📍 El distrito con mayor inasistencia (entre los de mayor volumen) es ${top.distrito}, con ${top.tasa}%.`;
  }

  if (t.includes("mes")) {
    const idx = POR_MES.reduce((maxI, cur, i, arr) => (cur.tasa > arr[maxI].tasa ? i : maxI), 0);
    return `🗓️ El mes con más inasistencia es ${POR_MES[idx].mes}, con ${POR_MES[idx].tasa}%.`;
  }

  if (t.includes("anticipacion")) {
    const top = [...POR_ANTICIPACION].sort((a, b) => b.tasa - a.tasa)[0];
    return `⏱️ Las citas reservadas con "${top.rango}" de anticipación tienen la mayor inasistencia, con ${top.tasa}%.`;
  }

  if (t.includes("reprogramad")) {
    const [no, si] = POR_REPROGRAMADA;
    return (
      `🔁 Comparativo por reprogramación:\n` +
      `• No reprogramadas: ${no.tasa}%\n` +
      `• Reprogramadas: ${si.tasa}%`
    );
  }

  if (t.includes("impacto") || t.includes("ingreso perdido")) {
    return (
      `💰 El tratamiento con mayor impacto económico por inasistencia es "${KPIS.tratamientoMayorImpacto}", ` +
      `con S/ ${KPIS.impactoTratamientoMayor.toLocaleString()} perdidos. ` +
      `El total estimado de ingreso perdido es S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}.`
    );
  }

  if (t.includes("asistencia") && !t.includes("inasistencia")) {
    const asistencia = (100 - KPIS.tasaInasistenciaGlobal).toFixed(1);
    return `✅ El porcentaje de asistencia actual es ${asistencia}% (inasistencia: ${KPIS.tasaInasistenciaGlobal}%).`;
  }

  if (t.includes("cuant") && (t.includes("faltar") || t.includes("inasist"))) {
    return (
      `📉 ${KPIS.totalInasistencias.toLocaleString()} pacientes faltaron, ` +
      `sobre un total de ${KPIS.totalCitas.toLocaleString()} citas registradas (${KPIS.tasaInasistenciaGlobal}%).`
    );
  }

  return (
    `📊 Estadísticas generales:\n` +
    `• Tasa de inasistencia global: ${KPIS.tasaInasistenciaGlobal}%\n` +
    `• Total de citas registradas: ${KPIS.totalCitas.toLocaleString()}\n` +
    `• Total de inasistencias: ${KPIS.totalInasistencias.toLocaleString()}\n` +
    `• Ingreso perdido estimado: S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}\n\n` +
    `Puedes preguntarme por tratamiento, día, mes, distrito, odontólogo, especialidad o turno.`
  );
}

// ---------------------------------------------------------
// Perfiles de cita con mayor riesgo (usa el modelo real)
// ---------------------------------------------------------
// Nota: tu tabla CITAS del Excel es un histórico ya cerrado
// (Completada / No asistió), no tiene citas futuras pendientes.
// Por eso el bot combina odontólogos reales (con su especialidad
// y turno reales) con los tratamientos/días/distritos de mayor
// inasistencia histórica, y le pide al modelo entrenado (predecir)
// que estime el riesgo de esos PERFILES. Si más adelante tienes
// una tabla de citas futuras agendadas, dime y la conecto directo.
// ---------------------------------------------------------
function responderCitasRiesgo(): string {
  const topTratamientos = [...POR_TRATAMIENTO].sort((a, b) => b.tasa - a.tasa).slice(0, 2);
  const topDias = [...POR_DIA_SEMANA].sort((a, b) => b.tasa - a.tasa).slice(0, 2);
  const topDistritos = [...POR_DISTRITO].sort((a, b) => b.tasa - a.tasa).slice(0, 2);

  const combinaciones: {
    tratamiento: string; dia: string; distrito: string;
    odontologo: string; especialidad: string; turno: string;
  }[] = [];

  for (const od of POR_ODONTOLOGO) {
    for (const t of topTratamientos) {
      for (const d of topDias) {
        for (const dist of topDistritos) {
          combinaciones.push({
            tratamiento: t.tratamiento,
            dia: d.dia,
            distrito: dist.distrito,
            odontologo: od.nombre,
            especialidad: od.especialidad,
            turno: od.turno,
          });
        }
      }
    }
  }

  const evaluadas = combinaciones.map((c) => {
    const costo = COSTO_TRATAMIENTO[c.tratamiento] ?? 100;
    const resultado = predecir({
      edad: 35,
      sexo: "M",
      distrito: c.distrito,
      tratamiento: c.tratamiento,
      costo,
      especialidad: c.especialidad,
      turno: c.turno,
      mes: new Date().getMonth() + 1,
      diaSemana: c.dia,
      diasAnticipacion: 5,
      reprogramada: "No",
    });
    return { ...c, resultado };
  });

  const top5 = evaluadas
    .sort((a, b) => b.resultado.probabilidadNoAsistir - a.resultado.probabilidadNoAsistir)
    .slice(0, 5);

  const lineas = top5.map(
    (item, i) =>
      `${i + 1}. ${item.odontologo} — ${item.tratamiento} — ${item.dia} — ${item.distrito} — ` +
      `${item.resultado.probabilidadNoAsistir}% de no asistir [${item.resultado.nivelRiesgo.toUpperCase()}]`
  );

  return (
    `🎯 Perfiles de cita con mayor riesgo estimado (combinando tus datos históricos con el modelo):\n\n` +
    `${lineas.join("\n")}\n\n` +
    `_Nota: son combinaciones de factores reales, no citas ya agendadas — tu histórico no incluye citas futuras pendientes. ` +
    `Para evaluar un paciente puntual, usa la pestaña "Predicción"._`
  );
}

// ---------------------------------------------------------
// Recomendaciones accionables basadas en los datos del dashboard
// ---------------------------------------------------------
function responderRecomendaciones(): string {
  const topTratamiento = [...POR_TRATAMIENTO].sort((a, b) => b.tasa - a.tasa)[0];
  const topDia = [...POR_DIA_SEMANA].sort((a, b) => b.tasa - a.tasa)[0];
  const topDistrito = [...POR_DISTRITO].sort((a, b) => b.tasa - a.tasa)[0];
  const topOdontologo = [...POR_ODONTOLOGO].sort((a, b) => b.tasa - a.tasa)[0];
  const topMesIdx = POR_MES.reduce((maxI, cur, i, arr) => (cur.tasa > arr[maxI].tasa ? i : maxI), 0);

  return (
    `💡 Recomendaciones basadas en tus datos actuales:\n\n` +
    `• "${topTratamiento.tratamiento}" tiene la mayor tasa de inasistencia (${topTratamiento.tasa}%). ` +
    `Considera un recordatorio adicional 24h antes para estos pacientes.\n` +
    `• Los días ${topDia.dia} concentran más ausencias (${topDia.tasa}%). Refuerza la confirmación de citas ese día.\n` +
    `• El distrito ${topDistrito.distrito} tiene la mayor inasistencia (${topDistrito.tasa}%); evalúa si el traslado influye.\n` +
    `• ${POR_MES[topMesIdx].mes} históricamente es el mes con más ausencias (${POR_MES[topMesIdx].tasa}%); planifica overbooking preventivo en esa fecha.\n` +
    `• Usa "muéstrame las citas con mayor riesgo" para priorizar llamadas de confirmación antes de cada jornada.`
  );
}