import type { Metadata } from "next";
import { ContentPageView } from "@/components/content-page";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "Meeting readings | GEEF" : "Leituras da reunião pública | GEEF",
    description: locale === "en" ? "Selected texts for the public meeting." : "Seleções de textos para a reunião pública.",
  };
}

export default async function ReuniaoPublicaLeituraPage() {
  const locale = await getRequestLocale();
  return (
    <ContentPageView
      locale={locale}
      slug="reuniao-publica-leitura"
      page={{
        title: locale === "en" ? "Meeting readings" : "Leituras da reunião pública",
        summary: locale === "en" ? "Selected texts connected to the theme of each meeting." : "Seleções de textos relacionadas ao tema de cada reunião.",
        intro: locale === "en" ? "These readings belong to the public meeting and are independent from the library collection." : "Estas leituras pertencem à reunião pública e são independentes do acervo da biblioteca.",
        ctaLabel: locale === "en" ? "Back to meeting" : "Voltar à reunião",
        ctaHref: "/reuniao-publica",
        sections: [{
          heading: locale === "en" ? "Current selection" : "Seleção atual",
          text: locale === "en" ? "Texts can be registered by the meeting team according to the theme and the needs of the gathering." : "Os textos podem ser cadastrados pela equipe da reunião conforme o tema e a necessidade do encontro.",
        }],
      }}
    />
  );
}
