export type MusicaDisplayConfig = {
  columns?: number;
  scale?: number;
  fillRows?: boolean;
};

const configs: Record<string, MusicaDisplayConfig> = {
  "A Canção Que a Gente Fez": { columns: 5, scale: 0.72 },
  Aleluia: { columns: 3, scale: 0.98 },
  "Quanta Luz": { columns: 2, scale: 1.35 },
};

export function getMusicaDisplayConfig(titulo: string): MusicaDisplayConfig {
  return configs[titulo] ?? {};
}
