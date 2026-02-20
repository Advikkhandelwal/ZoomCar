import { Response } from "express";
import * as tripService from "../services/trip.service";
import { AuthRequest } from "../types";

export const uploadPhotos = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const { bookingId, type, photos } = req.body;

        if (!bookingId || !type || !photos) {
            return res.status(400).json({ error: "Missing required fields: bookingId, type, photos" });
        }

        const updatedBooking = await tripService.uploadTripPhotos(bookingId, userId, type, photos);
        res.json(updatedBooking);
    } catch (error: any) {
        console.error("Error uploading trip photos:", error);
        res.status(500).json({ error: "Failed to upload trip photos", message: error.message });
    }
};

export const getPhotos = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const { bookingId } = req.params;

        const bookingIdNum = Number(bookingId);

        const photos = await tripService.getTripPhotos(bookingIdNum, userId);
        res.json(photos);
    } catch (error: any) {
        console.error("Error getting trip photos:", error);
        res.status(500).json({ error: "Failed to fetch trip photos", message: error.message });
    }
};
