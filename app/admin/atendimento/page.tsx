import Link from 'next/link';
import { getRecepcoes, getAtendimentosFraterno, getEvangelhasNoLar, getIrradiacoes } from './actions';
import { Suspense } from 'react';
import { checkPermission } from '@/lib/auth/permissions';

export const metadata = {
  title: 'Atendimento - Admin GEEF',
};

type AtendimentoFraternoListItem = {
  id: string;
  data: string;
  tipo?: string | null;
  sigilo?: boolean | null;
  pessoas?: { nome?: string | null } | null;
  atendente?: { nome?: string | null } | null;
};

type RecepcaoListItem = {
  pessoas_atendidas: number;
};

async function AtendimentoContent() {
  const allowed = await checkPermission('pode_atendimento');

  if (!allowed) {
    return (
      <div className="admin-page-header atendimento-summary">
        <div>
          <h1 className="admin-page-title">🔒 Módulo Restrito</h1>
          <p className="admin-page-subtitle">Acesso negado ao Atendimento Espiritual</p>
        </div>
      </div>
    );
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const recepcoes = await getRecepcoes(mesAtual, anoAtual);
  const fraternos = await getAtendimentosFraterno(mesAtual, anoAtual);
  const evangelhos = await getEvangelhasNoLar();
  const irradiacoes = await getIrradiacoes(true);
  const recepcaoList = recepcoes as RecepcaoListItem[];
  const fraternoList = fraternos as AtendimentoFraternoListItem[];

  const totalPessoasAtendidas = recepcaoList.reduce((sum, r) => sum + r.pessoas_atendidas, 0);
  const summary = [
    { label: "Recepção", value: recepcaoList.length, note: "Registros no mês" },
    { label: "Pessoas atendidas", value: totalPessoasAtendidas, note: "Total consolidado" },
    { label: "Fraterno", value: fraternoList.length, note: "Histórico recente" },
    { label: "Irradiações", value: irradiacoes.length, note: "Ativas" },
    { label: "Evangelho no Lar", value: evangelhos.length, note: "Sessões registradas" },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Atendimento</span>
          <h1 className="admin-page-title">Atendimento Espiritual</h1>
          <p className="admin-page-subtitle">
            {new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <section className="area-section">
        <div className="stat-grid">
          {summary.map((item) => (
            <div key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="area-section">
        <div className="admin-card">
          <div className="atendimento-section-header">
            <h2>Últimos atendimentos</h2>
            <Link href="/admin/atendimento/fraterno" className="admin-btn admin-btn-small">
              Ver Todos →
            </Link>
          </div>

          {fraternoList.length > 0 ? (
            <div className="atendimento-list">
              {fraternoList.slice(0, 5).map((atend) => (
                <div
                  key={atend.id}
                  className={`area-panel-item atendimento-list-item ${atend.sigilo ? 'atendimento-list-item--sigilo' : ''}`}
                >
                  <div className="atendimento-list-item-content">
                    <div>
                      <strong>{atend.pessoas?.nome}</strong>
                      <p>
                        {new Date(atend.data).toLocaleDateString('pt-BR')} • {atend.tipo}
                        <br />
                        Atendente: {atend.atendente?.nome}
                      </p>
                    </div>
                    <span className={atend.sigilo ? 'inline-status inline-status-danger' : 'inline-status inline-status-success'}>
                      {atend.sigilo ? 'Sigiloso' : 'Registro'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="area-empty">Nenhum atendimento neste mês.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AtendimentoPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <AtendimentoContent />
    </Suspense>
  );
}
