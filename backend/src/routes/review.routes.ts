import express from "express";
import {
  addReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  checkEligibility,
} from "../controllers/review.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// POST, PUT, DELETE require authentication; GET routes are public
router.post("/", authenticateToken, addReview);
router.get("/user", authenticateToken, getUserReviews); // Specific path before generic :id
router.get("/car/:carId", getReviews);
router.get("/eligibility/:bookingId", authenticateToken, checkEligibility);
router.get("/:id", getReviewById);
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

export default router;
