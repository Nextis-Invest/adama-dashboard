"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, BedDouble, Bath, Users, ChevronDown, Sparkles, ShieldCheck, KeyRound, Globe, Building2, HeartHandshake, Zap } from "lucide-react";
import Link from "next/link";
import { IsometricIcon, iconPresets } from "@/components/public/isometric-icon";

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
  return `¥${Number(value).toLocaleString("zh-CN")}`;
}

function PublicPropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/p/${property.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        {/* Image */}
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

          {/* Featured badge */}
          {property.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#222222] shadow-sm">
                <Sparkles className="size-3 text-[#FF385C]" />
                Coup de cœur
              </span>
            </div>
          )}

          {/* Discount badge */}
          {property.discountMonthly && Number(property.discountMonthly) > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-[#008A05] px-2.5 py-1 text-xs font-medium text-white">
                -{Number(property.discountMonthly)}% mensuel
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[15px] font-semibold text-[#222222]">
              {property.city.pinyin}{property.district ? `, ${property.district}` : ""}
            </h3>
          </div>

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

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [cityId, type]);

  async function fetchProperties() {
    setLoading(true);
    const params = new URLSearchParams();
    if (cityId) params.set("cityId", cityId);
    if (type) params.set("type", type);
    if (search) params.set("search", search);

    const res = await fetch(`/api/public/properties?${params}`);
    const json = await res.json();
    if (json.success) {
      setProperties(json.data);
      setCities(json.cities);
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProperties();
  }

  const featuredCount = properties.filter((p) => p.isFeatured).length;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#222222] py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF385C]/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Votre logement en{" "}
              <span className="text-[#FF385C]">Chine</span>,{" "}
              simplifié.
            </h1>
            <p className="mt-4 text-base text-white/70 sm:mt-5 sm:text-lg lg:text-xl">
              Découvrez notre sélection de propriétés dans les plus grandes villes chinoises. Appartements, villas, studios — tous vérifiés et gérés par nos agences partenaires.
            </p>
          </div>

          {/* Airbnb-style search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-8 sm:mt-10"
          >
            {/* Desktop: segmented pill */}
            <div className="hidden rounded-full border border-[#DDDDDD] bg-white shadow-lg sm:flex sm:items-center">
              {/* Destination segment */}
              <div className="relative flex-1 py-3 pl-7 pr-4">
                <label className="block text-xs font-bold text-[#222222]">Destination</label>
                <input
                  type="text"
                  placeholder="Rechercher une destination"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                />
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-[#DDDDDD]" />

              {/* City segment */}
              <div className="relative py-3 pl-6 pr-4">
                <label className="block text-xs font-bold text-[#222222]">Ville</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="mt-0.5 w-full appearance-none bg-transparent text-sm text-[#222222] focus:outline-none [&:not(:valid)]:text-[#B0B0B0]"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.pinyin} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-[#DDDDDD]" />

              {/* Type segment */}
              <div className="relative py-3 pl-6 pr-4">
                <label className="block text-xs font-bold text-[#222222]">Type de bien</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-0.5 w-full appearance-none bg-transparent text-sm text-[#222222] focus:outline-none"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <div className="pr-2">
                <button
                  type="submit"
                  className="flex size-12 items-center justify-center rounded-full bg-[#FF385C] text-white transition-all hover:bg-[#E31C5F] hover:shadow-md"
                >
                  <Search className="size-5" />
                </button>
              </div>
            </div>

            {/* Mobile: stacked card */}
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:hidden">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6A6A6A]" />
                <input
                  type="text"
                  placeholder="Rechercher une destination"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#DDDDDD] bg-white py-3 pl-10 pr-4 text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:border-[#222222] focus:outline-none"
                />
              </div>

              {/* City + Type row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222222]">Ville</label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#DDDDDD] bg-white px-3 py-2.5 text-sm text-[#222222] focus:border-[#222222] focus:outline-none"
                  >
                    <option value="">Toutes</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.pinyin}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222222]">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#DDDDDD] bg-white px-3 py-2.5 text-sm text-[#222222] focus:border-[#222222] focus:outline-none"
                  >
                    <option value="">Tous</option>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E31C5F]"
              >
                <Search className="size-4" />
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* City pills */}
      {cities.length > 0 && (
        <section className="border-b border-[#EBEBEB] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setCityId("")}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !cityId
                    ? "bg-[#222222] text-white"
                    : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EBEBEB]"
                }`}
              >
                Toutes
              </button>
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCityId(c.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    cityId === c.id
                      ? "bg-[#222222] text-white"
                      : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EBEBEB]"
                  }`}
                >
                  <span>{c.pinyin}</span>
                  <span className="ml-1.5 text-xs opacity-60">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features — 3D Isometric Icons */}
      <section className="border-b border-[#EBEBEB] bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-[#222222]">
              Pourquoi <span className="text-[#FF385C]">Adama</span> ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#6A6A6A]">
              Une plateforme complète pour trouver et gérer votre logement en Chine, en toute confiance.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={ShieldCheck} {...iconPresets.shield} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                Logements vérifiés
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Chaque propriété est inspectée et validée par nos agences partenaires sur place.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={KeyRound} {...iconPresets.key} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                Gestion simplifiée
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Paiements, contrats et communication — tout centralisé dans un seul tableau de bord.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={Globe} {...iconPresets.globe} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                5 grandes villes
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Beijing, Shanghai, Guangzhou, Shenzhen et Chengdu — les meilleures opportunités.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={HeartHandshake} {...iconPresets.location} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                Agences de confiance
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Réseau d'agences locales sélectionnées, bilingues et réactives.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={Zap} {...iconPresets.star} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                Réductions longue durée
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Profitez de tarifs dégressifs : -5% par semaine, jusqu'à -25% à l'année.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <IsometricIcon icon={Building2} {...iconPresets.building} size="lg" />
              <h3 className="font-display mt-5 text-lg font-semibold text-[#222222]">
                Tous types de biens
              </h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Studios, appartements, villas, lofts — meublés ou non, pour tous les budgets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[20/19] rounded-2xl bg-[#F7F7F7]" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#F7F7F7]" />
                  <div className="h-3 w-1/2 rounded bg-[#F7F7F7]" />
                  <div className="h-3 w-2/3 rounded bg-[#F7F7F7]" />
                  <div className="h-4 w-1/3 rounded bg-[#F7F7F7]" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center">
            <MapPin className="mx-auto size-12 text-[#DDDDDD]" />
            <h2 className="font-display mt-4 text-xl font-semibold text-[#222222]">
              Aucune propriété trouvée
            </h2>
            <p className="mt-2 text-sm text-[#6A6A6A]">
              Essayez de modifier vos filtres ou votre recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#222222]">
                  {cityId
                    ? `Propriétés à ${cities.find((c) => c.id === cityId)?.pinyin ?? ""}`
                    : "Toutes les propriétés"}
                </h2>
                <p className="mt-1 text-sm text-[#6A6A6A]">
                  {properties.length} logement{properties.length > 1 ? "s" : ""} disponible{properties.length > 1 ? "s" : ""}
                  {featuredCount > 0 && ` · ${featuredCount} coup${featuredCount > 1 ? "s" : ""} de cœur`}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PublicPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EBEBEB] bg-[#F7F7F7]">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">Adama</h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Plateforme de gestion immobilière pour la sous-location en Chine.
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">Villes</h3>
              <div className="mt-2 flex flex-col gap-1">
                {cities.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCityId(c.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-left text-sm text-[#6A6A6A] transition-colors hover:text-[#222222]"
                  >
                    {c.pinyin} ({c.name})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#222222]">Contact</h3>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                adama@nextis-ai.com
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-[#EBEBEB] pt-6 text-center text-xs text-[#B0B0B0]">
            © {new Date().getFullYear()} Adama. Tous droits réservés.
          </div>
        </div>
      </footer>
    </>
  );
}
