import { Response } from "express";
import * as reviewService from "../services/review.service";
import { AuthRequest } from "../types";

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, bookingId, rating } = req.body;

    if (!carId || !bookingId || !rating) {
      return res.status(400).json({ error: "Missing required fields: carId, bookingId, rating" });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const review = await reviewService.addReview(userId, {
      ...req.body,
      rating: numericRating
    });
    res.status(201).json(review);
  } catch (error: any) {
    console.error("Error adding review:", error);
    
    // Handle specific errors
    if (error.message.includes("not found") || 
        error.message.includes("not completed") ||
        error.message.includes("already been reviewed")) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to add review", message: error.message });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const reviews = await reviewService.getReviews(carId);
    res.json(reviews);
  } catch (error: any) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews", message: error.message });
  }
};

export const getReviewById = async (req: AuthRequest, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await reviewService.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (error: any) {
    console.error("Error getting review:", error);
    res.status(500).json({ error: "Failed to fetch review", message: error.message });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const { rating } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const reviewId = Number(req.params.id);
    const review = await reviewService.updateReview(reviewId, userId, req.body);

    if (!review) {
      return res.status(404).json({ error: "Review not found or you don't have permission to update it" });
    }

    res.json(review);
  } catch (error: any) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review", message: error.message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const reviewId = Number(req.params.id);
    const review = await reviewService.deleteReview(reviewId, userId);

    if (!review) {
      return res.status(404).json({ error: "Review not found or you don't have permission to delete it" });
    }

    res.json({ message: "Review deleted successfully", review });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review", message: error.message });
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const reviews = await reviewService.getUserReviews(userId);
    res.json(reviews);
  } catch (error: any) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews", message: error.message });
  }
};

export const checkEligibility = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const { bookingId } = req.params;

    const bookingIdNum = Number(bookingId);
    // Check if user has a completed booking for this car that hasn't been reviewed yet
    const isEligible = await reviewService.checkReviewEligibility(userId, bookingIdNum);

    res.json({ eligible: isEligible });
  } catch (error: any) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({ error: "Failed to check eligibility", message: error.message });
  }
};
