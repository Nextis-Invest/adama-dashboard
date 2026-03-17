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
  experience: { id: string; title: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteExperienceDialog({
  experience,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  return (
    <Dialog open={!!experience} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;exp&eacute;rience</DialogTitle>
          <DialogDescription>
            &Ecirc;tes-vous s&ucirc;r de vouloir supprimer l&apos;exp&eacute;rience{" "}
            <strong>{experience?.title}</strong> ? Cette action est
            irr&eacute;versible.
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
