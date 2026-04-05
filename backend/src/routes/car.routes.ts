import express from "express";
import { 
  searchCars, 
  getCars, 
  getNearbyCars, 
  getCarById, 
  createCar, 
  updateCar, 
  deleteCar 
} from "../controllers/car.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/search", searchCars);
router.get("/", getCars);
router.get("/nearby", getNearbyCars);
router.get("/:id", getCarById);
router.post("/", authenticateToken, createCar);
router.put("/:id", authenticateToken, updateCar);
router.delete("/:id", authenticateToken, deleteCar);

export default router;
