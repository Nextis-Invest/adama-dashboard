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

const serviceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  order: z.number().int().default(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof serviceSchema>;

type ServiceData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
} | null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ServiceFormDialog({ open, onOpenChange, service }: Props) {
  const isEditing = !!service;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      icon: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        title: service.title,
        slug: service.slug,
        description: service.description || "",
        icon: service.icon || "",
        order: service.order,
        isActive: service.isActive,
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        description: "",
        icon: "",
        order: 0,
        isActive: true,
      });
    }
  }, [service, form]);

  // Auto-slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      form.setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, isEditing, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing ? `/api/services/${service.id}` : "/api/services";
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
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(
        isEditing ? "Service modifié" : "Service créé"
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
            {isEditing ? "Modifier le service" : "Ajouter un service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du service."
              : "Créez un nouveau service pour la plateforme."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Transport"
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
                placeholder="transport"
                {...form.register("slug")}
                aria-invalid={!!form.formState.errors.slug}
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Description du service..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône (chemin ou nom)</Label>
              <Input
                id="icon"
                placeholder="plane, car, hotel..."
                {...form.register("icon")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordre</Label>
              <Input
                id="order"
                type="number"
                {...form.register("order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="size-4 rounded border-input accent-[#FF385C]"
              {...form.register("isActive")}
            />
            <Label htmlFor="isActive">Service actif</Label>
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
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
