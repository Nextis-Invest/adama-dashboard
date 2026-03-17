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

interface DeleteCityDialogProps {
  city: { id: string; name: string; pinyin: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteCityDialog({
  city,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteCityDialogProps) {
  return (
    <Dialog open={!!city} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la ville</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la ville{" "}
            <strong>
              {city?.name} ({city?.pinyin})
            </strong>{" "}
            ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
