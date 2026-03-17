"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const citySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  pinyin: z.string().min(1, "Le pinyin est requis"),
  province: z.string().min(1, "La province est requise"),
  description: z.string().optional().default(""),
  famousFor: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  isActive: z.boolean(),
});

type CityFormValues = z.infer<typeof citySchema>;

type CityData = {
  id: string;
  name: string;
  pinyin: string;
  province: string;
  description?: string;
  famousFor?: string;
  coverImage?: string;
  isActive: boolean;
} | null;

interface CityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: CityData;
}

export function CityFormDialog({ open, onOpenChange, city }: CityFormDialogProps) {
  const isEditing = !!city;
  const queryClient = useQueryClient();

  const form = useForm<CityFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(citySchema) as any,
    defaultValues: {
      name: "",
      pinyin: "",
      province: "",
      description: "",
      famousFor: "",
      coverImage: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (city) {
      form.reset({
        name: city.name,
        pinyin: city.pinyin,
        province: city.province,
        description: city.description ?? "",
        famousFor: city.famousFor ?? "",
        coverImage: city.coverImage ?? "",
        isActive: city.isActive,
      });
    } else {
      form.reset({
        name: "",
        pinyin: "",
        province: "",
        description: "",
        famousFor: "",
        coverImage: "",
        isActive: true,
      });
    }
  }, [city, form]);

  const mutation = useMutation({
    mutationFn: async (values: CityFormValues) => {
      const url = isEditing ? `/api/cities/${city.id}` : "/api/cities";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success(
        isEditing ? "Ville modifiée avec succès" : "Ville créée avec succès"
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: CityFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la ville" : "Ajouter une ville"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la ville."
              : "Remplissez les informations de la nouvelle ville."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom (chinois)</Label>
            <Input
              id="name"
              placeholder="北京"
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinyin">Pinyin</Label>
            <Input
              id="pinyin"
              placeholder="Beijing"
              {...form.register("pinyin")}
              aria-invalid={!!form.formState.errors.pinyin}
            />
            {form.formState.errors.pinyin && (
              <p className="text-xs text-destructive">
                {form.formState.errors.pinyin.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              placeholder="Beijing"
              {...form.register("province")}
              aria-invalid={!!form.formState.errors.province}
            />
            {form.formState.errors.province && (
              <p className="text-xs text-destructive">
                {form.formState.errors.province.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Ex: Hub technologique mondial"
              {...form.register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="famousFor">Célèbre pour</Label>
            <Input
              id="famousFor"
              placeholder="Ex: Célèbre pour la Grande Muraille"
              {...form.register("famousFor")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Image de couverture</Label>
            <Input
              id="coverImage"
              placeholder="URL de l'image"
              {...form.register("coverImage")}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="size-4 rounded border-input accent-[#FF385C]"
              {...form.register("isActive")}
            />
            <Label htmlFor="isActive">Ville active</Label>
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
              className="bg-[#FF385C] hover:bg-[#E0314F] text-white"
            >
              {mutation.isPending
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
