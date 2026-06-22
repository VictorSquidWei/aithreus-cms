"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DayPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export function TimeSeriesChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-56 w-full" data-testid="timeseries">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: "var(--text-faint)", fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis tick={{ fill: "var(--text-faint)", fontSize: 10 }} width={36} />
          <Tooltip
            contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "var(--text)" }}
          />
          <Area type="monotone" dataKey="impressions" name="Views" stroke="var(--text-muted)" fill="var(--surface-3)" />
          <Area type="monotone" dataKey="clicks" name="Clicks" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
          <Area type="monotone" dataKey="conversions" name="Conversions" stroke="var(--positive)" fill="var(--positive)" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
