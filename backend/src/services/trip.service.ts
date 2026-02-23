import prisma from "../config/prisma";

export const uploadTripPhotos = async (bookingId: string | number, userId: number, type: 'pre' | 'post', photos: string[]) => {
    // Validate booking ownership
    const booking = await prisma.booking.findFirst({
        where: {
            id: Number(bookingId),
            OR: [
                { userId: userId },
                { car: { ownerId: userId } }
            ]
        }
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    const photosJson = JSON.stringify(photos);
    const updateData: any = {};

    if (type === 'pre') {
        updateData.preTripPhotos = photosJson;
    } else if (type === 'post') {
        updateData.postTripPhotos = photosJson;
    } else {
        throw new Error("Invalid photo type. Must be 'pre' or 'post'");
    }

    return prisma.booking.update({
        where: { id: Number(bookingId) },
        data: updateData
    });
};

export const getTripPhotos = async (bookingId: string | number, userId: number) => {
    const booking = await prisma.booking.findFirst({
        where: {
            id: Number(bookingId),
            OR: [
                { userId: userId },
                { car: { ownerId: userId } }
            ]
        },
        select: {
            preTripPhotos: true,
            postTripPhotos: true
        }
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    return {
        preTripPhotos: booking.preTripPhotos ? JSON.parse(booking.preTripPhotos) : [],
        postTripPhotos: booking.postTripPhotos ? JSON.parse(booking.postTripPhotos) : []
    };
};
