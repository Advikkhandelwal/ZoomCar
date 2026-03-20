import prisma from "../config/prisma";

export const uploadVerificationDocs = async (userId: number, data: { aadhaarNumber?: string; drivingLicenseNumber?: string }) => {
    const { aadhaarNumber, drivingLicenseNumber } = data;

    return prisma.user.update({
        where: { id: userId },
        data: {
            aadhaarNumber: aadhaarNumber || undefined,
            drivingLicenseNumber: drivingLicenseNumber || undefined,
            // Instant verification for this simulation
            isVerified: true,
        },
        select: {
            id: true,
            name: true,
            isVerified: true,
            aadhaarNumber: true,
            drivingLicenseNumber: true,
        }
    });
};

export const verifyUser = async (userId: number, isVerified: boolean) => {
    return prisma.user.update({
        where: { id: userId },
        data: { isVerified },
        select: {
            id: true,
            name: true,
            isVerified: true,
        }
    });
};

export const getVerificationStatus = async (userId: number) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            isVerified: true,
            aadhaarNumber: true,
            drivingLicenseNumber: true,
        }
    });
};
