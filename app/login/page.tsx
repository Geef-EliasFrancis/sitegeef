import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getMultilingualCopy } from "@/lib/multilingual";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getMultilingualCopy(locale);

  return {
    title: `GEEF | ${copy.login.title}`,
    description: copy.login.lead,
  };
}

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    popup?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getRequestLocale();
  const copy = getMultilingualCopy(locale);
  const resolvedSearchParams = await searchParams;
  const isPopup = resolvedSearchParams?.popup === "1";
  const nextUrl = resolvedSearchParams?.next || "/minha-area";
  const initialError = resolvedSearchParams?.error === "not_allowed"
    ? (locale === "en" ? "This email is not authorized to access GEEF." : "Este email não está autorizado para acessar o GEEF.")
    : undefined;

  return (
    <main className={`login-page ${isPopup ? "login-page-popup" : ""}`}>
      <div className="login-modal">
        <div className="login-modal-head">
          <div>
            <p className="eyebrow">GEEF</p>
            <h1>{copy.login.title}</h1>
            <p className="login-modal-lead">{copy.login.lead}</p>
          </div>

          <Link href="/" className="login-close-link" aria-label={locale === "en" ? "Close login" : "Fechar login"}>
            ×
          </Link>
        </div>

        <LoginForm locale={locale} nextUrl={nextUrl} initialError={initialError} />

        <div className="login-footer">
          <p>{copy.login.footer}</p>
        </div>
      </div>
    </main>
  );
}
