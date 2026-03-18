import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import carRoutes from "./routes/car.routes";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

console.log("Booting DriveFleet backend...");
console.log("PORT =", process.env.PORT);
console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("DATABASE_URL exists =", !!process.env.DATABASE_URL);
console.log("JWT_SECRET exists =", !!process.env.JWT_SECRET);

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
// pool.query("SELECT 1")
//   .then(() => console.log("PostgreSQL Connected ✅"))
//   .catch((err) => console.error("DB Connection Error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});