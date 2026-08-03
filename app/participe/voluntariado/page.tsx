import type { Metadata } from "next";
import { ContentPageView } from "@/components/content-page";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "Volunteering | GEEF" : "Voluntariado | GEEF",
    description: locale === "en" ? "Ways to collaborate with GEEF." : "Formas de colaborar com o GEEF.",
  };
}

export default async function ParticipeVoluntariadoPage() {
  const locale = await getRequestLocale();
  const english = locale === "en";
  return (
    <ContentPageView
      locale={locale}
      slug="participe-voluntariado"
      page={{
        title: english ? "Volunteering" : "Voluntariado",
        summary: english ? "Offer your time, care and skills to the house." : "Ofereça seu tempo, cuidado e habilidades à casa.",
        intro: english ? "Find a respectful way to collaborate with the activities and needs of GEEF." : "Encontre uma forma respeitosa de colaborar com as atividades e necessidades do GEEF.",
        ctaLabel: english ? "Contact the house" : "Falar com a casa",
        ctaHref: "/contato",
        sections: [{
          heading: english ? "Ways to help" : "Formas de ajudar",
          text: english ? "Volunteering can support reception, study, public meetings, library and communication." : "O voluntariado pode apoiar a recepção, os estudos, as reuniões públicas, a biblioteca e a comunicação.",
          bullets: english ? ["Availability agreed with the team.", "Respect for each activity and its guidelines."] : ["Disponibilidade combinada com a equipe.", "Respeito a cada atividade e suas orientações."],
        }],
      }}
    />
  );
}
