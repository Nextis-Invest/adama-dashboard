"use client";

/* eslint-disable @next/next/no-img-element */
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side — Hero */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-[#222222] via-[#460a1a] to-[#FF385C] p-12 lg:flex">
        <div className="max-w-lg text-white">
          <span className="mb-8 inline-block text-4xl font-black tracking-tight text-white">
            CHINEFY
          </span>
          <h1 className="mb-6 text-5xl font-bold leading-tight xl:text-6xl">
            Trouvez votre logement idéal en Chine.
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            Logements vérifiés, aide juridique, transferts, sourcing —
            Chinefy vous accompagne dans tous les aspects de votre installation.
          </p>

          {/* Stats */}
          <div className="mt-10 flex gap-8">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/60">Logements</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-white/60">Villes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-white/60">Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center lg:text-left">
            <span className="mb-4 inline-block text-2xl font-black tracking-tight text-[#FF385C]">
              CHINEFY
            </span>
            <h2 className="text-3xl font-bold text-[#222222]">Bon retour</h2>
            <p className="mt-1 text-[#6A6A6A]">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#222222]"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded-xl border border-[#DDDDDD] bg-white px-4 py-3 text-[#222222] outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#222222]"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full rounded-xl border border-[#DDDDDD] bg-white px-4 py-3 pr-12 text-[#222222] outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
                  placeholder="Entrez votre mot de passe"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#B0B0B0] transition-colors hover:text-[#6A6A6A]"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#DDDDDD] text-[#FF385C] focus:ring-[#FF385C]"
                />
                <span className="ml-2 text-sm text-[#6A6A6A]">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#FF385C] hover:text-[#E31C5F]"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#E31C5F] focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EBEBEB]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-[#B0B0B0]">
                  Ou continuer avec
                </span>
              </div>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#DDDDDD] px-4 py-2.5 text-sm font-medium text-[#222222] transition-colors hover:bg-[#F7F7F7]">
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#DDDDDD] px-4 py-2.5 text-sm font-medium text-[#222222] transition-colors hover:bg-[#F7F7F7]">
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#000"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              Apple
            </button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#B0B0B0]">
            En vous connectant, vous acceptez nos{" "}
            <span className="text-[#6A6A6A] underline">
              Conditions d&apos;utilisation
            </span>{" "}
            et notre{" "}
            <span className="text-[#6A6A6A] underline">
              Politique de confidentialité
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
