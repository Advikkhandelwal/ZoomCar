import prisma from "../config/prisma";

export interface CarFilters {
  location?: string;
  brand?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  seats?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
}

export const getAllCars = async () => {
  return prisma.car.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCar = async (id: string | number) => {
  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return car;
};

export const searchCars = async (filters: CarFilters) => {
  const where: any = {};

  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }
  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: 'insensitive' };
  }
  if (filters.model) {
    where.model = { contains: filters.model, mode: 'insensitive' };
  }
  if (filters.fuelType) {
    where.fuelType = filters.fuelType;
  }
  if (filters.transmission) {
    where.transmission = filters.transmission;
  }
  if (filters.seats) {
    where.seats = { gte: parseInt(filters.seats) }; // Filter by minimum seats
  }
  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    where.pricePerDay = { ...where.pricePerDay, gte: parseFloat(filters.minPrice) };
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    where.pricePerDay = { ...where.pricePerDay, lte: parseFloat(filters.maxPrice) };
  }

  // Availability Check
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      where.bookings = {
        none: {
          status: 'APPROVED', // Standard status for confirmed/approved bookings
          OR: [
            {
              // Case 1: Booking starts during the requested period
              startDate: { gte: start, lte: end }
            },
            {
              // Case 2: Booking ends during the requested period
              endDate: { gte: start, lte: end }
            },
            {
              // Case 3: Booking covers the entire requested period
              startDate: { lte: start },
              endDate: { gte: end }
            }
          ]
        }
      };
    }
  }

  let orderBy: any = { createdAt: 'desc' }; // Default sort
  if (filters.sortBy) {
    if (filters.sortBy === 'priceAsc') {
      orderBy = { pricePerDay: 'asc' };
    } else if (filters.sortBy === 'priceDesc') {
      orderBy = { pricePerDay: 'desc' };
    }
  }

  const cars = await prisma.car.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: filters.sortBy !== 'rating' ? orderBy : { averageRating: 'desc' },
  });

  return cars;
};

export const createCar = async (carData: any) => {
  // Ensure ownerId is a number
  if (carData.ownerId) {
    carData.ownerId = Number(carData.ownerId);
  }
  return prisma.car.create({
    data: carData,
  });
};

export const getCarsNearby = async ({ lat, lng, radiusInKm = 10 }: { lat: string | number; lng: string | number; radiusInKm?: string | number }) => {
  const latitude = parseFloat(lat.toString());
  const longitude = parseFloat(lng.toString());
  const radius = parseFloat(radiusInKm.toString());

  // Haversine formula to find cars within radius
  const nearbyCarsRaw = await prisma.$queryRaw<any[]>`
    SELECT 
      c.id,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(c.latitude))
        )
      ) AS distance
    FROM "Car" c
    WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
    AND (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(c.latitude))
        )
      ) < ${radius}
    ORDER BY distance ASC;
  `;

  if (nearbyCarsRaw.length === 0) return [];

  const carIds: number[] = nearbyCarsRaw.map(c => Number(c.id));
  const cars = await prisma.car.findMany({
    where: { id: { in: carIds } },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Re-attach distance and sort
  return nearbyCarsRaw.map(raw => {
    const car = cars.find(c => c.id === Number(raw.id));
    return { ...car, distance: raw.distance };
  });
};

export const updateCar = async (id: string | number, carData: any) => {
  // Ensure ownerId is a number if present
  if (carData.ownerId) {
    carData.ownerId = Number(carData.ownerId);
  }
  return prisma.car.update({
    where: { id: Number(id) },
    data: carData,
  });
};

export const deleteCar = async (id: string | number) => {
  const carId = Number(id);

  // Use a transaction to delete all associated records
  return prisma.$transaction(async (tx) => {
    // 1. Delete associated Favorites
    await tx.favorite.deleteMany({
      where: { carId }
    });

    // 2. Delete associated Reviews
    await tx.review.deleteMany({
      where: { carId }
    });

    // 3. Delete associated Bookings
    await tx.booking.deleteMany({
      where: { carId }
    });

    // 4. Finally delete the Car
    return tx.car.delete({
      where: { id: carId }
    });
  });
};
