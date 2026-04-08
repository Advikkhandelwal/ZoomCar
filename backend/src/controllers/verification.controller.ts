import { Response } from "express";
import * as verificationService from "../services/verification.service";
import { AuthRequest } from "../types";

export const uploadDocs = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const { aadhaarNumber, drivingLicenseNumber } = req.body;

        if (!aadhaarNumber && !drivingLicenseNumber) {
            return res.status(400).json({ error: "No documents provided" });
        }

        const user = await verificationService.uploadVerificationDocs(userId, { aadhaarNumber, drivingLicenseNumber });
        res.json(user);
    } catch (error: any) {
        console.error("Error uploading verification docs:", error);
        res.status(500).json({ error: "Failed to upload verification documents", message: error.message });
    }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, isVerified } = req.body;

        // In a real app, this would be admin-only
        const user = await verificationService.verifyUser(Number(userId), isVerified);
        res.json(user);
    } catch (error: any) {
        console.error("Error verifying user:", error);
        res.status(500).json({ error: "Failed to verify user", message: error.message });
    }
};

export const getStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const status = await verificationService.getVerificationStatus(userId);
        res.json(status);
    } catch (error: any) {
        console.error("Error getting verification status:", error);
        res.status(500).json({ error: "Failed to fetch verification status", message: error.message });
    }
};
