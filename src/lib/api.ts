import type {
  User,
  Car,
  Booking,
  BookingStatus,
  AdminStats,
  CarFiltersState,
  Review,
} from "@/types";
import { SEED_USERS, SEED_CARS, SEED_BOOKINGS, SEED_REVIEWS } from "./mockData";

const BASE_URL = "http://localhost:5000/api";

/** ======================
 *  JWT + REQUEST HELPER
 *  ====================== */
function getToken() {
  return localStorage.getItem("carrental_token");
}

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;

  return res.json();
}

/** ======================
 *  MOCK DB (KEEP FOR MVP)
 *  ====================== */
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
    users: SEED_USERS.map((u) => ({ ...u }) as StoredUser),
    cars: SEED_CARS.map((c) => ({ ...c })),
    bookings: SEED_BOOKINGS.map((b) => ({ ...b })),
    reviews: SEED_REVIEWS.map((r) => ({ ...r })),
  };
}

let db = loadDB();
function save() {
  localStorage.setItem("carrental_db", JSON.stringify(db));
}

/** ======================
 *  API
 *  ====================== */
export const api = {
  // ========= AUTH (REAL BACKEND) =========
  getCurrentUser(): User | null {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeJwt(token);
    if (!decoded) return null;

    // Minimal user object for MVP
    // (your backend returns full user on login/register anyway)
    return { id: String(decoded.id), role: decoded.role } as any;
  },

  async register(data: { name: string; email: string; password: string }) {
    const result = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    localStorage.setItem("carrental_token", result.token);
    return result; // { user, token }
  },

  async login(data: { email: string; password: string }) {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    localStorage.setItem("carrental_token", result.token);
    return result; // { user, token }
  },

  logout() {
    localStorage.removeItem("carrental_token");
  },

  // ========= CARS (BROWSE - still MOCK for now) =========
  async getCars(filters?: Partial<CarFiltersState>): Promise<Car[]> {
    await delay(100);
    let cars = db.cars.filter((c) => c.available && !c.is_deleted);

    if (filters) {
      if (filters.category)
        cars = cars.filter((c) => c.category === filters.category);
      if (filters.transmission)
        cars = cars.filter((c) => c.transmission === filters.transmission);
      if (filters.minPrice)
        cars = cars.filter((c) => c.price_per_day >= filters.minPrice!);
      if (filters.maxPrice)
        cars = cars.filter((c) => c.price_per_day <= filters.maxPrice!);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        cars = cars.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.brand.toLowerCase().includes(s),
        );
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

  // ========= CARS (ADMIN) — REAL BACKEND =========
  async getAllCarsAdmin() {
    return request("/cars");
  },

  async getDeletedCarsAdmin() {
    return request("/cars/deleted");
  },

  async createCar(data: any) {
    return request("/cars", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCar(id: string, data: any) {
    return request(`/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCar(id: string) {
    return request(`/cars/${id}`, {
      method: "DELETE",
    });
  },

  async restoreCar(id: string) {
    return request(`/cars/${id}/restore`, {
      method: "POST",
    });
  },

  async restoreDefaultCars(): Promise<void> {
    await delay();
    const existingIds = new Set(db.cars.map((c) => c.id));
    const seedIds = new Set(SEED_CARS.map((c) => c.id));

    const missingCars = SEED_CARS.filter((c) => !existingIds.has(c.id));
    db.cars.push(...missingCars.map((c) => ({ ...c })));

    db.cars.forEach((c) => {
      if (seedIds.has(c.id)) c.is_deleted = false;
    });

    save();
  },

  // ========= BOOKINGS (MOCK) =========
  async createBooking(data: {
    car_id: string;
    start_date: string;
    end_date: string;
  }): Promise<Booking> {
    await delay();
    const user = api.getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    const car = db.cars.find((c) => c.id === data.car_id);
    if (!car) throw new Error("Car not found");

    const hasConflict = db.bookings.some(
      (b) =>
        b.car_id === data.car_id &&
        b.status !== "cancelled" &&
        b.start_date <= data.end_date &&
        b.end_date >= data.start_date,
    );
    if (hasConflict) throw new Error("Car is not available for selected dates");

    const days = Math.ceil(
      (new Date(data.end_date).getTime() -
        new Date(data.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
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
    const user = api.getCurrentUser();
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
        const { password: _pw, ...safe } = u;
        return safe;
      })(),
    }));
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
  ): Promise<Booking> {
    await delay();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Booking not found");
    db.bookings[idx].status = status;
    save();
    return db.bookings[idx];
  },

  // ========= ADMIN STATS (MOCK) =========
  async getAdminStats(): Promise<AdminStats> {
    await delay(100);
    const bookings = db.bookings;
    return {
      totalCars: db.cars.length,
      totalBookings: bookings.length,
      totalRevenue: bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((s, b) => s + b.total_price, 0),
      activeBookings: bookings.filter((b) => b.status === "approved").length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
    };
  },

  async getRevenueByMonth(): Promise<
    { month: string; revenue: number; bookings: number }[]
  > {
    await delay(100);
    const map: Record<string, { revenue: number; bookings: number }> = {};

    db.bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        const key = b.created_at.slice(0, 7);
        if (!map[key]) map[key] = { revenue: 0, bookings: 0 };
        map[key].revenue += b.total_price;
        map[key].bookings += 1;
      });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        ...data,
      }));
  },

  async getBookingsByStatus(): Promise<{ status: string; count: number }[]> {
    await delay(100);
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
    };
    db.bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  },

  async getTopCars(): Promise<
    { name: string; bookings: number; revenue: number }[]
  > {
    await delay(100);
    const map: Record<
      string,
      { name: string; bookings: number; revenue: number }
    > = {};

    db.bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        const car = db.cars.find((c) => c.id === b.car_id);
        if (!car) return;
        const key = b.car_id;

        if (!map[key])
          map[key] = {
            name: `${car.brand} ${car.name}`,
            bookings: 0,
            revenue: 0,
          };
        map[key].bookings += 1;
        map[key].revenue += b.total_price;
      });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  },

  getCategories(): string[] {
    return [...new Set(db.cars.map((c) => c.category))];
  },

  // ========= REVIEWS (MOCK) =========
  async getReviews(carId: string): Promise<Review[]> {
    await delay(100);
    return db.reviews.filter((r) => r.car_id === carId);
  },

  async createReview(data: {
    car_id: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    await delay();
    const user = api.getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    const review: Review = {
      id: genId(),
      user_id: user.id,
      car_id: data.car_id,
      rating: data.rating,
      comment: data.comment,
      user_name: (user as any).name || "User",
      created_at: new Date().toISOString(),
    };

    db.reviews.push(review);
    save();
    return review;
  },
};
