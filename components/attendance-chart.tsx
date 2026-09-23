"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { EmptyState } from "@/components/ui";
import { BarChart3 } from "lucide-react";

export function AttendanceChart({
  data,
}: {
  data: { title: string; present: number; total: number }[];
}) {
  if (data.length === 0) {
    return <EmptyState icon={BarChart3}>No completed meetings yet.</EmptyState>;
  }

  const chartData = data.map((d) => ({ name: d.title, Present: d.present, Absent: d.total - d.present }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" height={50} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
            cursor={{ fill: "#f8fafc" }}
          />
          <Bar dataKey="Present" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
