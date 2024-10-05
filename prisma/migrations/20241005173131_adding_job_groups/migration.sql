-- CreateTable
CREATE TABLE "JobGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Shared" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_JobToJobGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_JobGroupToShared" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobToJobGroup_AB_unique" ON "_JobToJobGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_JobToJobGroup_B_index" ON "_JobToJobGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JobGroupToShared_AB_unique" ON "_JobGroupToShared"("A", "B");

-- CreateIndex
CREATE INDEX "_JobGroupToShared_B_index" ON "_JobGroupToShared"("B");
