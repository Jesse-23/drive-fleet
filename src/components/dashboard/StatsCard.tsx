import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatsCard({ label, value, icon: Icon, accent }: Props) {
  return (
    <div className="rounded-xl bg-card p-5 card-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-bold", accent && "text-accent")}>{value}</p>
        </div>
        <div className={cn("rounded-lg p-2.5", accent ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
