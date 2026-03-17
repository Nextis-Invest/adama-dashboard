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

interface Props {
  service: { id: string; title: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteServiceDialog({
  service,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le service</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le service{" "}
            <strong>{service?.title}</strong> ? Cette action
            est irréversible.
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
