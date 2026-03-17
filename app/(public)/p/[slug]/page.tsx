"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Share,
  Wifi,
  Car,
  Tv,
  Wind,
  Flame,
  Utensils,
  WashingMachine,
  Dumbbell,
  ShieldCheck,
  Bath,
  Snowflake,
  Coffee,
  Refrigerator,
  Microwave,
  Laptop,
  Lock,
  BedDouble,
  MapPin,
  Ruler,
  Building,
  Sofa,
  Users,
  Home,
  CalendarDays,
  Minus,
  Plus,
  type LucideIcon,
} from "lucide-react";

/* ─── Label Maps ─── */

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  ROOM: "Chambre",
  STUDIO: "Studio",
  VILLA: "Villa",
  LOFT: "Loft",
};

const listingTypeLabels: Record<string, string> = {
  ENTIRE_PLACE: "Logement entier",
  PRIVATE_ROOM: "Chambre privée",
  SHARED_ROOM: "Chambre partagée",
};

const furnishingLabels: Record<string, string> = {
  FURNISHED: "Meublé",
  UNFURNISHED: "Non meublé",
  SEMI_FURNISHED: "Semi-meublé",
};

/* ─── Amenity → Icon Map ─── */

const amenityIcons: Record<string, { icon: LucideIcon; label: string }> = {
  wifi: { icon: Wifi, label: "Wifi" },
  parking: { icon: Car, label: "Parking" },
  tv: { icon: Tv, label: "Télévision" },
  climatisation: { icon: Wind, label: "Climatisation" },
  chauffage: { icon: Flame, label: "Chauffage" },
  cuisine: { icon: Utensils, label: "Cuisine équipée" },
  "lave-linge": { icon: WashingMachine, label: "Lave-linge" },
  "salle-de-sport": { icon: Dumbbell, label: "Salle de sport" },
  securite: { icon: ShieldCheck, label: "Sécurité 24h" },
  baignoire: { icon: Bath, label: "Baignoire" },
  "air-conditionne": { icon: Snowflake, label: "Air conditionné" },
  "machine-a-cafe": { icon: Coffee, label: "Machine à café" },
  refrigerateur: { icon: Refrigerator, label: "Réfrigérateur" },
  "micro-ondes": { icon: Microwave, label: "Micro-ondes" },
  "espace-travail": { icon: Laptop, label: "Espace de travail" },
  coffre: { icon: Lock, label: "Coffre-fort" },
};

function getAmenityInfo(amenity: string): { icon: LucideIcon; label: string } {
  const key = amenity.toLowerCase().replace(/[\s_]/g, "-");
  return amenityIcons[key] || { icon: ShieldCheck, label: amenity };
}

/* ─── Format Helpers ─── */

function formatRent(value: string | number) {
  return Number(value).toLocaleString("fr-FR") + " €";
}

/* ─── Property Interface ─── */

interface PropertyDetail {
  id: string;
  title: string;
  slug: string;
  type: string;
  listingType: string;
  status: string;
  coverPhoto: string | null;
  photos: string[];
  address: string;
  district: string | null;
  floor: number | null;
  building: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  totalRooms: number | null;
  surfaceArea: string | null;
  monthlyRent: string | number;
  deposit: string | null;
  utilities: string | null;
  furnishing: string;
  amenities: string[];
  description: string | null;
  descriptionCn: string | null;
  isFeatured: boolean;
  discountWeekly: string | null;
  discountBiweekly: string | null;
  discountMonthly: string | null;
  discountQuarterly: string | null;
  discountYearly: string | null;
  minLeaseDuration: number | null;
  city: { name: string; pinyin: string };
  agency: { name: string };
}

/* ─── Photo Gallery ─── */

