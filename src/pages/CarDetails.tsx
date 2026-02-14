import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Car, Review } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Fuel, Settings2, ArrowLeft, CalendarDays, Star } from "lucide-react";

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      api.getCar(id).then(setCar).catch(() => navigate("/cars"));
      api.getReviews(id).then(setReviews);
    }
  }, [id]);

  const today = new Date().toISOString().split("T")[0];

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 0;

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!startDate || !endDate) { toast({ title: "Select dates", variant: "destructive" }); return; }
    if (endDate <= startDate) { toast({ title: "End date must be after start date", variant: "destructive" }); return; }
    setBooking(true);
    try {
      await api.createBooking({ car_id: car!.id, start_date: startDate, end_date: endDate });
      toast({ title: "Booking confirmed!", description: "Your booking is pending approval." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async () => {
    if (!user) { navigate("/login"); return; }
    if (!reviewComment.trim()) { toast({ title: "Please write a comment", variant: "destructive" }); return; }
    setSubmittingReview(true);
    try {
      const review = await api.createReview({ car_id: car!.id, rating: reviewRating, comment: reviewComment });
      setReviews((prev) => [review, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Review submitted!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  if (!car) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/cars")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Fleet
          </Button>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Image */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-2xl">
                <img src={car.image_url} alt={`${car.brand} ${car.name}`} className="h-full w-full object-cover aspect-[16/10]" />
              </div>
            </div>

            {/* Details + Booking */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">{car.category}</Badge>
                <h1 className="text-3xl font-bold">{car.brand} {car.name}</h1>
                {avgRating && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{avgRating}</span>
                    <span>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                  </div>
                )}
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-accent">${car.price_per_day}</span>
                  <span className="text-muted-foreground">/day</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Users, label: `${car.seats} Seats` },
                  { icon: Settings2, label: car.transmission },
                  { icon: Fuel, label: car.fuel_type },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 rounded-lg bg-secondary p-3 text-sm">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Booking form */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-4 w-4 text-accent" /> Book This Car
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start">Pickup Date</Label>
                    <Input id="start" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="end">Return Date</Label>
                    <Input id="end" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                {days > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-3 text-sm">
                    <span>{days} day{days > 1 ? "s" : ""} × ${car.price_per_day}</span>
                    <span className="font-bold text-accent">${days * car.price_per_day}</span>
                  </div>
                )}
                <Button variant="accent" className="w-full" onClick={handleBook} disabled={booking}>
                  {booking ? "Booking..." : user ? "Confirm Booking" : "Sign In to Book"}
                </Button>
              </div>
            </div>
          </div>
          {/* Reviews Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>

            {/* Add Review */}
            <div className="rounded-xl border bg-card p-5 mb-6 space-y-3">
              <h3 className="font-semibold">Leave a Review</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)}>
                    <Star className={`h-5 w-5 ${star <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
              <Button variant="accent" size="sm" onClick={handleReview} disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl bg-card p-4 card-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{review.user_name}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
