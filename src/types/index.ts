export type UserRole = 'admin' | 'user';
export type BookingStatus = 'pending' | 'approved' | 'completed' | 'cancelled';
export type Transmission = 'automatic' | 'manual';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Car {
  id: string;
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
  id: string;
  user_id: string;
  car_id: string;
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
  id: string;
  user_id: string;
  car_id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
}
