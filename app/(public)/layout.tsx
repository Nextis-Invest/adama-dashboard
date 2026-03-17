import Link from "next/link";
import { Building2 } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Public header */}
      <header className="sticky top-0 z-50 border-b border-[#EBEBEB] bg-white/80 backdrop-blur-md">
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
    </div>
  );
}
