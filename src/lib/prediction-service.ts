// src/lib/prediction-service.ts
// Adaptador entre el formulario y la función de predicción.
// La firma de predecirAsistencia es la que usa prediction-form.tsx.

import { predecir } from "./prediccion";
import { COSTO_TRATAMIENTO } from "./prediction-config";

export interface PredictionInput {
  edad: number;
  sexo: string;
  distrito: string;
  tratamiento: string;
  especialidad: string;
  turno: string;
  fechaCita: string;       // "YYYY-MM-DD" — se usa para calcular mes, día y anticipación
  reprogramada: string;
}

export interface PredictionResult {
  prediccion: 0 | 1;
  etiqueta: string;
  probAsistir: number;
  probNoAsistir: number;
  nivelRiesgo: "bajo" | "medio" | "alto";
  costo: number;
}

export async function predecirAsistencia(
  input: PredictionInput
): Promise<PredictionResult> {
  // Derivar mes, día de la semana y días de anticipación desde la fecha
  const fecha = new Date(input.fechaCita + "T12:00:00");
  const hoy   = new Date();

  const mes              = fecha.getMonth() + 1;   // 1–12
  const diaSemana        = fecha.toLocaleDateString("es-PE", { weekday: "long" }); // "Monday", etc.
  const diasAnticipacion = Math.max(
    0,
    Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Obtener el costo automático según el tratamiento
  const costo = COSTO_TRATAMIENTO[input.tratamiento] ?? 0;

  // Llamar al modelo
  const resultado = predecir({
    edad:             input.edad,
    sexo:             input.sexo,
    distrito:         input.distrito,
    tratamiento:      input.tratamiento,
    costo,
    especialidad:     input.especialidad,
    turno:            input.turno,
    mes,
    diaSemana,
    diasAnticipacion,
    reprogramada:     input.reprogramada,
  });

  return {
    prediccion:     resultado.prediccion,
    etiqueta:       resultado.etiqueta,
    probAsistir:    resultado.probabilidadAsistir,
    probNoAsistir:  resultado.probabilidadNoAsistir,
    nivelRiesgo:    resultado.nivelRiesgo,
    costo,
  };
}
