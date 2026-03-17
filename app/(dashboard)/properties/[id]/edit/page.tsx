"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Schema ──────────────────────────────────────────────────

const propertyFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "VILLA", "LOFT"]),
  listingType: z.enum(["ENTIRE_PLACE", "PRIVATE_ROOM", "SHARED_ROOM"]),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE", "OFFLINE"]),
  agencyId: z.string().min(1, "L'agence est requise"),
  cityId: z.string().min(1, "La ville est requise"),
  address: z.string().min(1, "L'adresse est requise"),
  district: z.string().optional().default(""),
  floor: z.coerce.number().int().optional(),
  building: z.string().optional().default(""),
  surfaceArea: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).default(1),
  beds: z.coerce.number().int().min(0).default(1),
  bathrooms: z.coerce.number().int().min(0).default(1),
  maxGuests: z.coerce.number().int().min(1).default(2),
  totalRooms: z.coerce.number().int().min(0).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]),
  amenities: z.array(z.string()).default([]),
  monthlyRent: z.coerce.number().positive("Le loyer est requis"),
  deposit: z.coerce.number().positive().optional(),
  commissionRate: z.coerce.number().min(0).max(100),
  utilities: z.coerce.number().positive().optional(),
  discountWeekly: z.coerce.number().min(0).max(100).optional(),
  discountBiweekly: z.coerce.number().min(0).max(100).optional(),
  discountMonthly: z.coerce.number().min(0).max(100).optional(),
  discountQuarterly: z.coerce.number().min(0).max(100).optional(),
  discountYearly: z.coerce.number().min(0).max(100).optional(),
  leaseStartDate: z.string().optional().default(""),
  leaseEndDate: z.string().optional().default(""),
  minLeaseDuration: z.coerce.number().int().min(1).optional(),
  contractRef: z.string().optional().default(""),
  photos: z.array(z.string()).default([]),
  coverPhoto: z.string().optional().default(""),
  description: z.string().optional().default(""),
  descriptionCn: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  isFeatured: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

// ─── Constants ───────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "ROOM", label: "Chambre" },
  { value: "STUDIO", label: "Studio" },
  { value: "VILLA", label: "Villa" },
  { value: "LOFT", label: "Loft" },
];

const LISTING_TYPES = [
  { value: "ENTIRE_PLACE", label: "Logement entier" },
  { value: "PRIVATE_ROOM", label: "Chambre privée" },
  { value: "SHARED_ROOM", label: "Chambre partagée" },
];

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RENTED", label: "Loué" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OFFLINE", label: "Hors ligne" },
];

const FURNISHING_OPTIONS = [
  { value: "FURNISHED", label: "Meublé" },
  { value: "SEMI_FURNISHED", label: "Semi-meublé" },
  { value: "UNFURNISHED", label: "Non meublé" },
];

const AMENITIES_LIST = [
  { value: "wifi", label: "WiFi" },
  { value: "kitchen", label: "Cuisine" },
  { value: "parking", label: "Parking" },
  { value: "pool", label: "Piscine" },
  { value: "ac", label: "Climatisation" },
  { value: "heating", label: "Chauffage" },
  { value: "washer", label: "Lave-linge" },
  { value: "dryer", label: "Sèche-linge" },
  { value: "tv", label: "TV" },
  { value: "elevator", label: "Ascenseur" },
];

