import { useState, useEffect } from "react";
import type { Booking } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";

const statusVariant: Record<string, "default" | "warning" | "success" | "secondary" | "destructive"> = {
  pending: "warning",
  approved: "success",
  completed: "default",
  cancelled: "destructive",
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.getUserBookings().then((b) => { setBookings(b); setLoading(false); });
  };

  useEffect(load, []);

  const cancel = async (id: string) => {
    await api.updateBookingStatus(id, "cancelled");
    toast({ title: "Booking cancelled" });
    load();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold">My Bookings</h1>
          <p className="mb-8 text-muted-foreground">Welcome back, {user?.name}!</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl bg-card p-12 text-center card-shadow">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No bookings yet. Browse our fleet to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-col gap-4 rounded-xl bg-card p-5 card-shadow sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {b.car && (
                      <img src={b.car.image_url} alt={b.car.name} className="h-16 w-24 rounded-lg object-cover hidden sm:block" />
                    )}
                    <div>
                      <p className="font-semibold">{b.car ? `${b.car.brand} ${b.car.name}` : "Unknown Car"}</p>
                      <p className="text-sm text-muted-foreground">{b.start_date} → {b.end_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-accent">${b.total_price}</span>
                    <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                    {b.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => cancel(b.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
