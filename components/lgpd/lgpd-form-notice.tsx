"use client";

import { getMultilingualCopy, type Locale } from "@/lib/multilingual/client";
import { LgpdNotice } from "./lgpd-notice";

type LgpdFormNoticeProps = {
  locale?: Locale;
  text?: string;
  title?: string;
  className?: string;
};

export function LgpdFormNotice({
  locale = "pt",
  title,
  text,
  className = "",
}: Readonly<LgpdFormNoticeProps>) {
  const copy = getMultilingualCopy(locale);
  return (
    <LgpdNotice
      title={title || copy.formNotice.title}
      text={text || copy.formNotice.text}
      policyHref="/privacidade"
      policyLabel={copy.formNotice.policyLabel}
      contactHref="/lgpd"
      contactLabel={copy.formNotice.contactLabel}
      openLinksInNewTab
      className={`lgpd-form-notice ${className}`.trim()}
    />
  );
}
