"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Globe, Menu, MapPin, Building2, Minus, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, addMonths } from "date-fns";
import type { DateRange } from "react-day-picker";

/* ---------- Types ---------- */

interface City {
  id: string;
  name: string;
  pinyin: string;
  province: string;
  description?: string;
  famousFor?: string;
  coverImage?: string;
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

type Panel = "destination" | "dates" | "guests" | null;
type DateTab = "dates" | "months" | "flexible";

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

const flexibilityOptions = [
  { label: "Dates exactes", value: "exact" },
  { label: "± 1 jour", value: "1" },
  { label: "± 2 jours", value: "2" },
  { label: "± 3 jours", value: "3" },
  { label: "± 7 jours", value: "7" },
  { label: "± 14 jours", value: "14" },
];

const durationOptions = [
  { label: "Un week-end", value: "weekend" },
  { label: "Une semaine", value: "week" },
  { label: "Un mois", value: "month" },
];

/* ---------- Helper: Counter Row ---------- */

function CounterRow({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  link,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  link?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-base font-medium text-[#222222]">{label}</p>
        <p className="text-sm text-[#6A6A6A]">{sublabel}</p>
        {link && (
          <button className="mt-0.5 text-xs font-medium text-[#222222] underline">
            {link}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-8 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:cursor-not-allowed disabled:border-[#EBEBEB] disabled:text-[#EBEBEB]"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-base text-[#222222]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex size-8 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222]"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

export function DesktopHeader() {
  const router = useRouter();

  // Data
  const [cities, setCities] = useState<City[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Row 1 state
  const [activeTab, setActiveTab] = useState("logements");

  // Panel state
  const [activePanel, setActivePanel] = useState<Panel>(null);

  // Destination state
  const [destination, setDestination] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Dates state
  const [dateTab, setDateTab] = useState<DateTab>("dates");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [flexibility, setFlexibility] = useState("exact");
  const [monthsDuration, setMonthsDuration] = useState(3);
  const [flexibleMonths, setFlexibleMonths] = useState<string[]>([]);
  const [flexibleDuration, setFlexibleDuration] = useState("week");

  // Guests state
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- Fetch data ---------- */
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

  /* ---------- Click outside ---------- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target as Node)
      ) {
        setActivePanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- Compute suggestions ---------- */
  useEffect(() => {
    const q = destination.toLowerCase().trim();

    if (!q) {
      const defaults: Suggestion[] = cities.map((c) => ({
        type: "city" as const,
        label: c.pinyin,
        sublabel: c.description || c.famousFor || c.name,
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
          sublabel: c.description || c.famousFor || c.name,
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

  /* ---------- Handlers ---------- */

  function handleSelectSuggestion(s: Suggestion) {
    if (s.type === "property" && s.slug) {
      router.push(`/p/${s.slug}`);
      setActivePanel(null);
    } else if (s.type === "city") {
      const city = cities.find((c) => c.id === s.value);
      setDestination(city?.pinyin || s.label);
      setSelectedCityId(s.value);
      setActivePanel("dates");
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (selectedCityId) params.set("city", selectedCityId);
    else if (destination.trim()) params.set("search", destination.trim());
    if (dateRange?.from)
      params.set("checkin", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to)
      params.set("checkout", format(dateRange.to, "yyyy-MM-dd"));
    if (adults > 0) params.set("adults", String(adults));
    if (children > 0) params.set("children", String(children));
    if (infants > 0) params.set("infants", String(infants));
    if (pets > 0) params.set("pets", String(pets));
    router.push(`/?${params.toString()}`);
    setActivePanel(null);
  }

  const togglePanel = useCallback(
    (panel: Panel) => {
      setActivePanel((prev) => (prev === panel ? null : panel));
    },
    []
  );

  /* ---------- Derived display values ---------- */

  const destinationSublabel = selectedCityId
    ? cities.find((c) => c.id === selectedCityId)?.pinyin || destination
    : "Rechercher une destination";

  const datesSublabel = (() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "d MMM", { locale: fr })} – ${format(dateRange.to, "d MMM", { locale: fr })}`;
    }
    if (dateRange?.from) {
      return format(dateRange.from, "d MMM", { locale: fr });
    }
    return "Quand ?";
  })();

  const guestsSublabel = (() => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adulte${adults > 1 ? "s" : ""}`);
    if (children > 0) parts.push(`${children} enfant${children > 1 ? "s" : ""}`);
    if (infants > 0) parts.push(`${infants} bébé${infants > 1 ? "s" : ""}`);
    if (pets > 0) parts.push(`${pets} animal${pets > 1 ? "ux" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "Ajouter des voyageurs";
  })();

  const isExpanded = activePanel !== null;

  /* ---------- Flexible months grid ---------- */
  const nextSixMonths = Array.from({ length: 6 }, (_, i) => {
    const d = addMonths(new Date(), i + 1);
    return {
      key: format(d, "yyyy-MM"),
      label: format(d, "MMMM", { locale: fr }),
      year: format(d, "yyyy"),
    };
  });

  /* ---------- Months dial computed dates ---------- */
  const monthsStartDate = new Date();
  const monthsEndDate = addMonths(monthsStartDate, monthsDuration);

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

      {/* Row 2: Airbnb-style 3-segment search bar */}
      <div className="mx-auto max-w-3xl px-5 pb-5">
        <div ref={searchBarRef} className="relative">
          {/* Search pill */}
          <div
            className={`relative flex items-center rounded-full border bg-white transition-all ${
              isExpanded
                ? "border-[#DDDDDD] shadow-lg"
                : "border-[#DDDDDD] shadow-sm hover:shadow-md"
            }`}
          >
            {/* Segment 1: Destination */}
            <button
              type="button"
              onClick={() => {
                togglePanel("destination");
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className={`flex flex-1 flex-col rounded-full py-3.5 pl-7 pr-4 text-left transition-colors ${
                activePanel === "destination"
                  ? "bg-white shadow-md"
                  : "hover:bg-[#EBEBEB]"
              }`}
            >
              <span className="text-xs font-bold text-[#222222]">Destination</span>
              {activePanel === "destination" ? (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher une destination"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedCityId("");
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-full bg-transparent text-sm text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                  autoComplete="off"
                />
              ) : (
                <span
                  className={`mt-0.5 truncate text-sm ${
                    selectedCityId ? "text-[#222222]" : "text-[#6A6A6A]"
                  }`}
                >
                  {destinationSublabel}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-9 w-px shrink-0 bg-[#DDDDDD]" />

            {/* Segment 2: Dates */}
            <button
              type="button"
              onClick={() => togglePanel("dates")}
              className={`flex flex-1 flex-col rounded-full py-3.5 px-6 text-left transition-colors ${
                activePanel === "dates"
                  ? "bg-white shadow-md"
                  : "hover:bg-[#EBEBEB]"
              }`}
            >
              <span className="text-xs font-bold text-[#222222]">
                {activePanel === "dates" ? "Quand" : "Dates"}
              </span>
              <span
                className={`mt-0.5 truncate text-sm ${
                  dateRange?.from ? "text-[#222222]" : "text-[#6A6A6A]"
                }`}
              >
                {datesSublabel}
              </span>
            </button>

            {/* Divider */}
            <div className="h-9 w-px shrink-0 bg-[#DDDDDD]" />

            {/* Segment 3: Guests */}
            <button
              type="button"
              onClick={() => togglePanel("guests")}
              className={`flex flex-1 flex-col rounded-full py-3.5 pl-6 pr-2 text-left transition-colors ${
                activePanel === "guests"
                  ? "bg-white shadow-md"
                  : "hover:bg-[#EBEBEB]"
              }`}
            >
              <span className="text-xs font-bold text-[#222222]">Voyageurs</span>
              <span
                className={`mt-0.5 truncate text-sm ${
                  adults > 0 || children > 0 ? "text-[#222222]" : "text-[#6A6A6A]"
                }`}
              >
                {guestsSublabel}
              </span>
            </button>

            {/* Search button */}
            <div className="shrink-0 pr-2.5">
              <button
                type="button"
                onClick={handleSearch}
                className={`flex items-center justify-center rounded-full bg-[#FF385C] text-white transition-all hover:bg-[#E31C5F] hover:shadow-md ${
                  isExpanded
                    ? "gap-2 px-5 py-3"
                    : "size-12"
                }`}
              >
                <Search className="size-4" />
                {isExpanded && (
                  <span className="text-sm font-semibold">Rechercher</span>
                )}
              </button>
            </div>
          </div>

          {/* ============ DROPDOWNS ============ */}

          {/* Destination dropdown */}
          {activePanel === "destination" && (
            <div className="absolute left-0 top-full z-50 mt-3 w-full max-w-md rounded-3xl border border-[#EBEBEB] bg-white py-4 shadow-xl">
              <p className="mb-2 px-6 text-xs font-semibold text-[#222222]">
                Suggestions de destinations
              </p>
              <div className="max-h-[360px] overflow-y-auto">
                {suggestions.map((s, i) => {
                  const city =
                    s.type === "city"
                      ? cities.find((c) => c.id === s.value)
                      : null;

                  return (
                    <button
                      key={`${s.type}-${s.value}-${i}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="flex w-full items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-[#F7F7F7]"
                    >
                      {/* City image or icon */}
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F7]">
                        {city?.coverImage ? (
                          <img
                            src={city.coverImage}
                            alt={city.pinyin}
                            className="size-12 object-cover"
                          />
                        ) : s.type === "city" ? (
                          <MapPin className="size-5 text-[#6A6A6A]" />
                        ) : (
                          <Building2 className="size-5 text-[#6A6A6A]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#222222]">
                          {s.label}
                          {city?.province && (
                            <span className="font-normal text-[#6A6A6A]">
                              , {city.province}
                            </span>
                          )}
                        </p>
                        {s.sublabel && (
                          <p className="truncate text-xs text-[#6A6A6A]">
                            {s.sublabel}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
                {suggestions.length === 0 && (
                  <p className="px-6 py-4 text-sm text-[#6A6A6A]">
                    Aucun résultat trouvé
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dates dropdown */}
          {activePanel === "dates" && (
            <div className="absolute left-1/2 top-full z-50 mt-3 w-[720px] -translate-x-1/2 rounded-3xl border border-[#EBEBEB] bg-white p-6 shadow-xl">
              {/* Tabs: Dates / Mois / Flexible */}
              <div className="mb-5 flex items-center justify-center gap-1.5">
                {(
                  [
                    { key: "dates", label: "Dates" },
                    { key: "months", label: "Mois" },
                    { key: "flexible", label: "Flexible" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDateTab(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      dateTab === tab.key
                        ? "bg-[#222222] text-white"
                        : "bg-[#EBEBEB] text-[#222222] hover:bg-[#DDDDDD]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Dates — Calendar */}
              {dateTab === "dates" && (
                <div>
                  <div className="flex justify-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={fr}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                  {/* Flexibility pills */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {flexibilityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFlexibility(opt.value)}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          flexibility === opt.value
                            ? "border-[#222222] bg-[#F7F7F7] font-medium text-[#222222]"
                            : "border-[#DDDDDD] text-[#6A6A6A] hover:border-[#222222]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Months — duration selector */}
              {dateTab === "months" && (
                <div className="flex flex-col items-center py-4">
                  <p className="mb-6 text-lg font-medium text-[#222222]">
                    Quand voulez-vous voyager ?
                  </p>
                  {/* Circular dial */}
                  <div className="relative mb-6 flex size-48 items-center justify-center">
                    <svg className="absolute inset-0" viewBox="0 0 192 192">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="#EBEBEB"
                        strokeWidth="6"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="#222222"
                        strokeWidth="6"
                        strokeDasharray={`${(monthsDuration / 12) * 502.65} 502.65`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 96 96)"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="z-10 flex flex-col items-center">
                      <span className="text-5xl font-bold text-[#222222]">
                        {monthsDuration}
                      </span>
                      <span className="text-sm text-[#6A6A6A]">mois</span>
                    </div>
                  </div>
                  {/* +/- buttons */}
                  <div className="mb-4 flex items-center gap-4">
                    <button
                      type="button"
                      disabled={monthsDuration <= 1}
                      onClick={() =>
                        setMonthsDuration(Math.max(1, monthsDuration - 1))
                      }
                      className="flex size-10 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:cursor-not-allowed disabled:border-[#EBEBEB] disabled:text-[#EBEBEB]"
                    >
                      <Minus className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={monthsDuration >= 12}
                      onClick={() =>
                        setMonthsDuration(Math.min(12, monthsDuration + 1))
                      }
                      className="flex size-10 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:cursor-not-allowed disabled:border-[#EBEBEB] disabled:text-[#EBEBEB]"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  {/* Computed date range */}
                  <p className="text-sm text-[#6A6A6A]">
                    {format(monthsStartDate, "EEE d MMM", { locale: fr })} au{" "}
                    {format(monthsEndDate, "EEE d MMM yyyy", { locale: fr })}
                  </p>
                </div>
              )}

              {/* Tab: Flexible */}
              {dateTab === "flexible" && (
                <div className="flex flex-col items-center py-4">
                  <p className="mb-5 text-lg font-medium text-[#222222]">
                    Quand souhaitez-vous partir ?
                  </p>
                  {/* Duration pills */}
                  <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                    {durationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFlexibleDuration(opt.value)}
                        className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                          flexibleDuration === opt.value
                            ? "border-[#222222] bg-[#F7F7F7] font-medium text-[#222222]"
                            : "border-[#DDDDDD] text-[#6A6A6A] hover:border-[#222222]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Month cards grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {nextSixMonths.map((m) => {
                      const isSelected = flexibleMonths.includes(m.key);
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => {
                            setFlexibleMonths((prev) =>
                              isSelected
                                ? prev.filter((k) => k !== m.key)
                                : [...prev, m.key]
                            );
                          }}
                          className={`rounded-2xl border px-6 py-4 text-center transition-colors ${
                            isSelected
                              ? "border-[#222222] bg-[#F7F7F7]"
                              : "border-[#DDDDDD] hover:border-[#222222]"
                          }`}
                        >
                          <p className="text-sm font-medium capitalize text-[#222222]">
                            {m.label}
                          </p>
                          <p className="text-xs text-[#6A6A6A]">{m.year}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guests dropdown */}
          {activePanel === "guests" && (
            <div className="absolute right-0 top-full z-50 mt-3 w-96 rounded-3xl border border-[#EBEBEB] bg-white px-6 py-4 shadow-xl">
              <CounterRow
                label="Adultes"
                sublabel="13 ans et plus"
                value={adults}
                onChange={setAdults}
              />
              <div className="border-t border-[#EBEBEB]" />
              <CounterRow
                label="Enfants"
                sublabel="De 2 à 12 ans"
                value={children}
                onChange={setChildren}
              />
              <div className="border-t border-[#EBEBEB]" />
              <CounterRow
                label="Bébés"
                sublabel="Moins de 2 ans"
                value={infants}
                onChange={setInfants}
              />
              <div className="border-t border-[#EBEBEB]" />
              <CounterRow
                label="Animaux domestiques"
                sublabel="Vous voyagez avec un animal ?"
                value={pets}
                onChange={setPets}
                link="Vous voyagez avec un animal d'assistance ?"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
