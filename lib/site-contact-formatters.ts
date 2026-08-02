export function normalizeWebsite(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
}

export function normalizeHandle(value?: string | null) {
  return value?.trim().replace(/^@/, "").trim() ?? "";
}

export function normalizePhoneLink(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}
