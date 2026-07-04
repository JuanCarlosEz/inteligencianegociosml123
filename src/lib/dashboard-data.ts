// src/lib/dashboard-data.ts
// AUTO-GENERADO desde CLINICA_DENTAL_PACIENTES_CORREGIDO_ML_COMPLETO.xlsx
// Datos agregados para el dashboard informativo y el asistente virtual

export const KPIS = {
  totalCitas: 5999,
  totalInasistencias: 1233,
  tasaInasistenciaGlobal: 20.6,
  ingresoPerdidoEstimado: 341240.0,
  tratamientoMayorImpacto: "Implante Dental",
  impactoTratamientoMayor: 165600.0,
} as const;

export const POR_MES = [
  { mes: "Ene", tasa: 20.0 }, { mes: "Feb", tasa: 21.6 }, { mes: "Mar", tasa: 20.0 },
  { mes: "Abr", tasa: 20.3 }, { mes: "May", tasa: 22.9 }, { mes: "Jun", tasa: 21.5 },
  { mes: "Jul", tasa: 23.3 }, { mes: "Ago", tasa: 18.3 }, { mes: "Sep", tasa: 20.1 },
  { mes: "Oct", tasa: 18.9 }, { mes: "Nov", tasa: 19.3 }, { mes: "Dic", tasa: 19.9 },
];

export const POR_DIA_SEMANA = [
  { dia: "Lunes", tasa: 21.6 }, { dia: "Martes", tasa: 20.3 }, { dia: "Miercoles", tasa: 19.2 },
  { dia: "Jueves", tasa: 21.9 }, { dia: "Viernes", tasa: 18.9 }, { dia: "Sabado", tasa: 21.3 },
  { dia: "Domingo", tasa: 20.8 },
];

export const POR_TRATAMIENTO = [
  { tratamiento: "Ortodoncia", tasa: 22.8 },
  { tratamiento: "Blanqueamiento Dental", tasa: 20.7 },
  { tratamiento: "Limpieza Dental", tasa: 20.7 },
  { tratamiento: "Extracción Dental", tasa: 20.6 },
  { tratamiento: "Consulta General", tasa: 20.3 },
  { tratamiento: "Curación Dental", tasa: 20.2 },
  { tratamiento: "Endodoncia", tasa: 19.8 },
  { tratamiento: "Implante Dental", tasa: 19.1 },
];

export const POR_ANTICIPACION = [
  { rango: "0-7 dias", tasa: 20.6 },
  { rango: "8-15 dias", tasa: 20.3 },
  { rango: "16-23 dias", tasa: 20.9 },
  { rango: "24-30 dias", tasa: 20.4 },
];

export const POR_REPROGRAMADA = [
  { reprogramada: "No", tasa: 20.8 },
  { reprogramada: "Sí", tasa: 20.3 },
];

export const POR_DISTRITO = [
  { distrito: "El Tambo", tasa: 22.9 },
  { distrito: "Sapallanga", tasa: 21.7 },
  { distrito: "Ingenio", tasa: 21.4 },
  { distrito: "Huancán", tasa: 21.2 },
  { distrito: "Huancayo", tasa: 20.8 },
  { distrito: "Chilca", tasa: 20.1 },
  { distrito: "San Agustín de Cajas", tasa: 19.9 },
  { distrito: "Pilcomayo", tasa: 17.1 },
];

// --- NUEVO: tabla ODONTOLOGOS del Excel (join CITAS + ODONTOLOGOS) ---
export interface OdontologoInfo {
  nombre: string;
  especialidad: string;
  turno: "Mañana" | "Tarde";
  tasa: number; // % de inasistencia de sus pacientes
}
export const POR_ODONTOLOGO: OdontologoInfo[] = [
  { nombre: "Dra. María López", especialidad: "Ortodoncia", turno: "Mañana", tasa: 21.6 },
  { nombre: "Dr. Carlos Pérez", especialidad: "Endodoncia", turno: "Tarde", tasa: 20.9 },
  { nombre: "Dra. Ana Torres", especialidad: "Odontopediatría", turno: "Mañana", tasa: 20.2 },
  { nombre: "Dr. Luis Ramírez", especialidad: "Rehabilitación Oral", turno: "Tarde", tasa: 19.5 },
];

// --- NUEVO: tasa por especialidad (derivada de ODONTOLOGOS) y por turno de la cita ---
export const POR_ESPECIALIDAD = [
  { especialidad: "Ortodoncia", tasa: 21.6 },
  { especialidad: "Endodoncia", tasa: 20.9 },
  { especialidad: "Odontopediatría", tasa: 20.2 },
  { especialidad: "Rehabilitación Oral", tasa: 19.5 },
];

export const POR_TURNO = [
  { turno: "Tarde", tasa: 21.7 },
  { turno: "Mañana", tasa: 19.7 },
];