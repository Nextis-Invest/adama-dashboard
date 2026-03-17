"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Building,
  MapPin,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/financial/revenue-chart"),
  { ssr: false }
);
const CityChart = dynamic(
  () => import("@/components/financial/city-chart"),
  { ssr: false }
);

function formatCNY(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      return json.data;
    },
  });

  const kpis = [
    {
      title: "Propriétés",
      value: stats?.totalProperties ?? "—",
      sub: `${stats?.rentedProperties ?? 0} louées`,
      icon: Building2,
      color: "#FF385C",
    },
    {
      title: "Agences actives",
      value: stats?.activeAgencies ?? "—",
      icon: Building,
      color: "#00A699",
    },
    {
      title: "Villes",
      value: stats?.totalCities ?? "—",
      icon: MapPin,
      color: "#FC642D",
    },
    {
      title: "Revenu mensuel",
      value: stats ? formatCNY(stats.currentRevenue) : "—",
      change: stats?.revenueChange,
      icon: TrendingUp,
      color: "#008A05",
    },
    {
      title: "Commissions",
      value: stats ? formatCNY(stats.currentCommission) : "—",
      change: stats?.commissionChange,
      icon: CreditCard,
      color: "#484848",
    },
    {
      title: "En retard",
      value: stats?.overduePayments ?? "—",
      icon: AlertTriangle,
      color: stats?.overduePayments > 0 ? "#C13515" : "#6A6A6A",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre portefeuille immobilier"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="border-[#EBEBEB] shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6A6A6A]">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#222222]">
                {kpi.value}
              </div>
              <div className="flex items-center gap-2">
                {kpi.sub && (
                  <p className="text-xs text-[#6A6A6A]">{kpi.sub}</p>
                )}
                {kpi.change !== undefined && kpi.change !== 0 && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      kpi.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {kpi.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(kpi.change)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#EBEBEB]">
          <CardHeader>
            <CardTitle className="text-base">Revenus — 12 derniers mois</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="border-[#EBEBEB]">
          <CardHeader>
            <CardTitle className="text-base">Propriétés par ville</CardTitle>
          </CardHeader>
          <CardContent>
            <CityChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
