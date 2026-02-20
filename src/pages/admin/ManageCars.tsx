import { useState, useEffect } from "react";
import type { Car, Transmission } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = {
  name: "", brand: "", category: "Sedan", transmission: "automatic" as Transmission,
  price_per_day: 50, image_url: "", seats: 5, fuel_type: "Gasoline", available: true,
};

export default function ManageCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = () => api.getAllCarsAdmin().then(setCars);
  useEffect(() => { load(); }, []);

  const handleOpen = (car?: Car) => {
    if (car) {
      setEditId(car.id);
      setForm({
        name: car.name, brand: car.brand, category: car.category,
        transmission: car.transmission, price_per_day: car.price_per_day,
        image_url: car.image_url, seats: car.seats, fuel_type: car.fuel_type,
        available: car.available,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.updateCar(editId, form);
        toast({ title: "Car updated" });
      } else {
        await api.createCar(form);
        toast({ title: "Car added" });
      }
      setOpen(false);
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteCar(id);
    toast({ title: "Car deleted" });
    load();
  };

  const toggleAvailability = async (car: Car) => {
    await api.updateCar(car.id, { available: !car.available });
    toast({ title: car.available ? "Car hidden from listings" : "Car is now available" });
    load();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Cars</h1>
          <p className="text-muted-foreground">{cars.length} vehicles in fleet</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => handleOpen()}>
              <Plus className="mr-1 h-4 w-4" /> Add Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Car" : "Add New Car"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required /></div>
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Sedan", "SUV", "Sports", "Electric", "Economy", "Luxury"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transmission</Label>
                  <Select value={form.transmission} onValueChange={(v: any) => setForm({ ...form, transmission: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Price/Day ($)</Label><Input type="number" value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: +e.target.value })} required /></div>
                <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: +e.target.value })} required /></div>
                <div><Label>Fuel</Label><Input value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} required /></div>
              </div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
              <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Car" : "Add Car"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {cars.map((car) => (
          <div key={car.id} className="flex items-center gap-4 rounded-xl bg-card p-4 card-shadow">
            <img src={car.image_url} alt={car.name} className="h-14 w-20 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{car.brand} {car.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">{car.category}</Badge>
                <span>${car.price_per_day}/day</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <Switch
                  checked={car.available}
                  onCheckedChange={() => toggleAvailability(car)}
                  aria-label="Toggle availability"
                />
                <span className="text-xs text-muted-foreground">{car.available ? "Listed" : "Hidden"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpen(car)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(car.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
