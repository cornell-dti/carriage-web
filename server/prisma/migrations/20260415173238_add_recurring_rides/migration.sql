/*
  Warnings:

  - You are about to drop the column `exdate` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `parentRideId` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `rdate` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `rrule` on the `Ride` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "exdate",
DROP COLUMN "parentRideId",
DROP COLUMN "rdate",
DROP COLUMN "rrule",
ADD COLUMN     "recurrenceDays" INTEGER[],
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Ride_recurrenceId_idx" ON "Ride"("recurrenceId");
