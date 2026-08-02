import Link from "next/link";

type ShellArea = { key: string; label: string; note: string };

export function AdminShellTabs({ items, activeKey, routes }: { items: readonly ShellArea[]; activeKey: string; routes: Record<string, string> }) {
  return <nav className="admin-shell-tabs" aria-label="Seções do painel">
    {items.map((item) => <Link key={item.key} href={routes[item.key]} className={`admin-shell-tab ${activeKey === item.key ? "active" : ""}`} aria-current={activeKey === item.key ? "page" : undefined} aria-label={`${item.label}: ${item.note}`} title={`${item.label}: ${item.note}`}><span className="admin-shell-tab-label">{item.label}</span></Link>)}
  </nav>;
}
