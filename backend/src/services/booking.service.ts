import prisma from "../config/prisma";

export const checkAvailability = async (carId: string | number, startDate: string | Date, endDate: string | Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      carId: Number(carId),
      status: { in: ["APPROVED", "ACTIVE"] } as any, // Cast to any to bypass enum mismatch if needed
      OR: [
        {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      ],
    },
  });

  return !overlappingBooking;
};

export const createBooking = async (userId: number, data: any) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const today = new Date();
  
  // Check if user is verified
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true }
  });

  if (!user?.isVerified) {
    throw new Error("Please verify your identity in your profile before booking a car");
  }

  // Check if user is the owner
  const car = await prisma.car.findUnique({
    where: { id: Number(data.carId) },
    select: { ownerId: true }
  });

  if (!car) {
    throw new Error("Car not found");
  }

  if (car.ownerId === userId) {
    throw new Error("You cannot book your own car");
  }
  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  if (startDate < today) {
    throw new Error("Start date cannot be in the past");
  }

  if (endDate <= startDate) {
    throw new Error("End date must be after start date");
  }

  // Check for date conflicts with existing APPROVED or ACTIVE bookings
  const isAvailable = await checkAvailability(data.carId, data.startDate, data.endDate);
  if (!isAvailable) {
    throw new Error("Car is not available for the selected dates (Already Booked)");
  }

  return prisma.booking.create({
    data: {
      userId,
      carId: Number(data.carId),
      startDate,
      endDate,
      status: "PENDING",
    },
  });
};

export const getBookings = (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
    },
  });
};

export const getBookingById = (id: string | number, userId: number) => {
  return prisma.booking.findFirst({
    where: {
      id: Number(id),
      userId
    },
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });
};

export const updateBooking = async (id: string | number, userId: number, data: any) => {
  const booking = await prisma.booking.findFirst({
    where: { id: Number(id), userId },
  });

  if (!booking) {
    return null;
  }

  const updateData: any = {};
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.status) updateData.status = data.status;

  return prisma.booking.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });
};

export const cancelBooking = async (id: string | number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
  });

  if (!booking) {
    return null;
  }

  return prisma.booking.update({
    where: { id: Number(id) },
    data: { status: "CANCELLED" },
  });
};

// Owner-side helpers
export const getOwnerBookings = (ownerId: number) => {
  return prisma.booking.findMany({
    where: {
      car: {
        ownerId,
      },
    },
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });
};

export const updateBookingStatusByOwner = async (id: string | number, ownerId: number, status: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(id),
      car: {
        ownerId,
      },
    },
  });

  if (!booking) {
    return null;
  }

  // If APPROVING, we must strictly check if there are overlaps with other APPROVED/ACTIVE bookings
  // This prevents double booking when multiple PENDING requests exist
  if (status === "APPROVED") {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: Number(id) },
        status: { in: ["APPROVED", "ACTIVE"] } as any,
        OR: [
          {
            startDate: { lte: booking.endDate },
            endDate: { gte: booking.startDate },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new Error("Cannot approve: Car is already booked (Approved/Active) for these dates");
    }
  }

  const updateData = { status: status as any };

  const updated = await prisma.booking.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  return updated;
};

export const getCarBookings = (carId: string | number) => {
  return prisma.booking.findMany({
    where: {
      carId: Number(carId),
      status: { in: ["PENDING", "APPROVED", "ACTIVE", "COMPLETED"] } as any,
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
};

// Auto-complete past bookings (should be called periodically or on booking fetch)
export const autoCompletePastBookings = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updated = await prisma.booking.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: today },
    },
    data: {
      status: "COMPLETED",
    },
  });

  return updated.count;
};
