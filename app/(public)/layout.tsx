"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Heart, User, SlidersHorizontal } from "lucide-react";
import { DesktopHeader } from "@/components/public/desktop-header";
import { MobileSearchOverlay } from "@/components/public/search-overlay";
import { SessionProvider } from "next-auth/react";
import { HeaderTabProvider } from "@/lib/header-tab-context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SessionProvider>
    <HeaderTabProvider>
      <div className="min-h-screen bg-white pb-16 sm:pb-0">
        {/* Mobile sticky search header — Airbnb style */}
        <header className="sticky top-0 z-50 bg-white px-4 pb-3 pt-3 shadow-sm sm:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex flex-1 items-center gap-3 rounded-full border border-[#DDDDDD] bg-white px-4 py-2.5 shadow-sm"
            >
              <Search className="size-4 shrink-0 text-[#222222]" />
              <div className="min-w-0 text-left">
                <p className="text-[13px] font-semibold text-[#222222]">Où allez-vous ?</p>
                <p className="truncate text-xs text-[#6A6A6A]">
                  Toutes les villes · Type · Rechercher
                </p>
              </div>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#DDDDDD]"
            >
              <SlidersHorizontal className="size-4 text-[#222222]" />
            </button>
          </div>
        </header>

        {/* Desktop header with search bar */}
        <DesktopHeader />

        {/* Mobile search overlay */}
        <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

        {children}

        {/* Mobile bottom navigation — Airbnb style */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EBEBEB] bg-white sm:hidden">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-0.5 px-4 py-1"
            >
              <Search className="size-5 text-[#FF385C]" />
              <span className="text-[10px] font-semibold text-[#FF385C]">
                Explorer
              </span>
            </Link>
            <button
              className="flex flex-col items-center gap-0.5 px-4 py-1"
              disabled
            >
              <Heart className="size-5 text-[#B0B0B0]" />
              <span className="text-[10px] font-medium text-[#B0B0B0]">
                Favoris
              </span>
            </button>
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 px-4 py-1"
            >
              <User className="size-5 text-[#6A6A6A]" />
              <span className="text-[10px] font-medium text-[#6A6A6A]">
                Connexion
              </span>
            </Link>
          </div>
          {/* Safe area for iPhone notch */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </HeaderTabProvider>
    </SessionProvider>
  );
}
