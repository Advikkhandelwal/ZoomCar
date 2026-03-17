import { Response } from "express";
import * as bookingService from "../services/booking.service";
import { AuthRequest } from "../types";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields: carId, startDate, endDate" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const booking = await bookingService.createBooking(userId, req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking", message: error.message });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const bookings = await bookingService.getBookings(userId);

    const sanitized = bookings.map((b: any) => {
      const booking = { ...b };

      if (booking.car && booking.car.owner) {
        booking.car = { ...booking.car, owner: { ...booking.car.owner } };
        // Phone visibility: Owner sees renter phone if APPROVED or ACTIVE
        if (!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(booking.status)) {
          delete booking.car.owner.phone;
        }
      }
      return booking;
    });

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error getting bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings", message: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const bookingId = Number(req.params.id);
    const booking = await bookingService.getBookingById(bookingId, userId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const sanitized: any = { ...booking };

    if (sanitized.car && sanitized.car.owner) {
      sanitized.car = { ...sanitized.car, owner: { ...sanitized.car.owner } };
      if (!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(sanitized.status)) {
        delete sanitized.car.owner.phone;
      }
    }

    if (sanitized.user) {
      sanitized.user = { ...sanitized.user };
      if (!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(sanitized.status)) {
        delete sanitized.user.phone;
      }
    }

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error getting booking:", error);
    res.status(500).json({ error: "Failed to fetch booking", message: error.message });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    const { status } = req.body;

    // Validate status if provided
    if (status && !['PENDING', 'APPROVED', 'ACTIVE', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be PENDING, APPROVED, ACTIVE, CANCELLED, or COMPLETED" });
    }

    const bookingId = Number(req.params.id);
    const booking = await bookingService.updateBooking(bookingId, userId, req.body);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found or you don't have permission to update it" });
    }

    const sanitized: any = { ...booking };

    if (sanitized.car && sanitized.car.owner) {
      sanitized.car = { ...sanitized.car, owner: { ...sanitized.car.owner } };
      if (!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(sanitized.status)) {
        delete sanitized.car.owner.phone;
      }
    }
    if (sanitized.user) {
      sanitized.user = { ...sanitized.user };
      if (!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(sanitized.status)) {
        delete sanitized.user.phone;
      }
    }

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking", message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.id;
    // Verify booking belongs to user before cancelling
    const bookingId = Number(req.params.id);
    const booking = await bookingService.getBookingById(bookingId, userId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or you don't have permission to cancel it" });
    }
    const cancelledBooking = await bookingService.cancelBooking(bookingId);
    const sanitized: any = { ...cancelledBooking };

    if (sanitized.car && sanitized.car.owner) {
      sanitized.car = { ...sanitized.car, owner: { ...sanitized.car.owner } };
      delete sanitized.car.owner.phone;
    }
    if (sanitized.user) {
      sanitized.user = { ...sanitized.user };
      delete sanitized.user.phone;
    }

    res.json({ message: "Booking cancelled", booking: sanitized });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking", message: error.message });
  }
};

export const checkAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const { startDate, endDate } = req.query as any;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const available = await bookingService.checkAvailability(carId, startDate, endDate);
    res.json({ available });
  } catch (error: any) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Failed to check availability", message: error.message });
  }
};

export const getCarBookings = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const bookings = await bookingService.getCarBookings(carId);    
    const sanitized = bookings.map((b: any) => ({
      id: b.id,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status
    }));

    res.json(sanitized);
  } catch (error: any) {
    console.error("Error getting car bookings:", error);
    res.status(500).json({ error: "Failed to fetch car bookings", message: error.message });
  }
};
