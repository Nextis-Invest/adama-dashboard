"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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

const linkSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().optional(),
  href: z.string().optional(),
  order: z.number().int().default(0),
});

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean(),
  links: z.array(linkSchema),
});

type FormValues = z.infer<typeof categorySchema>;

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  links: {
    id: string;
    title: string;
    subtitle: string | null;
    href: string | null;
    order: number;
  }[];
} | null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DestinationFormDialog({ open, onOpenChange, category }: Props) {
  const isEditing = !!category;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      order: 0,
      isActive: true,
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        icon: category.icon || "",
        order: category.order,
        isActive: category.isActive,
        links: category.links.map((l) => ({
          title: l.title,
          subtitle: l.subtitle || "",
          href: l.href || "",
          order: l.order,
        })),
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        icon: "",
        order: 0,
        isActive: true,
        links: [],
      });
    }
  }, [category, form]);

  // Auto-slug from name
  const watchName = form.watch("name");
  useEffect(() => {
    if (!isEditing && watchName) {
      form.setValue("slug", slugify(watchName));
    }
  }, [watchName, isEditing, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing ? `/api/destinations/${category.id}` : "/api/destinations";
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
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success(
        isEditing ? "Catégorie modifiée" : "Catégorie créée"
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
            {isEditing ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez la catégorie et ses liens de destination."
              : "Créez une catégorie avec ses liens de destination."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Category fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;onglet</Label>
              <Input
                id="name"
                placeholder="Populaire"
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
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="populaire"
                {...form.register("slug")}
                aria-invalid={!!form.formState.errors.slug}
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône (Lucide)</Label>
              <Input
                id="icon"
                placeholder="flame, waves, mountain..."
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
            <Label htmlFor="isActive">Catégorie active</Label>
          </div>

          {/* Links section */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Liens de destination ({fields.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ title: "", subtitle: "", href: "", order: fields.length })
                }
              >
                <Plus className="size-3" />
                Ajouter un lien
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-3 rounded-lg border border-[#EBEBEB] bg-[#F7F7F7] p-3"
              >
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Input
                      placeholder="Titre (ex: Beijing)"
                      {...form.register(`links.${index}.title`)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Sous-titre (ex: 北京 · Logements)"
                      {...form.register(`links.${index}.subtitle`)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Lien (optionnel)"
                      {...form.register(`links.${index}.href`)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => remove(index)}
                  className="mt-1 text-[#B0B0B0] hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-center text-sm text-[#B0B0B0]">
                Aucun lien. Cliquez sur « Ajouter un lien » pour commencer.
              </p>
            )}
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
