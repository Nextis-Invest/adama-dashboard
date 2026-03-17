import Link from "next/link";
import { Building2, Search, Heart, User } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white pb-16 sm:pb-0">
      {/* Desktop header — hidden on mobile */}
      <header className="sticky top-0 z-50 hidden border-b border-[#EBEBEB] bg-white/80 backdrop-blur-md sm:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF385C]">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#222222]">
              Adama
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-[#222222] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#000000]"
          >
            Connexion
          </Link>
        </div>
      </header>

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
  );
}
