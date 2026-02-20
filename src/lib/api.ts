import type { User, Car, Booking, BookingStatus, AdminStats, CarFiltersState, Review } from "@/types";
import { SEED_USERS, SEED_CARS, SEED_BOOKINGS, SEED_REVIEWS } from "./mockData";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const genId = () => Math.random().toString(36).slice(2, 10);

interface StoredUser extends User {
  password: string;
}

interface DB {
  users: StoredUser[];
  cars: Car[];
  bookings: Booking[];
  reviews: Review[];
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem("carrental_db");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    users: SEED_USERS.map((u) => ({ ...u })),
    cars: SEED_CARS.map((c) => ({ ...c })),
    bookings: SEED_BOOKINGS.map((b) => ({ ...b })),
    reviews: SEED_REVIEWS.map((r) => ({ ...r })),
  };
}

let db = loadDB();
function save() {
  localStorage.setItem("carrental_db", JSON.stringify(db));
}

function encodeToken(user: User): string {
  return btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
}

function decodeToken(token: string): { id: string; role: string } | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

function getToken(): string | null {
  return localStorage.getItem("carrental_token");
}

function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const u = db.users.find((u) => u.id === decoded.id);
  if (!u) return null;
  const { password: _, ...user } = u;
  return user;
}

export const api = {
  // ─── Auth ───
  async register(data: { name: string; email: string; password: string }) {
    await delay();
    if (db.users.find((u) => u.email === data.email)) throw new Error("Email already exists");
    const user: StoredUser = {
      id: genId(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: "user",
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    save();
    const { password: _, ...safe } = user;
    const token = encodeToken(safe);
    localStorage.setItem("carrental_token", token);
    return { user: safe, token };
  },

  async login(data: { email: string; password: string }) {
    await delay();
    const u = db.users.find((u) => u.email === data.email && u.password === data.password);
    if (!u) throw new Error("Invalid credentials");
    const { password: _, ...safe } = u;
    const token = encodeToken(safe);
    localStorage.setItem("carrental_token", token);
    return { user: safe, token };
  },

  logout() {
    localStorage.removeItem("carrental_token");
  },

  getCurrentUser,

  // ─── Cars ───
  async getCars(filters?: Partial<CarFiltersState>): Promise<Car[]> {
    await delay(100);
    let cars = db.cars.filter((c) => c.available);
    if (filters) {
      if (filters.category) cars = cars.filter((c) => c.category === filters.category);
      if (filters.transmission) cars = cars.filter((c) => c.transmission === filters.transmission);
      if (filters.minPrice) cars = cars.filter((c) => c.price_per_day >= filters.minPrice!);
      if (filters.maxPrice) cars = cars.filter((c) => c.price_per_day <= filters.maxPrice!);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        cars = cars.filter((c) => c.name.toLowerCase().includes(s) || c.brand.toLowerCase().includes(s));
      }
    }
    return cars;
  },

  async getCar(id: string): Promise<Car> {
    await delay(100);
    const car = db.cars.find((c) => c.id === id);
    if (!car) throw new Error("Car not found");
    return car;
  },

  async getAllCarsAdmin(): Promise<Car[]> {
    await delay(100);
    return [...db.cars];
  },

  async createCar(data: Omit<Car, "id" | "created_at">): Promise<Car> {
    await delay();
    const car: Car = { ...data, id: genId(), created_at: new Date().toISOString() };
    db.cars.push(car);
    save();
    return car;
  },

  async updateCar(id: string, data: Partial<Car>): Promise<Car> {
    await delay();
    const idx = db.cars.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Car not found");
    db.cars[idx] = { ...db.cars[idx], ...data };
    save();
    return db.cars[idx];
  },

  async deleteCar(id: string): Promise<void> {
    await delay();
    db.cars = db.cars.filter((c) => c.id !== id);
    save();
  },

  // ─── Bookings ───
  async createBooking(data: { car_id: string; start_date: string; end_date: string }): Promise<Booking> {
    await delay();
    const user = getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const car = db.cars.find((c) => c.id === data.car_id);
    if (!car) throw new Error("Car not found");

    // Date conflict check
    const hasConflict = db.bookings.some(
      (b) =>
        b.car_id === data.car_id &&
        b.status !== "cancelled" &&
        b.start_date <= data.end_date &&
        b.end_date >= data.start_date
    );
    if (hasConflict) throw new Error("Car is not available for selected dates");

    const days = Math.ceil(
      (new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const booking: Booking = {
      id: genId(),
      user_id: user.id,
      car_id: data.car_id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_price: days * car.price_per_day,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    db.bookings.push(booking);
    save();
    return booking;
  },

  async getUserBookings(): Promise<Booking[]> {
    await delay(100);
    const user = getCurrentUser();
    if (!user) return [];
    return db.bookings
      .filter((b) => b.user_id === user.id)
      .map((b) => ({ ...b, car: db.cars.find((c) => c.id === b.car_id) }));
  },

  async getAllBookings(): Promise<Booking[]> {
    await delay(100);
    return db.bookings.map((b) => ({
      ...b,
      car: db.cars.find((c) => c.id === b.car_id),
      user: (() => {
        const u = db.users.find((u) => u.id === b.user_id);
        if (!u) return undefined;
        const { password: _, ...safe } = u;
        return safe;
      })(),
    }));
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    await delay();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Booking not found");
    db.bookings[idx].status = status;
    save();
    return db.bookings[idx];
  },

  // ─── Admin Stats ───
  async getAdminStats(): Promise<AdminStats> {
    await delay(100);
    const bookings = db.bookings;
    return {
      totalCars: db.cars.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total_price, 0),
      activeBookings: bookings.filter((b) => b.status === "approved").length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
    };
  },

  async getRevenueByMonth(): Promise<{ month: string; revenue: number; bookings: number }[]> {
    await delay(100);
    const map: Record<string, { revenue: number; bookings: number }> = {};
    db.bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        const key = b.created_at.slice(0, 7); // "YYYY-MM"
        if (!map[key]) map[key] = { revenue: 0, bookings: 0 };
        map[key].revenue += b.total_price;
        map[key].bookings += 1;
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        ...data,
      }));
  },

  async getBookingsByStatus(): Promise<{ status: string; count: number }[]> {
    await delay(100);
    const counts: Record<string, number> = { pending: 0, approved: 0, completed: 0, cancelled: 0 };
    db.bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  },

  async getTopCars(): Promise<{ name: string; bookings: number; revenue: number }[]> {
    await delay(100);
    const map: Record<string, { name: string; bookings: number; revenue: number }> = {};
    db.bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        const car = db.cars.find((c) => c.id === b.car_id);
        if (!car) return;
        const key = b.car_id;
        if (!map[key]) map[key] = { name: `${car.brand} ${car.name}`, bookings: 0, revenue: 0 };
        map[key].bookings += 1;
        map[key].revenue += b.total_price;
      });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  },

  getCategories(): string[] {
    return [...new Set(db.cars.map((c) => c.category))];
  },

  // ─── Reviews ───
  async getReviews(carId: string): Promise<Review[]> {
    await delay(100);
    return db.reviews.filter((r) => r.car_id === carId);
  },

  async createReview(data: { car_id: string; rating: number; comment: string }): Promise<Review> {
    await delay();
    const user = getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const review: Review = {
      id: genId(),
      user_id: user.id,
      car_id: data.car_id,
      rating: data.rating,
      comment: data.comment,
      user_name: user.name,
      created_at: new Date().toISOString(),
    };
    db.reviews.push(review);
    save();
    return review;
  },
};
