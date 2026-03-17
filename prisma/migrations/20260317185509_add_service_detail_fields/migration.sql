-- AlterTable
ALTER TABLE "services" ADD COLUMN     "content" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "ctaHref" TEXT,
ADD COLUMN     "ctaLabel" TEXT,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
