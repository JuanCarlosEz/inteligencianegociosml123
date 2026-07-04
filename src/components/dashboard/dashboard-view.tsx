// src/components/dashboard/dashboard-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  CalendarX2, TrendingDown, DollarSign, AlertTriangle,
} from "lucide-react";
import {
  KPIS, POR_MES, POR_DIA_SEMANA, POR_TRATAMIENTO,
  POR_ANTICIPACION, POR_REPROGRAMADA, POR_DISTRITO,
} from "@/lib/dashboard-data";

const COLOR_PRIMARIO = "#ef4444"; // rojo (inasistencia)
const COLOR_SECUNDARIO = "#f59e0b"; // ambar
const COLORS_PIE = ["#ef4444", "#94a3b8"];

function KpiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
          <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={CalendarX2}
          label="Tasa de inasistencia"
          value={`${KPIS.tasaInasistenciaGlobal}%`}
          sub={`${KPIS.totalInasistencias.toLocaleString()} de ${KPIS.totalCitas.toLocaleString()} citas`}
        />
        <KpiCard
          icon={DollarSign}
          label="Ingreso perdido estimado"
          value={`S/ ${KPIS.ingresoPerdidoEstimado.toLocaleString()}`}
          sub="Acumulado por citas no atendidas"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Tratamiento de mayor impacto"
          value={KPIS.tratamientoMayorImpacto}
          sub={`S/ ${KPIS.impactoTratamientoMayor.toLocaleString()} en inasistencias`}
        />
        <KpiCard
          icon={TrendingDown}
          label="Total de citas registradas"
          value={KPIS.totalCitas.toLocaleString()}
          sub="Periodo 2021 - 2026"
        />
      </div>

      {/* Evolución mensual */}
      <ChartCard title="Evolución de la tasa de inasistencia por mes" subtitle="% de citas no atendidas">
        <LineChart data={POR_MES}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="mes" fontSize={12} />
          <YAxis fontSize={12} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`, "Inasistencia"]} />
          <Line type="monotone" dataKey="tasa" stroke={COLOR_PRIMARIO} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Por dia de semana */}
        <ChartCard title="Inasistencia por día de la semana">
          <BarChart data={POR_DIA_SEMANA}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="dia" fontSize={11} angle={-20} textAnchor="end" height={50} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, "Inasistencia"]} />
            <Bar dataKey="tasa" fill={COLOR_SECUNDARIO} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* Por tratamiento */}
        <ChartCard title="Inasistencia por tratamiento">
          <BarChart data={POR_TRATAMIENTO} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis type="number" fontSize={12} unit="%" />
            <YAxis type="category" dataKey="tratamiento" fontSize={11} width={110} />
            <Tooltip formatter={(v) => [`${v}%`, "Inasistencia"]} />
            <Bar dataKey="tasa" fill={COLOR_PRIMARIO} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* Por dias de anticipacion */}
        <ChartCard title="Inasistencia según días de anticipación" subtitle="Días entre reserva y cita">
          <BarChart data={POR_ANTICIPACION}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="rango" fontSize={11} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, "Inasistencia"]} />
            <Bar dataKey="tasa" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* Reprogramada: donut simple */}
        <ChartCard title="Reprogramación vs. inasistencia" subtitle="¿Las citas reprogramadas fallan más?">
          <PieChart>
            <Pie
              data={POR_REPROGRAMADA}
              dataKey="tasa"
              nameKey="reprogramada"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {POR_REPROGRAMADA.map((_, i) => (
                <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, `Reprogramada: ${n}`]} />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>

      {/* Por distrito */}
      <ChartCard title="Inasistencia por distrito (Top 8 por volumen de citas)">
        <BarChart data={POR_DISTRITO}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="distrito" fontSize={10} angle={-30} textAnchor="end" height={70} />
          <YAxis fontSize={12} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`, "Inasistencia"]} />
          <Bar dataKey="tasa" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}