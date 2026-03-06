import express from "express";
import { uploadPhotos, getPhotos } from "../controllers/trip.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/photos", authenticateToken, uploadPhotos);
router.get("/photos/:bookingId", authenticateToken, getPhotos);

export default router;
