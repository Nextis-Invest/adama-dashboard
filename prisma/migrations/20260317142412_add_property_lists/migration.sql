-- CreateTable
CREATE TABLE "property_lists" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tag" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_list_items" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "property_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_lists_slug_key" ON "property_lists"("slug");

-- CreateIndex
CREATE INDEX "property_list_items_listId_idx" ON "property_list_items"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "property_list_items_listId_propertyId_key" ON "property_list_items"("listId", "propertyId");

-- AddForeignKey
ALTER TABLE "property_list_items" ADD CONSTRAINT "property_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "property_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_list_items" ADD CONSTRAINT "property_list_items_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
