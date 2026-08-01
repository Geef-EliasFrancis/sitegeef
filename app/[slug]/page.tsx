import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/content-page";
import { getLocalizedContentPage } from "@/lib/multilingual/content";
import { getRequestLocale } from "@/lib/multilingual/server";
import { AgendaView } from "@/components/agenda/agenda-view";
import { getPublicAgenda } from "@/lib/agenda/public-agenda";

type Params = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const page = getLocalizedContentPage(slug, locale);
  if (!page) {
    return {};
  }
  return {
    title: `${page.title} | GEEF`,
    description: page.summary,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const page = getLocalizedContentPage(slug, locale);

  if (!page) {
    notFound();
  }

  if (slug === "agenda") {
    const events = await getPublicAgenda();
    return <AgendaView events={events} />;
  }

  return <ContentPageView page={page} locale={locale} slug={slug} />;
}
