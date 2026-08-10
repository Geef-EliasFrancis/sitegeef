import type { ConflitoCompromisso } from '@/lib/escalas/conflitos';

type Relation<T> = T | T[] | null;
type HistoryPerson = Relation<{ nome?: string | null }>;

type FuncaoHistory = {
  id: string;
  criado_em: string;
  motivo?: string | null;
  pessoa_anterior?: HistoryPerson;
  pessoa_nova?: HistoryPerson;
  substituto_anterior?: HistoryPerson;
  substituto_novo?: HistoryPerson;
  escala_funcao?: Relation<{ funcoes?: Relation<{ nome?: string | null }> }>;
};

type PasseHistory = {
  id: string;
  criado_em: string;
  motivo?: string | null;
  pessoa_anterior?: HistoryPerson;
  pessoa_nova?: HistoryPerson;
  posicao_anterior?: number | null;
  posicao_nova?: number | null;
};

function pessoaNome(pessoa: HistoryPerson | undefined) {
  const item = Array.isArray(pessoa) ? pessoa[0] : pessoa;
  return item?.nome || '—';
}

function funcaoNome(item: FuncaoHistory) {
  const escalaFuncao = Array.isArray(item.escala_funcao) ? item.escala_funcao[0] : item.escala_funcao;
  const funcoes = escalaFuncao?.funcoes;
  const funcao = Array.isArray(funcoes) ? funcoes[0] : funcoes;
  return funcao?.nome || 'Função';
}

export function EscalaAuditPanels({
  conflitos,
  historico,
  historicoPasse,
}: {
  conflitos: ConflitoCompromisso[];
  historico: FuncaoHistory[];
  historicoPasse: PasseHistory[];
}) {
  return (
    <>
      {conflitos.length > 0 && (
        <section className="area-section">
          <div className="area-panel-item" style={{ borderColor: 'rgba(234, 179, 8, 0.45)' }}>
            <div className="area-section-title">
              <h2>Alertas de conflito</h2>
              <p>A mesma pessoa aparece em mais de um compromisso na mesma data.</p>
            </div>
            <div className="area-panel-grid">
              {conflitos.map((conflito) => (
                <div key={`${conflito.data}-${conflito.pessoaId}`} className="area-panel-item">
                  <strong>{conflito.nome}</strong>
                  <span>{new Date(`${conflito.data}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                  <small>{conflito.compromissos.join(' · ')}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {historico.length > 0 && (
        <section className="area-section">
          <div className="area-panel-item">
            <div className="area-section-title">
              <h2>Histórico de substituições</h2>
              <p>Alterações manuais preservadas para revisão da coordenação.</p>
            </div>
            <div className="area-panel-grid">
              {historico.map((item) => (
                <div key={item.id} className="area-panel-item">
                  <strong>{funcaoNome(item)}</strong>
                  <span>{new Date(item.criado_em).toLocaleString('pt-BR')}</span>
                  <small>{pessoaNome(item.pessoa_anterior)} → {pessoaNome(item.pessoa_nova)}; substituto: {pessoaNome(item.substituto_anterior)} → {pessoaNome(item.substituto_novo)}</small>
                  {item.motivo ? <small>Motivo: {item.motivo}</small> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {historicoPasse.length > 0 && (
        <section className="area-section">
          <div className="area-panel-item">
            <div className="area-section-title">
              <h2>Histórico dos aplicadores de passe</h2>
              <p>Alterações manuais de pessoa ou posição preservadas para revisão.</p>
            </div>
            <div className="area-panel-grid">
              {historicoPasse.map((item) => (
                <div key={item.id} className="area-panel-item">
                  <strong>Aplicador de passe</strong>
                  <span>{new Date(item.criado_em).toLocaleString('pt-BR')}</span>
                  <small>{pessoaNome(item.pessoa_anterior)} → {pessoaNome(item.pessoa_nova)}; posição: {item.posicao_anterior || '—'} → {item.posicao_nova || '—'}</small>
                  {item.motivo ? <small>Motivo: {item.motivo}</small> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
