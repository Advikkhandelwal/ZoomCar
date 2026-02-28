import prisma from "../config/prisma";

export const addReview = async (userId: number, data: { carId: string | number; bookingId: string | number; rating: number; comment?: string }) => {
  const { carId, bookingId, rating, comment } = data;

  // Verify booking exists, is completed, belongs to user, and hasn't been reviewed
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      carId: Number(carId),
      status: "COMPLETED",
    },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found, not completed, or doesn't belong to you");
  }

  // Cast to any to access included review relation safely
  if ((booking as any).review) {
    throw new Error("This booking has already been reviewed");
  }

  return prisma.$transaction(async (tx) => {
    // Create the review
    const review = await tx.review.create({
      data: {
        userId,
        carId: Number(carId),
        bookingId: Number(bookingId),
        rating,
        comment: comment || "",
      },
    });

    // Update the car's pre-calculated fields
    const car = await tx.car.findUnique({
      where: { id: Number(carId) },
      select: { averageRating: true, reviewCount: true },
    });

    if (car) {
      const newReviewCount = car.reviewCount + 1;
      const newAverageRating =
        ((car.averageRating * car.reviewCount) + rating) / newReviewCount;

      await tx.car.update({
        where: { id: Number(carId) },
        data: {
          reviewCount: newReviewCount,
          averageRating: Math.round(newAverageRating * 10) / 10,
        },
      });
    }

    return review;
  });
};

export const getReviews = (carId: string | number) => {
  return prisma.review.findMany({
    where: { carId: Number(carId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // phone intentionally excluded from public reviews
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getReviewById = (id: string | number) => {
  return prisma.review.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // phone intentionally excluded from public review detail
        },
      },
      car: true,
    },
  });
};

export const updateReview = async (id: string | number, userId: number, data: { rating?: number; comment?: string }) => {
  // Verify review belongs to user
  const review = await prisma.review.findFirst({
    where: { id: Number(id), userId },
  });

  if (!review) {
    return null;
  }

  const updateData: any = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.comment !== undefined) updateData.comment = data.comment;

  return prisma.review.update({
    where: { id: Number(id) },
    data: updateData,
  });
};

export const deleteReview = async (id: string | number, userId: number) => {
  // Verify review belongs to user
  const review = await prisma.review.findFirst({
    where: { id: Number(id), userId },
  });

  if (!review) {
    return null;
  }

  return prisma.review.delete({
    where: { id: Number(id) },
  });
};

export const getUserReviews = (userId: number) => {
  return prisma.review.findMany({
    where: { userId },
    include: {
      car: {
        select: {
          id: true,
          brand: true,
          model: true,
          image: true,
          owner: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const checkReviewEligibility = async (userId: number, bookingId: string | number) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      status: "COMPLETED",
    },
    include: {
      review: true,
    },
  });

  if (!booking) return false;

  // Cast to any to access included review relation safely
  if ((booking as any).review) return false;

  return true;
};
