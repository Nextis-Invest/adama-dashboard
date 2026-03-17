"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Building2, Clock, ArrowLeft } from "lucide-react";
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
  city: { name: string; pinyin: string };
}

interface Suggestion {
  type: "city" | "property" | "recent";
  label: string;
  sublabel?: string;
  value: string;
  slug?: string;
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      // Show default suggestions: popular cities
      const defaults: Suggestion[] = cities.slice(0, 6).map((c) => ({
        type: "city" as const,
        label: c.pinyin,
        sublabel: c.name,
        value: c.id,
      }));
      setSuggestions(defaults);
      return;
    }

    const q = query.toLowerCase();
    const matched: Suggestion[] = [];

    // Match cities
    cities.forEach((c) => {
      if (
        c.pinyin.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      ) {
        matched.push({
          type: "city",
          label: c.pinyin,
          sublabel: c.name,
          value: c.id,
        });
      }
    });

    // Match properties
    properties.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.city.pinyin.toLowerCase().includes(q)
      ) {
        matched.push({
          type: "property",
          label: p.title,
          sublabel: p.city.pinyin,
          value: p.id,
          slug: p.slug,
        });
      }
    });

    setSuggestions(matched.slice(0, 8));
  }, [query, cities, properties]);

  function handleSelect(s: Suggestion) {
    if (s.type === "property" && s.slug) {
      router.push(`/p/${s.slug}`);
    } else {
      // Navigate to homepage with city filter
      router.push(`/?city=${s.value}`);
    }
    onClose();
    setQuery("");
  }

  if (!open) return null;

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
      <div className="overflow-y-auto px-4 pt-4">
        {!query.trim() && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6A6A6A]">
            Villes populaires
          </p>
        )}
        {query.trim() && suggestions.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto size-8 text-[#DDDDDD]" />
            <p className="mt-3 text-sm text-[#6A6A6A]">
              Aucun résultat pour &quot;{query}&quot;
            </p>
          </div>
        )}
        <div className="flex flex-col">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.value}-${i}`}
              onClick={() => handleSelect(s)}
              className="flex items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors active:bg-[#F7F7F7]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F7]">
                {s.type === "city" ? (
                  <MapPin className="size-5 text-[#6A6A6A]" />
                ) : (
                  <Building2 className="size-5 text-[#6A6A6A]" />
                )}
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
      </div>
    </div>
  );
}
