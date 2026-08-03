import { listMusicaPasseRecords, saveMusicaPasseRecord, deleteMusicaPasseRecord, type MusicaPasseRecord } from "@/lib/musica-passes-repository";

export type MusicaPasse = MusicaPasseRecord;
export const listMusicaPasses = () => listMusicaPasseRecords(false);
export const listAdminMusicaPasses = () => listMusicaPasseRecords(true);
export const saveMusicaPasse = saveMusicaPasseRecord;
export const deleteMusicaPasse = deleteMusicaPasseRecord;
