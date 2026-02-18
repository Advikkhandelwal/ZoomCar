const { PrismaClient } = require('@prisma/client');
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    car: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

module.exports = { mockPrisma };
