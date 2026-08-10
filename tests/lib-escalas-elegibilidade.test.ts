import { describe, expect, it } from 'vitest';
import { diaDaSemana, podeSerEscalado } from '@/lib/escalas/elegibilidade';

describe('elegibilidade de escala', () => {
  it('exige pessoa ativa, vínculo, capacidade e disponibilidade não negativa', () => {
    expect(podeSerEscalado({ status: 'ativo', temVinculoTarefeiro: true, temCapacidade: true })).toBe(true);
    expect(podeSerEscalado({ status: 'ativo', temVinculoTarefeiro: true, temCapacidade: true, disponibilidadeInformada: false })).toBe(false);
    expect(podeSerEscalado({ status: 'afastado', temVinculoTarefeiro: true, temCapacidade: true })).toBe(false);
  });

  it('mantém domingo como 0', () => {
    expect(diaDaSemana('2026-08-09')).toBe(0);
  });
});
