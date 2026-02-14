import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Car className="h-5 w-5 text-accent" />
            <span>DriveFleet</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 DriveFleet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
