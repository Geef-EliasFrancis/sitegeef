import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type InstitutionRow = { nome_oficial?: string | null; nome_curto?: string | null; descricao?: string | null };
export type AddressRow = { cep?: string | null; logradouro?: string | null; numero?: string | null; complemento?: string | null; bairro?: string | null; cidade?: string | null; estado?: string | null; maps_link?: string | null };
export type ContactRow = { tipo?: string | null; telefone?: string | null; whatsapp?: string | null; email?: string | null; instagram?: string | null; facebook?: string | null; youtube?: string | null; site?: string | null; ativo?: boolean | null };

export async function loadPublicContactRows() {
  const supabase = createServiceRoleClient();
  const [institutionResult, addressResult, contactsResult] = await Promise.all([
    supabase.from("instituicao").select("nome_oficial, nome_curto, descricao").order("criado_em", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("instituicao_enderecos").select("cep, logradouro, numero, complemento, bairro, cidade, estado, maps_link").limit(1).maybeSingle(),
    supabase.from("instituicao_contatos").select("tipo, telefone, whatsapp, email, instagram, facebook, youtube, site, ativo").eq("ativo", true).order("tipo", { ascending: true }),
  ]);
  return {
    institution: institutionResult.data as InstitutionRow | null,
    address: addressResult.data as AddressRow | null,
    contacts: (contactsResult.data ?? []) as ContactRow[],
  };
}
