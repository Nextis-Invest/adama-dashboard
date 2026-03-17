"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// ─── Types ───────────────────────────────────────────────────

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Record<string, unknown> | null | undefined;
}

interface CityItem {
  id: string;
  name: string;
  pinyin: string;
}

interface AgencyItem {
  id: string;
  name: string;
}

// ─── Component ───────────────────────────────────────────────

export function PropertyFormDialog({
  open,
  onOpenChange,
  property,
}: PropertyFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!property;

  const { data: citiesData } = useQuery<{ success: boolean; data: CityItem[] }>({
    queryKey: ["cities"],
    queryFn: () => fetch("/api/cities?active=true").then((r) => r.json()),
    enabled: open,
  });

  const { data: agenciesData } = useQuery<{ success: boolean; data: AgencyItem[] }>({
    queryKey: ["agencies"],
    queryFn: () => fetch("/api/agencies?status=ACTIVE").then((r) => r.json()),
    enabled: open,
  });

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
    defaultValues: getDefaultValues(property),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(property));
    }
  }, [open, property, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const url = isEdit
        ? `/api/properties/${(property as Record<string, unknown>).id}`
        : "/api/properties";
      const method = isEdit ? "PUT" : "POST";

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

      const res = await fetch(url, {
        method,
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
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      onOpenChange(false);
    },
  });

  // Watched values for Select components
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
      setValue(
        "amenities",
        amenities.filter((a) => a !== value)
      );
    } else {
      setValue("amenities", [...amenities, value]);
    }
  }

  function addPhotoField() {
    setValue("photos", [...photos, ""]);
  }

  function removePhotoField(index: number) {
    setValue(
      "photos",
      photos.filter((_, i) => i !== index)
    );
  }

  function updatePhoto(index: number, value: string) {
    const updated = [...photos];
    updated[index] = value;
    setValue("photos", updated);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Modifier la propriété" : "Nouvelle propriété"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations de la propriété."
              : "Remplissez les informations pour créer une nouvelle propriété."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <form
            id="property-form"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-6 pb-6"
          >
            {/* ─── Identité ────────────────────────────── */}
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
                {errors.title && (
                  <p className="text-xs text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select
                  value={watchType}
                  onValueChange={(val) =>
                    val && setValue("type", val as PropertyFormData["type"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type de bien" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Type d&apos;annonce *</Label>
                <Select
                  value={watchListingType}
                  onValueChange={(val) =>
                    val && setValue("listingType", val as PropertyFormData["listingType"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type d'annonce" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select
                  value={watchStatus}
                  onValueChange={(val) =>
                    val && setValue("status", val as PropertyFormData["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ─── Localisation ─────────────────────────── */}
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
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.agencyId && (
                  <p className="text-xs text-red-500">
                    {errors.agencyId.message}
                  </p>
                )}
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
                      <SelectItem key={c.id} value={c.id}>
                        {c.pinyin} ({c.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cityId && (
                  <p className="text-xs text-red-500">
                    {errors.cityId.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="123 rue Exemple"
                  aria-invalid={!!errors.address}
                />
                {errors.address && (
                  <p className="text-xs text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">Quartier</Label>
                <Input
                  id="district"
                  {...register("district")}
                  placeholder="Quartier / District"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="floor">Étage</Label>
                <Input
                  id="floor"
                  type="number"
                  {...register("floor", { valueAsNumber: true })}
                  placeholder="3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="building">Bâtiment</Label>
                <Input
                  id="building"
                  {...register("building")}
                  placeholder="Tour A"
                />
              </div>
            </div>

            <Separator />

            {/* ─── Caractéristiques ─────────────────────── */}
            <SectionTitle>Caractéristiques</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="surfaceArea">Surface (m²)</Label>
                <Input
                  id="surfaceArea"
                  type="number"
                  step="0.01"
                  {...register("surfaceArea", { valueAsNumber: true })}
                  placeholder="45"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  {...register("bedrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="beds">Lits</Label>
                <Input
                  id="beds"
                  type="number"
                  {...register("beds", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bathrooms">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  {...register("bathrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxGuests">Capacité max</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  {...register("maxGuests", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="totalRooms">Total pièces</Label>
                <Input
                  id="totalRooms"
                  type="number"
                  {...register("totalRooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Ameublement</Label>
                <Select
                  value={watchFurnishing}
                  onValueChange={(val) =>
                    val && setValue("furnishing", val as PropertyFormData["furnishing"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ameublement" />
                  </SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ─── Équipements ──────────────────────────── */}
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

            <Separator />

            {/* ─── Financier ───────────────────────────── */}
            <SectionTitle>Financier</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="monthlyRent">Loyer /mois (CNY) *</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  step="0.01"
                  {...register("monthlyRent", { valueAsNumber: true })}
                  placeholder="5000"
                  aria-invalid={!!errors.monthlyRent}
                />
                {errors.monthlyRent && (
                  <p className="text-xs text-red-500">
                    {errors.monthlyRent.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deposit">Caution (CNY)</Label>
                <Input
                  id="deposit"
                  type="number"
                  step="0.01"
                  {...register("deposit", { valueAsNumber: true })}
                  placeholder="10000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commissionRate">Commission (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  {...register("commissionRate", { valueAsNumber: true })}
                  placeholder="10"
                  aria-invalid={!!errors.commissionRate}
                />
                {errors.commissionRate && (
                  <p className="text-xs text-red-500">
                    {errors.commissionRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="utilities">Charges (CNY)</Label>
                <Input
                  id="utilities"
                  type="number"
                  step="0.01"
                  {...register("utilities", { valueAsNumber: true })}
                  placeholder="500"
                />
              </div>
            </div>

            <Separator />

            {/* ─── Réductions durée ─────────────────────── */}
            <SectionTitle>Réductions durée (%)</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="space-y-1.5">
                <Label htmlFor="discountWeekly">Hebdo</Label>
                <Input
                  id="discountWeekly"
                  type="number"
                  step="0.01"
                  {...register("discountWeekly", { valueAsNumber: true })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountBiweekly">Bi-hebdo</Label>
                <Input
                  id="discountBiweekly"
                  type="number"
                  step="0.01"
                  {...register("discountBiweekly", { valueAsNumber: true })}
                  placeholder="8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountMonthly">Mensuel</Label>
                <Input
                  id="discountMonthly"
                  type="number"
                  step="0.01"
                  {...register("discountMonthly", { valueAsNumber: true })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountQuarterly">Trimestriel</Label>
                <Input
                  id="discountQuarterly"
                  type="number"
                  step="0.01"
                  {...register("discountQuarterly", { valueAsNumber: true })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discountYearly">Annuel</Label>
                <Input
                  id="discountYearly"
                  type="number"
                  step="0.01"
                  {...register("discountYearly", { valueAsNumber: true })}
                  placeholder="20"
                />
              </div>
            </div>

            <Separator />

            {/* ─── Contrat ─────────────────────────────── */}
            <SectionTitle>Contrat</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="leaseStartDate">Début du bail</Label>
                <Input
                  id="leaseStartDate"
                  type="date"
                  {...register("leaseStartDate")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leaseEndDate">Fin du bail</Label>
                <Input
                  id="leaseEndDate"
                  type="date"
                  {...register("leaseEndDate")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minLeaseDuration">Durée min. (mois)</Label>
                <Input
                  id="minLeaseDuration"
                  type="number"
                  {...register("minLeaseDuration", { valueAsNumber: true })}
                  placeholder="6"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contractRef">Réf. contrat</Label>
                <Input
                  id="contractRef"
                  {...register("contractRef")}
                  placeholder="CTR-2024-001"
                />
              </div>
            </div>

            <Separator />

            {/* ─── Médias ──────────────────────────────── */}
            <SectionTitle>Médias</SectionTitle>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="coverPhoto">Photo de couverture (URL)</Label>
                <Input
                  id="coverPhoto"
                  {...register("coverPhoto")}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Photos supplémentaires (URLs)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPhotoField}
                  >
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
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Description de la propriété..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descriptionCn">Description (CN)</Label>
                <Textarea
                  id="descriptionCn"
                  {...register("descriptionCn")}
                  placeholder="房产描述..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* ─── Meta ────────────────────────────────── */}
            <SectionTitle>Meta</SectionTitle>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Notes visibles uniquement par l'équipe..."
                  rows={2}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#FF385C]"
                  {...register("isFeatured")}
                />
                Propriété en vedette
              </label>
            </div>
          </form>
        </ScrollArea>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="property-form"
            disabled={mutation.isPending}
            className="bg-[#FF385C] text-white hover:bg-[#E0294D]"
          >
            {mutation.isPending
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer"
                : "Créer la propriété"}
          </Button>
        </SheetFooter>

        {mutation.isError && (
          <p className="px-4 pb-2 text-xs text-red-500 text-center">
            {mutation.error.message}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-wider">
      {children}
    </h3>
  );
}

function getDefaultValues(
  property?: Record<string, unknown> | null
): PropertyFormData {
  if (!property) {
    return {
      title: "",
      type: "APARTMENT",
      listingType: "ENTIRE_PLACE",
      status: "AVAILABLE",
      agencyId: "",
      cityId: "",
      address: "",
      district: "",
      floor: undefined,
      building: "",
      surfaceArea: undefined,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      totalRooms: undefined,
      furnishing: "FURNISHED",
      amenities: [],
      monthlyRent: 0,
      deposit: undefined,
      commissionRate: 0,
      utilities: undefined,
      discountWeekly: undefined,
      discountBiweekly: undefined,
      discountMonthly: undefined,
      discountQuarterly: undefined,
      discountYearly: undefined,
      leaseStartDate: "",
      leaseEndDate: "",
      minLeaseDuration: undefined,
      contractRef: "",
      photos: [],
      coverPhoto: "",
      description: "",
      descriptionCn: "",
      notes: "",
      isFeatured: false,
    };
  }

  return {
    title: (property.title as string) || "",
    type: (property.type as PropertyFormData["type"]) || "APARTMENT",
    listingType:
      (property.listingType as PropertyFormData["listingType"]) ||
      "ENTIRE_PLACE",
    status: (property.status as PropertyFormData["status"]) || "AVAILABLE",
    agencyId: (property.agencyId as string) || "",
    cityId: (property.cityId as string) || "",
    address: (property.address as string) || "",
    district: (property.district as string) || "",
    floor: property.floor != null ? Number(property.floor) : undefined,
    building: (property.building as string) || "",
    surfaceArea:
      property.surfaceArea != null
        ? Number(property.surfaceArea)
        : undefined,
    bedrooms: Number(property.bedrooms) || 1,
    beds: Number(property.beds) || 1,
    bathrooms: Number(property.bathrooms) || 1,
    maxGuests: Number(property.maxGuests) || 2,
    totalRooms:
      property.totalRooms != null ? Number(property.totalRooms) : undefined,
    furnishing:
      (property.furnishing as PropertyFormData["furnishing"]) || "FURNISHED",
    amenities: (property.amenities as string[]) || [],
    monthlyRent: Number(property.monthlyRent) || 0,
    deposit:
      property.deposit != null ? Number(property.deposit) : undefined,
    commissionRate: Number(property.commissionRate) || 0,
    utilities:
      property.utilities != null ? Number(property.utilities) : undefined,
    discountWeekly:
      property.discountWeekly != null
        ? Number(property.discountWeekly)
        : undefined,
    discountBiweekly:
      property.discountBiweekly != null
        ? Number(property.discountBiweekly)
        : undefined,
    discountMonthly:
      property.discountMonthly != null
        ? Number(property.discountMonthly)
        : undefined,
    discountQuarterly:
      property.discountQuarterly != null
        ? Number(property.discountQuarterly)
        : undefined,
    discountYearly:
      property.discountYearly != null
        ? Number(property.discountYearly)
        : undefined,
    leaseStartDate: property.leaseStartDate
      ? new Date(property.leaseStartDate as string).toISOString().split("T")[0]
      : "",
    leaseEndDate: property.leaseEndDate
      ? new Date(property.leaseEndDate as string).toISOString().split("T")[0]
      : "",
    minLeaseDuration:
      property.minLeaseDuration != null
        ? Number(property.minLeaseDuration)
        : undefined,
    contractRef: (property.contractRef as string) || "",
    photos: (property.photos as string[]) || [],
    coverPhoto: (property.coverPhoto as string) || "",
    description: (property.description as string) || "",
    descriptionCn: (property.descriptionCn as string) || "",
    notes: (property.notes as string) || "",
    isFeatured: Boolean(property.isFeatured),
  };
}
