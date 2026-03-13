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
const PORT = process.env.PORT || 5000;

// TEST DATABASE CONNECTION
pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch((err) => console.error("DB Connection Error:", err));

app.use(cors({
  origin: ["http://localhost:5173", "https://drive-fleet.pxxl.click/"],
  credentials: true,
}))
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DriveFleet Backend Running 🚗");
});

app.use("/api/cars", carRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/stats", statsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
