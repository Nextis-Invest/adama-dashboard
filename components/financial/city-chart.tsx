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
} from "recharts";

export default function CityChart() {
  const { data } = useQuery({
    queryKey: ["chart-by-city"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/charts/by-city");
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
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis type="number" stroke="#6A6A6A" fontSize={12} />
        <YAxis
          type="category"
          dataKey="city"
          stroke="#6A6A6A"
          fontSize={12}
          width={80}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #EBEBEB",
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="properties"
          name="Propriétés"
          fill="#FF385C"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="agencies"
          name="Agences"
          fill="#00A699"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
