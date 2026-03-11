import { Router } from "express";
import { pool } from "../config/db";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// CREATE BOOKING
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { car_id, start_date, end_date } = req.body;

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({ message: "car_id, start_date and end_date are required" });
    }

    const carResult = await pool.query(
      "SELECT id, price_per_day FROM cars WHERE id = $1 AND deleted_at IS NULL",
      [car_id]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const conflictResult = await pool.query(
      `SELECT id FROM bookings
       WHERE car_id = $1
         AND status IN ('pending', 'approved')
         AND start_date <= $3
         AND end_date >= $2`,
      [car_id, start_date, end_date]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: "Car is not available for selected dates" });
    }

    const pricePerDay = Number(carResult.rows[0].price_per_day);

    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const totalPrice = days * pricePerDay;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, car_id, start_date, end_date, totalPrice]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { car_id, start_date, end_date } = req.body;

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({ message: "car_id, start_date and end_date are required" });
    }

    const carResult = await pool.query(
      "SELECT id, price_per_day FROM cars WHERE id = $1 AND deleted_at IS NULL",
      [car_id]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    // prevent overlapping bookings
    const conflictResult = await pool.query(
      `SELECT id FROM bookings
       WHERE car_id = $1
         AND status IN ('pending', 'approved')
         AND start_date <= $3
         AND end_date >= $2`,
      [car_id, start_date, end_date]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        message: "Car is not available for the selected dates",
      });
    }

    const pricePerDay = Number(carResult.rows[0].price_per_day);

    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const totalPrice = days * pricePerDay;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, car_id, start_date, end_date, totalPrice]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

// GET MY BOOKINGS
router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
         b.*,
         c.name AS car_name,
         c.brand AS car_brand,
         c.image_url
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// GET ALL BOOKINGS (ADMIN)
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         u.name AS user_name,
         u.email AS user_email,
         c.name AS car_name,
         c.brand AS car_brand
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN cars c ON c.id = b.car_id
       ORDER BY b.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Error fetching all bookings" });
  }
});

// UPDATE BOOKING STATUS (ADMIN)
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "approved", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);
    res.status(500).json({ message: "Error updating booking status" });
  }
});

export default router;