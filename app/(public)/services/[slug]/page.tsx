"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  coverImage: string | null;
  content: string | null;
  features: string[];
  ctaLabel: string | null;
  ctaHref: string | null;
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/services/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setService(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-[#F7F7F7]" />
          <div className="h-10 w-2/3 rounded bg-[#F7F7F7]" />
          <div className="h-4 w-full rounded bg-[#F7F7F7]" />
          <div className="h-4 w-3/4 rounded bg-[#F7F7F7]" />
          <div className="h-64 rounded-2xl bg-[#F7F7F7]" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-[#222222]">
          Service non trouvé
        </h1>
        <p className="mt-2 text-sm text-[#6A6A6A]">
          Ce service n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E31C5F]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 pt-6 pb-10 sm:pt-10 sm:pb-16">
          {/* Back link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6A6A6A] transition-colors hover:text-[#222222]"
          >
            <ArrowLeft className="size-4" />
            Retour
          </Link>

          <div className="flex items-start gap-6">
            {service.icon && (
              <img
                src={service.icon}
                alt={service.title}
                className="size-20 shrink-0 object-contain sm:size-24"
              />
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-[#222222] sm:text-4xl">
                {service.title}
              </h1>
              {service.description && (
                <p className="mt-3 text-base leading-relaxed text-[#6A6A6A] sm:text-lg">
                  {service.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {service.coverImage && (
        <section className="bg-white pb-10">
          <div className="mx-auto max-w-4xl px-5">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={service.coverImage}
                alt={service.title}
                className="h-64 w-full object-cover sm:h-80"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      {service.content && (
        <section className="border-t border-[#EBEBEB] bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-display text-xl font-bold text-[#222222] sm:text-2xl">
              En détail
            </h2>
            <div className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#484848]">
              {service.content}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {service.features.length > 0 && (
        <section className="border-t border-[#EBEBEB] bg-[#F7F7F7] py-10 sm:py-14">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-display text-xl font-bold text-[#222222] sm:text-2xl">
              Ce qui est inclus
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#008A05]/10">
                    <Check className="size-3.5 text-[#008A05]" />
                  </div>
                  <span className="text-[15px] text-[#484848]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-[#EBEBEB] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="font-display text-xl font-bold text-[#222222] sm:text-2xl">
            Intéressé par ce service ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[#6A6A6A]">
            Contactez-nous pour en savoir plus ou demander un devis personnalisé. Notre équipe vous répond sous 24h.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={service.ctaHref || "/contact"}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF385C] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E31C5F]"
            >
              <MessageCircle className="size-4" />
              {service.ctaLabel || "Demander un devis"}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#DDDDDD] px-8 py-3.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#F7F7F7]"
            >
              Voir tous les services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
