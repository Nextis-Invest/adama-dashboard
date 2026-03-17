"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

export default function OverduePaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments-overdue"],
    queryFn: async () => {
      const res = await fetch("/api/payments/overdue");
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements en retard"
        description="Paiements dont l'échéance est dépassée"
      />

      {payments?.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {payments.length} paiement(s) en retard
        </div>
      )}

      <Card className="border-[#EBEBEB]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead>Propriété</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead className="text-right">Montant dû</TableHead>
                <TableHead className="text-right">Montant payé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Retard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#6A6A6A]">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#6A6A6A]">
                    Aucun paiement en retard
                  </TableCell>
                </TableRow>
              ) : (
                payments?.map((p: Record<string, unknown>) => {
                  const daysOverdue = Math.floor(
                    (Date.now() - new Date(p.dueDate as string).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={p.id as string}>
                      <TableCell className="font-medium">
                        {format(new Date(p.period as string), "MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        {(p.property as Record<string, unknown>).title as string}
                      </TableCell>
                      <TableCell>
                        {
                          ((p.property as Record<string, unknown>).agency as Record<string, string>)
                            .name
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(p.amountDue).toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(p.amountPaid).toLocaleString("fr-FR")} €
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          {p.status as string}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(p.dueDate as string), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {daysOverdue}j
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
