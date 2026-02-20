import prisma from "../config/prisma";
import supabase from "../config/supabase";

export const addCar = (ownerId: number, data: any) => {
  return prisma.car.create({
    data: {
      ownerId,
      brand: data.brand,
      model: data.model,
      engine: data.engine,
      fuelType: data.fuelType,
      color: data.color,
      pricePerDay: Math.round(Number(data.pricePerDay)),
      location: data.location,
      image: data.image ?? null,
      transmission: data.transmission,
      seats: data.seats,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};

export const getCars = (ownerId: number) => {
  return prisma.car.findMany({
    where: { ownerId },
  });
};

export const updateCar = async (carId: string | number, ownerId: number, data: any) => {
  // Verify car belongs to owner
  const car = await prisma.car.findFirst({
    where: { id: Number(carId), ownerId },
  });

  if (!car) {
    return null;
  }

  return prisma.car.update({
    where: { id: Number(carId) },
    data: {
      brand: data.brand,
      model: data.model,
      engine: data.engine,
      fuelType: data.fuelType,
      color: data.color,
      pricePerDay: data.pricePerDay ? Number(data.pricePerDay) : undefined,
      location: data.location,
      image: data.image,
      transmission: data.transmission,
      seats: data.seats ? parseInt(data.seats) : undefined,
      latitude: (data.latitude !== undefined && data.latitude !== null) ? parseFloat(data.latitude) : undefined,
      longitude: (data.longitude !== undefined && data.longitude !== null) ? parseFloat(data.longitude) : undefined,
    },
  });
};

export const deleteCar = async (carId: string | number, ownerId: number) => {
  // Verify car belongs to owner
  const car = await prisma.car.findFirst({
    where: { id: Number(carId), ownerId },
  });

  if (!car) {
    return null;
  }

  const id = Number(carId);

  // Use a transaction to delete all associated records
  return prisma.$transaction(async (tx) => {
    // 1. Delete associated Favorites
    await tx.favorite.deleteMany({
      where: { carId: id }
    });

    // 2. Delete associated Reviews
    await tx.review.deleteMany({
      where: { carId: id }
    });

    // 3. Delete associated Bookings
    await tx.booking.deleteMany({
      where: { carId: id }
    });

    // 4. Delete image from Supabase Storage if it exists and is a Supabase URL
    if (car.image && car.image.includes('supabase.co')) {
      try {
        const urlParts = car.image.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from('car-images')
          .remove([fileName]);
        console.log(`Deleted image from storage: ${fileName}`);
      } catch (storageError) {
        console.error("Failed to delete image from storage:", storageError);
        // We don't fail the transaction if storage deletion fails, 
        // as the DB record should still be removed.
      }
    }

    // 5. Finally delete the Car
    return tx.car.delete({
      where: { id }
    });
  });
};