function PhotoGallery({ property }: { property: PropertyDetail }) {
  const allPhotos = [
    property.coverPhoto,
    ...property.photos.filter((p) => p !== property.coverPhoto),
  ].filter(Boolean) as string[];

  const mainPhoto = allPhotos[0];
  const sidePhotos = allPhotos.slice(1, 5);

  if (allPhotos.length === 0) {
    return (
      <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-[#FF385C]/8 via-[#FF385C]/4 to-[#F7F7F7] flex items-center justify-center">
        <BedDouble className="size-16 text-[#FF385C]/20" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:h-[60vh] sm:min-h-[400px] sm:max-h-[560px]">
      {/* Main large image */}
      <div className="sm:col-span-2 sm:row-span-2 overflow-hidden rounded-l-2xl sm:rounded-l-2xl rounded-r-2xl sm:rounded-r-none">
        <img
          src={mainPhoto}
          alt={property.title}
          className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
        />
      </div>

      {/* Side images — 2x2 grid */}
      {sidePhotos.map((photo, i) => (
        <div
          key={i}
          className={`hidden sm:block overflow-hidden ${
            i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""
          }`}
        >
          <img
            src={photo}
            alt={`${property.title} - ${i + 2}`}
            className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
          />
        </div>
      ))}

      {/* Fill empty grid slots if fewer than 4 side photos */}
      {Array.from({ length: Math.max(0, 4 - sidePhotos.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className={`hidden sm:flex items-center justify-center bg-[#F7F7F7] ${
            sidePhotos.length + i === 1 ? "rounded-tr-2xl" : ""
          } ${sidePhotos.length + i === 3 ? "rounded-br-2xl" : ""}`}
        >
          <BedDouble className="size-8 text-[#DDDDDD]" />
        </div>
      ))}
    </div>
  );
}

/* ─── Booking Card ─── */

/* ─── Mini Calendar (inline, no external deps) ─── */

const FR_MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const FR_DAYS = ["lu", "ma", "me", "je", "ve", "sa", "di"];

function getMondayStart(year: number, month: number) {
  const first = new Date(year, month, 1);
  const day = first.getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d: Date, from: Date, to: Date) {
  return d > from && d < to;
}

function MiniCalendar({
  checkin,
  checkout,
  onSelect,
}: {
  checkin: Date | null;
  checkout: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  const canPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const startDay = getMondayStart(viewYear, viewMonth);
  const daysCount = getDaysInMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev}
          disabled={!canPrev}
          className="flex size-8 items-center justify-center rounded-full hover:bg-[#F7F7F7] disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-[#222222] capitalize">
          {FR_MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={next}
          className="flex size-8 items-center justify-center rounded-full hover:bg-[#F7F7F7]"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {FR_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-[#6A6A6A] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="aspect-square" />;

          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isCheckin = checkin && isSameDay(date, checkin);
          const isCheckout = checkout && isSameDay(date, checkout);
          const isInRange = checkin && checkout && isBetween(date, checkin, checkout);
          const isSelected = isCheckin || isCheckout;

          return (
            <button
              key={`d-${day}`}
              disabled={isPast}
              onClick={() => !isPast && onSelect(date)}
              className={`
                relative aspect-square flex items-center justify-center text-[13px] transition-colors
                ${isPast ? "text-[#B0B0B0] cursor-default" : "text-[#222222] hover:bg-[#F7F7F7] cursor-pointer"}
                ${isSelected ? "!bg-[#222222] !text-white rounded-full font-semibold" : ""}
                ${isInRange ? "!bg-[#F7F7F7]" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Guest Counter Row ─── */

function GuestRow({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-[#222222]">{label}</p>
        <p className="text-xs text-[#6A6A6A]">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex size-8 items-center justify-center rounded-full border border-[#B0B0B0] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-medium text-[#222222]">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex size-8 items-center justify-center rounded-full border border-[#B0B0B0] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Booking Card ─── */

function BookingCard({ property }: { property: PropertyDetail }) {
  const hasDiscount =
    property.discountMonthly && Number(property.discountMonthly) > 0;
  const discountPercent = hasDiscount ? Number(property.discountMonthly) : 0;
  const originalRent = Number(property.monthlyRent);
  const discountedRent = hasDiscount
    ? Math.round(originalRent * (1 - discountPercent / 100))
    : originalRent;

  // Date state
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingCheckout, setSelectingCheckout] = useState(false);

  // Guest state
  const [showGuests, setShowGuests] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const calRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuests(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDateSelect(d: Date) {
    if (!selectingCheckout || !checkin) {
      // Selecting check-in
      setCheckin(d);
      setCheckout(null);
      setSelectingCheckout(true);
    } else {
      // Selecting checkout
      if (d <= checkin) {
        // If before checkin, restart
        setCheckin(d);
        setCheckout(null);
      } else {
        setCheckout(d);
        setSelectingCheckout(false);
        setShowCalendar(false);
      }
    }
  }

  function clearDates() {
    setCheckin(null);
    setCheckout(null);
    setSelectingCheckout(false);
  }

  const totalGuests = adults + children;
  const guestLabel =
    totalGuests === 1
      ? "1 voyageur"
      : `${totalGuests} voyageurs`;
  const guestSublabel = infants > 0 ? `, ${infants} bébé${infants > 1 ? "s" : ""}` : "";

  // Calculate nights and total
  const nights = checkin && checkout
    ? Math.round((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const nightlyRate = originalRent / 30;
  const totalPrice = nights ? Math.round(nightlyRate * nights) : null;

  function formatDateShort(d: Date) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      {/* Price */}
      <div className="flex items-baseline gap-2">
        {hasDiscount ? (
          <>
            <span className="font-display text-[22px] font-semibold text-[#222222]">
              {formatRent(discountedRent)}
            </span>
            <span className="text-base text-[#6A6A6A] line-through">
              {formatRent(originalRent)}
            </span>
            <span className="text-sm text-[#6A6A6A]">/ mois</span>
          </>
        ) : (
          <>
            <span className="font-display text-[22px] font-semibold text-[#222222]">
              {formatRent(originalRent)}
            </span>
            <span className="text-sm text-[#6A6A6A]">/ mois</span>
          </>
        )}
      </div>

      {hasDiscount && (
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
            -{discountPercent}% réduction mensuelle
          </span>
        </div>
      )}

      {/* ── Date Picker ── */}
      <div className="relative mt-5" ref={calRef}>
        <div
          className={`grid grid-cols-2 overflow-hidden rounded-t-lg border ${showCalendar ? "border-[#222222]" : "border-[#B0B0B0]"}`}
        >
          <button
            onClick={() => {
              setShowCalendar(true);
              setSelectingCheckout(false);
            }}
            className={`px-3 py-2.5 text-left transition-colors ${
              showCalendar && !selectingCheckout ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#222222]">Arrivée</p>
            <p className={`text-sm ${checkin ? "text-[#222222]" : "text-[#B0B0B0]"}`}>
              {checkin ? formatDateShort(checkin) : "Ajouter"}
            </p>
          </button>
          <button
            onClick={() => {
              setShowCalendar(true);
              setSelectingCheckout(true);
            }}
            className={`border-l border-[#B0B0B0] px-3 py-2.5 text-left transition-colors ${
              showCalendar && selectingCheckout ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#222222]">Départ</p>
            <p className={`text-sm ${checkout ? "text-[#222222]" : "text-[#B0B0B0]"}`}>
              {checkout ? formatDateShort(checkout) : "Ajouter"}
            </p>
          </button>
        </div>

        {/* Guest selector trigger */}
        <div ref={guestRef} className="relative">
          <button
            onClick={() => setShowGuests(!showGuests)}
            className={`w-full rounded-b-lg border border-t-0 ${showGuests ? "border-[#222222]" : "border-[#B0B0B0]"} px-3 py-2.5 text-left transition-colors hover:bg-[#F7F7F7]`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#222222]">Voyageurs</p>
            <p className="text-sm text-[#222222]">
              {guestLabel}{guestSublabel}
            </p>
          </button>

          {/* Guest dropdown */}
          {showGuests && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#DDDDDD] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <GuestRow label="Adultes" sublabel="13 ans et plus" value={adults} min={1} max={property.maxGuests} onChange={setAdults} />
              <div className="border-t border-[#EBEBEB]" />
              <GuestRow label="Enfants" sublabel="2 à 12 ans" value={children} min={0} max={Math.max(0, property.maxGuests - adults)} onChange={setChildren} />
              <div className="border-t border-[#EBEBEB]" />
              <GuestRow label="Bébés" sublabel="Moins de 2 ans" value={infants} min={0} max={5} onChange={setInfants} />
            </div>
          )}
        </div>

        {/* Calendar dropdown */}
        {showCalendar && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#DDDDDD] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <MiniCalendar
              checkin={checkin}
              checkout={checkout}
              onSelect={handleDateSelect}
            />
            {(checkin || checkout) && (
              <button
                onClick={clearDates}
                className="mt-3 text-xs font-semibold text-[#222222] underline"
              >
                Effacer les dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Price Breakdown ── */}
      {nights && totalPrice && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6A6A6A] underline">
              {formatRent(Math.round(nightlyRate))} x {nights} nuit{nights > 1 ? "s" : ""}
            </span>
            <span className="text-[#222222]">{formatRent(totalPrice)}</span>
          </div>
          {property.utilities && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6A6A6A] underline">Charges estimées</span>
              <span className="text-[#222222]">
                {formatRent(Math.round(Number(property.utilities) * nights / 30))}
              </span>
            </div>
          )}
          <div className="border-t border-[#EBEBEB] pt-2">
            <div className="flex items-center justify-between text-base font-semibold">
              <span className="text-[#222222]">Total</span>
              <span className="text-[#222222]">
                {formatRent(
                  totalPrice +
                    (property.utilities ? Math.round(Number(property.utilities) * nights / 30) : 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <Link
        href={`/p/${property.slug}/checkout${checkin && checkout ? `?checkin=${checkin.toISOString().split("T")[0]}&checkout=${checkout.toISOString().split("T")[0]}&adults=${adults}&children=${children}&infants=${infants}` : ""}`}
        className="mt-5 block w-full rounded-xl bg-[#FF385C] py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-[#E31C5F] active:scale-[0.98]"
      >
        Réserver
      </Link>

      <button className="mt-3 w-full rounded-xl border border-[#222222] py-3.5 text-base font-semibold text-[#222222] transition-colors hover:bg-[#F7F7F7] active:scale-[0.98]">
        Contacter l&apos;agence
      </button>

      <p className="mt-4 text-center text-xs text-[#6A6A6A]">
        Aucun montant ne vous sera débité pour le moment
      </p>
    </div>
  );
}

/* ─── Loading Skeleton ─── */

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 animate-pulse">
      {/* Gallery skeleton */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 h-[400px]">
        <div className="sm:col-span-2 sm:row-span-2 rounded-l-2xl bg-[#F7F7F7]" />
        <div className="hidden sm:block bg-[#F7F7F7]" />
        <div className="hidden sm:block rounded-tr-2xl bg-[#F7F7F7]" />
        <div className="hidden sm:block bg-[#F7F7F7]" />
        <div className="hidden sm:block rounded-br-2xl bg-[#F7F7F7]" />
      </div>

      {/* Content skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-2/3 rounded bg-[#F7F7F7]" />
          <div className="h-5 w-1/2 rounded bg-[#F7F7F7]" />
          <div className="h-px bg-[#EBEBEB] my-6" />
          <div className="h-5 w-1/3 rounded bg-[#F7F7F7]" />
          <div className="h-px bg-[#EBEBEB] my-6" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-[#F7F7F7]" />
            <div className="h-4 w-5/6 rounded bg-[#F7F7F7]" />
            <div className="h-4 w-4/6 rounded bg-[#F7F7F7]" />
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="h-[360px] rounded-2xl bg-[#F7F7F7]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/public/properties/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setProperty(json.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Share handler ── */
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: property?.title || "Logement Chinefy",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return <LoadingSkeleton />;
  }

  /* ── Not found ── */
  if (notFound || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5">
        <Home className="size-16 text-[#DDDDDD]" />
        <h1 className="font-display mt-6 text-2xl font-semibold text-[#222222]">
          Logement introuvable
        </h1>
        <p className="mt-2 text-sm text-[#6A6A6A]">
          Ce logement n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#FF385C] px-8 py-3 text-sm font-semibold text-white hover:bg-[#E31C5F] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const typeLabel = typeLabels[property.type] || property.type;
  const listingLabel = listingTypeLabels[property.listingType] || property.listingType;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top Bar: Back + Share ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#EBEBEB] sm:relative sm:border-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-[#222222] hover:underline"
          >
            <ChevronLeft className="size-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#222222] hover:bg-[#F7F7F7] transition-colors"
          >
            <Share className="size-4" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>
      </div>

      {/* ── Photo Gallery ── */}
      <div className="mx-auto max-w-7xl px-0 sm:px-5">
        <PhotoGallery property={property} />
      </div>

      {/* ── "Perle rare" Banner (featured properties) ── */}
      {property.isFeatured && (
        <div className="mx-auto max-w-7xl px-5 mt-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#FFF0F3] border border-[#FFD6DE] px-5 py-3.5">
            <span className="text-lg" role="img" aria-label="diamant">💎</span>
            <p className="text-sm font-medium text-[#E31C5F]">
              Perle rare ! Les réservations pour ce logement sont fréquentes.
            </p>
          </div>
        </div>
      )}

      {/* ── Content: Two Columns ── */}
      <div className="mx-auto max-w-7xl px-5 pb-24 sm:pb-12">
        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2">
            {/* Title */}
            <h1 className="font-display text-2xl font-semibold text-[#222222] sm:text-[26px]">
              {property.city.pinyin} · {typeLabel}
            </h1>
            <p className="mt-2 text-base text-[#6A6A6A]">
              {listingLabel} · {property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""} · {property.beds} lit{property.beds > 1 ? "s" : ""} · {property.bathrooms} salle{property.bathrooms > 1 ? "s" : ""} de bain · {property.maxGuests} voyageur{property.maxGuests > 1 ? "s" : ""}
            </p>

            {/* Divider */}
            <div className="my-6 border-t border-[#EBEBEB]" />

            {/* Host info */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#222222] text-white font-semibold text-lg">
                {property.agency.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-medium text-[#222222]">
                  Proposé par {property.agency.name}
                </p>
                <p className="text-sm text-[#6A6A6A]">
                  {listingLabel}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-[#EBEBEB]" />

            {/* Description */}
            <div>
              <h2 className="font-display text-lg font-semibold text-[#222222]">
                À propos de ce logement
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#6A6A6A] whitespace-pre-line">
                {property.description ||
                  `Découvrez ce ${typeLabel.toLowerCase()} situé à ${property.city.pinyin}${property.district ? `, dans le quartier ${property.district}` : ""}. Un logement idéal pour votre séjour en Chine, entièrement géré par notre agence partenaire ${property.agency.name}.`}
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-[#EBEBEB]" />

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#222222]">
                    Ce que propose ce logement
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {property.amenities.map((amenity) => {
                      const info = getAmenityInfo(amenity);
                      const Icon = info.icon;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-4 text-[#222222]"
                        >
                          <Icon className="size-6 shrink-0 text-[#6A6A6A]" />
                          <span className="text-base">{info.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[#EBEBEB]" />
              </>
            )}

            {/* Discount breakdown */}
            {(property.discountWeekly ||
              property.discountBiweekly ||
              property.discountMonthly ||
              property.discountQuarterly ||
              property.discountYearly) && (
              <>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#222222]">
                    Réductions selon la durée
                  </h2>
                  <div className="mt-4 space-y-3">
                    {property.discountWeekly && Number(property.discountWeekly) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6A6A6A]">Séjour d&apos;une semaine</span>
                        <span className="rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
                          -{Number(property.discountWeekly)}%
                        </span>
                      </div>
                    )}
                    {property.discountBiweekly && Number(property.discountBiweekly) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6A6A6A]">Séjour de deux semaines</span>
                        <span className="rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
                          -{Number(property.discountBiweekly)}%
                        </span>
                      </div>
                    )}
                    {property.discountMonthly && Number(property.discountMonthly) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6A6A6A]">Séjour d&apos;un mois</span>
                        <span className="rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
                          -{Number(property.discountMonthly)}%
                        </span>
                      </div>
                    )}
                    {property.discountQuarterly && Number(property.discountQuarterly) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6A6A6A]">Séjour de trois mois</span>
                        <span className="rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
                          -{Number(property.discountQuarterly)}%
                        </span>
                      </div>
                    )}
                    {property.discountYearly && Number(property.discountYearly) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6A6A6A]">Séjour d&apos;un an</span>
                        <span className="rounded-full bg-[#008A05]/10 px-2.5 py-1 text-xs font-medium text-[#008A05]">
                          -{Number(property.discountYearly)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[#EBEBEB]" />
              </>
            )}

            {/* Location */}
            <div>
              <h2 className="font-display text-lg font-semibold text-[#222222]">
                Où se situe le logement
              </h2>
              <div className="mt-4 flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-[#FF385C]" />
                <div>
                  <p className="text-base text-[#222222]">
                    {property.address}
                  </p>
                  <p className="mt-1 text-sm text-[#6A6A6A]">
                    {[property.district, property.city.pinyin]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Sticky Booking Card (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#EBEBEB] bg-white px-5 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              {property.discountMonthly && Number(property.discountMonthly) > 0 ? (
                <>
                  <span className="font-display text-lg font-semibold text-[#222222]">
                    {formatRent(
                      Math.round(
                        Number(property.monthlyRent) *
                          (1 - Number(property.discountMonthly) / 100)
                      )
                    )}
                  </span>
                  <span className="text-sm text-[#6A6A6A] line-through">
                    {formatRent(property.monthlyRent)}
                  </span>
                </>
              ) : (
                <span className="font-display text-lg font-semibold text-[#222222]">
                  {formatRent(property.monthlyRent)}
                </span>
              )}
              <span className="text-sm text-[#6A6A6A]">/ mois</span>
            </div>
            <p className="mt-0.5 text-xs text-[#6A6A6A]">
              Annulation gratuite avant le check-in
            </p>
          </div>
          <Link
            href={`/p/${property.slug}/checkout`}
            className="rounded-xl bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E31C5F] active:scale-[0.98] transition-all"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}
