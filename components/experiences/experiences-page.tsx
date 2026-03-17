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
import { ExperienceFormDialog } from "./experience-form-dialog";
import { DeleteExperienceDialog } from "./delete-experience-dialog";

type Experience = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  price: string | null;
  duration: string | null;
  location: string | null;
  cityId: string | null;
  maxParticipants: number | null;
  category: string | null;
  rating: string | null;
  reviewCount: number;
  hostName: string | null;
  hostPhoto: string | null;
  photos: string[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  city: {
    id: string;
    name: string;
    pinyin: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchExperiences(): Promise<Experience[]> {
  const res = await fetch("/api/experiences");
  if (!res.ok) throw new Error("Erreur lors du chargement");
  const json = await res.json();
  return json.data;
}

export function ExperiencesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editExperience, setEditExperience] = useState<Experience | null>(null);
  const [deleteExperience, setDeleteExperience] = useState<Experience | null>(null);

  const queryClient = useQueryClient();

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: fetchExperiences,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Exp\u00e9rience supprim\u00e9e avec succ\u00e8s");
      setDeleteExperience(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<Experience>[] = [
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
      id: "image",
      header: "Image",
      cell: ({ row }) =>
        row.original.coverImage ? (
          <img
            src={row.original.coverImage}
            alt={row.original.title}
            className="size-10 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-[#F7F7F7] text-xs text-[#B0B0B0]">
            —
          </div>
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
      accessorKey: "category",
      header: "Cat\u00e9gorie",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">
          {row.original.category || "\u2014"}
        </span>
      ),
    },
    {
      id: "city",
      header: "Ville",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">
          {row.original.city?.pinyin || "\u2014"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Prix",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">
          {row.original.price ? `${row.original.price} \u00a5` : "\u2014"}
        </span>
      ),
    },
    {
      accessorKey: "duration",
      header: "Dur\u00e9e",
      cell: ({ row }) => (
        <span className="text-xs text-[#6A6A6A]">
          {row.original.duration || "\u2014"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Statut",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.isActive ? (
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
          {row.original.isFeatured && (
            <Badge className="border-amber-200 bg-amber-100 text-amber-700">
              Featured
            </Badge>
          )}
        </div>
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
                  setEditExperience(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteExperience(row.original)}
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
    data: experiences,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exp\u00e9riences"
        description="G\u00e9rez les exp\u00e9riences propos\u00e9es aux voyageurs"
      >
        {isAdmin && (
          <Button
            onClick={() => {
              setEditExperience(null);
              setFormOpen(true);
            }}
            className="bg-[#FF385C] text-white hover:bg-[#E0314F]"
          >
            <Plus className="size-4" />
            Ajouter une exp\u00e9rience
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Chargement...
          </div>
        ) : experiences.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6A6A6A]">
            Aucune exp\u00e9rience
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

      <ExperienceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditExperience(null);
        }}
        experience={editExperience}
      />

      <DeleteExperienceDialog
        experience={deleteExperience}
        onClose={() => setDeleteExperience(null)}
        onConfirm={() => {
          if (deleteExperience) deleteMutation.mutate(deleteExperience.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
