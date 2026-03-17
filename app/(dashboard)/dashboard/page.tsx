"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
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

function formatEUR(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

function ChangeIndicator({ change }: { change?: number }) {
  if (change === undefined || change === 0) return null;
  const isPositive = change > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        isPositive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {Math.abs(change)}%
    </span>
  );
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre portefeuille immobilier"
      />

      {/* KPI Grid — 2 rows, 3 cols */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Properties — accent card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FF385C] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Propriétés</span>
            <Building2 className="size-5 text-white/50" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            {stats?.totalProperties ?? "—"}
          </div>
          <p className="mt-1 text-sm text-white/70">
            {stats?.rentedProperties ?? 0} louées
          </p>
          <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-white/10" />
        </div>

        {/* Agencies */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6A6A6A]">Agences actives</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#00A699]/10">
              <Building className="size-4 text-[#00A699]" />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#222222]">
            {stats?.activeAgencies ?? "—"}
          </div>
        </div>

        {/* Cities */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6A6A6A]">Villes</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#FC642D]/10">
              <MapPin className="size-4 text-[#FC642D]" />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#222222]">
            {stats?.totalCities ?? "—"}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6A6A6A]">Revenu mensuel</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-3xl font-bold text-[#222222]">
              {stats ? formatEUR(stats.currentRevenue) : "—"}
            </span>
            <ChangeIndicator change={stats?.revenueChange} />
          </div>
        </div>

        {/* Commissions */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6A6A6A]">Commissions</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#484848]/10">
              <CreditCard className="size-4 text-[#484848]" />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-3xl font-bold text-[#222222]">
              {stats ? formatEUR(stats.currentCommission) : "—"}
            </span>
            <ChangeIndicator change={stats?.commissionChange} />
          </div>
        </div>

        {/* Overdue */}
        <div
          className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
            stats?.overduePayments > 0
              ? "border-red-200 bg-red-50"
              : "border-[#EBEBEB] bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6A6A6A]">En retard</span>
            <div
              className={`flex size-9 items-center justify-center rounded-xl ${
                stats?.overduePayments > 0 ? "bg-red-100" : "bg-[#F7F7F7]"
              }`}
            >
              <AlertTriangle
                className={`size-4 ${
                  stats?.overduePayments > 0 ? "text-red-600" : "text-[#6A6A6A]"
                }`}
              />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#222222]">
            {stats?.overduePayments ?? "—"}
          </div>
          {stats?.overduePayments > 0 && (
            <p className="mt-1 text-sm text-red-600">
              Paiements à régulariser
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold text-[#222222]">
            Revenus — 12 derniers mois
          </h3>
          <div className="mt-4">
            <RevenueChart />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold text-[#222222]">
            Propriétés par ville
          </h3>
          <div className="mt-4">
            <CityChart />
          </div>
        </div>
      </div>
    </div>
  );
}
