import type { Metadata } from "next";
import { EvangelhoLarSession } from "@/components/evangelho-lar-guide";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "Let's do it together | Gospel at home | GEEF" : "Vamos fazer juntos | Evangelho no Lar | GEEF",
    description: locale === "en" ? "A guided, self-timed Gospel at home sequence." : "Uma sequência guiada do Evangelho no Lar com contador de referência.",
  };
}

export default async function EvangelhoNoLarGuidePage() {
  const locale = await getRequestLocale();
  return <EvangelhoLarSession locale={locale} />;
}
