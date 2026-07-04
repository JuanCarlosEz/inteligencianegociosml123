/**
 * ============================================================
 *  PESTAÑA "INFORMACIÓN DEL PROYECTO"
 * ============================================================
 *  Contenido estático mostrado en la primera pestaña.
 *  EDITA AQUÍ los textos de la empresa, problema, solución,
 *  objetivo, tecnologías y variables del modelo.
 * ============================================================
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Brain, Stethoscope, Database, Target, AlertTriangle, Sparkles,
} from "lucide-react";

export function ProjectInfo() {
  return (
    <div className="space-y-8">
      {/* --- HERO / TÍTULO PRINCIPAL --- */}
      <section
        className="overflow-hidden rounded-2xl p-8 md:p-12 text-primary-foreground"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-soft)" }}
      >
        <Badge className="mb-4 bg-white/20 text-primary-foreground hover:bg-white/20">
          <Sparkles className="mr-1 h-3 w-3" /> Machine Learning Aplicado
        </Badge>
        <h2 className="text-3xl font-bold md:text-4xl">
          Sistema Inteligente de Predicción de Inasistencia de Pacientes
        </h2>
        <p className="mt-3 text-lg opacity-90">Clínica Odontológica Arte Dental</p>
      </section>

      {/* --- TARJETAS DESCRIPTIVAS (empresa, problema, solución, objetivo) --- */}
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={<Stethoscope className="h-5 w-5" />} title="Sobre la Empresa">
          La Clínica Odontológica Arte Dental brinda servicios especializados de salud bucal,
          incluyendo consultas, limpiezas dentales, tratamientos preventivos y procedimientos
          especializados.
        </InfoCard>
        <InfoCard icon={<AlertTriangle className="h-5 w-5" />} title="Problema Identificado">
          La clínica presenta inasistencias de pacientes a las citas programadas, generando
          espacios desaprovechados y disminución de la productividad.
        </InfoCard>
        <InfoCard icon={<Brain className="h-5 w-5" />} title="Solución Propuesta">
          Se implementó un modelo de Machine Learning basado en Random Forest capaz de predecir
          la probabilidad de asistencia o inasistencia de los pacientes utilizando datos históricos.
        </InfoCard>
        <InfoCard icon={<Target className="h-5 w-5" />} title="Objetivo">
          Optimizar la programación de citas y apoyar la toma de decisiones mediante predicciones
          basadas en datos.
        </InfoCard>
      </div>

      {/* --- TECNOLOGÍAS Y VARIABLES DEL MODELO --- */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-primary" /> Tecnologías Utilizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Python", "Google Colab", "Scikit-Learn", "Random Forest", "ML Supervisado"].map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full px-3 py-1">{t}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" /> Variables del Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Edad", "Sexo", "Tratamiento", "Especialidad", "Día de la semana", "Turno"].map((t) => (
              <Badge key={t} variant="outline" className="rounded-full border-primary/30 px-3 py-1 text-primary">{t}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">{children}</CardContent>
    </Card>
  );
}
