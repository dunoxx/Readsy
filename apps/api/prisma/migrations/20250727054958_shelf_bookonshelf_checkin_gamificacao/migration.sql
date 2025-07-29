/*
  Warnings:

  - You are about to drop the `_BookToShelf` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BookToShelf" DROP CONSTRAINT "_BookToShelf_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookToShelf" DROP CONSTRAINT "_BookToShelf_B_fkey";

-- DropTable
DROP TABLE "_BookToShelf";

-- CreateTable
CREATE TABLE "BookOnShelf" (
    "id" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookOnShelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookOnShelf_shelfId_bookId_key" ON "BookOnShelf"("shelfId", "bookId");

-- AddForeignKey
ALTER TABLE "BookOnShelf" ADD CONSTRAINT "BookOnShelf_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookOnShelf" ADD CONSTRAINT "BookOnShelf_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
