import Link from "next/link";
import { isAdminContextItemActive, type AdminContextItem } from "@/lib/admin-context-navigation";

export function AdminContextMenu({ items, pathname, searchParams, nested = false, label }: { items: readonly AdminContextItem[]; pathname: string; searchParams: { get(name: string): string | null }; nested?: boolean; label: string }) {
  return <nav className={`admin-context-menu${nested ? " admin-context-menu--nested" : ""}`} aria-label={label}>
    {items.map((item) => {
      const isActive = isAdminContextItemActive(item, pathname, searchParams);
      return <Link key={item.label} href={item.href} className={`admin-context-menu-item ${isActive ? "active" : ""}`} aria-current={isActive ? "page" : undefined}>{item.label}</Link>;
    })}
  </nav>;
}
