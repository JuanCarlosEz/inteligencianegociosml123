import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Phone,
  MessageSquare,
  Bell,
  TrendingUp,
  Shield,
} from "lucide-react";
import type { PredictionResult } from "@/lib/prediction-service";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
}

export function ResultPanel({ result, loading }: Props) {
  // --- Estado: cargando ---
  if (loading) {
    return (
      <Card className="border-border/70 h-full flex flex-col items-center justify-center min-h-[320px] bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <TrendingUp className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Analizando predicción...</p>
            <p className="text-xs text-muted-foreground mt-1">Procesando modelo de IA</p>
          </div>
        </div>
      </Card>
    );
  }

  // --- Estado: sin predicción ---
  if (!result) {
    return (
      <Card className="border-border/70 h-full flex flex-col items-center justify-center min-h-[320px] bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-950/20">
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Clock className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="font-semibold text-foreground">Sin predicción aún</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Completa el formulario y presiona "Predecir Asistencia" para obtener una predicción personalizada.
          </p>
        </div>
      </Card>
    );
  }

  // Colores y textos según predicción
  const asistio = result.prediccion === 1;
  
  const colorScheme = asistio
    ? {
        bg: "bg-gradient-to-br from-emerald-50/80 to-green-50/40 dark:from-emerald-950/30 dark:to-green-950/20",
        border: "border-emerald-200 dark:border-emerald-800",
        textMain: "text-emerald-700 dark:text-emerald-400",
        textSecond: "text-emerald-600 dark:text-emerald-500",
        bgLight: "bg-emerald-50/50 dark:bg-emerald-900/20",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      }
    : {
        bg: "bg-gradient-to-br from-orange-50/80 to-red-50/40 dark:from-orange-950/30 dark:to-red-950/20",
        border: "border-orange-200 dark:border-orange-800",
        textMain: "text-orange-700 dark:text-orange-400",
        textSecond: "text-orange-600 dark:text-orange-500",
        bgLight: "bg-orange-50/50 dark:bg-orange-900/20",
        badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };

  const badgeRiesgo: Record<string, string> = {
    bajo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    alto: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const Icono = asistio ? CheckCircle2 : XCircle;

  return (
    <Card className={`border-2 h-full flex flex-col ${colorScheme.border} ${colorScheme.bg}`}>
      {/* Header mejorado */}
      <CardHeader className="pb-3 border-b border-current/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Predicción de Asistencia</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Modelo: Árbol de Decisión</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 flex-1 pt-5">
        {/* Resultado principal - Mejorado */}
        <div className={`rounded-xl border-2 p-5 ${colorScheme.bgLight} ${colorScheme.border}`}>
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-full ${asistio ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-orange-100 dark:bg-orange-900/40"}`}>
              <Icono className={`h-7 w-7 ${colorScheme.textMain}`} />
            </div>
            <div className="flex-1">
              <p className={`text-lg font-bold leading-snug ${colorScheme.textMain}`}>
                {asistio ? "✅ El paciente ASISTIRÁ" : "⚠️ RIESGO: No asistirá"}
              </p>
              <p className={`text-sm ${colorScheme.textSecond} mt-1.5 font-medium`}>
                {asistio
                  ? "Predicción positiva: paciente confiable"
                  : "Predicción negativa: requiere intervención"}
              </p>
            </div>
          </div>
        </div>

        {/* Confianza del modelo */}
        <div className={`rounded-lg p-3 ${colorScheme.bgLight} border border-current/10`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`h-4 w-4 ${colorScheme.textMain}`} />
            <span className="text-xs font-semibold">Confianza del Modelo</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-1 bg-muted rounded-full h-2 mr-3">
              <div
                className={`h-full rounded-full ${asistio ? "bg-emerald-500" : "bg-orange-500"} transition-all duration-500`}
                style={{
                  width: `${Math.max(result.probAsistir, result.probNoAsistir)}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold">
              {Math.max(result.probAsistir, result.probNoAsistir)}%
            </span>
          </div>
        </div>

        {/* Nivel de riesgo - Mejorado */}
        <div className="rounded-lg bg-muted/50 px-4 py-3 border border-current/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Nivel de Riesgo</span>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${badgeRiesgo[result.nivelRiesgo]}`}>
              {result.nivelRiesgo === "alto" && <AlertTriangle className="h-3.5 w-3.5" />}
              {result.nivelRiesgo === "medio" && <Clock className="h-3.5 w-3.5" />}
              {result.nivelRiesgo === "bajo" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {result.nivelRiesgo}
            </div>
          </div>
        </div>

        {/* Barras de probabilidad - Mejoradas */}
        <div className="space-y-3.5">
          <p className="text-sm font-semibold">Probabilidades Predichas</p>

          {/* Asistirá */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">✅ Probabilidad de Asistencia</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {result.probAsistir}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden shadow-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                style={{ width: `${result.probAsistir}%` }}
              />
            </div>
          </div>

          {/* No asistirá */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">❌ Riesgo de Inasistencia</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {result.probNoAsistir}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden shadow-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-600 transition-all duration-700 ease-out"
                style={{ width: `${result.probNoAsistir}%` }}
              />
            </div>
          </div>
        </div>

        {/* Costo del tratamiento */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 px-4 py-3 border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              💰 Costo del Tratamiento
            </span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
              S/ {result.costo.toFixed(2)}
            </span>
          </div>
        </div>

        {/* RECOMENDACIONES PERSONALIZADAS */}
        <div className="space-y-2.5 pt-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendaciones
          </p>

          {asistio ? (
            /* Recomendaciones para ASISTENCIA */
            <div className="space-y-2">
              <RecommendationCard
                icon={<Bell className="h-4 w-4" />}
                title="Confirmación Preventiva"
                description="Confirmar cita 24 horas antes para maximizar asistencia"
                color="blue"
              />
              <RecommendationCard
                icon={<MessageSquare className="h-4 w-4" />}
                title="Recordatorio Amable"
                description="Enviar recordatorio por SMS o WhatsApp el día anterior"
                color="green"
              />
              <RecommendationCard
                icon={<TrendingUp className="h-4 w-4" />}
                title="Aprovechar Disponibilidad"
                description="Paciente confiable: puede agendar en horarios premium"
                color="emerald"
              />
            </div>
          ) : (
            /* Recomendaciones para NO ASISTENCIA */
            <div className="space-y-2">
              <RecommendationCard
                icon={<Phone className="h-4 w-4" />}
                title="Llamada Telefónica Directa"
                description="Contacto personal para confirmar y resolver dudas"
                color="orange"
              />
              <RecommendationCard
                icon={<Bell className="h-4 w-4" />}
                title="Recordatorios Intensivos"
                description="SMS/Email a 48h, 24h y 2h antes de la cita"
                color="amber"
              />
              <RecommendationCard
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Investigar Barreras"
                description="Preguntar sobre transporte, horario o costo y ofrecer soluciones"
                color="red"
              />
            </div>
          )}
        </div>

        {/* Indicador de confiabilidad */}
        <div className="mt-2 pt-3 border-t border-current/10">
          <p className="text-xs text-muted-foreground text-center">
            {asistio
              ? "✅ Este paciente tiene alto potencial de asistencia según el modelo"
              : "⚠️ Este paciente necesita seguimiento personalizado para reducir riesgo"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente auxiliar: Tarjeta de recomendación
 */
interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "green" | "emerald" | "orange" | "amber" | "red";
}

function RecommendationCard({
  icon,
  title,
  description,
  color,
}: RecommendationCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    green: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    emerald:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    orange:
      "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    amber:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    red: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${iconColorMap[color]} mt-0.5`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs opacity-90 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}