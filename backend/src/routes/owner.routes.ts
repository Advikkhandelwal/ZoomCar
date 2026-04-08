import express from "express";
import {
  addCar,
  getOwnerCars,
  updateCar,
  deleteCar,
  getOwnerBookings,
  updateOwnerBookingStatus,
} from "../controllers/owner.controller";
import { upload, uploadToSupabase } from "../middlewares/upload.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// All owner routes require authentication
router.post("/cars", authenticateToken, upload.single('image'), uploadToSupabase, addCar);
router.get("/cars", authenticateToken, getOwnerCars);
router.put("/cars/:id", authenticateToken, upload.single('image'), uploadToSupabase, updateCar);
router.delete("/cars/:id", authenticateToken, deleteCar);

// Bookings for cars owned by the authenticated user
router.get("/bookings", authenticateToken, getOwnerBookings);
router.put("/bookings/:id/status", authenticateToken, updateOwnerBookingStatus);

export default router;
