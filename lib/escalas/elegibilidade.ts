export interface ElegibilidadeEscala {
  status: string | null | undefined;
  temVinculoTarefeiro: boolean;
  temCapacidade: boolean;
  disponibilidadeInformada?: boolean | null;
}

/** Regra de domínio compartilhada por funções e aplicadores de passe. */
export function podeSerEscalado({
  status,
  temVinculoTarefeiro,
  temCapacidade,
  disponibilidadeInformada,
}: ElegibilidadeEscala) {
  return status === 'ativo'
    && temVinculoTarefeiro
    && temCapacidade
    && disponibilidadeInformada !== false;
}

export function diaDaSemana(data: string) {
  return new Date(`${data}T00:00:00`).getDay();
}
