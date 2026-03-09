export type UserRole = "admin" | "user";
export type BookingStatus = "pending" | "approved" | "completed" | "cancelled";
export type Transmission = "automatic" | "manual";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Car {
  id: number;
  name: string;
  brand: string;
  category: string;
  transmission: Transmission;
  price_per_day: number;
  image_url: string;
  seats: number;
  fuel_type: string;
  available: boolean;
  is_deleted?: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  car_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  car?: Car;
  user?: User;
}

export interface CarFiltersState {
  category: string;
  transmission: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

export interface AdminStats {
  totalCars: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  pendingBookings: number;
}

export interface Review {
  id: number;
  user_id: number;
  car_id: number;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
}