export type MusicaDisplayConfig = {
  columns?: number;
  scale?: number;
  scaleNarrow?: number;
  scaleWide?: number;
  fillRows?: boolean;
};

const configs: Record<string, MusicaDisplayConfig> = {
  "A Canção Que a Gente Fez": { columns: 5, scaleNarrow: 0.45, scaleWide: 0.65 },
  "A Família É o Lugar": { columns: 3, scale: 0.62 },
  Aleluia: { columns: 3, scale: 0.58 },
  "Amor de Jesus": { columns: 3, scale: 0.68 },
  "Aos Pés do Monte": { columns: 3, scale: 0.62 },
  "Atitude de Amor": { columns: 3, scale: 0.62 },
  "Corações Tarefeiros": { columns: 3, scale: 0.62 },
  "Depende de Você": { columns: 3, scale: 0.62 },
  "DIGA A SI MESMO": { columns: 3, scale: 0.62 },
  "Dor E Confiança": { columns: 3, scale: 0.62 },
  "Fica Sempre": { columns: 3, scale: 0.62 },
  "Força do Bem": { columns: 3, scale: 0.62 },
  "MESTRE JESUS": { columns: 3, scale: 0.62 },
  "Oração de São Francisco": { columns: 3, scale: 0.62 },
  "Paz Pela Paz": { columns: 3, scale: 0.62 },
  "Quanta Luz": { columns: 2, scale: 1.35 },
  Reencarnação: { columns: 3, scale: 0.62 },
  "Santa Casa Santa": { columns: 3, scale: 0.52 },
  "VIDA E MAGIA": { columns: 3, scale: 0.62 },
};

export function getMusicaDisplayConfig(titulo: string): MusicaDisplayConfig {
  return configs[titulo] ?? {};
}

export function getMusicaDisplayScale(titulo: string, viewportWidth: number, fallback: number) {
  const config = getMusicaDisplayConfig(titulo);
  if (viewportWidth >= 1600 && config.scaleWide) return config.scaleWide;
  if (viewportWidth < 1600 && config.scaleNarrow) return config.scaleNarrow;
  return config.scale ?? fallback;
}
