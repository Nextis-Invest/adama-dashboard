"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(
  () => import("@/components/financial/revenue-chart"),
  { ssr: false }
);

const AgencyChart = dynamic(
  () => import("@/components/financial/agency-chart"),
  { ssr: false }
);

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports financiers"
        description="Analyse des revenus et commissions"
      >
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/api/financial/export";
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card className="border-[#EBEBEB]">
          <CardHeader>
            <CardTitle className="text-base">
              Revenus et commissions — 12 derniers mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="border-[#EBEBEB]">
          <CardHeader>
            <CardTitle className="text-base">Revenus par agence</CardTitle>
          </CardHeader>
          <CardContent>
            <AgencyChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
