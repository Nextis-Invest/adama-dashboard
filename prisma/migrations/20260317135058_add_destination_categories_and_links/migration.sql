-- CreateTable
CREATE TABLE "destination_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_links" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destination_categories_name_key" ON "destination_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "destination_categories_slug_key" ON "destination_categories"("slug");

-- CreateIndex
CREATE INDEX "destination_links_categoryId_idx" ON "destination_links"("categoryId");

-- AddForeignKey
ALTER TABLE "destination_links" ADD CONSTRAINT "destination_links_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "destination_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
