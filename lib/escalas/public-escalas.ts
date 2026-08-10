import { unstable_cache } from "next/cache";
import { listPublishedEscalasFromCurrentYear } from "@/lib/escalas/public-escalas-repository";

export type PublicEscalaRecord = {
  id: string | number;
  ano: number;
  mes: number;
  status?: string;
  reunioes?: Array<{
    id: string | number;
    data: string;
    escala_funcoes?: Array<{
      id?: string | number;
      funcao_id?: string | number | null;
      pessoa_id?: string | number | null;
      substituto_id?: string | number | null;
      funcoes?: { nome?: string | null } | null;
      pessoas?: { nome?: string | null } | null;
      substitutos?: { nome?: string | null } | null;
    }>;
    escala_passe?: Array<{
      id?: string | number;
      pessoa_id?: string | number | null;
      posicao?: number | null;
      pessoas?: { nome?: string | null } | null;
    }>;
    escala_evangelizacao?: Array<{
      id?: string | number;
      pessoa_id?: string | number | null;
      tema_id?: string | number | null;
      tema_livre?: string | null;
      turma?: string | null;
      pessoas?: { nome?: string | null } | null;
      temas_doutrinarios?: { titulo?: string | null } | null;
    }>;
    escala_palestras?: Array<{
      id?: string | number;
      expositor_id?: string | number | null;
      palestrante_id?: string | number | null;
      tema_id?: string | number | null;
      tema_livre?: string | null;
      cidade_origem?: string | null;
      tipo_palestra?: string | null;
      expositores?: { nome?: string | null } | null;
      palestrantes?: { nome?: string | null; cidade?: string | null; instituicao?: string | null } | null;
      temas_doutrinarios?: { titulo?: string | null } | null;
    }>;
  }>;
};

type PublicEscalasResult = {
  escalas: PublicEscalaRecord[];
  currentYear: number;
  currentMonth: number;
};

async function loadPublicEscalas(): Promise<PublicEscalasResult> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { data, error } = await listPublishedEscalasFromCurrentYear(currentYear);

  const escalas = error
    ? []
    : (data ?? []).filter(
    (escala) => escala.ano > currentYear || (escala.ano === currentYear && escala.mes >= currentMonth)
  ) as PublicEscalaRecord[];

  return { escalas, currentYear, currentMonth };
}

export const getPublicEscalas = unstable_cache(loadPublicEscalas, ["public-escalas"], {
  revalidate: 300,
  tags: ["public-escalas"],
});
