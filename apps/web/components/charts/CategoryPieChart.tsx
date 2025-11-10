"use client";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from "recharts";

const COLORS = ["#06b6d4","#0ea5e9","#3b82f6","#60a5fa","#a78bfa","#f472b6","#fb7185"];

export default function CategoryPieChart() {
  const { data } = useSWR("/api/category-spend", () => fetchJson<any[]>("/api/category-spend"));
  if (!data) return <div>Loading chart...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium mb-2">Spend by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="spend" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
            {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
