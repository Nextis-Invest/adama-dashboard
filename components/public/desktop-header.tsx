"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import { Search, Globe, Menu, MapPin, Building2 } from "lucide-react";

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
  type: "city" | "property";
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

const headerTabs = [
  { key: "logements", label: "Logements", icon: "/icons/apartment.png" },
  {
    key: "experiences",
    label: "Expériences",
    icon: "/icons/travel-map.png",
    badge: "NOUVEAU",
  },
  {
    key: "services",
    label: "Services",
    icon: "/icons/bell.png",
    badge: "NOUVEAU",
  },
];

export function DesktopHeader() {
  const [cities, setCities] = useState<City[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  const [activeTab, setActiveTab] = useState("logements");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/public/properties")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setProperties(json.data);
          setCities(json.cities || []);
        }
      })
      .catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Compute suggestions
  useEffect(() => {
    const q = destination.toLowerCase().trim();

    if (!q) {
      // Default: show all cities
      const defaults: Suggestion[] = cities.map((c) => ({
        type: "city" as const,
        label: c.pinyin,
        sublabel: c.name,
        value: c.id,
      }));
      setSuggestions(defaults);
      return;
    }

    const matched: Suggestion[] = [];

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

    properties.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.city.pinyin.toLowerCase().includes(q)
      ) {
        matched.push({
          type: "property",
          label: p.title,
          sublabel: `${typeLabels[p.type] || p.type} · ${p.city.pinyin}`,
          value: p.id,
          slug: p.slug,
        });
      }
    });

    setSuggestions(matched.slice(0, 8));
  }, [destination, cities, properties]);

  function handleSelect(s: Suggestion) {
    if (s.type === "property" && s.slug) {
      router.push(`/p/${s.slug}`);
    } else if (s.type === "city") {
      setDestination(s.label);
      setSelectedCityId(s.value);
    }
    setShowSuggestions(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCityId) params.set("city", selectedCityId);
    else if (destination.trim()) params.set("search", destination.trim());
    if (type) params.set("type", type);
    router.push(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 hidden border-b border-[#EBEBEB] bg-white sm:block">
      {/* Row 1: Logo — Category tabs with isometric icons — Right actions */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-display text-xl font-black tracking-tight text-[#FF385C]">
            CHINEFY
          </span>
        </Link>

        {/* Center: Category tabs — icon left, text right, badge above text */}
        <nav className="flex items-end gap-6">
          {headerTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 border-b-2 pb-3 pt-2 transition-colors ${
                  isActive
                    ? "border-[#222222] text-[#222222]"
                    : "border-transparent text-[#6A6A6A] hover:border-[#DDDDDD] hover:text-[#222222]"
                }`}
              >
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="size-10 object-contain"
                />
                <div className="flex flex-col items-start">
                  {tab.badge && (
                    <span className="mb-0.5 rounded-sm bg-[#222222] px-1.5 py-[1px] text-[8px] font-bold uppercase leading-tight text-white">
                      {tab.badge}
                    </span>
                  )}
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#222222] transition-colors hover:text-[#000000]"
          >
            Connexion
          </Link>
          <button className="flex size-9 items-center justify-center rounded-full border border-[#DDDDDD] transition-colors hover:bg-[#F7F7F7]">
            <Globe className="size-4 text-[#222222]" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-full border border-[#DDDDDD] transition-colors hover:bg-[#F7F7F7]">
            <Menu className="size-4 text-[#222222]" />
          </button>
        </div>
      </div>

      {/* Row 2: Search pill with autocomplete */}
      <div className="mx-auto max-w-3xl px-5 pb-5">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center rounded-full border border-[#DDDDDD] bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Destination — autocomplete input */}
            <div className="relative flex-1 py-3.5 pl-7 pr-4">
              <label className="block text-xs font-bold text-[#222222]">
                Destination
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher une ville, un logement..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="mt-0.5 w-full bg-transparent text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Divider */}
            <div className="h-9 w-px bg-[#DDDDDD]" />

            {/* Type */}
            <div className="py-3.5 pl-6 pr-4">
              <label className="block text-xs font-bold text-[#222222]">
                Type de bien
              </label>
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
            <div className="pr-2.5">
              <button
                type="submit"
                className="flex size-12 items-center justify-center rounded-full bg-[#FF385C] text-white transition-all hover:bg-[#E31C5F] hover:shadow-md"
              >
                <Search className="size-5" />
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 top-full z-50 mt-2 w-full max-w-md rounded-2xl border border-[#EBEBEB] bg-white py-2 shadow-lg"
              >
                {!destination.trim() && (
                  <p className="mb-1 px-4 pt-1 text-xs font-semibold uppercase tracking-wider text-[#6A6A6A]">
                    Suggestions
                  </p>
                )}
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.type}-${s.value}-${i}`}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F7F7F7]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F7]">
                      {s.type === "city" ? (
                        <MapPin className="size-4 text-[#6A6A6A]" />
                      ) : (
                        <Building2 className="size-4 text-[#6A6A6A]" />
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
            )}
          </div>
        </form>
      </div>
    </header>
  );
}
