import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import carRoutes from "./routes/car.routes";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "https://drive-fleet.pxxl.click"],
  credentials: true,
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("DriveFleet Backend Running 🚗");
});

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

// Test DB connection
pool.query("SELECT 1")
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch((err) => console.error("DB Connection Error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});