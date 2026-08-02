import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function listUpcomingAgendaRows() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.GEEF_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase public agenda configuration.");

  const supabase = createSupabaseClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const today = new Date().toISOString().slice(0, 10);
  return supabase
    .from("reunioes")
    .select("id, data, observacao, escala:escalas_mensais!inner(status)")
    .eq("escala.status", "publicada")
    .gte("data", today)
    .order("data", { ascending: true })
    .limit(180);
}
