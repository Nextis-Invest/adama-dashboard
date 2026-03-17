"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceFormDialog } from "./service-form-dialog";
import { DeleteServiceDialog } from "./delete-service-dialog";

type Service = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchServices(): Promise<Service[]> {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Erreur lors du chargement");
  const json = await res.json();
  return json.data;
}

export function ServicesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service supprimé avec succès");
      setDeleteService(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "order",
      header: "Ordre",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-[#B0B0B0]">
          <GripVertical className="size-4" />
          {row.original.order}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => (
        <span className="font-medium text-[#222222]">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "icon",
      header: "Icône",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">{row.original.icon || "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (!isAdmin) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-xs" />}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditService(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteService(row.original)}
              >
                <Trash2 />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Gérez les services proposés sur la plateforme"
      >
        {isAdmin && (
          <Button
            onClick={() => {
              setEditService(null);
              setFormOpen(true);
            }}
            className="bg-[#FF385C] text-white hover:bg-[#E0314F]"
          >
            <Plus className="size-4" />
            Ajouter un service
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Chargement...
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Aucun service
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditService(null);
        }}
        service={editService}
      />

      <DeleteServiceDialog
        service={deleteService}
        onClose={() => setDeleteService(null)}
        onConfirm={() => {
          if (deleteService) deleteMutation.mutate(deleteService.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
