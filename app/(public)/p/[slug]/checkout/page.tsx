"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Shield,
  Clock,
  Star,
  Check,
  Home,
  PartyPopper,
  DoorOpen,
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

/* ─── Payment Method Tab ─── */
function PaymentMethodTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "border-[#222222] bg-[#F7F7F7] text-[#222222]"
          : "border-[#DDDDDD] bg-white text-[#6A6A6A] hover:border-[#B0B0B0]"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Main Component ─── */
export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wechat" | "alipay">("card");
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

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
  const discountPct = property?.discountMonthly ? Number(property.discountMonthly) : 0;
  const discountAmount = Math.round(rent * (discountPct / 100));
  const serviceFee = Math.round(rent * 0.08);
  const deposit = property?.deposit ? Number(property.deposit) : Math.round(rent * 0.5);
  const subtotal = rent - discountAmount + serviceFee + deposit;

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header skeleton */}
        <div className="sticky top-0 z-30 border-b border-[#EBEBEB] bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-[#F7F7F7]" />
            <div className="h-6 w-48 animate-pulse rounded bg-[#F7F7F7]" />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-[3] space-y-6">
              <div className="h-6 w-40 animate-pulse rounded bg-[#F7F7F7]" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
              <div className="h-6 w-32 animate-pulse rounded bg-[#F7F7F7]" />
              <div className="h-48 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
            </div>
            <div className="flex-[2]">
              <div className="h-80 w-full animate-pulse rounded-xl bg-[#F7F7F7]" />
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
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E31C5F]"
          >
            Retour a l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-30 border-b border-[#EBEBEB] bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#F7F7F7]"
            aria-label="Retour"
          >
            <ChevronLeft className="size-5 text-[#222222]" />
          </button>
          <h1 className="font-display text-lg font-semibold text-[#222222] sm:text-xl">
            Confirmer et payer
          </h1>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col-reverse gap-10 lg:flex-row">
          {/* ─── Left column (3/5) ─── */}
          <div className="flex-[3]">
            {/* ── Votre voyage ── */}
            <section>
              <h2 className="font-display text-[22px] font-semibold text-[#222222]">
                Votre voyage
              </h2>

              {/* Dates */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#222222]">Dates</h3>
                    <p className="mt-0.5 text-sm text-[#6A6A6A]">1 mois minimum</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#222222] underline hover:text-[#FF385C]"
                  >
                    Modifier
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Arrivee
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Depart
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F7F7F7] px-4 py-3">
                <Clock className="size-4 text-[#6A6A6A]" />
                <span className="text-sm text-[#6A6A6A]">
                  Duree minimale : <span className="font-medium text-[#222222]">1 mois</span>
                </span>
              </div>

              {/* Guests */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#222222]">Voyageurs</h3>
                    <p className="mt-0.5 text-sm text-[#6A6A6A]">
                      {guests} voyageur{guests > 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#222222] underline hover:text-[#FF385C]"
                  >
                    Modifier
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="flex size-9 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-[15px] font-medium text-[#222222]">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests(Math.min(property.maxGuests || 10, guests + 1))
                    }
                    className="flex size-9 items-center justify-center rounded-full border border-[#DDDDDD] text-[#6A6A6A] transition-colors hover:border-[#222222] hover:text-[#222222] disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={guests >= (property.maxGuests || 10)}
                  >
                    +
                  </button>
                  <span className="text-xs text-[#6A6A6A]">
                    {property.maxGuests} max
                  </span>
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="my-8 border-[#EBEBEB]" />

            {/* ── Paiement ── */}
            <section>
              <h2 className="font-display text-[22px] font-semibold text-[#222222]">
                Paiement
              </h2>

              {/* Payment method selector */}
              <div className="mt-5 flex flex-wrap gap-3">
                <PaymentMethodTab
                  active={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard className="size-5" />
                  Carte bancaire
                </PaymentMethodTab>
                <PaymentMethodTab
                  active={paymentMethod === "wechat"}
                  onClick={() => setPaymentMethod("wechat")}
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.99a1.013 1.013 0 1 1 0 2.025 1.013 1.013 0 0 1 0-2.025zm5.812 0a1.013 1.013 0 1 1 0 2.025 1.013 1.013 0 0 1 0-2.025z" />
                    <path d="M23.96 14.517c0-3.267-3.19-5.92-7.12-5.92-3.942 0-7.12 2.653-7.12 5.92 0 3.267 3.178 5.92 7.12 5.92a8.691 8.691 0 0 0 2.32-.319.724.724 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .243-.11.243-.245 0-.06-.024-.12-.04-.178l-.326-1.233a.493.493 0 0 1 .178-.554C23.013 18.167 23.96 16.445 23.96 14.517zM14.306 13.1a.845.845 0 1 1 0 1.69.845.845 0 0 1 0-1.69zm5.344 0a.845.845 0 1 1 0 1.69.845.845 0 0 1 0-1.69z" />
                  </svg>
                  WeChat Pay
                </PaymentMethodTab>
                <PaymentMethodTab
                  active={paymentMethod === "alipay"}
                  onClick={() => setPaymentMethod("alipay")}
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.422 15.358c-1.49-.688-3.27-1.494-5.203-2.387a20.852 20.852 0 0 0 1.87-4.37h-4.636V6.89h5.71V5.712h-5.71V3.13a.469.469 0 0 0-.468-.468h-2.348v3.05h-5.42v1.18h5.42v1.71H5.65v1.18h8.591a17.835 17.835 0 0 1-1.347 3.08c-2.014-.77-4.14-1.277-5.668-.934-3.168.71-4.595 3.573-3.27 5.78 1.325 2.206 4.712 2.835 7.108 1.105 1.454-1.05 2.609-2.737 3.471-4.678 1.98.95 3.69 1.734 5.058 2.3C22.65 23.038 18.655 24 14.399 24 6.446 24 0 18.627 0 12S6.446 0 14.399 0C22.353 0 24 5.373 24 12c0 1.195-.052 1.673-.367 2.493l-2.211.865zM7.593 19.724c-2.128 1.122-4.244.442-4.641-.946-.398-1.389.74-3.103 2.77-3.355 1.238-.153 2.59.2 4.02.788a12.573 12.573 0 0 1-2.149 3.513z" />
                  </svg>
                  Alipay
                </PaymentMethodTab>
              </div>

              {/* Credit card form */}
              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Numero de carte
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 pr-12 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                      />
                      <CreditCard className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#B0B0B0]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                        Date d&apos;expiration
                      </label>
                      <input
                        type="text"
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
                        placeholder="123"
                        maxLength={4}
                        className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#6A6A6A]">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      placeholder="Prenom Nom"
                      className="w-full rounded-xl border border-[#DDDDDD] px-4 py-3 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                    />
                  </div>
                </div>
              )}

              {/* WeChat / Alipay placeholder */}
              {paymentMethod !== "card" && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] px-5 py-8 text-center">
                  <div className="mx-auto">
                    <Shield className="mx-auto size-8 text-[#6A6A6A]" />
                    <p className="mt-3 text-sm text-[#6A6A6A]">
                      Vous serez redirige vers{" "}
                      <span className="font-medium text-[#222222]">
                        {paymentMethod === "wechat" ? "WeChat Pay" : "Alipay"}
                      </span>{" "}
                      pour finaliser le paiement de maniere securisee.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Divider */}
            <hr className="my-8 border-[#EBEBEB]" />

            {/* ── Conditions d'annulation ── */}
            <section>
              <h2 className="font-display text-[22px] font-semibold text-[#222222]">
                Conditions d&apos;annulation
              </h2>
              <div className="mt-4 flex gap-3 rounded-xl bg-[#F7F7F7] p-4">
                <Shield className="mt-0.5 size-5 shrink-0 text-[#008A05]" />
                <div>
                  <p className="text-sm leading-relaxed text-[#222222]">
                    <span className="font-semibold">Annulation gratuite pendant 48h.</span>{" "}
                    Passe ce delai, le premier mois est du.
                  </p>
                  <p className="mt-1.5 text-xs text-[#6A6A6A]">
                    La caution vous sera restituee sous 15 jours apres votre depart, sous
                    reserve d&apos;un etat des lieux conforme.
                  </p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="my-8 border-[#EBEBEB]" />

            {/* ── Regles de base ── */}
            <section>
              <h2 className="font-display text-[22px] font-semibold text-[#222222]">
                Regles de base
              </h2>
              <p className="mt-2 text-sm text-[#6A6A6A]">
                Nous demandons a tous les voyageurs de respecter quelques regles simples.
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <Home className="mt-0.5 size-5 shrink-0 text-[#222222]" />
                  <span className="text-sm text-[#222222]">
                    Respectez le logement comme si c&apos;etait le votre
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <PartyPopper className="mt-0.5 size-5 shrink-0 text-[#222222]" />
                  <span className="text-sm text-[#222222]">
                    Pas de fete ni d&apos;evenement sans autorisation prealable
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <DoorOpen className="mt-0.5 size-5 shrink-0 text-[#222222]" />
                  <span className="text-sm text-[#222222]">
                    Check-in a partir de 14h00, check-out avant 11h00
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-[#222222]" />
                  <span className="text-sm text-[#222222]">
                    Respectez les horaires de calme (22h - 8h)
                  </span>
                </li>
              </ul>
            </section>

            {/* Divider */}
            <hr className="my-8 border-[#EBEBEB]" />

            {/* ── CTA ── */}
            <section className="pb-10">
              <p className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-[#6A6A6A]">
                <Check className="mt-0.5 size-4 shrink-0 text-[#6A6A6A]" />
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
              <button
                type="button"
                className="w-full rounded-xl bg-[#FF385C] py-4 text-base font-semibold text-white transition-all hover:bg-[#E31C5F] active:scale-[0.98]"
              >
                Confirmer la reservation
              </button>
              <p className="mt-3 text-center text-xs text-[#6A6A6A]">
                Aucun montant ne sera debite avant confirmation par l&apos;agence partenaire.
                Paiement securise par chiffrement SSL.
              </p>
            </section>
          </div>

          {/* ─── Right column (2/5) — Sticky summary ─── */}
          <div className="flex-[2]">
            <div className="sticky top-28 rounded-2xl border border-[#DDDDDD] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
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
                    <span className="text-xs text-[#6A6A6A]">(Nouveau)</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="my-5 border-[#EBEBEB]" />

              {/* Price breakdown */}
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
                      <span className="text-[#008A05]">-{formatRent(discountAmount)}</span>
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

              {/* Divider */}
              <hr className="my-5 border-[#EBEBEB]" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-[#222222]">
                  Total
                </span>
                <span className="font-display text-base font-bold text-[#222222]">
                  {formatRent(subtotal)}
                </span>
              </div>

              {/* Security badge */}
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#F7F7F7] px-3 py-2.5">
                <Shield className="size-4 shrink-0 text-[#FF385C]" />
                <span className="text-xs text-[#6A6A6A]">
                  Paiement securise et protege par Chinefy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
