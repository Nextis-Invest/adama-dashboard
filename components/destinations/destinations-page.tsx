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
import { MoreHorizontal, Plus, Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";

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
import { DestinationFormDialog } from "./destination-form-dialog";
import { DeleteDestinationDialog } from "./delete-destination-dialog";

type DestinationLink = {
  id: string;
  title: string;
  subtitle: string | null;
  href: string | null;
  order: number;
};

type DestinationCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  links: DestinationLink[];
  _count: { links: number };
  createdAt: string;
  updatedAt: string;
};

async function fetchCategories(): Promise<DestinationCategory[]> {
  const res = await fetch("/api/destinations");
  if (!res.ok) throw new Error("Erreur lors du chargement");
  const json = await res.json();
  return json.data;
}

export function DestinationsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<DestinationCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<DestinationCategory | null>(null);

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Catégorie supprimée avec succès");
      setDeleteCategory(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<DestinationCategory>[] = [
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
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <span className="font-medium text-[#222222]">{row.original.name}</span>
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
      id: "links",
      header: "Liens",
      cell: ({ row }) => (
        <span className="text-[#6A6A6A]">{row.original._count.links}</span>
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
                  setEditCategory(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteCategory(row.original)}
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
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="Gérez les onglets et liens de la section « Des idées pour vos prochaines escapades »"
      >
        {isAdmin && (
          <Button
            onClick={() => {
              setEditCategory(null);
              setFormOpen(true);
            }}
            className="bg-[#FF385C] text-white hover:bg-[#E0314F]"
          >
            <Plus className="size-4" />
            Ajouter une catégorie
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Chargement...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Aucune catégorie de destination
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

      {/* Expandable links preview per category */}
      {categories.map((cat) =>
        cat.links.length > 0 ? (
          <div key={cat.id} className="rounded-xl border bg-white p-5">
            <h3 className="text-sm font-semibold text-[#222222]">
              Liens — {cat.name}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {cat.links.map((link) => (
                <div
                  key={link.id}
                  className="rounded-lg bg-[#F7F7F7] px-3 py-2"
                >
                  <p className="text-sm font-medium text-[#222222]">
                    {link.title}
                  </p>
                  {link.subtitle && (
                    <p className="text-xs text-[#6A6A6A]">{link.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      <DestinationFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditCategory(null);
        }}
        category={editCategory}
      />

      <DeleteDestinationDialog
        category={deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={() => {
          if (deleteCategory) deleteMutation.mutate(deleteCategory.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
