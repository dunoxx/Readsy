/*
  Warnings:

  - You are about to drop the column `planType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "planType",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
