import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  TERMINATED: "bg-red-100 text-red-700",
  AVAILABLE: "bg-blue-100 text-blue-700",
  RENTED: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  OFFLINE: "bg-gray-100 text-gray-700",
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  PAUSED: "En pause",
  TERMINATED: "Résilié",
  AVAILABLE: "Disponible",
  RENTED: "Loué",
  MAINTENANCE: "Maintenance",
  OFFLINE: "Hors ligne",
  PAID: "Payé",
  PENDING: "En attente",
  OVERDUE: "En retard",
  PARTIAL: "Partiel",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusColors[status] ?? "bg-gray-100 text-gray-700",
        className
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
