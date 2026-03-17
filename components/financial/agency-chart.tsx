"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AgencyChart() {
  const { data } = useQuery({
    queryKey: ["chart-by-agency"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/charts/by-agency");
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis dataKey="agency" stroke="#6A6A6A" fontSize={12} />
        <YAxis stroke="#6A6A6A" fontSize={12} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #EBEBEB",
            fontSize: 12,
          }}
        />
        <Legend />
        <Bar
          dataKey="revenue"
          name="Revenus"
          fill="#FF385C"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="commission"
          name="Commissions"
          fill="#00A699"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
