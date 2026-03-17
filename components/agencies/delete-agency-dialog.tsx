"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Agency {
  id: string;
  name: string;
  _count: { properties: number };
}

interface DeleteAgencyDialogProps {
  agency: Agency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAgencyDialog({
  agency,
  open,
  onOpenChange,
}: DeleteAgencyDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agencies/${agency.id}`, {
        method: "DELETE",
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
  });

  const hasProperties = agency._count.properties > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;agence</DialogTitle>
          <DialogDescription>
            {hasProperties ? (
              <>
                Impossible de supprimer <strong>{agency.name}</strong> car elle
                possède {agency._count.properties} bien(s). Veuillez d&apos;abord
                supprimer ou transférer les biens associés.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer <strong>{agency.name}</strong>
                 ? Cette action est irréversible.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {!hasProperties && (
            <Button
              variant="destructive"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          )}
        </DialogFooter>

        {mutation.isError && (
          <p className="text-xs text-red-500 text-center">
            {mutation.error.message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
