export type MusicaDisplayConfig = {
  columns?: number;
  scale?: number;
};

const configs: Record<string, MusicaDisplayConfig> = {
  "A Canção Que a Gente Fez": { columns: 3, scale: 0.72 },
  Aleluia: { columns: 3, scale: 0.98 },
  "Quanta Luz": { columns: 4, scale: 1 },
};

export function getMusicaDisplayConfig(titulo: string): MusicaDisplayConfig {
  return configs[titulo] ?? {};
}
