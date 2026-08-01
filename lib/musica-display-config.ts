export type MusicaDisplayConfig = {
  columns?: number;
  scale?: number;
  scaleNarrow?: number;
  scaleWide?: number;
  fillRows?: boolean;
};

const configs: Record<string, MusicaDisplayConfig> = {
  "A Canção Que a Gente Fez": { columns: 5, scaleNarrow: 0.45, scaleWide: 0.65 },
  Aleluia: { columns: 3, scale: 0.98 },
  "Quanta Luz": { columns: 2, scale: 1.35 },
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
