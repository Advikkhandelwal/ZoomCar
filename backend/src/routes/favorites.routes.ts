import express from "express";
import { toggleFavorite, getFavorites, checkFavorite } from "../controllers/favorites.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all favorite routes
router.use(authenticateToken);

router.post("/", toggleFavorite);
router.get("/", getFavorites);
router.get("/check/:carId", checkFavorite);

export default router;
