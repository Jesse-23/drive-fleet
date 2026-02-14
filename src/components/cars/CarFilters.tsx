import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { CarFiltersState } from "@/types";

interface Props {
  filters: CarFiltersState;
  categories: string[];
  onChange: (filters: CarFiltersState) => void;
}

export function CarFilters({ filters, categories, onChange }: Props) {
  const update = (key: keyof CarFiltersState, value: string | number) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 card-shadow sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cars..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.category || "all"} onValueChange={(v) => update("category", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.transmission || "all"}
        onValueChange={(v) => update("transmission", v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Transmission" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any</SelectItem>
          <SelectItem value="automatic">Automatic</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
