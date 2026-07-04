export const SEXOS = ["F", "M"];

export const TRATAMIENTOS = [
  "Blanqueamiento Dental",
  "Consulta General",
  "Curación Dental",
  "Endodoncia",
  "Extracción Dental",
  "Implante Dental",
  "Limpieza Dental",
  "Ortodoncia",
];

export const ESPECIALIDADES = [
  "Endodoncia",
  "Odontopediatría",
  "Ortodoncia",
  "Rehabilitación Oral",
];

export const TURNOS = ["Mañana", "Tarde"];

export const REPROGRAMADA_OPTS = ["No", "Sí"];

export const DISTRITOS = [
  "Acobamba", "Acolla", "Apata", "Canchayllo",
  "Chilca", "Chongos Bajo", "Chupaca", "Concepción",
  "El Mantaro", "El Tambo", "Hualhuas", "Huancayo",
  "Huancan", "Huaripampa", "Huertas", "Janjaillo",
  "Jauja", "Julcán", "Leonor Ordóñez", "Llocllapampa",
  "Marco", "Masma", "Masma Chicche", "Mito",
  "Molinos", "Monobamba", "Muquiyauyo", "Nueve De Julio",
  "Orcotuna", "Paca", "Pancán", "Parco",
  "Pariahuanca", "Pilcomayo", "Pomucocha", "Ricán",
  "San Jerónimo", "Sapallanga", "Sausa", "Sicaya",
  "Sincos", "Tunan Marca", "Yauli", "Yauyos",
];

// Costo automático según tratamiento (no necesita campo manual en el form)
export const COSTO_TRATAMIENTO: Record<string, number> = {
  "Blanqueamiento Dental":  180,
  "Consulta General":        50,
  "Curación Dental":         90,
  "Endodoncia":             350,
  "Extracción Dental":      120,
  "Implante Dental":       1200,
  "Limpieza Dental":         80,
  "Ortodoncia":             250,
};
