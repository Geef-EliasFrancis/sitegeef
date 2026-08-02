import { unstable_cache } from "next/cache";
import { loadAdminDashboardSummary } from "@/lib/admin/dashboard-repository";

export type AdminDashboardSummary = {
  totalPessoas: number;
  totalFuncoes: number;
  totalTemas: number;
  totalEscalasPublicadas: number;
  escalaMesAtual: { id: string; status: string } | null;
  mesAtual: number;
  anoAtual: number;
};

export const getCachedAdminDashboardSummary = unstable_cache(
  loadAdminDashboardSummary,
  ["admin-dashboard"],
  {
    revalidate: 60,
    tags: ["admin-dashboard"],
  }
);
