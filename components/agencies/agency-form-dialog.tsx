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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const agencySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  cityId: z.string().min(1, "La ville est requise"),
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "TERMINATED"]),
  notes: z.string().optional(),
});

type AgencyFormData = z.infer<typeof agencySchema>;

interface City {
  id: string;
  name: string;
  pinyin: string;
}

interface Agency {
  id: string;
  name: string;
  cityId: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  status: "ACTIVE" | "PAUSED" | "TERMINATED";
  notes: string | null;
}

interface AgencyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency: Agency | null;
}

async function fetchCities(): Promise<City[]> {
  const res = await fetch("/api/cities");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export function AgencyFormDialog({
  open,
  onOpenChange,
  agency,
}: AgencyFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!agency;

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(agencySchema) as any,
    defaultValues: {
      name: "",
      cityId: "",
      address: "",
      email: "",
      phone: "",
      contactPerson: "",
      status: "ACTIVE",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && agency) {
      reset({
        name: agency.name,
        cityId: agency.cityId,
        address: agency.address ?? "",
        email: agency.email ?? "",
        phone: agency.phone ?? "",
        contactPerson: agency.contactPerson ?? "",
        status: agency.status,
        notes: agency.notes ?? "",
      });
    } else if (open) {
      reset({
        name: "",
        cityId: "",
        address: "",
        email: "",
        phone: "",
        contactPerson: "",
        status: "ACTIVE",
        notes: "",
      });
    }
  }, [open, agency, reset]);

  const mutation = useMutation({
    mutationFn: async (data: AgencyFormData) => {
      const url = isEditing ? `/api/agencies/${agency.id}` : "/api/agencies";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: AgencyFormData) => {
    mutation.mutate(data);
  };

  const watchCityId = watch("cityId");
  const watchStatus = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'agence" : "Nouvelle agence"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'agence."
              : "Remplissez les informations pour créer une nouvelle agence."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              placeholder="Nom de l'agence"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* City */}
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
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} ({city.pinyin})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cityId && (
              <p className="text-xs text-red-500">{errors.cityId.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="Adresse complète"
              {...register("address")}
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@agence.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+86 ..."
                {...register("phone")}
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Personne de contact</Label>
            <Input
              id="contactPerson"
              placeholder="Nom du contact"
              {...register("contactPerson")}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Statut</Label>
            <Select
              value={watchStatus}
              onValueChange={(val) =>
                val && setValue("status", val as AgencyFormData["status"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="PAUSED">En pause</SelectItem>
                <SelectItem value="TERMINATED">Résilié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes internes..."
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer"
                  : "Créer l'agence"}
            </Button>
          </DialogFooter>

          {mutation.isError && (
            <p className="text-xs text-red-500 text-center">
              {mutation.error.message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
