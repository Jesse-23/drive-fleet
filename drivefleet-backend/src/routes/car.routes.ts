import { Router } from "express";
import { pool } from "../config/db";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// PUBLIC CARS (for Browse Cars page)
router.get("/public", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cars WHERE deleted_at IS NULL AND available = true ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET PUBLIC CARS ERROR:", error);
    res.status(500).json({ message: "Error fetching public cars" });
  }
});

// DELETED CARS (archive)
router.get("/deleted", async (_req, res) => {
  try {
    const cars = await pool.query(
      "SELECT * FROM cars WHERE deleted_at IS NOT NULL ORDER BY created_at DESC"
    );
    res.json(cars.rows);
  } catch (error) {
    console.error("FETCH DELETED CARS ERROR:", error);
    res.status(500).json({ message: "Error fetching deleted cars" });
  }
});

// SINGLE CAR (for CarDetails page)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM cars WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET CAR ERROR:", error);
    res.status(500).json({ message: "Error fetching car" });
  }
});

// ALL ACTIVE CARS (admin list)
router.get("/", async (_req, res) => {
  try {
    const cars = await pool.query(
      "SELECT * FROM cars WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );
    res.json(cars.rows);
  } catch (error) {
    console.error("FETCH CARS ERROR:", error);
    res.status(500).json({ message: "Error fetching cars" });
  }
});

// CREATE CAR
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      category = "Sedan",
      transmission = "automatic",
      price_per_day,
      image_url = "",
      seats = 5,
      fuel_type = "Gasoline",
      available = true,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO cars
      (name, brand, category, transmission, price_per_day, image_url, seats, fuel_type, available)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        name,
        brand,
        category,
        transmission,
        price_per_day,
        image_url,
        seats,
        fuel_type,
        available,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("CREATE CAR ERROR:", error);
    res.status(500).json({ message: error.message, detail: error.detail });
  }
});

// UPDATE CAR
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const current = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const payload = { ...current.rows[0], ...req.body };

    const result = await pool.query(
      `UPDATE cars SET
        name=$1,
        brand=$2,
        category=$3,
        transmission=$4,
        price_per_day=$5,
        image_url=$6,
        seats=$7,
        fuel_type=$8,
        available=$9
      WHERE id=$10
      RETURNING *`,
      [
        payload.name,
        payload.brand,
        payload.category,
        payload.transmission,
        payload.price_per_day,
        payload.image_url,
        payload.seats,
        payload.fuel_type,
        payload.available,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE CAR ERROR:", error);
    res.status(500).json({ message: "Error updating car" });
  }
});

// ARCHIVE CAR
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE cars SET deleted_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car archived", car: result.rows[0] });
  } catch (error) {
    console.error("ARCHIVE CAR ERROR:", error);
    res.status(500).json({ message: "Error archiving car" });
  }
});

// RESTORE CAR
router.post("/:id/restore", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE cars SET deleted_at = NULL WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car restored", car: result.rows[0] });
  } catch (error) {
    console.error("RESTORE CAR ERROR:", error);
    res.status(500).json({ message: "Error restoring car" });
  }
});

export default router;