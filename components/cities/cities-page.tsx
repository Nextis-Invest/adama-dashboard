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
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";

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
import { CityFormDialog } from "./city-form-dialog";
import { DeleteCityDialog } from "./delete-city-dialog";

type City = {
  id: string;
  name: string;
  pinyin: string;
  province: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    agencies: number;
    properties: number;
  };
};

async function fetchCities(): Promise<City[]> {
  const res = await fetch("/api/cities");
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  const json = await res.json();
  return json.data;
}

export function CitiesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [deleteCity, setDeleteCity] = useState<City | null>(null);

  const queryClient = useQueryClient();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville supprimée avec succès");
      setDeleteCity(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<City>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <span className="font-medium text-[#222222]">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "pinyin",
      header: "Pinyin",
    },
    {
      accessorKey: "province",
      header: "Province",
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: "agencies",
      header: "Agences",
      cell: ({ row }) => (
        <span className="text-[#6A6A6A]">{row.original._count.agencies}</span>
      ),
    },
    {
      id: "properties",
      header: "Propriétés",
      cell: ({ row }) => (
        <span className="text-[#6A6A6A]">
          {row.original._count.properties}
        </span>
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
                  setEditCity(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteCity(row.original)}
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
    data: cities,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Villes" description="Gérez les villes disponibles">
        {isAdmin && (
          <Button
            onClick={() => {
              setEditCity(null);
              setFormOpen(true);
            }}
            className="bg-[#FF385C] hover:bg-[#E0314F] text-white"
          >
            <Plus className="size-4" />
            Ajouter une ville
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Chargement...
          </div>
        ) : cities.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Aucune ville enregistrée
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

      <CityFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditCity(null);
        }}
        city={editCity}
      />

      <DeleteCityDialog
        city={deleteCity}
        onClose={() => setDeleteCity(null)}
        onConfirm={() => {
          if (deleteCity) deleteMutation.mutate(deleteCity.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
