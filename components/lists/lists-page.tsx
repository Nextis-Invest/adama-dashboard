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
import { ListFormDialog } from "./list-form-dialog";
import { DeleteListDialog } from "./delete-list-dialog";

type PropertyList = {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  order: number;
  isActive: boolean;
  _count: { items: number };
  createdAt: string;
  updatedAt: string;
};

async function fetchLists(): Promise<PropertyList[]> {
  const res = await fetch("/api/lists");
  if (!res.ok) throw new Error("Erreur lors du chargement");
  const json = await res.json();
  return json.data;
}

export function ListsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editList, setEditList] = useState<PropertyList | null>(null);
  const [deleteList, setDeleteList] = useState<PropertyList | null>(null);

  const queryClient = useQueryClient();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists"],
    queryFn: fetchLists,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lists/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Liste supprimée avec succès");
      setDeleteList(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<PropertyList>[] = [
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
      accessorKey: "tag",
      header: "Tag",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">{row.original.tag || "—"}</span>
      ),
    },
    {
      id: "items",
      header: "Propriétés",
      cell: ({ row }) => (
        <span className="text-[#6A6A6A]">{row.original._count.items}</span>
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
                  setEditList(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteList(row.original)}
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
    data: lists,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listes"
        description="Gérez les listes de propriétés curatées affichées sur le site"
      >
        {isAdmin && (
          <Button
            onClick={() => {
              setEditList(null);
              setFormOpen(true);
            }}
            className="bg-[#FF385C] text-white hover:bg-[#E0314F]"
          >
            <Plus className="size-4" />
            Nouvelle liste
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Chargement...
          </div>
        ) : lists.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Aucune liste de propriétés
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

      <ListFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditList(null);
        }}
        list={editList}
      />

      <DeleteListDialog
        list={deleteList}
        onClose={() => setDeleteList(null)}
        onConfirm={() => {
          if (deleteList) deleteMutation.mutate(deleteList.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
