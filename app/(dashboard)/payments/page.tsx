"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarPlus, Download } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};

export default function PaymentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "ADMIN";
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/payments?${params}`);
      const json = await res.json();
      return json.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const period = new Date(now.getFullYear(), now.getMonth(), 1);
      const res = await fetch("/api/payments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: period.toISOString() }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `${data.data.created} paiements générés, ${data.data.skipped} ignorés`
      );
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: () => toast.error("Erreur lors de la génération"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      amountPaid,
    }: {
      id: string;
      status: string;
      amountPaid?: number;
    }) => {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, amountPaid }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Paiement mis à jour");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" description="Suivi des paiements mensuels">
        {isAdmin && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/api/financial/export";
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Générer mois courant
            </Button>
          </>
        )}
      </PageHeader>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PAID">Payé</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="OVERDUE">En retard</SelectItem>
            <SelectItem value="PARTIAL">Partiel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#EBEBEB]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead>Propriété</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead className="text-right">Montant dû</TableHead>
                <TableHead className="text-right">Montant payé</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#6A6A6A]">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#6A6A6A]">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                payments?.map((p: Record<string, unknown>) => (
                  <TableRow key={p.id as string}>
                    <TableCell className="font-medium">
                      {format(new Date(p.period as string), "MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>{(p.property as Record<string, unknown>).title as string}</TableCell>
                    <TableCell>
                      {((p.property as Record<string, unknown>).agency as Record<string, string>).name}
                    </TableCell>
                    <TableCell>
                      {((p.property as Record<string, unknown>).city as Record<string, string>).pinyin}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(p.amountDue).toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(p.amountPaid).toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(p.commission).toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[p.status as string] ?? ""}
                      >
                        {p.status as string}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(p.dueDate as string), "dd/MM/yyyy")}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {p.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus.mutate({
                                id: p.id as string,
                                status: "PAID",
                                amountPaid: Number(p.amountDue),
                              })
                            }
                          >
                            Marquer payé
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
