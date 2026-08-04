import { createServiceRoleClient } from "@/lib/supabase/service-role";

export function normalizeAllowlistEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isEmailAllowlisted(email: string) {
  const normalizedEmail = normalizeAllowlistEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  const { data, error } = await createServiceRoleClient()
    .from("pessoas_allowlist")
    .select("id")
    .eq("email", normalizedEmail)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
