"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const experienceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  price: z.number().nonnegative().optional().nullable(),
  duration: z.string().optional().default(""),
  location: z.string().optional().default(""),
  cityId: z.string().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  category: z.string().optional().default(""),
  hostName: z.string().optional().default(""),
  hostPhoto: z.string().optional().default(""),
  photos: z.string().optional().default(""),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type FormValues = z.infer<typeof experienceSchema>;

type ExperienceData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  price: string | null;
  duration: string | null;
  location: string | null;
  cityId: string | null;
  maxParticipants: number | null;
  category: string | null;
  hostName: string | null;
  hostPhoto: string | null;
  photos: string[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
} | null;

type City = {
  id: string;
  name: string;
  pinyin: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: ExperienceData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_SUGGESTIONS = [
  "Culture",
  "Gastronomie",
  "Aventure",
  "Nature",
  "Art",
  "Sport",
];

export function ExperienceFormDialog({ open, onOpenChange, experience }: Props) {
  const isEditing = !!experience;
  const queryClient = useQueryClient();

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["cities-active"],
    queryFn: async () => {
      const res = await fetch("/api/cities?active=true");
      if (!res.ok) throw new Error("Erreur chargement villes");
      const json = await res.json();
      return json.data;
    },
  });

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(experienceSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      coverImage: "",
      price: null,
      duration: "",
      location: "",
      cityId: null,
      maxParticipants: null,
      category: "",
      hostName: "",
      hostPhoto: "",
      photos: "",
      order: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (experience) {
      form.reset({
        title: experience.title,
        slug: experience.slug,
        description: experience.description || "",
        coverImage: experience.coverImage || "",
        price: experience.price ? parseFloat(experience.price) : null,
        duration: experience.duration || "",
        location: experience.location || "",
        cityId: experience.cityId || null,
        maxParticipants: experience.maxParticipants || null,
        category: experience.category || "",
        hostName: experience.hostName || "",
        hostPhoto: experience.hostPhoto || "",
        photos: experience.photos.join(", "),
        order: experience.order,
        isActive: experience.isActive,
        isFeatured: experience.isFeatured,
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        description: "",
        coverImage: "",
        price: null,
        duration: "",
        location: "",
        cityId: null,
        maxParticipants: null,
        category: "",
        hostName: "",
        hostPhoto: "",
        photos: "",
        order: 0,
        isActive: true,
        isFeatured: false,
      });
    }
  }, [experience, form]);

  // Auto-slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      form.setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, isEditing, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing
        ? `/api/experiences/${experience.id}`
        : "/api/experiences";
      const method = isEditing ? "PUT" : "POST";

      // Convert photos string to array
      const photosArray = values.photos
        ? values.photos
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...values,
        photos: photosArray,
        cityId: values.cityId || null,
        price: values.price ?? undefined,
        maxParticipants: values.maxParticipants ?? undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success(
        isEditing
          ? "Exp\u00e9rience modifi\u00e9e"
          : "Exp\u00e9rience cr\u00e9\u00e9e"
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Modifier l\u2019exp\u00e9rience"
              : "Ajouter une exp\u00e9rience"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l\u2019exp\u00e9rience."
              : "Cr\u00e9ez une nouvelle exp\u00e9rience pour les voyageurs."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Informations de base</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Cours de calligraphie"
                  {...form.register("title")}
                  aria-invalid={!!form.formState.errors.title}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="cours-de-calligraphie"
                  {...form.register("slug")}
                  aria-invalid={!!form.formState.errors.slug}
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="D\u00e9crivez l\u2019exp\u00e9rience..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...form.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Cat\u00e9gorie</Label>
              <Input
                id="category"
                placeholder="Culture, Gastronomie, Aventure..."
                list="category-suggestions"
                {...form.register("category")}
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">M\u00e9dias</Label>
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                <Input
                  id="coverImage"
                  placeholder="https://..."
                  {...form.register("coverImage")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Photos (URLs s\u00e9par\u00e9es par des virgules)</Label>
                <Input
                  id="photos"
                  placeholder="https://img1.jpg, https://img2.jpg"
                  {...form.register("photos")}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">D\u00e9tails</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (\u00a5)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="299"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Dur\u00e9e</Label>
                <Input
                  id="duration"
                  placeholder="2h, Demi-journ\u00e9e..."
                  {...form.register("duration")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Quartier des arts, Beijing"
                  {...form.register("location")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Participants max</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="10"
                  {...form.register("maxParticipants", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Host */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">H\u00f4te</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hostName">Nom de l&apos;h\u00f4te</Label>
                <Input
                  id="hostName"
                  placeholder="Li Wei"
                  {...form.register("hostName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostPhoto">Photo de l&apos;h\u00f4te (URL)</Label>
                <Input
                  id="hostPhoto"
                  placeholder="https://..."
                  {...form.register("hostPhoto")}
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">Ville</Label>
            <div className="space-y-2">
              <Label htmlFor="cityId">Ville associ\u00e9e</Label>
              <select
                id="cityId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...form.register("cityId")}
              >
                <option value="">Aucune ville</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.pinyin} ({city.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">Param\u00e8tres</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
                <Input
                  id="order"
                  type="number"
                  {...form.register("order", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="size-4 rounded border-input accent-[#FF385C]"
                  {...form.register("isActive")}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  className="size-4 rounded border-input accent-[#FF385C]"
                  {...form.register("isFeatured")}
                />
                <Label htmlFor="isFeatured">Mise en avant</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#FF385C] text-white hover:bg-[#E0314F]"
            >
              {mutation.isPending
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer"
                  : "Cr\u00e9er"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
