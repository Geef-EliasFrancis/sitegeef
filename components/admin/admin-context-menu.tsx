import Link from "next/link";

type ContextItem = { label: string; href: string };

export function AdminContextMenu({ items, pathname, searchParams, nested = false, label }: { items: readonly ContextItem[]; pathname: string; searchParams: { get(name: string): string | null }; nested?: boolean; label: string }) {
  return <nav className={`admin-context-menu${nested ? " admin-context-menu--nested" : ""}`} aria-label={label}>
    {items.map((item) => {
      const itemPath = item.href.split("?")[0];
      const isPathActive = item.label === "Início" ? pathname === itemPath : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
      const isCategoriaItem = item.label === "Prece" || item.label === "Palestra";
      const isActive = isCategoriaItem
        ? isPathActive && (item.label === "Prece" ? searchParams.get("categoria") === "prece" : !searchParams.get("categoria"))
        : isPathActive;
      return <Link key={item.label} href={item.href} className={`admin-context-menu-item ${isActive ? "active" : ""}`} aria-current={isActive ? "page" : undefined}>{item.label}</Link>;
    })}
  </nav>;
}
