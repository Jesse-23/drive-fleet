import { useState, useEffect } from "react";
import type { Booking, BookingStatus } from "@/types";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

const statusVariant: Record<
  string,
  "default" | "warning" | "success" | "secondary" | "destructive"
> = {
  pending: "warning",
  approved: "success",
  completed: "default",
  cancelled: "destructive",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.getAllBookings().then((b) => {
      setBookings(b);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: BookingStatus) => {
    await api.updateBookingStatus(id, status);
    toast({ title: `Booking ${status}` });
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-2 text-2xl font-bold">Manage Bookings</h1>
      <p className="mb-8 text-muted-foreground">{bookings.length} total bookings</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 card-shadow sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {b.car ? `${b.car.brand} ${b.car.name}` : "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {b.user?.name ?? "Unknown user"} · {formatDate(b.start_date)} →{" "}
                  {formatDate(b.end_date)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-accent">${b.total_price}</span>
                <Badge variant={statusVariant[b.status]}>{b.status}</Badge>

                {b.status === "pending" && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateStatus(b.id, "approved")}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateStatus(b.id, "cancelled")}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}

                {b.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(b.id, "completed")}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}