import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { removeMusicaPasseAudio } from "@/lib/musica-passes-storage";

export type MusicaPasseRecord = { id: string; titulo: string; audio_url: string; ordem: number; ativo: boolean };
const fields = "id, titulo, audio_url, ordem, ativo";

export async function listMusicaPasseRecords(includeInactive = false): Promise<MusicaPasseRecord[]> {
  const query = createServiceRoleClient().from("musica_passes").select(fields).order("ordem").order("criado_em");
  const { data, error } = includeInactive ? await query : await query.eq("ativo", true);
  return error ? [] : (data ?? []) as MusicaPasseRecord[];
}

async function reindexMusicaPasses(records: MusicaPasseRecord[]) {
  const client = createServiceRoleClient();
  const temporaryBase = 1000000;

  await Promise.all(records.map(async (record, index) => {
    const { error } = await client.from("musica_passes").update({ ordem: temporaryBase + index }).eq("id", record.id);
    if (error) throw error;
  }));

  await Promise.all(records.map(async (record, index) => {
    const { error } = await client.from("musica_passes").update({ ordem: index, atualizado_em: new Date().toISOString() }).eq("id", record.id);
    if (error) throw error;
  }));
}

export async function saveMusicaPasseRecord(input: { id?: string; titulo: string; audio_url: string; ordem?: number; ativo: boolean }) {
  const client = createServiceRoleClient();
  let ordem = input.ordem;

  if (ordem === undefined) {
    const { data, error } = await client.from("musica_passes").select("ordem").eq("ativo", true).order("ordem", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    ordem = (data?.ordem ?? -1) + 1;
  }

  const payload = { ...input, ordem, id: input.id ?? undefined, atualizado_em: new Date().toISOString() };
  const { data, error } = await client.from("musica_passes").upsert(payload, { onConflict: "id" }).select(fields).single();
  if (error) throw error;
  return data as MusicaPasseRecord;
}

export async function moveMusicaPasseRecord(id: string, direction: "up" | "down") {
  const records = await listMusicaPasseRecords();
  const currentIndex = records.findIndex((record) => record.id === id);
  if (currentIndex < 0) return;

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= records.length) return;

  const reordered = [...records];
  const [current] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, current);
  await reindexMusicaPasses(reordered);
}

export async function deleteMusicaPasseRecord(id: string) {
  const client = createServiceRoleClient();
  const { data: item } = await client.from("musica_passes").select("audio_url").eq("id", id).maybeSingle();
  const { error } = await client.from("musica_passes").delete().eq("id", id);
  if (error) throw error;
  if (item?.audio_url) await removeMusicaPasseAudio(item.audio_url);
  await reindexMusicaPasses(await listMusicaPasseRecords());
}
