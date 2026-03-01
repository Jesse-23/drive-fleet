import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

// CREATE CAR
router.post("/", async (req, res) => {
  const { brand, model, year, price_per_day } = req.body;

  try {
    const newCar = await pool.query(
      "INSERT INTO cars (brand, model, year, price_per_day) VALUES ($1, $2, $3, $4) RETURNING *",
      [brand, model, year, price_per_day]
    );

    res.status(201).json(newCar.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating car" });
  }
});

// GET ALL CARS
router.get("/", async (req, res) => {
  try {
    const cars = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    res.json(cars.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});

export default router;

// UPDATE CARS
router.post("/", async (req, res) => {
  try {
    const { brand, model, year, price_per_day } = req.body;

    const newCar = await pool.query(
      `INSERT INTO cars (brand, model, year, price_per_day)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [brand, model, year, price_per_day]
    );

    res.status(201).json(newCar.rows[0]);
  } catch (error) {
    console.error("CREATE CAR ERROR:", error);
    res.status(500).json({ message: "Error creating car" });
  }
});


// UPDATE CAR
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, year, price_per_day, available } = req.body;

    const updatedCar = await pool.query(
      `UPDATE cars
       SET brand = $1,
           model = $2,
           year = $3,
           price_per_day = $4,
           available = $5
       WHERE id = $6
       RETURNING *`,
      [brand, model, year, price_per_day, available, id]
    );

    if (updatedCar.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(updatedCar.rows[0]);
  } catch (error) {
    console.error("UPDATE CAR ERROR:", error);
    res.status(500).json({ message: "Error updating car" });
  }
});

//DELETE CAR
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCar = await pool.query(
      "DELETE FROM cars WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedCar.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car deleted successfully", car: deletedCar.rows[0] });
  } catch (error) {
    console.error("DELETE CAR ERROR:", error);
    res.status(500).json({ message: "Error deleting car" });
  }
});