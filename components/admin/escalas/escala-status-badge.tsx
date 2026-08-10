const STATUS_CLASS: Record<string, string> = {
  rascunho: 'inline-status-info',
  revisada: 'inline-status-warning',
  publicada: 'inline-status-success',
};

export function EscalaStatusBadge({ status }: { status?: string | null }) {
  const label = status || 'indefinido';
  return <span className={`inline-status ${STATUS_CLASS[label] || 'inline-status-neutral'}`}>{label}</span>;
}
