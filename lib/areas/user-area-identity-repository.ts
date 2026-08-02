import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function loadUserAreaIdentity(userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.GEEF_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createSupabaseClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const authUserResponse = await fetch(`${url}/auth/v1/admin/users/${userId}`, { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } });
  const authUser = authUserResponse.ok ? await authUserResponse.json() : null;
  const siteRole = typeof authUser?.app_metadata?.site_role === "string" ? authUser.app_metadata.site_role : null;
  const [perfilResult, usuarioResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("usuarios_sistema").select("*").eq("id", userId).single(),
  ]);
  return { supabase, siteRole, perfilResult, usuarioResult };
}
