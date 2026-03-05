import { PrismaClient } from "@prisma/client";

/**
 * Reusable Prisma client instance to prevent multiple connection pools
 * from being created during application lifecycle.
 */
const prisma = new PrismaClient({
    // Enable logging in development mode to help with debugging
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
