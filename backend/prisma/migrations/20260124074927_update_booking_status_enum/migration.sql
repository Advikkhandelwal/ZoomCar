/*
  Warnings:

  - The values [CONFIRMED] on the enum `Booking_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `status` ENUM('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
