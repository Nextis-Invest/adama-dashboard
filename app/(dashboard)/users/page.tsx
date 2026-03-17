"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  AGENT: "bg-blue-100 text-blue-700",
  VIEWER: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      const json = await res.json();
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes utilisateurs"
      />

      <Card className="border-[#EBEBEB]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#6A6A6A]">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : (
                users?.map(
                  (u: {
                    id: string;
                    name: string;
                    email: string;
                    role: string;
                    agency?: { name: string } | null;
                    createdAt: string;
                  }) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={roleColors[u.role] ?? ""}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.agency?.name ?? "—"}</TableCell>
                      <TableCell>
                        {format(new Date(u.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Supprimer cet utilisateur ?")) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
