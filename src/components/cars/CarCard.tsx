import { Link } from "react-router-dom";
import type { Car } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Users, Fuel, Settings2 } from "lucide-react";

export function CarCard({ car }: { car: Car }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      className="group block overflow-hidden rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {car.brand} {car.name}
          </h3>
          <Badge variant="secondary">{car.category}</Badge>
        </div>
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {car.seats}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {car.fuel_type}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-accent">${car.price_per_day}</span>
          <span className="text-xs text-muted-foreground">/day</span>
        </div>
      </div>
    </Link>
  );
}
