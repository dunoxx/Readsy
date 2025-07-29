-- CreateTable
CREATE TABLE "SuggestedBook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "publisher" TEXT,
    "totalPages" INTEGER,
    "edition" TEXT,
    "coverUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "suggestedById" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuggestedBook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuggestedBook" ADD CONSTRAINT "fk_suggested_book_user" FOREIGN KEY ("suggestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedBook" ADD CONSTRAINT "fk_suggested_book_reviewer" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
