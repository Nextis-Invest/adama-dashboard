"use client";

import { Badge } from "@/components/ui/badge";
import {
  BedDouble,
  Bath,
  Users,
  BedSingle,
  MapPin,
  Percent,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    type: string;
    listingType: string;
    status: string;
    coverPhoto: string | null;
    city: { name: string; pinyin: string };
    agency: { name: string };
    district: string | null;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    maxGuests: number;
    monthlyRent: string | number;
    commissionRate: string | number;
    isFeatured: boolean;
    _count: { payments: number };
  };
  onEdit: (property: PropertyCardProps["property"]) => void;
  onDelete: (property: PropertyCardProps["property"]) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  AVAILABLE: { label: "Disponible", variant: "default" },
  RENTED: { label: "Loué", variant: "secondary" },
  MAINTENANCE: { label: "Maintenance", variant: "outline" },
  OFFLINE: { label: "Hors ligne", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  ROOM: "Chambre",
  STUDIO: "Studio",
  VILLA: "Villa",
  LOFT: "Loft",
};

export function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const router = useRouter();
  const statusInfo = statusConfig[property.status] ?? {
    label: property.status,
    variant: "outline" as const,
  };

  return (
    <div className="group overflow-hidden rounded-xl bg-white ring-1 ring-[#EBEBEB] shadow-sm transition-shadow hover:shadow-md">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {property.coverPhoto ? (
          <img
            src={property.coverPhoto}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF385C]/10 via-[#FF385C]/5 to-[#F7F7F7]">
            <BedDouble className="size-10 text-[#FF385C]/30" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={statusInfo.variant} className="text-xs">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Featured badge */}
        {property.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#FF385C] text-white text-xs">
              Vedette
            </Badge>
          </div>
        )}

        {/* Actions menu */}
        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-white/90 backdrop-blur-sm"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/properties/${property.id}/edit`)}>
                <Pencil className="size-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(property)}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Type + listing type */}
        <div className="mb-1 flex items-center gap-1.5 text-xs text-[#6A6A6A]">
          <span>{typeLabels[property.type] ?? property.type}</span>
          <span className="text-[#DDDDDD]">&middot;</span>
          <span>{property.agency.name}</span>
        </div>

        {/* Title */}
        <h3 className="mb-1 truncate text-[15px] font-semibold text-[#222222]">
          {property.title}
        </h3>

        {/* Location */}
        <div className="mb-2.5 flex items-center gap-1 text-xs text-[#6A6A6A]">
          <MapPin className="size-3" />
          <span className="truncate">
            {property.city.pinyin}
            {property.district ? `, ${property.district}` : ""}
          </span>
        </div>

        {/* Icons row */}
        <div className="mb-3 flex items-center gap-3 text-xs text-[#6A6A6A]">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3.5" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <BedSingle className="size-3.5" />
            {property.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3.5" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {property.maxGuests}
          </span>
        </div>

        {/* Price + commission */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-[#222222]">
              {Number(property.monthlyRent).toLocaleString("fr-FR")} €
            </span>
            <span className="text-xs text-[#6A6A6A]"> /mois</span>
          </div>
          <span className="flex items-center gap-0.5 text-xs text-[#6A6A6A]">
            <Percent className="size-3" />
            {Number(property.commissionRate)}%
          </span>
        </div>
      </div>
    </div>
  );
}
