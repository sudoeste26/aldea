import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, DoorOpen, TrendingUp } from "lucide-react";

const kpis = [
  { label: "Investidores ativos", value: "—", icon: Users, color: "border-t-brand" },
  { label: "Empreendimentos", value: "—", icon: Building2, color: "border-t-blue-500" },
  { label: "Total de unidades", value: "—", icon: DoorOpen, color: "border-t-green-500" },
  { label: "Valor estimado / mês", value: "—", icon: TrendingUp, color: "border-t-purple-500" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do portfólio imobiliário"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`border-t-4 ${kpi.color}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Gráficos do dashboard serão implementados no Sprint 2.
      </div>
    </>
  );
}
