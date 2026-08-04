import Link from "next/link";
import { IconPlus } from "@/components/icons";

type AdminPageTitleAddProps = {
  title: string;
  href: string;
  label?: string;
};

export function AdminPageTitleAdd({ title, href, label = `Adicionar ${title.toLowerCase()}` }: AdminPageTitleAddProps) {
  return (
    <div className="admin-page-header admin-page-header--title-add">
      <h1 className="admin-page-title">{title}</h1>
      <Link
        href={href}
        className="admin-btn admin-btn-primary admin-page-add-button"
        aria-label={label}
        title={label}
      >
        <IconPlus size={20} />
      </Link>
    </div>
  );
}
