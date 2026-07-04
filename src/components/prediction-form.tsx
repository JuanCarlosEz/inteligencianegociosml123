import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Brain, UserRound, CalendarDays, MapPin, Stethoscope } from "lucide-react";
import { ResultPanel } from "@/components/result-panel";
import {
  predecirAsistencia,
  type PredictionInput,
  type PredictionResult,
} from "@/lib/prediction-service";
import {
  SEXOS, TRATAMIENTOS, ESPECIALIDADES, TURNOS,
  REPROGRAMADA_OPTS, DISTRITOS, COSTO_TRATAMIENTO,
} from "@/lib/prediction-config";

export function PredictionForm() {
  // --- Estado del formulario ---
  const [edad,         setEdad]         = useState("");
  const [sexo,         setSexo]         = useState("");
  const [distrito,     setDistrito]     = useState("");
  const [tratamiento,  setTratamiento]  = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [turno,        setTurno]        = useState("");
  const [fechaCita,    setFechaCita]    = useState("");
  const [reprogramada, setReprogramada] = useState("");

  const [result,  setResult]  = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Costo calculado automáticamente
  const costoAuto = tratamiento ? COSTO_TRATAMIENTO[tratamiento] : null;

  // Datos auto-calculados desde la fecha
  const fechaObj    = fechaCita ? new Date(fechaCita + "T12:00:00") : null;
  const diaCalc     = fechaObj?.toLocaleDateString("es-PE", { weekday: "long" }) ?? "—";
  const mesCalc     = fechaObj ? fechaObj.getMonth() + 1 : null;
  const diasAntCalc = fechaObj
    ? Math.max(0, Math.ceil((fechaObj.getTime() - Date.now()) / 86_400_000))
    : null;

  // Fecha mínima: hoy
  const hoyISO = new Date().toISOString().split("T")[0];

  // Todos los campos requeridos
  const ready =
    !!edad && !!sexo && !!distrito && !!tratamiento &&
    !!especialidad && !!turno && !!fechaCita && !!reprogramada;

  // --- Envío al modelo ---
  const handlePredict = async () => {
    if (!ready) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const input: PredictionInput = {
        edad: Number(edad),
        sexo,
        distrito,
        tratamiento,
        especialidad,
        turno,
        fechaCita,
        reprogramada,
      };
      const r = await predecirAsistencia(input);
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">

      {/* ---- FORMULARIO ---- */}
      <Card className="border-border/70 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Predicción de Asistencia — Arte Dental
          </CardTitle>
          <CardDescription>
            Ingrese los datos de la cita para predecir si el paciente asistirá.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Sección: Datos del paciente */}
          <Section icon={<UserRound className="h-4 w-4" />} title="Datos del paciente">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Edad (años)">
                <Input
                  type="number" min={1} max={120}
                  value={edad} onChange={(e) => setEdad(e.target.value)}
                  placeholder="Ej. 32"
                />
              </Field>

              <SelectField
                label="Sexo" value={sexo} onChange={setSexo}
                options={SEXOS}
                labels={{ F: "Femenino (F)", M: "Masculino (M)" }}
              />

              <div className="md:col-span-2">
                <SelectField
                  label="Distrito de residencia"
                  value={distrito} onChange={setDistrito}
                  options={DISTRITOS}
                />
              </div>
            </div>
          </Section>

          {/* Sección: Datos de la cita */}
          <Section icon={<Stethoscope className="h-4 w-4" />} title="Datos de la cita">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Tratamiento"
                value={tratamiento} onChange={setTratamiento}
                options={TRATAMIENTOS}
              />

              {/* Costo auto-calculado */}
              <Field label="Costo estimado (S/)">
                <Input
                  readOnly
                  value={costoAuto !== null ? `S/ ${costoAuto.toFixed(2)}` : "—"}
                  className="bg-muted/50 cursor-default"
                />
              </Field>

              <SelectField
                label="Especialidad del odontólogo"
                value={especialidad} onChange={setEspecialidad}
                options={ESPECIALIDADES}
              />

              <SelectField
                label="Turno"
                value={turno} onChange={setTurno}
                options={TURNOS}
              />

              <SelectField
                label="¿Cita reprogramada?"
                value={reprogramada} onChange={setReprogramada}
                options={REPROGRAMADA_OPTS}
              />
            </div>
          </Section>

          {/* Sección: Fecha de la cita */}
          <Section icon={<CalendarDays className="h-4 w-4" />} title="Fecha de la cita">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Fecha de la cita">
                <Input
                  type="date" min={hoyISO}
                  value={fechaCita}
                  onChange={(e) => setFechaCita(e.target.value)}
                />
              </Field>

              {/* Valores derivados de la fecha */}
              {fechaCita && (
                <div className="flex flex-col justify-center gap-1 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  <p className="text-muted-foreground">
                    📅 Día: <span className="font-medium text-foreground capitalize">{diaCalc}</span>
                  </p>
                  <p className="text-muted-foreground">
                    📆 Mes: <span className="font-medium text-foreground">{mesCalc}</span>
                  </p>
                  <p className="text-muted-foreground">
                    ⏱ Días de anticipación:{" "}
                    <span className="font-medium text-foreground">{diasAntCalc}</span>
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              ⚠ {error}
            </p>
          )}

          {/* Botón */}
          <Button
            onClick={handlePredict}
            disabled={!ready || loading}
            className="w-full" size="lg"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Brain className="mr-2 h-4 w-4" />
            {loading ? "Analizando..." : "Predecir Asistencia"}
          </Button>
        </CardContent>
      </Card>

      {/* ---- PANEL DE RESULTADO ---- */}
      <div className="lg:col-span-2">
        <ResultPanel result={result} loading={loading} />
      </div>
    </div>
  );
}

// ---- Sub-componentes auxiliares ----
function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b pb-1">
        <span className="text-primary">{icon}</span>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  label, value, onChange, options, labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccione..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels?.[o] ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
