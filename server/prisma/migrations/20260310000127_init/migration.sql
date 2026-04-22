-- CreateEnum
CREATE TYPE "RideType" AS ENUM ('UPCOMING', 'PAST', 'ACTIVE');

-- CreateEnum
CREATE TYPE "SchedulingState" AS ENUM ('SCHEDULED', 'UNSCHEDULED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('NOT_STARTED', 'ON_THE_WAY', 'ARRIVED', 'PICKED_UP', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THURS', 'FRI');

-- CreateEnum
CREATE TYPE "Accessibility" AS ENUM ('ASSISTANT', 'CRUTCHES', 'WHEELCHAIR', 'MOTOR_SCOOTER', 'KNEE_SCOOTER', 'LOW_VISION', 'SERVICE_ANIMALS');

-- CreateEnum
CREATE TYPE "Organization" AS ENUM ('REDRUNNER', 'CULIFT');

-- CreateEnum
CREATE TYPE "LocationTag" AS ENUM ('EAST', 'CENTRAL', 'NORTH', 'WEST', 'CTOWN', 'DTOWN', 'INACTIVE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'RIDER', 'DRIVER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SDS_ADMIN', 'REDRUNNER_ADMIN');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('NOT_STARTED', 'ON_THE_WAY', 'ARRIVED', 'PICKED_UP', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "info" TEXT,
    "tag" "LocationTag" NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "photoLink" TEXT,
    "images" TEXT[],

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoLink" TEXT,
    "availability" "DayOfWeek"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT NOT NULL,
    "accessibility" "Accessibility"[],
    "organization" "Organization",
    "description" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "address" TEXT,
    "photoLink" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "type" "RideType" NOT NULL DEFAULT 'UPCOMING',
    "status" "RideStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "schedulingState" "SchedulingState" NOT NULL DEFAULT 'UNSCHEDULED',
    "startLocationId" TEXT NOT NULL,
    "endLocationId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "driverId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "rrule" TEXT,
    "exdate" TEXT[],
    "rdate" TEXT[],
    "parentRideId" TEXT,
    "recurrenceId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "favoritedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","rideId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roles" "AdminRole"[],
    "isDriver" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoLink" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "year" TEXT NOT NULL,
    "monthDay" TEXT NOT NULL,
    "dayCount" INTEGER NOT NULL DEFAULT 0,
    "dayNoShow" INTEGER NOT NULL DEFAULT 0,
    "dayCancel" INTEGER NOT NULL DEFAULT 0,
    "nightCount" INTEGER NOT NULL DEFAULT 0,
    "nightNoShow" INTEGER NOT NULL DEFAULT 0,
    "nightCancel" INTEGER NOT NULL DEFAULT 0,
    "drivers" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("year","monthDay")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "notifEvent" "NotificationEvent" NOT NULL,
    "userID" TEXT NOT NULL,
    "rideID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "timeSent" TIMESTAMP(3) NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RideRiders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RideRiders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_email_key" ON "Rider"("email");

-- CreateIndex
CREATE INDEX "Ride_startTime_idx" ON "Ride"("startTime");

-- CreateIndex
CREATE INDEX "Ride_endTime_idx" ON "Ride"("endTime");

-- CreateIndex
CREATE INDEX "Ride_driverId_idx" ON "Ride"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "_RideRiders_B_index" ON "_RideRiders"("B");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_startLocationId_fkey" FOREIGN KEY ("startLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_endLocationId_fkey" FOREIGN KEY ("endLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_rideID_fkey" FOREIGN KEY ("rideID") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RideRiders" ADD CONSTRAINT "_RideRiders_A_fkey" FOREIGN KEY ("A") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RideRiders" ADD CONSTRAINT "_RideRiders_B_fkey" FOREIGN KEY ("B") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
