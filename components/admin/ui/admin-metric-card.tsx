type AdminMetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function AdminMetricCard({ label, value, detail }: AdminMetricCardProps) {
  return (
    <article className="admin-card admin-stat-card">
      <p className="admin-stat-value">{value}</p>
      <p className="admin-stat-label">{label}</p>
      {detail ? <p className="admin-stat-detail">{detail}</p> : null}
    </article>
  );
}
