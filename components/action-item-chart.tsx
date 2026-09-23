"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EmptyState } from "@/components/ui";
import { ListChecks } from "lucide-react";

export function ActionItemChart({ open, done }: { open: number; done: number }) {
  const data = [
    { name: "Open", value: open, color: "#f59e0b" },
    { name: "Done", value: done, color: "#10b981" },
  ];

  if (open + done === 0) {
    return <EmptyState icon={ListChecks}>No action items yet.</EmptyState>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} cornerRadius={4}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
