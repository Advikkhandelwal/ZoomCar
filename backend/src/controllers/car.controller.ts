import { Response } from "express";
import * as carService from "../services/car.service";
import { AuthRequest } from "../types";

export const searchCars = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query as any;
    const cars = await carService.searchCars(filters);
    res.json(cars);
  } catch (error: any) {
    console.error("Error searching cars:", error);
    res.status(500).json({ error: "Failed to search cars", message: error.message });
  }
};

export const getCars = async (req: AuthRequest, res: Response) => {
  try {
    // If query parameters exist (excluding empty ones), treat as search
    const hasFilters = Object.values(req.query).some(val => typeof val === 'string' && val.trim() !== '');

    if (hasFilters) {
      return searchCars(req, res);
    }

    const cars = await carService.getAllCars();
    res.json(cars);
  } catch (error: any) {
    console.error("Error getting cars:", error);
    res.status(500).json({ error: "Failed to fetch cars", message: error.message });
  }
};

export const getCarById = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.id);
    const car = await carService.getCar(carId);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error: any) {
    console.error("Error getting car:", error);
    res.status(500).json({ error: "Failed to fetch car", message: error.message });
  }
};

export const createCar = async (req: AuthRequest, res: Response) => {
  try {
    const { brand, model, engine, fuelType, color, pricePerDay, location, transmission, seats, image } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id; 

    if (!brand || !model || !fuelType || !pricePerDay || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const carData = {
      brand,
      model,
      engine,
      fuelType,
      color,
      pricePerDay: parseFloat(pricePerDay),
      location,
      transmission: transmission || 'Manual',
      seats: seats ? parseInt(seats) : 5,   
      image,
      ownerId,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
    };

    const newCar = await carService.createCar(carData);
    res.status(201).json(newCar);
  } catch (error: any) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Failed to create car", message: error.message });
  }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.id);
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;

    const existingCar = await carService.getCar(carId);
    if (!existingCar) return res.status(404).json({ error: "Car not found" });
    if (existingCar.ownerId !== userId) return res.status(403).json({ error: "Unauthorized" });

    const updatedCar = await carService.updateCar(carId, req.body);
    res.json(updatedCar);
  } catch (error: any) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car", message: error.message });
  }
};

export const deleteCar = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.id);
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;

    const existingCar = await carService.getCar(carId);
    if (!existingCar) return res.status(404).json({ error: "Car not found" });
    if (existingCar.ownerId !== userId) return res.status(403).json({ error: "Unauthorized" });

    await carService.deleteCar(carId);
    res.json({ message: "Car deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Failed to delete car", message: error.message });
  }
};

export const getNearbyCars = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius } = req.query as any;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const cars = await carService.getCarsNearby({ lat, lng, radiusInKm: radius });
    res.json(cars);
  } catch (error: any) {
    console.error("Error fetching nearby cars:", error);
    res.status(500).json({ error: "Failed to fetch nearby cars", message: error.message });
  }
};
