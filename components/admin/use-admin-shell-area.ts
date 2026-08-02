"use client";

import { usePathname } from "next/navigation";
import {
  ADMIN_SHELL_AREAS,
  ADMIN_SHELL_ROUTES,
  ADMIN_SHELL_TOP_AREAS,
  getAdminShellAreaFromPath,
} from "@/lib/admin-shell-navigation";

export type { AdminShellArea, AdminShellAreaItem } from "@/lib/admin-shell-navigation";
export { ADMIN_SHELL_AREAS, ADMIN_SHELL_ROUTES, ADMIN_SHELL_TOP_AREAS, getAdminShellAreaFromPath } from "@/lib/admin-shell-navigation";

export function useAdminShellArea() {
  const area = getAdminShellAreaFromPath(usePathname());
  return { area, areas: ADMIN_SHELL_AREAS, topAreas: ADMIN_SHELL_TOP_AREAS, routes: ADMIN_SHELL_ROUTES };
}
