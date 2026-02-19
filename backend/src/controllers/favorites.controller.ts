import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types";

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const carId = Number(req.body.carId);

        if (isNaN(carId)) {
            return res.status(400).json({ error: "Invalid carId" });
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_carId: {
                    userId,
                    carId,
                },
            },
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            res.json({ message: "Removed from favorites", isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId,
                    carId,
                },
            });
            res.json({ message: "Added to favorites", isFavorite: true });
        }
    } catch (error) {
        console.error("Toggle favorite error:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                car: true,
            },
        });

        // Transform to return list of cars
        const favoritedCars = favorites.map(fav => ({
            ...fav.car,
            favoritedAt: (fav as any).createdAt
        }));

        res.json(favoritedCars);
    } catch (error) {
        console.error("Get favorites error:", error);
        res.status(500).json({ error: "Failed to get favorites" });
    }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.id;
        const carId = Number(req.params.carId);

        if (isNaN(carId)) {
            return res.status(400).json({ error: "Invalid carId" });
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_carId: {
                    userId,
                    carId,
                },
            },
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error("Check favorite error:", error);
        res.status(500).json({ error: "Failed to check favorite status" });
    }
};
