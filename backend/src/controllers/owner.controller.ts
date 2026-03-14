import { Response } from "express";
import * as ownerService from "../services/owner.service";
import * as bookingService from "../services/booking.service";
import { AuthRequest } from "../types";

export const addCar = async (req: AuthRequest, res: Response) => {
  try {
    const { brand, model, engine, fuelType, color, pricePerDay, location } = req.body;

    if (!brand || !model || !fuelType || !pricePerDay || !location) {
      return res.status(400).json({
        error: "Missing required fields: brand, model, fuelType, pricePerDay, location"
      });
    }

    const numericPrice = Math.round(Number(pricePerDay));
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        error: "Invalid pricePerDay. It must be a positive number.",
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    let image = req.body.image;

    if (req.file) {
      image = (req.file as any).supabaseUrl;
    }

    const car = await ownerService.addCar(ownerId, {
      ...req.body,
      pricePerDay: numericPrice,
      image,
      transmission: req.body.transmission || 'Manual',
      seats: req.body.seats ? parseInt(req.body.seats) : 5,
      latitude: (req.body.latitude && req.body.latitude.trim() !== '') ? parseFloat(req.body.latitude) : null,
      longitude: (req.body.longitude && req.body.longitude.trim() !== '') ? parseFloat(req.body.longitude) : null,
    });

    res.status(201).json(car);
  } catch (error: any) {
    console.error("Error adding car:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid owner. Please make sure your user account exists before adding a car.",
        message: error.meta?.field || undefined,
      });
    }

    res
      .status(500)
      .json({ error: "Failed to add car", message: error.message });
  }
};

export const getOwnerCars = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    const cars = await ownerService.getCars(ownerId);
    res.json(cars);
  } catch (error: any) {
    console.error("Error getting owner cars:", error);
    res.status(500).json({ error: "Failed to fetch owner cars", message: error.message });
  }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = (req.file as any).supabaseUrl;
    }

    const carId = Number(req.params.id);
    const car = await ownerService.updateCar(carId, ownerId, updateData);

    if (!car) {
      return res.status(404).json({ error: "Car not found or you don't have permission to update it" });
    }

    res.json(car);
  } catch (error: any) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car", message: error.message });
  }
};

export const deleteCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    const carId = Number(req.params.id);
    const car = await ownerService.deleteCar(carId, ownerId);

    if (!car) {
      return res.status(404).json({ error: "Car not found or you don't have permission to delete it" });
    }

    res.json({ message: "Car deleted successfully", car });
  } catch (error: any) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Failed to delete car", message: error.message });
  }
};

export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    const bookings = await bookingService.getOwnerBookings(ownerId);

    const sanitized = bookings.map((b: any) => {
      const booking = { ...b };

      if (booking.user) {
        booking.user = { ...booking.user };
        if (!["APPROVED", "ACTIVE", "COMPLETED"].includes(booking.status)) {
          delete booking.user.phone;
        }
      }
      return booking;
    });

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error getting owner bookings:", error);
    res.status(500).json({ error: "Failed to fetch owner bookings", message: error.message });
  }
};

export const updateOwnerBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const ownerId = req.user.id;
    const { status } = req.body;

    if (!status || !["PENDING", "APPROVED", "ACTIVE", "CANCELLED", "COMPLETED"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Invalid status. Must be PENDING, APPROVED, ACTIVE, CANCELLED, or COMPLETED"
      });
    }

    await bookingService.autoCompletePastBookings();

    const bookingId = Number(req.params.id);
    const booking = await bookingService.updateBookingStatusByOwner(
      bookingId,
      ownerId,
      status
    );

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found or you don't have permission to update it",
      });
    }

    const sanitized: any = { ...booking };

    if (sanitized.user) {
      sanitized.user = { ...sanitized.user };
      if (!["APPROVED", "ACTIVE", "COMPLETED"].includes(sanitized.status)) {
        delete sanitized.user.phone;
      }
    }

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error updating owner booking status:", error);
    if (error.message.includes("Cannot confirm") || error.message.includes("already booked")) {
      return res.status(409).json({ error: error.message, message: error.message });
    }
    res.status(500).json({ error: "Failed to update booking status", message: error.message });
  }
};