// ─── Helpers ─────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#222222]">
      {children}
    </h3>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDefaultValues(property: any): PropertyFormData {
  return {
    title: property.title ?? "",
    type: property.type ?? "APARTMENT",
    listingType: property.listingType ?? "ENTIRE_PLACE",
    status: property.status ?? "AVAILABLE",
    agencyId: property.agencyId ?? "",
    cityId: property.cityId ?? "",
    address: property.address ?? "",
    district: property.district ?? "",
    floor: property.floor != null ? Number(property.floor) : undefined,
    building: property.building ?? "",
    surfaceArea: property.surfaceArea != null ? Number(property.surfaceArea) : undefined,
    bedrooms: Number(property.bedrooms) || 1,
    beds: Number(property.beds) || 1,
    bathrooms: Number(property.bathrooms) || 1,
    maxGuests: Number(property.maxGuests) || 2,
    totalRooms: property.totalRooms != null ? Number(property.totalRooms) : undefined,
    furnishing: property.furnishing ?? "FURNISHED",
    amenities: property.amenities ?? [],
    monthlyRent: Number(property.monthlyRent) || 0,
    deposit: property.deposit != null ? Number(property.deposit) : undefined,
    commissionRate: Number(property.commissionRate) || 30,
    utilities: property.utilities != null ? Number(property.utilities) : undefined,
    discountWeekly: property.discountWeekly != null ? Number(property.discountWeekly) : undefined,
    discountBiweekly: property.discountBiweekly != null ? Number(property.discountBiweekly) : undefined,
    discountMonthly: property.discountMonthly != null ? Number(property.discountMonthly) : undefined,
    discountQuarterly: property.discountQuarterly != null ? Number(property.discountQuarterly) : undefined,
    discountYearly: property.discountYearly != null ? Number(property.discountYearly) : undefined,
    leaseStartDate: property.leaseStartDate ? new Date(property.leaseStartDate).toISOString().split("T")[0] : "",
    leaseEndDate: property.leaseEndDate ? new Date(property.leaseEndDate).toISOString().split("T")[0] : "",
    minLeaseDuration: property.minLeaseDuration != null ? Number(property.minLeaseDuration) : undefined,
    contractRef: property.contractRef ?? "",
    photos: property.photos ?? [],
    coverPhoto: property.coverPhoto ?? "",
    description: property.description ?? "",
    descriptionCn: property.descriptionCn ?? "",
    notes: property.notes ?? "",
    isFeatured: Boolean(property.isFeatured),
  };
}

// ─── Page ─────────────────────────────────────────────────────

