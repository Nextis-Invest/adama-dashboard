"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

const listSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  tag: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean(),
  items: z.array(
    z.object({
      propertyId: z.string().min(1),
      order: z.number().int().default(0),
    })
  ),
});

type FormValues = z.infer<typeof listSchema>;

type ListData = {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  order: number;
  isActive: boolean;
} | null;

type ListDetailData = {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  order: number;
  isActive: boolean;
  items: {
    id: string;
    propertyId: string;
    order: number;
    property: {
      id: string;
      title: string;
      slug: string;
      coverPhoto: string | null;
      monthlyRent: number;
      city: { name: string } | null;
    };
  }[];
};

type PropertyOption = {
  id: string;
  title: string;
  type: string;
  city: { name: string } | null;
  monthlyRent: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ListData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  ROOM: "Chambre",
  STUDIO: "Studio",
  VILLA: "Villa",
  LOFT: "Loft",
};

async function fetchProperties(): Promise<PropertyOption[]> {
  const res = await fetch("/api/properties?limit=100");
  if (!res.ok) throw new Error("Erreur lors du chargement des propriétés");
  const json = await res.json();
  return json.data;
}

async function fetchListDetail(id: string): Promise<ListDetailData> {
  const res = await fetch(`/api/lists/${id}`);
  if (!res.ok) throw new Error("Erreur lors du chargement de la liste");
  const json = await res.json();
  return json.data;
}

export function ListFormDialog({ open, onOpenChange, list }: Props) {
  const isEditing = !!list;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    { propertyId: string; order: number }[]
  >([]);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(listSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      tag: "",
      order: 0,
      isActive: true,
      items: [],
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-all"],
    queryFn: fetchProperties,
    enabled: open,
  });

  const { data: listDetail } = useQuery({
    queryKey: ["list-detail", list?.id],
    queryFn: () => fetchListDetail(list!.id),
    enabled: open && !!list?.id,
  });

  // Reset form when list changes
  useEffect(() => {
    if (list && listDetail) {
      form.reset({
        title: listDetail.title,
        slug: listDetail.slug,
        tag: listDetail.tag || "",
        order: listDetail.order,
        isActive: listDetail.isActive,
        items: listDetail.items.map((item) => ({
          propertyId: item.propertyId,
          order: item.order,
        })),
      });
      setSelectedItems(
        listDetail.items.map((item) => ({
          propertyId: item.propertyId,
          order: item.order,
        }))
      );
    } else if (!list) {
      form.reset({
        title: "",
        slug: "",
        tag: "",
        order: 0,
        isActive: true,
        items: [],
      });
      setSelectedItems([]);
    }
  }, [list, listDetail, form]);

  // Auto-slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      form.setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, isEditing, form]);

  // Sync selectedItems to form
  useEffect(() => {
    form.setValue("items", selectedItems);
  }, [selectedItems, form]);

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return properties;
    const lower = search.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.city?.name?.toLowerCase().includes(lower) ||
        typeLabels[p.type]?.toLowerCase().includes(lower)
    );
  }, [properties, search]);

  const selectedSet = useMemo(
    () => new Set(selectedItems.map((i) => i.propertyId)),
    [selectedItems]
  );

  function toggleProperty(propertyId: string) {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.propertyId === propertyId)) {
        return prev.filter((i) => i.propertyId !== propertyId);
      }
      return [...prev, { propertyId, order: prev.length }];
    });
  }

  function updateItemOrder(propertyId: string, order: number) {
    setSelectedItems((prev) =>
      prev.map((i) => (i.propertyId === propertyId ? { ...i, order } : i))
    );
  }

  function removeItem(propertyId: string) {
    setSelectedItems((prev) =>
      prev.filter((i) => i.propertyId !== propertyId)
    );
  }

  // Build a map of property details for selected items display
  const propertyMap = useMemo(() => {
    const map = new Map<string, PropertyOption>();
    for (const p of properties) {
      map.set(p.id, p);
    }
    return map;
  }, [properties]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing ? `/api/lists/${list.id}` : "/api/lists";
      const method = isEditing ? "PUT" : "POST";

      // For create, first create the list, then update with items
      if (!isEditing) {
        const { items, ...listData } = values;
        const createRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listData),
        });
        if (!createRes.ok) {
          const json = await createRes.json();
          throw new Error(json.error || "Erreur lors de la création");
        }
        const created = await createRes.json();

        // If there are items, update the list with them
        if (items.length > 0) {
          const updateRes = await fetch(`/api/lists/${created.data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
          if (!updateRes.ok) {
            const json = await updateRes.json();
            throw new Error(json.error || "Erreur lors de l'ajout des propriétés");
          }
          return updateRes.json();
        }
        return created;
      }

      // For edit, send everything in one PUT
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
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-detail"] });
      toast.success(isEditing ? "Liste modifiée" : "Liste créée");
      onOpenChange(false);
      form.reset();
      setSelectedItems([]);
      setSearch("");
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
            {isEditing ? "Modifier la liste" : "Créer une liste"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez la liste et ses propriétés associées."
              : "Créez une liste curatée de propriétés."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* List fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Nos coups de coeur"
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
                placeholder="nos-coups-de-coeur"
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
              <Label htmlFor="tag">Tag (optionnel)</Label>
              <Input
                id="tag"
                placeholder="featured, new, promo..."
                {...form.register("tag")}
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
            <Label htmlFor="isActive">Liste active</Label>
          </div>

          {/* Property assignment section */}
          <div className="space-y-3 border-t border-[#EBEBEB] pt-4">
            <Label className="text-base font-semibold">
              Propriétés ({selectedItems.length})
            </Label>

            {/* Selected properties */}
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                {selectedItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const prop = propertyMap.get(item.propertyId);
                    if (!prop) return null;
                    return (
                      <div
                        key={item.propertyId}
                        className="flex items-center gap-3 rounded-lg border border-[#EBEBEB] bg-[#F7F7F7] px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#222222] truncate">
                            {prop.title}
                          </p>
                          <p className="text-xs text-[#6A6A6A]">
                            {prop.city?.name || "—"} · {typeLabels[prop.type] || prop.type} · {prop.monthlyRent.toLocaleString("fr-FR")} EUR/mois
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.order}
                            onChange={(e) =>
                              updateItemOrder(
                                item.propertyId,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="h-8 w-16 text-center text-xs"
                            title="Ordre"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeItem(item.propertyId)}
                            className="text-[#B0B0B0] hover:text-red-500"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Search and property picker */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#B0B0B0]" />
              <Input
                placeholder="Rechercher une propriété..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-[#EBEBEB]">
              {filteredProperties.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-[#B0B0B0]">
                  Aucune propriété trouvée
                </p>
              ) : (
                filteredProperties.map((prop) => {
                  const isSelected = selectedSet.has(prop.id);
                  return (
                    <label
                      key={prop.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-[#EBEBEB] px-3 py-2 last:border-b-0 hover:bg-[#F7F7F7]"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProperty(prop.id)}
                        className="size-4 rounded border-input accent-[#FF385C]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#222222] truncate">
                          {prop.title}
                        </p>
                        <p className="text-xs text-[#6A6A6A]">
                          {prop.city?.name || "—"} · {typeLabels[prop.type] || prop.type} · {prop.monthlyRent.toLocaleString("fr-FR")} EUR/mois
                        </p>
                      </div>
                      {isSelected && (
                        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 text-xs">
                          Sélectionné
                        </Badge>
                      )}
                    </label>
                  );
                })
              )}
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
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
