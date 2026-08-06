"use client";

import Link from "next/link";

type LgpdNoticeProps = {
  title?: string;
  text: string;
  policyHref?: string;
  policyLabel?: string;
  contactHref?: string;
  contactLabel?: string;
  openLinksInNewTab?: boolean;
  className?: string;
};

export function LgpdNotice({
  title = "Privacidade",
  text,
  policyHref = "/privacidade",
  policyLabel = "Política de Privacidade",
  contactHref = "/lgpd",
  contactLabel = "Entenda seus direitos",
  openLinksInNewTab = false,
  className = "",
}: Readonly<LgpdNoticeProps>) {
  const linkProps = openLinksInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <aside className={`lgpd-notice ${className}`.trim()}>
      <strong>{title}</strong>
      <p>{text}</p>
      <div className="lgpd-notice-links">
        <Link href={policyHref} {...linkProps}>{policyLabel}</Link>
        <span aria-hidden="true">·</span>
        <Link href={contactHref} {...linkProps}>{contactLabel}</Link>
      </div>
    </aside>
  );
}
