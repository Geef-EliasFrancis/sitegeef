import type { ReactNode } from "react";

type AdminPanelProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "subtle";
};

export function AdminPanel({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
}: AdminPanelProps) {
  return (
    <section className={`admin-card admin-dashboard-panel admin-area-panel${tone === "subtle" ? " admin-subtle-card" : ""}`}>
      {eyebrow || title || description ? (
        <div className="admin-section-heading">
          {eyebrow ? <span className="admin-dashboard-kicker">{eyebrow}</span> : null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
