import { formatarDataLonga, getNomeMes, getProximaQuinta } from "@/lib/escalas/datas";
import type { AdminDashboardSummary } from "@/lib/admin/dashboard";

export type AdminDashboardViewModel = {
  summaryCards: Array<{ label: string; value: number }>;
  monthLabel: string;
  nextMeetingLabel: string;
  scale: { title: string; description: string };
};

export function createAdminDashboardViewModel(summary: AdminDashboardSummary): AdminDashboardViewModel {
  const escalaStatus = summary.escalaMesAtual?.status;
  const scale = escalaStatus === "publicada"
    ? { title: "Publicada", description: "A escala atual já está visível." }
    : escalaStatus === "revisada"
      ? { title: "Em revisão", description: "A escala atual ainda precisa de atenção." }
      : escalaStatus
        ? { title: "Rascunho", description: "A escala atual ainda precisa de atenção." }
        : { title: "Sem escala", description: "Nenhuma escala criada para este mês." };

  return {
    summaryCards: [
      { label: "Tarefeiros ativos", value: summary.totalPessoas },
      { label: "Funções", value: summary.totalFuncoes },
      { label: "Temas doutrinários", value: summary.totalTemas },
      { label: "Escalas publicadas", value: summary.totalEscalasPublicadas },
    ],
    monthLabel: `${getNomeMes(summary.mesAtual)} / ${summary.anoAtual}`,
    nextMeetingLabel: formatarDataLonga(getProximaQuinta()),
    scale,
  };
}
