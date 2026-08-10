import { describe, expect, it } from 'vitest';
import { detectarCompromissosConflitantes } from '@/lib/escalas/conflitos';

describe('detectarCompromissosConflitantes', () => {
  it('agrupa somente compromissos da mesma pessoa na mesma data', () => {
    expect(detectarCompromissosConflitantes([
      { data: '2026-08-10', pessoaId: 'p1', nome: 'Ana', compromisso: 'Função: Dirigente', escalaId: 'e1' },
      { data: '2026-08-10', pessoaId: 'p1', nome: 'Ana', compromisso: 'Aplicador de passe', escalaId: 'e1' },
      { data: '2026-08-11', pessoaId: 'p1', nome: 'Ana', compromisso: 'Palestra', escalaId: 'e2' },
      { data: '2026-08-10', pessoaId: 'p2', nome: 'Bruno', compromisso: 'Apoio', escalaId: 'e1' },
    ])).toEqual([
      {
        data: '2026-08-10',
        pessoaId: 'p1',
        nome: 'Ana',
        compromissos: ['Função: Dirigente', 'Aplicador de passe'],
      },
    ]);
  });
});
