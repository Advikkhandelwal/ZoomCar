import express from "express";
import { uploadDocs, getStatus, verifyUser } from "../controllers/verification.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/upload", authenticateToken, uploadDocs);
router.get("/status", authenticateToken, getStatus);
router.post("/verify", authenticateToken, verifyUser); // Admin simulation

export default router;
