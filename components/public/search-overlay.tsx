"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  TrendingUp,
  Home,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface City {
  id: string;
  name: string;
  pinyin: string;
}

interface Property {
  id: string;
  title: string;
  slug: string;
  type: string;
  monthlyRent?: string | number;
  city: { name: string; pinyin: string };
}

interface Suggestion {
  type: "city" | "property" | "recent" | "trending";
  icon: "city" | "property" | "recent" | "trending";
  label: string;
  sublabel?: string;
  value: string;
  slug?: string;
}

const typeLabels: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  ROOM: "Chambre",
  STUDIO: "Studio",
  VILLA: "Villa",
  LOFT: "Loft",
};

function formatRent(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} €`;
}

const RECENT_SEARCHES_KEY = "chinefy_recent_searches";

function getRecentSearches(): Suggestion[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveRecentSearch(s: Suggestion) {
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((e) => e.value !== s.value);
    const updated = [{ ...s, icon: "recent" as const, type: "recent" as const }, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
}

export function MobileSearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentSearches, setRecentSearches] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetch("/api/public/properties")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setProperties(json.data);
            setCities(json.cities || []);
          }
        })
        .catch(() => {});
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      // Show default: recent searches + trending suggestions + featured properties
      const defaults: Suggestion[] = [];

      // Recent searches
      recentSearches.forEach((r) => {
        defaults.push({ ...r, icon: "recent", type: "recent" });
      });

      // Trending searches (popular cities as suggestions)
      cities.slice(0, 4).forEach((c) => {
        // Avoid duplicates with recent
        if (!defaults.some((d) => d.value === c.id)) {
          defaults.push({
            type: "trending",
            icon: "trending",
            label: `Logements à ${c.pinyin}`,
            sublabel: c.name,
            value: c.id,
          });
        }
      });

      // Featured properties
      properties
        .filter((p) => (p as any).isFeatured)
        .slice(0, 3)
        .forEach((p) => {
          defaults.push({
            type: "property",
            icon: "property",
            label: p.title,
            sublabel: `${typeLabels[p.type] || p.type} · ${p.city.pinyin}${p.monthlyRent ? ` · ${formatRent(p.monthlyRent)}/mois` : ""}`,
            value: p.id,
            slug: p.slug,
          });
        });

      setSuggestions(defaults);
      return;
    }

    const q = query.toLowerCase();
    const matched: Suggestion[] = [];

    // Match cities — show as "Logements à {city}"
    cities.forEach((c) => {
      if (
        c.pinyin.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      ) {
        matched.push({
          type: "city",
          icon: "city",
          label: `Logements à ${c.pinyin}`,
          sublabel: c.name,
          value: c.id,
        });
      }
    });

    // Match properties
    properties.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.city.pinyin.toLowerCase().includes(q) ||
        (typeLabels[p.type] || "").toLowerCase().includes(q)
      ) {
        matched.push({
          type: "property",
          icon: "property",
          label: p.title,
          sublabel: `${typeLabels[p.type] || p.type} · ${p.city.pinyin}${p.monthlyRent ? ` · ${formatRent(p.monthlyRent)}/mois` : ""}`,
          value: p.id,
          slug: p.slug,
        });
      }
    });

    setSuggestions(matched.slice(0, 10));
  }, [query, cities, properties, recentSearches]);

  function handleSelect(s: Suggestion) {
    // Save to recent
    saveRecentSearch(s);

    if ((s.type === "property" || s.icon === "property") && s.slug) {
      router.push(`/p/${s.slug}`);
    } else if (s.type === "city" || s.type === "trending") {
      router.push(`/?city=${s.value}`);
    } else if (s.type === "recent") {
      // Replay the original action
      if (s.slug) {
        router.push(`/p/${s.slug}`);
      } else {
        router.push(`/?city=${s.value}`);
      }
    }
    onClose();
    setQuery("");
  }

  function handleSearchSubmit() {
    if (query.trim()) {
      saveRecentSearch({
        type: "recent",
        icon: "recent",
        label: query.trim(),
        value: `search-${query.trim()}`,
      });
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  }

  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {}
  }

  function iconForSuggestion(s: Suggestion) {
    switch (s.icon) {
      case "recent":
        return <Clock className="size-5 text-[#6A6A6A]" />;
      case "trending":
        return <TrendingUp className="size-5 text-[#FF385C]" />;
      case "property":
        return <Home className="size-5 text-[#6A6A6A]" />;
      case "city":
      default:
        return <MapPin className="size-5 text-[#6A6A6A]" />;
    }
  }

  if (!open) return null;

  const hasRecent = !query.trim() && recentSearches.length > 0;
  const recentSuggestions = suggestions.filter((s) => s.type === "recent");
  const trendingSuggestions = suggestions.filter((s) => s.type === "trending");
  const propertySuggestions = suggestions.filter((s) => s.type === "property");
  const searchSuggestions = suggestions.filter(
    (s) => s.type === "city" || s.type === "property"
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#EBEBEB] px-4 py-3">
        <button
          onClick={() => {
            onClose();
            setQuery("");
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#DDDDDD]"
        >
          <ArrowLeft className="size-4 text-[#222222]" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#B0B0B0]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            placeholder="Rechercher une ville, un logement..."
            className="w-full rounded-full border border-[#DDDDDD] bg-[#F7F7F7] py-3 pl-10 pr-10 text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:border-[#222222] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="size-4 text-[#6A6A6A]" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="overflow-y-auto px-4 pt-4" style={{ maxHeight: "calc(100vh - 72px)" }}>
        {/* When no query: show sections */}
        {!query.trim() ? (
          <>
            {/* Recent searches */}
            {recentSuggestions.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6A6A6A]">
                    Recherches récentes
                  </p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs font-medium text-[#FF385C] underline"
                  >
                    Effacer
                  </button>
                </div>
                {recentSuggestions.map((s, i) => (
                  <button
                    key={`recent-${i}`}
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors active:bg-[#F7F7F7]"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7]">
                      {iconForSuggestion(s)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#222222]">
                        {s.label}
                      </p>
                      {s.sublabel && (
                        <p className="truncate text-xs text-[#6A6A6A]">
                          {s.sublabel}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Trending */}
            {trendingSuggestions.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6A6A6A]">
                  Destinations populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSuggestions.map((s, i) => (
                    <button
                      key={`trending-${i}`}
                      onClick={() => handleSelect(s)}
                      className="flex items-center gap-2 rounded-full border border-[#DDDDDD] px-4 py-2.5 text-left transition-colors active:bg-[#F7F7F7]"
                    >
                      <MapPin className="size-3.5 text-[#FF385C]" />
                      <span className="text-sm font-medium text-[#222222]">
                        {s.label.replace("Logements à ", "")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured properties */}
            {propertySuggestions.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6A6A6A]">
                  Coups de cœur
                </p>
                {propertySuggestions.map((s, i) => (
                  <button
                    key={`featured-${i}`}
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors active:bg-[#F7F7F7]"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0F3]">
                      <Sparkles className="size-5 text-[#FF385C]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#222222]">
                        {s.label}
                      </p>
                      {s.sublabel && (
                        <p className="truncate text-xs text-[#6A6A6A]">
                          {s.sublabel}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Search results */}
            {searchSuggestions.length === 0 && (
              <div className="py-12 text-center">
                <Search className="mx-auto size-8 text-[#DDDDDD]" />
                <p className="mt-3 text-sm text-[#6A6A6A]">
                  Aucun résultat pour &quot;{query}&quot;
                </p>
              </div>
            )}

            {/* Free text search option */}
            <button
              onClick={handleSearchSubmit}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors active:bg-[#F7F7F7]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF385C]">
                <Search className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#222222]">
                  Rechercher &quot;{query}&quot;
                </p>
                <p className="text-xs text-[#6A6A6A]">
                  Dans tous les logements
                </p>
              </div>
            </button>

            {/* Divider */}
            {searchSuggestions.length > 0 && (
              <div className="my-2 h-px bg-[#EBEBEB]" />
            )}

            {searchSuggestions.map((s, i) => (
              <button
                key={`${s.type}-${s.value}-${i}`}
                onClick={() => handleSelect(s)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors active:bg-[#F7F7F7]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7]">
                  {iconForSuggestion(s)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#222222]">
                    {s.label}
                  </p>
                  {s.sublabel && (
                    <p className="truncate text-xs text-[#6A6A6A]">
                      {s.sublabel}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
