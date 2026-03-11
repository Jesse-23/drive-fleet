import { Router } from "express";
import { pool } from "../config/db";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const totalCarsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM cars WHERE deleted_at IS NULL"
    );

    const totalBookingsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM bookings"
    );

    const totalRevenueResult = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0)::float AS total FROM bookings WHERE status IN ('approved', 'completed')"
    );

    const activeBookingsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'approved'"
    );

    const pendingBookingsResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'pending'"
    );

    res.json({
      totalCars: totalCarsResult.rows[0].count,
      totalBookings: totalBookingsResult.rows[0].count,
      totalRevenue: totalRevenueResult.rows[0].total,
      activeBookings: activeBookingsResult.rows[0].count,
      pendingBookings: pendingBookingsResult.rows[0].count,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;