"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Plus, MoreHorizontal, Pencil, Trash2, Building } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AgencyFormDialog } from "./agency-form-dialog";
import { DeleteAgencyDialog } from "./delete-agency-dialog";

interface City {
  id: string;
  name: string;
  pinyin: string;
}

interface Agency {
  id: string;
  name: string;
  cityId: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  status: "ACTIVE" | "PAUSED" | "TERMINATED";
  notes: string | null;
  city: City;
  _count: { properties: number; users: number };
  createdAt: string;
}

async function fetchAgencies(params: {
  cityId?: string;
  status?: string;
}): Promise<Agency[]> {
  const query = new URLSearchParams();
  if (params.cityId) query.set("cityId", params.cityId);
  if (params.status) query.set("status", params.status);
  const res = await fetch(`/api/agencies?${query}`);
  if (!res.ok) throw new Error("Erreur lors du chargement");
  const json = await res.json();
  return json.data;
}

async function fetchCities(): Promise<City[]> {
  const res = await fetch("/api/cities");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export function AgenciesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const queryClient = useQueryClient();

  const [filterCity, setFilterCity] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);

  const { data: agencies = [], isLoading } = useQuery({
    queryKey: ["agencies", filterCity, filterStatus],
    queryFn: () =>
      fetchAgencies({
        cityId: filterCity || undefined,
        status: filterStatus || undefined,
      }),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const columns: ColumnDef<Agency>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF385C]/10">
            <Building className="h-4 w-4 text-[#FF385C]" />
          </div>
          <span className="font-medium text-[#222222]">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "Ville",
      cell: ({ row }) => (
        <div>
          <div className="text-[#222222]">{row.original.city.name}</div>
          <div className="text-xs text-[#6A6A6A]">
            {row.original.city.pinyin}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact",
      cell: ({ row }) => (
        <span className="text-[#222222]">
          {row.original.contactPerson || "—"}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => (
        <span className="text-[#6A6A6A]">{row.original.phone || "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "properties",
      header: "Biens",
      cell: ({ row }) => (
        <span className="font-medium text-[#222222]">
          {row.original._count.properties}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingAgency(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil />
              Modifier
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeletingAgency(row.original)}
              >
                <Trash2 />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: agencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Agences" description="Gestion des agences partenaires">
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingAgency(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Ajouter une agence
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={filterCity}
          onValueChange={(val) => setFilterCity(val === "__all__" || !val ? "" : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name} ({city.pinyin})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={(val) =>
            setFilterStatus(val === "__all__" || !val ? "" : val)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="PAUSED">En pause</SelectItem>
            <SelectItem value="TERMINATED">Résilié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-sm">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[#6A6A6A]"
                >
                  Aucune agence trouvée.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <AgencyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAgency(null);
        }}
        agency={editingAgency}
      />

      {deletingAgency && (
        <DeleteAgencyDialog
          agency={deletingAgency}
          open={!!deletingAgency}
          onOpenChange={(open) => {
            if (!open) setDeletingAgency(null);
          }}
        />
      )}
    </div>
  );
}
