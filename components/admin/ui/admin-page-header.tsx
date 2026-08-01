import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: "default" | "hero";
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  variant = "default",
}: AdminPageHeaderProps) {
  return (
    <section className={`admin-page-header admin-card${variant === "hero" ? " admin-page-header--hero" : ""}`}>
      <div className="admin-page-header-copy">
        {eyebrow ? <span className="admin-dashboard-kicker">{eyebrow}</span> : null}
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-subtitle">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
    </section>
  );
}