export default function PropertyEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: propertyData, isLoading: isLoadingProperty } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetch(`/api/properties/${id}`).then((r) => r.json()),
  });

  const { data: citiesData } = useQuery<{ success: boolean; data: { id: string; name: string; pinyin: string }[] }>({
    queryKey: ["cities"],
    queryFn: () => fetch("/api/cities?active=true").then((r) => r.json()),
  });

  const { data: agenciesData } = useQuery<{ success: boolean; data: { id: string; name: string }[] }>({
    queryKey: ["agencies"],
    queryFn: () => fetch("/api/agencies?status=ACTIVE").then((r) => r.json()),
  });

  const property = propertyData?.data;
  const cities = citiesData?.data ?? [];
  const agencies = agenciesData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertyFormSchema) as any,
  });

  useEffect(() => {
    if (property) {
      reset(getDefaultValues(property));
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const cleaned = {
        ...data,
        district: data.district || null,
        building: data.building || null,
        floor: data.floor || null,
        surfaceArea: data.surfaceArea || null,
        totalRooms: data.totalRooms || null,
        deposit: data.deposit || null,
        utilities: data.utilities || null,
        discountWeekly: data.discountWeekly || null,
        discountBiweekly: data.discountBiweekly || null,
        discountMonthly: data.discountMonthly || null,
        discountQuarterly: data.discountQuarterly || null,
        discountYearly: data.discountYearly || null,
        leaseStartDate: data.leaseStartDate || null,
        leaseEndDate: data.leaseEndDate || null,
        minLeaseDuration: data.minLeaseDuration || null,
        contractRef: data.contractRef || null,
        coverPhoto: data.coverPhoto || null,
        description: data.description || null,
        descriptionCn: data.descriptionCn || null,
        notes: data.notes || null,
        photos: data.photos.filter(Boolean),
      };

      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Propriété modifiée");
      router.push("/properties");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const watchType = watch("type");
  const watchListingType = watch("listingType");
  const watchStatus = watch("status");
  const watchFurnishing = watch("furnishing");
  const watchAgencyId = watch("agencyId");
  const watchCityId = watch("cityId");
  const amenities = watch("amenities") ?? [];
  const photos = watch("photos") ?? [];

  function toggleAmenity(value: string) {
    if (amenities.includes(value)) {
      setValue("amenities", amenities.filter((a) => a !== value));
    } else {
      setValue("amenities", [...amenities, value]);
    }
  }

  function addPhotoField() {
    setValue("photos", [...photos, ""]);
  }

  function removePhotoField(index: number) {
    setValue("photos", photos.filter((_, i) => i !== index));
  }

  function updatePhoto(index: number, value: string) {
    const updated = [...photos];
    updated[index] = value;
    setValue("photos", updated);
  }

  if (isLoadingProperty) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-semibold text-[#222222]">Propriété introuvable</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/properties")}
        >
          Retour aux propriétés
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* ─── Header ─────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/properties")}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Modifier la propriété</h1>
          <p className="text-sm text-[#6A6A6A]">{property.title}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/properties")}
            disabled={mutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="property-edit-form"
            disabled={mutation.isPending}
            className="bg-[#FF385C] text-white hover:bg-[#E0294D]"
          >
            <Save className="size-4" />
            {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {/* ─── Form ───────────────────────────────── */}
      <form
        id="property-edit-form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-8"
      >
        {/* ─── Identité ────────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Identité</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Appartement lumineux centre-ville"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={watchType}
                onValueChange={(val) => val && setValue("type", val as PropertyFormData["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type de bien" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Type d&apos;annonce *</Label>
              <Select
                value={watchListingType}
                onValueChange={(val) => val && setValue("listingType", val as PropertyFormData["listingType"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type d'annonce" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select
                value={watchStatus}
                onValueChange={(val) => val && setValue("status", val as PropertyFormData["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ─── Localisation ─────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Localisation</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Agence *</Label>
              <Select
                value={watchAgencyId}
                onValueChange={(val) => val && setValue("agencyId", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une agence" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agencyId && <p className="text-xs text-red-500">{errors.agencyId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Ville *</Label>
              <Select
                value={watchCityId}
                onValueChange={(val) => val && setValue("cityId", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.pinyin} ({c.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && <p className="text-xs text-red-500">{errors.cityId.message}</p>}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="123 rue Exemple"
                aria-invalid={!!errors.address}
              />
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district">Quartier</Label>
              <Input id="district" {...register("district")} placeholder="Quartier / District" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="floor">Étage</Label>
              <Input id="floor" type="number" {...register("floor", { valueAsNumber: true })} placeholder="3" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="building">Bâtiment</Label>
              <Input id="building" {...register("building")} placeholder="Tour A" />
            </div>
          </div>
        </div>

        {/* ─── Caractéristiques ─────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Caractéristiques</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="surfaceArea">Surface (m²)</Label>
              <Input id="surfaceArea" type="number" step="0.01" {...register("surfaceArea", { valueAsNumber: true })} placeholder="45" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Chambres</Label>
              <Input id="bedrooms" type="number" {...register("bedrooms", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="beds">Lits</Label>
              <Input id="beds" type="number" {...register("beds", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Salles de bain</Label>
              <Input id="bathrooms" type="number" {...register("bathrooms", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxGuests">Capacité max</Label>
              <Input id="maxGuests" type="number" {...register("maxGuests", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totalRooms">Total pièces</Label>
              <Input id="totalRooms" type="number" {...register("totalRooms", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Ameublement</Label>
              <Select
                value={watchFurnishing}
                onValueChange={(val) => val && setValue("furnishing", val as PropertyFormData["furnishing"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ameublement" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHING_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ─── Équipements ──────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Équipements</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {AMENITIES_LIST.map((amenity) => (
              <label
                key={amenity.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EBEBEB] p-2.5 text-sm transition-colors hover:border-[#FF385C]/30 has-[:checked]:border-[#FF385C] has-[:checked]:bg-[#FF385C]/5"
              >
                <input
                  type="checkbox"
                  className="accent-[#FF385C]"
                  checked={amenities.includes(amenity.value)}
                  onChange={() => toggleAmenity(amenity.value)}
                />
                {amenity.label}
              </label>
            ))}
          </div>
        </div>

        {/* ─── Financier ───────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Financier</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="monthlyRent">Loyer /mois (EUR) *</Label>
              <Input
                id="monthlyRent"
                type="number"
                step="0.01"
                {...register("monthlyRent", { valueAsNumber: true })}
                placeholder="5000"
                aria-invalid={!!errors.monthlyRent}
              />
              {errors.monthlyRent && <p className="text-xs text-red-500">{errors.monthlyRent.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deposit">Caution (EUR)</Label>
              <Input id="deposit" type="number" step="0.01" {...register("deposit", { valueAsNumber: true })} placeholder="10000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                {...register("commissionRate", { valueAsNumber: true })}
                placeholder="30"
                aria-invalid={!!errors.commissionRate}
              />
              {errors.commissionRate && <p className="text-xs text-red-500">{errors.commissionRate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utilities">Charges (EUR)</Label>
              <Input id="utilities" type="number" step="0.01" {...register("utilities", { valueAsNumber: true })} placeholder="500" />
            </div>
          </div>
        </div>

        {/* ─── Réductions durée ─────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Réductions durée (%)</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="discountWeekly">Hebdo</Label>
              <Input id="discountWeekly" type="number" step="0.01" {...register("discountWeekly", { valueAsNumber: true })} placeholder="5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountBiweekly">Bi-hebdo</Label>
              <Input id="discountBiweekly" type="number" step="0.01" {...register("discountBiweekly", { valueAsNumber: true })} placeholder="8" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountMonthly">Mensuel</Label>
              <Input id="discountMonthly" type="number" step="0.01" {...register("discountMonthly", { valueAsNumber: true })} placeholder="10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountQuarterly">Trimestriel</Label>
              <Input id="discountQuarterly" type="number" step="0.01" {...register("discountQuarterly", { valueAsNumber: true })} placeholder="15" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountYearly">Annuel</Label>
              <Input id="discountYearly" type="number" step="0.01" {...register("discountYearly", { valueAsNumber: true })} placeholder="20" />
            </div>
          </div>
        </div>

        {/* ─── Contrat ─────────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Contrat</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="leaseStartDate">Début du bail</Label>
              <Input id="leaseStartDate" type="date" {...register("leaseStartDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leaseEndDate">Fin du bail</Label>
              <Input id="leaseEndDate" type="date" {...register("leaseEndDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minLeaseDuration">Durée min. (mois)</Label>
              <Input id="minLeaseDuration" type="number" {...register("minLeaseDuration", { valueAsNumber: true })} placeholder="6" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contractRef">Réf. contrat</Label>
              <Input id="contractRef" {...register("contractRef")} placeholder="CTR-2024-001" />
            </div>
          </div>
        </div>

        {/* ─── Médias ──────────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Médias</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="coverPhoto">Photo de couverture (URL)</Label>
              <Input id="coverPhoto" {...register("coverPhoto")} placeholder="https://example.com/photo.jpg" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Photos supplémentaires (URLs)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPhotoField}>
                  + Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {photos.map((photo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={photo}
                      onChange={(e) => updatePhoto(index, e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removePhotoField(index)}
                      className="shrink-0 text-destructive"
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (FR)</Label>
              <Textarea id="description" {...register("description")} placeholder="Description de la propriété..." rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descriptionCn">Description (CN)</Label>
              <Textarea id="descriptionCn" {...register("descriptionCn")} placeholder="房产描述..." rows={3} />
            </div>
          </div>
        </div>

        {/* ─── Meta ────────────────────────────────── */}
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 space-y-5">
          <SectionTitle>Meta</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Notes visibles uniquement par l'équipe..." rows={2} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="accent-[#FF385C]" {...register("isFeatured")} />
              Propriété en vedette
            </label>
          </div>
        </div>

        {/* ─── Bottom CTA ──────────────────────────── */}
        <div className="flex justify-end gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/properties")}
            disabled={mutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#FF385C] text-white hover:bg-[#E0294D]"
          >
            <Save className="size-4" />
            {mutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
