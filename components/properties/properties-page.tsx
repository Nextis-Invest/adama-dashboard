"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "./property-card";
import { PropertyFormDialog } from "./property-form-dialog";
import { DeletePropertyDialog } from "./delete-property-dialog";
import {
  Plus,
  Search,
  LayoutGrid,
  TableIcon,
  Pencil,
  Trash2,
  BedDouble,
  Bath,
  MapPin,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface Property {
  id: string;
  title: string;
  slug: string;
  type: string;
  listingType: string;
  status: string;
  agencyId: string;
  cityId: string;
  agency: { id: string; name: string };
  city: { id: string; name: string; pinyin: string };
  address: string;
  district: string | null;
  floor: number | null;
  building: string | null;
  surfaceArea: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  totalRooms: number | null;
  furnishing: string;
  amenities: string[];
  monthlyRent: string;
  deposit: string | null;
  commissionRate: string;
  utilities: string | null;
  discountWeekly: string | null;
  discountBiweekly: string | null;
  discountMonthly: string | null;
  discountQuarterly: string | null;
  discountYearly: string | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  minLeaseDuration: number | null;
  contractRef: string | null;
  photos: string[];
  coverPhoto: string | null;
  description: string | null;
  descriptionCn: string | null;
  notes: string | null;
  isFeatured: boolean;
  _count: { payments: number };
}

interface CityItem {
  id: string;
  name: string;
  pinyin: string;
}

interface AgencyItem {
  id: string;
  name: string;
}

// ─── Constants ───────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  AVAILABLE: { label: "Disponible", variant: "default" },
  RENTED: { label: "Loué", variant: "secondary" },
  MAINTENANCE: { label: "Maintenance", variant: "outline" },
  OFFLINE: { label: "Hors ligne", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  ROOM: "Chambre",
  STUDIO: "Studio",
  VILLA: "Villa",
  LOFT: "Loft",
};

// ─── Table columns ───────────────────────────────────────────

const columnHelper = createColumnHelper<Property>();

const columns = [
  columnHelper.accessor("title", {
    header: "Propriété",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#FF385C]/10 to-[#F7F7F7]">
            {row.coverPhoto && (
              <img
                src={row.coverPhoto}
                alt={row.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium text-[#222222]">{row.title}</p>
            <p className="text-xs text-[#6A6A6A]">
              {typeLabels[row.type] ?? row.type}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("city", {
    header: "Ville",
    cell: (info) => {
      const city = info.getValue();
      const district = info.row.original.district;
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="size-3.5 text-[#6A6A6A]" />
          <span>
            {city.pinyin}
            {district ? `, ${district}` : ""}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("agency", {
    header: "Agence",
    cell: (info) => (
      <span className="text-sm">{info.getValue().name}</span>
    ),
  }),
  columnHelper.accessor("bedrooms", {
    header: "Ch.",
    cell: (info) => (
      <span className="flex items-center gap-1 text-sm">
        <BedDouble className="size-3.5" />
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("bathrooms", {
    header: "SdB",
    cell: (info) => (
      <span className="flex items-center gap-1 text-sm">
        <Bath className="size-3.5" />
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("monthlyRent", {
    header: "Loyer /mois",
    cell: (info) => (
      <span className="font-medium text-[#222222]">
        {Number(info.getValue()).toLocaleString("fr-FR")} €
      </span>
    ),
  }),
  columnHelper.accessor("commissionRate", {
    header: "Commission",
    cell: (info) => (
      <span className="text-sm text-[#6A6A6A]">
        {Number(info.getValue())}%
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Statut",
    cell: (info) => {
      const s = statusConfig[info.getValue()] ?? {
        label: info.getValue(),
        variant: "outline" as const,
      };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: () => null, // Filled in the component with callbacks
  }),
];

// ─── Component ───────────────────────────────────────────────

export function PropertiesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Queries
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (cityFilter) params.set("cityId", cityFilter);
  if (agencyFilter) params.set("agencyId", agencyFilter);
  if (typeFilter) params.set("type", typeFilter);
  if (statusFilter) params.set("status", statusFilter);

  const { data, isLoading } = useQuery<{ success: boolean; data: Property[] }>(
    {
      queryKey: ["properties", search, cityFilter, agencyFilter, typeFilter, statusFilter],
      queryFn: () =>
        fetch(`/api/properties?${params.toString()}`).then((r) => r.json()),
    }
  );

  const { data: citiesData } = useQuery<{ success: boolean; data: CityItem[] }>({
    queryKey: ["cities"],
    queryFn: () => fetch("/api/cities?active=true").then((r) => r.json()),
  });

  const { data: agenciesData } = useQuery<{
    success: boolean;
    data: AgencyItem[];
  }>({
    queryKey: ["agencies"],
    queryFn: () => fetch("/api/agencies?status=ACTIVE").then((r) => r.json()),
  });

  const properties = data?.data ?? [];
  const cities = citiesData?.data ?? [];
  const agencies = agenciesData?.data ?? [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setDeleteOpen(false);
      setDeleteTarget(null);
    },
  });

  // Table
  const tableColumns = columns.map((col) => {
    if (col.id === "actions") {
      return columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleEdit(info.row.original)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(info.row.original)}
              className="text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      });
    }
    return col;
  });

  const table = useReactTable({
    data: properties,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handlers
  function handleEdit(property: Property) {
    router.push(`/properties/${property.id}/edit`);
  }

  function handleDelete(property: Property) {
    setDeleteTarget(property);
    setDeleteOpen(true);
  }

  function handleAdd() {
    setEditProperty(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Propriétés" description="Gérez vos biens immobiliers">
        <Button
          onClick={handleAdd}
          className="bg-[#FF385C] text-white hover:bg-[#E0294D]"
        >
          <Plus className="size-4" />
          Ajouter
        </Button>
      </PageHeader>

      {/* ─── Filter bar ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#6A6A6A]" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={cityFilter} onValueChange={(v) => setCityFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.pinyin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agencyFilter} onValueChange={(v) => setAgencyFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes</SelectItem>
            {agencies.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="APARTMENT">Appartement</SelectItem>
            <SelectItem value="HOUSE">Maison</SelectItem>
            <SelectItem value="ROOM">Chambre</SelectItem>
            <SelectItem value="STUDIO">Studio</SelectItem>
            <SelectItem value="VILLA">Villa</SelectItem>
            <SelectItem value="LOFT">Loft</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="RENTED">Loué</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="OFFLINE">Hors ligne</SelectItem>
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-[#EBEBEB] p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl ring-1 ring-[#EBEBEB]">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DDDDDD] bg-white py-16 text-center">
          <BedDouble className="mb-3 size-10 text-[#DDDDDD]" />
          <p className="text-sm font-medium text-[#222222]">
            Aucune propriété trouvée
          </p>
          <p className="mt-1 text-xs text-[#6A6A6A]">
            Ajoutez votre première propriété pour commencer.
          </p>
          <Button
            onClick={handleAdd}
            className="mt-4 bg-[#FF385C] text-white hover:bg-[#E0294D]"
          >
            <Plus className="size-4" />
            Ajouter une propriété
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={(p) => handleEdit(property)}
              onDelete={(p) => handleDelete(property)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#EBEBEB]">
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
        </div>
      )}

      {/* ─── Dialogs ───────────────────────────────── */}
      <PropertyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProperty(null);
        }}
        property={editProperty as Record<string, unknown> | null}
      />

      <DeletePropertyDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        propertyTitle={deleteTarget?.title ?? ""}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
