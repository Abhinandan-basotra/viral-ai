-- CreateTable
CREATE TABLE "Tunes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "Tunes_pkey" PRIMARY KEY ("id")
);
