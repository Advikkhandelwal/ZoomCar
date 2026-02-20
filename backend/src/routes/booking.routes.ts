import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkAvailability,
  getCarBookings,
} from "../controllers/booking.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// All booking routes require authentication
router.post("/", authenticateToken, createBooking);
router.get("/", authenticateToken, getBookings);
router.get("/:id", authenticateToken, getBookingById);
router.put("/:id", authenticateToken, updateBooking);
router.delete("/:id", authenticateToken, cancelBooking);
router.get("/check-availability/:carId", checkAvailability); // Public endpoint for checking availability
router.get("/car/:carId", getCarBookings); // Public endpoint for car booking calendar

export default router;


