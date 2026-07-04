// src/routes/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Inasistencia</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores y patrones de inasistencia — Clínica Arte Dental
        </p>
      </div>
      <DashboardView />
    </div>
  );
}