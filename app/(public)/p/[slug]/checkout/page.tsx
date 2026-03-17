"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Check,
  Star,
  CreditCard,
  Shield,
  Home,
} from "lucide-react";

/* ─── Types ─── */
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
  deposit: string | number | null;
  city: { name: string; pinyin: string };
  agency: { name: string };
}

/* ─── Helpers ─── */
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
  PRIVATE_ROOM: "Chambre privee",
  SHARED_ROOM: "Chambre partagee",
};

function formatRent(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} \u20AC`;
}

/* ─── Main Component ─── */
export default function CheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  /* Accordion state */
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [paymentOption, setPaymentOption] = useState<"now" | "later">("now");

  /* Card form fields */
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  /* Voyageurs */
  const [guests] = useState(1);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/properties/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProperty(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  /* ─── Price calculations ─── */
  const rent = property ? Number(property.monthlyRent) : 0;
  const discountPct = property?.discountMonthly
    ? Number(property.discountMonthly)
    : 0;
  const discountAmount = Math.round(rent * (discountPct / 100));
  const serviceFee = Math.round(rent * 0.08);
  const deposit = property?.deposit
    ? Number(property.deposit)
    : Math.round(rent * 0.5);
  const subtotal = rent - discountAmount + serviceFee + deposit;

  /* Simulated future date for "pay later" */
  const laterDate = new Date();
  laterDate.setDate(laterDate.getDate() + 14);
  const laterDateStr = laterDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* Simulated dates for display */
  const displayDates = "ven. 8 \u2013 dim. 10 mai";
  const cancellationDate = new Date();
  cancellationDate.setDate(cancellationDate.getDate() + 2);
  const cancellationDateStr = cancellationDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-30 border-b border-[#EBEBEB] bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-[#F7F7F7]" />
            <div className="h-6 w-48 animate-pulse rounded bg-[#F7F7F7]" />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-[3] space-y-6">
              <div className="h-40 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
              <div className="h-40 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
              <div className="h-40 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
            </div>
            <div className="flex-[2]">
              <div className="h-96 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Home className="mx-auto size-12 text-[#DDDDDD]" />
          <h2 className="font-display mt-4 text-xl font-semibold text-[#222222]">
            Propriete introuvable
          </h2>
          <p className="mt-2 text-sm text-[#6A6A6A]">
            Ce logement n&apos;existe pas ou a ete retire.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E31C5F]"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Summary Card (shared between mobile top + desktop right) ─── */
  const SummaryCard = () => (
    <div className="rounded-2xl border border-[#DDDDDD] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      {/* Property preview */}
      <div className="flex gap-4">
        <div className="size-[120px] shrink-0 overflow-hidden rounded-xl">
          {property.coverPhoto ? (
            <img
              src={property.coverPhoto}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F7F7F7]">
              <Home className="size-8 text-[#DDDDDD]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#6A6A6A]">
            {typeLabels[property.type] || property.type} &middot;{" "}
            {listingTypeLabels[property.listingType] || property.listingType}
          </p>
          <h3 className="font-display mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[#222222]">
            {property.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="size-3.5 fill-[#222222] text-[#222222]" />
            <span className="text-xs font-medium text-[#222222]">4.8</span>
            <span className="text-xs text-[#6A6A6A]">(12)</span>
          </div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-semibold text-[#222222]">
            <Star className="size-2.5 fill-[#FF385C] text-[#FF385C]" />
            Coup de coeur voyageurs
          </span>
        </div>
      </div>

      <hr className="my-5 border-[#EBEBEB]" />

      {/* Annulation gratuite */}
      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 size-5 shrink-0 text-[#008A05]" />
        <div>
          <p className="text-sm font-semibold text-[#222222]">
            Annulation gratuite
          </p>
          <p className="mt-0.5 text-xs text-[#6A6A6A]">
            Avant le {cancellationDateStr}
          </p>
        </div>
      </div>

      <hr className="my-5 border-[#EBEBEB]" />

      {/* Dates row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#222222]">Dates</p>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">{displayDates}</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-[#222222] underline hover:text-[#FF385C]"
        >
          Modifier
        </button>
      </div>

      {/* Voyageurs row */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#222222]">Voyageurs</p>
          <p className="mt-0.5 text-sm text-[#6A6A6A]">
            {guests} adulte{guests > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-[#222222] underline hover:text-[#FF385C]"
        >
          Modifier
        </button>
      </div>

      <hr className="my-5 border-[#EBEBEB]" />

      {/* Detail du prix */}
      <div>
        <h4 className="font-display text-[15px] font-semibold text-[#222222]">
          Detail du prix
        </h4>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#222222]">
              {formatRent(rent)} x 1 mois
            </span>
            <span className="text-[#222222]">{formatRent(rent)}</span>
          </div>
          {discountPct > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#008A05]">
                Reduction mensuelle (-{discountPct}%)
              </span>
              <span className="text-[#008A05]">
                -{formatRent(discountAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#222222]">Frais de service Chinefy</span>
            <span className="text-[#222222]">{formatRent(serviceFee)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#222222]">Caution (remboursable)</span>
            <span className="text-[#222222]">{formatRent(deposit)}</span>
          </div>
        </div>
      </div>

      <hr className="my-5 border-[#EBEBEB]" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-display text-base font-bold text-[#222222]">
          Total EUR
        </span>
        <span className="font-display text-base font-bold text-[#222222]">
          {formatRent(subtotal)}
        </span>
      </div>

      {/* Detail du prix link */}
      <button
        type="button"
        className="mt-2 text-sm font-semibold text-[#222222] underline hover:text-[#FF385C]"
      >
        Detail du prix
      </button>

      <hr className="my-5 border-[#EBEBEB]" />

      {/* Perle rare badge */}
      <div className="flex items-center gap-2 rounded-xl bg-[#FFF0F3] px-4 py-3">
        <Star className="size-4 shrink-0 fill-[#FF385C] text-[#FF385C]" />
        <span className="text-xs font-semibold text-[#FF385C]">
          Perle rare ! Les reservations pour ce logement sont frequentes.
        </span>
      </div>
    </div>
  );

  /* ─── Step header renderer ─── */
  const StepHeader = ({
    step,
    title,
    completed,
  }: {
    step: 1 | 2 | 3;
    title: string;
    completed: boolean;
  }) => (
    <button
      type="button"
      onClick={() => {
        if (completed || step === activeStep) setActiveStep(step);
      }}
      className="flex w-full items-center justify-between py-5 text-left"
    >
      <div>
        <p className="text-xs font-medium text-[#6A6A6A]">
          Etape {step} sur 3
        </p>
        <h2 className="font-display mt-0.5 text-lg font-semibold text-[#222222]">
          {title}
        </h2>
      </div>
      {completed && step !== activeStep && (
        <div className="flex size-7 items-center justify-center rounded-full bg-[#222222]">
          <Check className="size-4 text-white" />
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-30 border-b border-[#EBEBEB] bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link
            href={`/p/${slug}`}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#F7F7F7]"
            aria-label="Retour"
          >
            <ChevronLeft className="size-5 text-[#222222]" />
          </Link>
          <h1 className="font-display text-lg font-semibold text-[#222222] sm:text-xl">
            Confirmer et payer
          </h1>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Mobile summary (top, visible on mobile only) */}
        <div className="mb-8 lg:hidden">
          <SummaryCard />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* ─── Left column (3/5) ─── */}
          <div className="flex-[3] space-y-4">
            {/* ══════════════════════════════════════════════
                Step 1: Choisissez quand vous souhaitez payer
               ══════════════════════════════════════════════ */}
            <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
              <div className="px-6">
                <StepHeader
                  step={1}
                  title="Choisissez quand vous souhaitez payer"
                  completed={activeStep > 1}
                />
              </div>

              {activeStep === 1 && (
                <div className="px-6 pb-6">
                  {/* Radio: pay now */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EBEBEB] p-4 transition-colors hover:bg-[#F7F7F7]">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === "now"}
                      onChange={() => setPaymentOption("now")}
                      className="mt-0.5 size-4 accent-[#222222]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">
                        Payer {formatRent(subtotal)} maintenant
                      </p>
                    </div>
                  </label>

                  {/* Radio: pay later */}
                  <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-[#EBEBEB] p-4 transition-colors hover:bg-[#F7F7F7]">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === "later"}
                      onChange={() => setPaymentOption("later")}
                      className="mt-0.5 size-4 accent-[#222222]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">
                        Payer 0 {"\u20AC"} maintenant
                      </p>
                      <p className="mt-1 text-xs text-[#6A6A6A]">
                        {formatRent(subtotal)} a payer le {laterDateStr}. Pas de
                        frais supplementaires.
                      </p>
                    </div>
                  </label>

                  {/* Suivant button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="rounded-lg bg-[#222222] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#000000]"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════
                Step 2: Ajoutez un mode de paiement
               ══════════════════════════════════════════════ */}
            <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
              <div className="px-6">
                <StepHeader
                  step={2}
                  title="Ajoutez un mode de paiement"
                  completed={activeStep > 2}
                />
              </div>

              {activeStep === 2 && (
                <div className="px-6 pb-6">
                  {/* Payment icons row */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md border border-[#EBEBEB]">
                      <svg
                        viewBox="0 0 48 32"
                        className="h-5 w-auto"
                        fill="none"
                      >
                        <rect
                          width="48"
                          height="32"
                          rx="4"
                          fill="#1A1F71"
                        />
                        <text
                          x="24"
                          y="20"
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          VISA
                        </text>
                      </svg>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-md border border-[#EBEBEB]">
                      <svg
                        viewBox="0 0 48 32"
                        className="h-5 w-auto"
                        fill="none"
                      >
                        <rect
                          width="48"
                          height="32"
                          rx="4"
                          fill="#EB001B"
                          opacity="0.8"
                        />
                        <circle cx="19" cy="16" r="8" fill="#EB001B" />
                        <circle cx="29" cy="16" r="8" fill="#F79E1B" />
                        <path
                          d="M24 10a8 8 0 0 1 0 12 8 8 0 0 1 0-12z"
                          fill="#FF5F00"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Card number */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Numero de carte
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 pr-12 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                      />
                      <CreditCard className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#B0B0B0]" />
                    </div>
                  </div>

                  {/* Expiry + CVV */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                        Date d&apos;expiration
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / AA"
                        maxLength={7}
                        className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                      />
                    </div>
                  </div>

                  {/* Cardholder name */}
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Prenom Nom"
                      className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                    />
                  </div>

                  {/* Suivant button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="rounded-lg bg-[#222222] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#000000]"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════
                Step 3: Verifiez votre reservation
               ══════════════════════════════════════════════ */}
            <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
              <div className="px-6">
                <StepHeader
                  step={3}
                  title="Verifiez votre reservation"
                  completed={false}
                />
              </div>

              {activeStep === 3 && (
                <div className="px-6 pb-6">
                  {/* Summary of dates + voyageurs */}
                  <div className="space-y-4 rounded-xl bg-[#F7F7F7] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#222222]">
                          Dates
                        </p>
                        <p className="mt-0.5 text-sm text-[#6A6A6A]">
                          {displayDates}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#222222]">
                          Voyageurs
                        </p>
                        <p className="mt-0.5 text-sm text-[#6A6A6A]">
                          {guests} adulte{guests > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#222222]">
                          Paiement
                        </p>
                        <p className="mt-0.5 text-sm text-[#6A6A6A]">
                          {paymentOption === "now"
                            ? `${formatRent(subtotal)} maintenant`
                            : `0 \u20AC maintenant, ${formatRent(subtotal)} le ${laterDateStr}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="mt-5 text-xs leading-relaxed text-[#6A6A6A]">
                    En cliquant sur le bouton ci-dessous, j&apos;accepte les{" "}
                    <span className="font-medium text-[#222222] underline">
                      conditions de Chinefy
                    </span>
                    , la{" "}
                    <span className="font-medium text-[#222222] underline">
                      politique de confidentialite
                    </span>{" "}
                    et les{" "}
                    <span className="font-medium text-[#222222] underline">
                      conditions d&apos;annulation
                    </span>
                    .
                  </p>

                  {/* Confirmer button */}
                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl bg-[#FF385C] py-4 text-base font-semibold text-white transition-all hover:bg-[#E31C5F] active:scale-[0.98]"
                  >
                    Confirmer la reservation
                  </button>

                  <p className="mt-3 text-center text-xs text-[#6A6A6A]">
                    Aucun montant ne sera debite avant confirmation par
                    l&apos;agence partenaire. Paiement securise par chiffrement
                    SSL.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right column (2/5) — Sticky summary (desktop only) ─── */}
          <div className="hidden flex-[2] lg:block">
            <div className="sticky top-28">
              <SummaryCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
