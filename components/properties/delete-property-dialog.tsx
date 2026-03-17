"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePropertyDialog({
  open,
  onOpenChange,
  propertyTitle,
  onConfirm,
  isDeleting,
}: DeletePropertyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la propriété</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer{" "}
            <strong>{propertyTitle}</strong> ? Cette action est
            irréversible. Tous les paiements associés seront également
            supprimés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
