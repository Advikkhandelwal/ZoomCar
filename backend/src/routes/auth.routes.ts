import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateMe,
  googleAuth,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateMe);
router.post("/logout", authenticateToken, logout);
router.post("/google", googleAuth);

export default router;
