import { unstable_cache } from "next/cache";
import { listUpcomingAgendaRows } from "@/lib/agenda/public-agenda-repository";

export type PublicAgendaEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
};

async function loadPublicAgenda(): Promise<PublicAgendaEvent[]> {
  const { data, error } = await listUpcomingAgendaRows();

  if (error) {
    console.error("Falha ao carregar agenda pública:", error.message);
    return [];
  }

  return (data ?? []).map((event) => ({
    id: String(event.id),
    date: event.data,
    title: "Reunião pública",
    description: event.observacao || "Palestra, passe e convivência fraterna.",
  }));
}

export const getPublicAgenda = unstable_cache(loadPublicAgenda, ["public-agenda"], {
  revalidate: 300,
  tags: ["public-agenda", "public-escalas"],
});
