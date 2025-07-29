/*
  Warnings:

  - You are about to drop the column `asin` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn10` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wishlistSlug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "asin",
DROP COLUMN "isbn10";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wishlistSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_wishlistSlug_key" ON "User"("wishlistSlug");
