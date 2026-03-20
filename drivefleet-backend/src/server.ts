import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import carRoutes from "./routes/car.routes";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app", "https://drive-fleet.pxxl.click"
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("DriveFleet backend running ");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

export default app;