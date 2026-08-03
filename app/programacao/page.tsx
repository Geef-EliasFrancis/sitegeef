import type { Metadata } from "next";
import { ContentPageView } from "@/components/content-page";
import { getLocalizedContentPage } from "@/lib/multilingual/content";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = getLocalizedContentPage("programacao", locale);

  return {
    title: `${page?.title ?? "Programação"} | GEEF`,
    description: page?.summary,
  };
}

export default async function ProgramacaoPage() {
  const locale = await getRequestLocale();
  const page = getLocalizedContentPage("programacao", locale);

  if (!page) {
    return null;
  }

  return <ContentPageView page={page} locale={locale} slug="programacao" showBrandKicker={false} />;
}
