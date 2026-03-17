"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Globe,
  Heart,
} from "lucide-react";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  slug: string;
  type: string;
  listingType: string;
  coverPhoto: string | null;
  photos: string[];
  address: string;
  district: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  surfaceArea: string | null;
  monthlyRent: string | number;
  furnishing: string;
  amenities: string[];
  isFeatured: boolean;
  discountWeekly: string | null;
  discountMonthly: string | null;
  city: { id: string; name: string; pinyin: string };
  agency: { name: string };
}

interface City {
  id: string;
  name: string;
  pinyin: string;
}

interface CuratedList {
  id: string;
  title: string;
  slug: string;
  items: { id: string; order: number; property: Property }[];
}

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

function formatRent(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} €`;
}

/* ─── Category Tabs with PNG isometric icons ─── */
const categories = [
  { key: "", label: "Tous", icon: "/icons/bell.png" },
  { key: "APARTMENT", label: "Appartements", icon: "/icons/apartment.png" },
  { key: "HOUSE", label: "Maisons", icon: "/icons/house.png" },
  { key: "STUDIO", label: "Studios", icon: "/icons/studio.png" },
  { key: "VILLA", label: "Villas", icon: "/icons/living-room.png" },
  { key: "LOFT", label: "Lofts", icon: "/icons/kitchen.png" },
  { key: "ROOM", label: "Chambres", icon: "/icons/pet-room.png" },
];

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

/* ─── Services offered by Chinefy (fallback) ─── */
const fallbackServices = [
  {
    icon: "/icons/apartment.png",
    title: "Logements vérifiés",
    description: "Appartements, villas, studios — inspectés et gérés par nos agences partenaires en Chine.",
  },
  {
    icon: "/icons/legal.png",
    title: "Aide juridique",
    description: "Accompagnement pour vos contrats, visas et démarches administratives en Chine.",
  },
  {
    icon: "/icons/flight.png",
    title: "Billets d'avion",
    description: "Organisation complète de votre voyage : réservation de vols aux meilleurs tarifs.",
  },
  {
    icon: "/icons/location-pin.png",
    title: "Transfert aéroport",
    description: "Service de transfert depuis l'aéroport jusqu'à votre logement, sans stress.",
  },
  {
    icon: "/icons/car-rental.png",
    title: "Location de voiture",
    description: "Véhicules disponibles à la réservation pour vos déplacements sur place.",
  },
  {
    icon: "/icons/factory.png",
    title: "Mise en relation Factory",
    description: "Connectez-vous directement avec des usines et fournisseurs chinois de confiance.",
  },
  {
    icon: "/icons/llc.png",
    title: "Création LLC Delaware",
    description: "Création de votre société américaine (LLC) pour faciliter vos échanges commerciaux.",
  },
  {
    icon: "/icons/agent.png",
    title: "Accompagnement personnalisé",
    description: "Un interlocuteur dédié bilingue pour toutes vos questions et besoins sur place.",
  },
];

/* ─── Favorite Button ─── */
function FavButton({ propertyId }: { propertyId: string }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const favs: string[] = JSON.parse(localStorage.getItem("chinefy_favorites") || "[]");
    setLiked(favs.includes(propertyId));
  }, [propertyId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs: string[] = JSON.parse(localStorage.getItem("chinefy_favorites") || "[]");
    const next = liked ? favs.filter((id) => id !== propertyId) : [...favs, propertyId];
    localStorage.setItem("chinefy_favorites", JSON.stringify(next));
    setLiked(!liked);
  };

  return (
    <button
      onClick={toggle}
      className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
      aria-label="Ajouter aux favoris"
    >
      <Heart
        className={`size-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-colors ${
          liked ? "fill-[#FF385C] text-[#FF385C]" : "fill-black/50 text-white"
        }`}
        strokeWidth={liked ? 0 : 2}
      />
    </button>
  );
}

/* ─── Horizontal Carousel Card ─── */
function CarouselPropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/p/${property.slug}`} className="group block w-[72vw] shrink-0 sm:w-[300px]">
      <div className="overflow-hidden rounded-2xl">
        <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl">
          {property.coverPhoto ? (
            <img
              src={property.coverPhoto}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF385C]/8 via-[#FF385C]/4 to-[#F7F7F7]">
              <BedDouble className="size-12 text-[#FF385C]/20" />
            </div>
          )}

          <FavButton propertyId={property.id} />

          {property.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#222222] shadow-sm">
                <Sparkles className="size-3 text-[#FF385C]" />
                Coup de cœur
              </span>
            </div>
          )}

          {property.discountMonthly && Number(property.discountMonthly) > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-[#008A05] px-2.5 py-1 text-xs font-medium text-white">
                -{Number(property.discountMonthly)}% mensuel
              </span>
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3 className="font-display text-[15px] font-semibold text-[#222222]">
            {property.city.pinyin}{property.district ? `, ${property.district}` : ""}
          </h3>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">
            {typeLabels[property.type]} · {listingTypeLabels[property.listingType]}
          </p>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">
            {property.bedrooms} ch · {property.beds} lit{property.beds > 1 ? "s" : ""} · {property.bathrooms} sdb
          </p>
          <p className="mt-1.5">
            <span className="font-display text-[15px] font-semibold text-[#222222]">
              {formatRent(property.monthlyRent)}
            </span>
            <span className="text-sm text-[#6A6A6A]"> /mois</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Grid Property Card (desktop) ─── */
function GridPropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/p/${property.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl">
          {property.coverPhoto ? (
            <img
              src={property.coverPhoto}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF385C]/8 via-[#FF385C]/4 to-[#F7F7F7]">
              <BedDouble className="size-12 text-[#FF385C]/20" />
            </div>
          )}

          <FavButton propertyId={property.id} />

          {property.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#222222] shadow-sm">
                <Sparkles className="size-3 text-[#FF385C]" />
                Coup de cœur
              </span>
            </div>
          )}

          {property.discountMonthly && Number(property.discountMonthly) > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-[#008A05] px-2.5 py-1 text-xs font-medium text-white">
                -{Number(property.discountMonthly)}% mensuel
              </span>
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3 className="font-display text-[15px] font-semibold text-[#222222]">
            {property.city.pinyin}{property.district ? `, ${property.district}` : ""}
          </h3>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">
            {typeLabels[property.type]} · {listingTypeLabels[property.listingType]}
          </p>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">
            {property.bedrooms} ch · {property.beds} lit{property.beds > 1 ? "s" : ""} · {property.bathrooms} sdb · {property.maxGuests} voyageur{property.maxGuests > 1 ? "s" : ""}
          </p>
          <p className="mt-1.5">
            <span className="font-display text-[15px] font-semibold text-[#222222]">
              {formatRent(property.monthlyRent)}
            </span>
            <span className="text-sm text-[#6A6A6A]"> /mois</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Horizontal Scroll Section ─── */
function PropertyCarousel({
  title,
  properties,
}: {
  title: string;
  properties: Property[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (properties.length === 0) return null;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 sm:px-0">
        <h2 className="font-display text-lg font-semibold text-[#222222] sm:text-xl">
          {title}
        </h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            className="flex size-8 items-center justify-center rounded-full border border-[#DDDDDD] text-[#222222] transition-colors hover:bg-[#F7F7F7] disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex size-8 items-center justify-center rounded-full border border-[#DDDDDD] text-[#222222] transition-colors hover:bg-[#F7F7F7] disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-none sm:px-0"
      >
        {properties.map((property) => (
          <CarouselPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}

/* ─── Destination Category (from API) ─── */
interface DestinationLink {
  id: string;
  title: string;
  subtitle: string | null;
  href: string | null;
  order: number;
}

interface DestinationCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  links: DestinationLink[];
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF385C] border-t-transparent" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get("city") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlType = searchParams.get("type") || "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(urlType);
  const [destinations, setDestinations] = useState<DestinationCategory[]>([]);
  const [activeDestTab, setActiveDestTab] = useState("");
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [activeCategory, urlCity, urlSearch]);

  useEffect(() => {
    fetch("/api/public/destinations")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setDestinations(json.data);
          setActiveDestTab(json.data[0].slug);
        }
      })
      .catch(() => {});

    fetch("/api/public/lists")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCuratedLists(json.data);
      })
      .catch(() => {});

    fetch("/api/public/services")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setServices(json.data);
      })
      .catch(() => {});
  }, []);

  async function fetchProperties() {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("type", activeCategory);
    if (urlCity) params.set("cityId", urlCity);
    if (urlSearch) params.set("search", urlSearch);

    const res = await fetch(`/api/public/properties?${params}`);
    const json = await res.json();
    if (json.success) {
      setProperties(json.data);
      setCities(json.cities);
    }
    setLoading(false);
  }

  const activeDestination = destinations.find((d) => d.slug === activeDestTab);

  // Group properties by city for carousels
  const propertiesByCity = properties.reduce<Record<string, Property[]>>(
    (acc, p) => {
      const key = p.city.pinyin;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {}
  );

  const featuredProperties = properties.filter((p) => p.isFeatured);

  return (
    <>
      {/* ── Section 1: Category Tabs (Airbnb style horizontal scroll — centered) ── */}
      <section className="border-b border-[#EBEBEB] bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-1 overflow-x-auto px-5 pt-3 pb-0 scrollbar-none sm:gap-2 sm:pt-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-3 pt-1 transition-colors sm:px-4 ${
                    isActive
                      ? "border-[#222222] text-[#222222]"
                      : "border-transparent text-[#6A6A6A] hover:border-[#DDDDDD] hover:text-[#222222]"
                  }`}
                >
                  <img
                    src={cat.icon}
                    alt={cat.label}
                    className="size-7 object-contain sm:size-8"
                  />
                  <span className="text-[10px] font-medium whitespace-nowrap sm:text-xs">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Featured Properties Carousel ── */}
      {loading ? (
        <section className="mx-auto max-w-7xl py-6 sm:py-8">
          <div className="px-5 sm:px-0">
            <div className="h-5 w-48 animate-pulse rounded bg-[#F7F7F7]" />
          </div>
          <div className="mt-4 flex gap-4 overflow-hidden px-5 sm:px-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[72vw] shrink-0 animate-pulse sm:w-[300px]">
                <div className="aspect-[20/19] rounded-2xl bg-[#F7F7F7]" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#F7F7F7]" />
                  <div className="h-3 w-1/2 rounded bg-[#F7F7F7]" />
                  <div className="h-4 w-1/3 rounded bg-[#F7F7F7]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : properties.length === 0 ? (
        <section className="py-20 text-center">
          <MapPin className="mx-auto size-12 text-[#DDDDDD]" />
          <h2 className="font-display mt-4 text-xl font-semibold text-[#222222]">
            Aucune propriété trouvée
          </h2>
          <p className="mt-2 text-sm text-[#6A6A6A]">
            Essayez une autre catégorie.
          </p>
        </section>
      ) : (
        <div className="mx-auto max-w-7xl">
          {/* Featured carousel */}
          {featuredProperties.length > 0 && (
            <section className="py-6 sm:py-8">
              <PropertyCarousel
                title="Coups de cœur des voyageurs"
                properties={featuredProperties}
              />
            </section>
          )}

          {/* ── Section 3: Auto-generated city carousels ── */}
          {Object.entries(propertiesByCity).map(([cityName, cityProperties]) => (
            <section key={cityName} className="border-t border-[#EBEBEB] py-6 sm:py-8">
              <PropertyCarousel
                title={`Logements populaires · ${cityName}`}
                properties={cityProperties}
              />
            </section>
          ))}

          {/* ── Section 3b: Admin curated lists ── */}
          {curatedLists.map((list) => (
            <section key={list.id} className="border-t border-[#EBEBEB] py-6 sm:py-8">
              <PropertyCarousel
                title={list.title}
                properties={list.items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => item.property)}
              />
            </section>
          ))}

          {/* ── Section 4: All Properties Grid (desktop) ── */}
          <section className="border-t border-[#EBEBEB] py-8 sm:py-10">
            <div className="px-5 sm:px-0">
              <h2 className="font-display text-xl font-bold text-[#222222] sm:text-2xl">
                {activeCategory
                  ? `${typeLabels[activeCategory]}s disponibles`
                  : "Tous les logements"}
              </h2>
              <p className="mt-1 text-sm text-[#6A6A6A]">
                {properties.length} logement{properties.length > 1 ? "s" : ""} disponible{properties.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-6 grid gap-6 px-5 sm:grid-cols-2 sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <GridPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── Section 5: Destination Ideas (dynamic from dashboard) ── */}
      {destinations.length > 0 && (
        <section className="border-t border-[#EBEBEB] bg-[#F7F7F7] py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="font-display text-xl font-bold text-[#222222] sm:text-2xl">
              Des idées pour vos prochaines escapades
            </h2>

            {/* Category tab pills */}
            <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-none">
              {destinations.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveDestTab(cat.slug)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeDestTab === cat.slug
                      ? "bg-[#222222] text-white"
                      : "bg-white text-[#222222] hover:bg-[#EBEBEB]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Links grid — 2 columns on mobile, 4 on desktop */}
            {activeDestination && activeDestination.links.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                {activeDestination.links.map((link) => (
                  <div key={link.id} className="text-left">
                    <p className="text-sm font-medium text-[#222222]">
                      {link.title}
                    </p>
                    {link.subtitle && (
                      <p className="text-xs text-[#6A6A6A]">{link.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Section 6: Services Chinefy ── */}
      <section className="border-t border-[#EBEBEB] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-[#222222] sm:text-3xl">
              Bien plus que des logements
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#6A6A6A] sm:text-base">
              Chinefy vous accompagne dans tous les aspects de votre installation et de vos affaires en Chine.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(services.length > 0 ? services : fallbackServices).map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#DDDDDD] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
              >
                <img
                  src={service.icon || ""}
                  alt={service.title}
                  className="size-14 object-contain"
                />
                <h3 className="font-display mt-4 text-[15px] font-semibold text-[#222222]">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6A6A6A]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Footer ── */}
      <footer className="border-t border-[#EBEBEB] bg-[#F7F7F7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">
                Assistance
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                <span className="text-sm text-[#6A6A6A]">Centre d&apos;aide</span>
                <span className="text-sm text-[#6A6A6A]">Problème de sécurité</span>
                <span className="text-sm text-[#6A6A6A]">Options d&apos;annulation</span>
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">
                CHINEFY
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                <span className="text-sm text-[#6A6A6A]">Gestion immobilière en Chine</span>
                <span className="text-sm text-[#6A6A6A]">Nos agences partenaires</span>
                <span className="text-sm text-[#6A6A6A]">Devenir partenaire</span>
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">
                Villes
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {cities.slice(0, 5).map((c) => (
                  <span key={c.id} className="text-sm text-[#6A6A6A]">
                    {c.pinyin} ({c.name})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-[#EBEBEB] pt-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[#6A6A6A]">
              <span>© {new Date().getFullYear()} CHINEFY</span>
              <span>·</span>
              <span>Confidentialité</span>
              <span>·</span>
              <span>Conditions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6A6A6A]">
              <Globe className="size-4" />
              <span>Français (FR)</span>
              <span className="ml-2">€ EUR</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
