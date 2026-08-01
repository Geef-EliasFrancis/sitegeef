import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type PublicAgendaEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
};

async function loadPublicAgenda(): Promise<PublicAgendaEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.GEEF_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase public agenda configuration.");
  }

  const supabase = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("reunioes")
    .select("id, data, observacao, escala:escalas_mensais!inner(status)")
    .eq("escala.status", "publicada")
    .gte("data", today)
    .order("data", { ascending: true })
    .limit(180);

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
