import express from "express";
import { getMe, updateMe, getUserById } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { upload, uploadToSupabase } from "../middlewares/upload.middleware";

const router = express.Router();

// All user routes require authentication
router.get("/profile", authenticateToken, getMe);
router.put("/profile", authenticateToken, upload.single('image'), uploadToSupabase, updateMe);
router.get("/:id", authenticateToken, getUserById);

export default router;
