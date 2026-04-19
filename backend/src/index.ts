import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";

// Routes
import authRoutes from "./routes/auth.routes";
import carRoutes from "./routes/car.routes";
import ownerRoutes from "./routes/owner.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";
import favoritesRoutes from "./routes/favorites.routes";
import verificationRoutes from "./routes/verification.routes";
import tripRoutes from "./routes/trip.routes";

const app = express();

/* -------- MIDDLEWARE -------- */
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Debug middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* -------- ROUTES -------- */

// Health check / root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "ZoomCar backend running 🚗" });
});

// Feature routes
app.use("/auth", authRoutes);
app.use("/cars", carRoutes);
app.use("/owner", ownerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/users", userRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/verification", verificationRoutes);
app.use("/trips", tripRoutes);

/* -------- ERROR HANDLER -------- */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

/* -------- SERVER -------- */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

