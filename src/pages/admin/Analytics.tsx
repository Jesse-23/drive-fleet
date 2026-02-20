import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "hsl(var(--success))",
  approved:  "hsl(var(--accent))",
  pending:   "hsl(var(--warning))",
  cancelled: "hsl(var(--destructive))",
};

export default function Analytics() {
  const [monthly, setMonthly]     = useState<{ month: string; revenue: number; bookings: number }[]>([]);
  const [byStatus, setByStatus]   = useState<{ status: string; count: number }[]>([]);
  const [topCars, setTopCars]     = useState<{ name: string; bookings: number; revenue: number }[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRevenueByMonth(),
      api.getBookingsByStatus(),
      api.getTopCars(),
    ]).then(([m, s, t]) => {
      setMonthly(m);
      setByStatus(s.filter((x) => x.count > 0));
      setTopCars(t);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const lastTwo = monthly.slice(-2);
  const growth = lastTwo.length === 2 && lastTwo[0].revenue > 0
    ? (((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100).toFixed(1)
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Revenue and booking performance overview.</p>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-accent">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="mt-1 text-2xl font-bold">{byStatus.reduce((s, x) => s + x.count, 0)}</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Month-over-Month</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-bold">{growth ? `${growth}%` : "—"}</p>
            {growth && Number(growth) >= 0
              ? <TrendingUp className="h-5 w-5 text-success" />
              : <TrendingDown className="h-5 w-5 text-destructive" />}
          </div>
        </div>
      </div>

      {/* Revenue over time */}
      <div className="rounded-xl bg-card p-5 card-shadow">
        <h2 className="mb-4 font-semibold">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="url(#revGrad)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings over time + Status pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 card-shadow">
          <h2 className="mb-4 font-semibold">Bookings per Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => [v, "Bookings"]}
              />
              <Bar dataKey="bookings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card p-5 card-shadow">
          <h2 className="mb-4 font-semibold">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "hsl(var(--muted))"} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{v}</span>} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top performing cars */}
      <div className="rounded-xl bg-card p-5 card-shadow">
        <h2 className="mb-4 font-semibold">Top Cars by Revenue</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topCars} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
