import { useState, useEffect } from "react";
import type { AdminStats } from "@/types";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Car, CalendarCheck, DollarSign, Clock, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.getAdminStats().then(setStats);
  }, []);

  if (!stats) return (
    <div className="flex h-full items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-muted-foreground">Overview of your rental business.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard label="Total Cars" value={stats.totalCars} icon={Car} />
        <StatsCard label="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} />
        <StatsCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} accent />
        <StatsCard label="Active Rentals" value={stats.activeBookings} icon={Clock} />
        <StatsCard label="Pending" value={stats.pendingBookings} icon={AlertCircle} />
      </div>
    </div>
  );
}
