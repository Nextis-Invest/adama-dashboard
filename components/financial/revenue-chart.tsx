"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart() {
  const { data } = useQuery({
    queryKey: ["chart-revenue"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/charts/revenue");
      const json = await res.json();
      return json.data;
    },
  });

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#6A6A6A]">
        Chargement...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis dataKey="month" stroke="#6A6A6A" fontSize={12} />
        <YAxis stroke="#6A6A6A" fontSize={12} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #EBEBEB",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenus"
          stroke="#FF385C"
          fill="#FF385C"
          fillOpacity={0.1}
        />
        <Area
          type="monotone"
          dataKey="commission"
          name="Commissions"
          stroke="#00A699"
          fill="#00A699"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
