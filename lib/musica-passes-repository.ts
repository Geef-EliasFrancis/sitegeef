import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type MusicaPasseRecord = { id: string; titulo: string; audio_url: string; ordem: number; ativo: boolean };
const fields = "id, titulo, audio_url, ordem, ativo";

export async function listMusicaPasseRecords(includeInactive = false): Promise<MusicaPasseRecord[]> {
  const query = createServiceRoleClient().from("musica_passes").select(fields).order("ordem").order("criado_em");
  const { data, error } = includeInactive ? await query : await query.eq("ativo", true);
  return error ? [] : (data ?? []) as MusicaPasseRecord[];
}

export async function saveMusicaPasseRecord(input: { id?: string; titulo: string; audio_url: string; ordem: number; ativo: boolean }) {
  const client = createServiceRoleClient();
  const payload = { ...input, id: input.id ?? undefined, atualizado_em: new Date().toISOString() };
  const { data, error } = await client.from("musica_passes").upsert(payload, { onConflict: "id" }).select(fields).single();
  if (error) throw error;
  return data as MusicaPasseRecord;
}

export async function deleteMusicaPasseRecord(id: string) {
  const { error } = await createServiceRoleClient().from("musica_passes").delete().eq("id", id);
  if (error) throw error;
}
