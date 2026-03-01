import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import carRoutes from "./routes/car.routes";

dotenv.config();

const app = express();
const PORT = 5000;

// TEST DATABASE CONNECTION
pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch((err) => console.error("DB Connection Error:", err));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DriveFleet MVP Backend Running 🚗");
});

app.use("/api/cars", carRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
