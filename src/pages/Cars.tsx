import { useState, useEffect } from "react";
import type { Car, CarFiltersState } from "@/types";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CarCard } from "@/components/cars/CarCard";
import { CarFilters } from "@/components/cars/CarFilters";

const defaultFilters: CarFiltersState = {
  category: "",
  transmission: "",
  minPrice: 0,
  maxPrice: 0,
  search: "",
};

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<CarFiltersState>(defaultFilters);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategories(api.getCategories());
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getCars(filters).then((c) => { setCars(c); setLoading(false); });
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Browse Our Fleet</h1>
            <p className="mt-1 text-muted-foreground">Find the perfect car for your next trip.</p>
          </div>

          <CarFilters filters={filters} categories={categories} onChange={setFilters} />

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : cars.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">No cars match your filters.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
