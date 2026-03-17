"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import {
  Building2,
  Search,
  Globe,
  Menu,
} from "lucide-react";

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

const headerTabs = [
  { key: "logements", label: "Logements", icon: "/icons/apartment.png" },
  { key: "experiences", label: "Expériences", icon: "/icons/travel-map.png", badge: "NOUVEAU" },
  { key: "services", label: "Services", icon: "/icons/bell.png", badge: "NOUVEAU" },
];

export function DesktopHeader() {
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("");
  const [type, setType] = useState("");
  const [activeTab, setActiveTab] = useState("logements");

  useEffect(() => {
    fetch("/api/public/properties?limit=0")
      .then((r) => r.json())
      .then((json) => {
        if (json.cities) setCities(json.cities);
      })
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* Row 2: Search pill */}
      <div className="mx-auto max-w-3xl px-5 pb-5">
        <form onSubmit={handleSearch}>
          <div className="flex items-center rounded-full border border-[#DDDDDD] bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Destination */}
            <div className="flex-1 py-3.5 pl-7 pr-4">
              <label className="block text-xs font-bold text-[#222222]">
                Destination
              </label>
              <input
                type="text"
                placeholder="Rechercher une destination"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
              />
            </div>

            {/* Divider */}
            <div className="h-9 w-px bg-[#DDDDDD]" />

            {/* Ville */}
            <div className="py-3.5 pl-6 pr-4">
              <label className="block text-xs font-bold text-[#222222]">
                Ville
              </label>
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
          </div>
        </form>
      </div>
    </header>
  );
}
