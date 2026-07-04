/**
 * ============================================================
 *  PÁGINA PRINCIPAL  —  LAYOUT + PESTAÑAS
 * ============================================================
 *  Este archivo sólo arma la estructura general (header,
 *  pestañas, footer). El contenido vive en componentes
 *  separados para que sea fácil ubicar dónde editar:
 *
 *   • Información del proyecto → src/components/project-info.tsx
 *   • Formulario de predicción → src/components/prediction-form.tsx
 *   • Panel de resultado       → src/components/result-panel.tsx
 *   • Dashboard informativo    → src/components/dashboard/dashboard-view.tsx
 *   • Opciones de los selects  → src/lib/prediction-config.ts
 *   • Conexión al modelo .pkl  → src/lib/prediction-service.ts
 * ============================================================
 */

import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope } from "lucide-react";
import { ProjectInfo } from "@/components/project-info";
import { PredictionForm } from "@/components/prediction-form";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Predicción de Inasistencia | Arte Dental" },
      { name: "description", content: "Sistema inteligente de predicción de inasistencia de pacientes para Clínica Odontológica Arte Dental." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      {/* --- ENCABEZADO (logo + nombre de la clínica) --- */}
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-soft)" }}
          >
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Arte Dental</h1>
            <p className="text-xs text-muted-foreground">Sistema Inteligente de Predicción</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* --- PESTAÑAS PRINCIPALES --- */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 md:w-[760px]">
            <TabsTrigger value="info">Información del Proyecto</TabsTrigger>
            <TabsTrigger value="predict">Predicción</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chat">Asistente Virtual</TabsTrigger>
          </TabsList>

          <TabsContent value="info"><ProjectInfo /></TabsContent>
          <TabsContent value="predict"><PredictionForm /></TabsContent>
          <TabsContent value="dashboard"><DashboardView /></TabsContent>
          <TabsContent value="chat"><ChatWidget /></TabsContent>
        </Tabs>

        <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Proyecto Universitario · Machine Learning · Random Forest
        </footer>
      </main>
    </div>
  );
}