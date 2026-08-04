import Link from 'next/link';
import { getConsentimentosLGPD } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Consentimentos LGPD - Admin GEEF',
};

type ConsentimentoItem = {
  id: string;
  finalidade: string;
  base_legal?: string | null;
  data_consentimento: string;
  status?: string | null;
  pessoas?: { nome?: string | null } | null;
};

type ConsentimentosSearchParams = {
  page?: string;
};

async function ConsentimentosList({ searchParams }: { searchParams: ConsentimentosSearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);

  const { consentimentos, total, pageSize } = await getConsentimentosLGPD(page);
  const consentimentoList = consentimentos as ConsentimentoItem[];
  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { href: '/admin/documentos', label: '📄 Modelos' },
    { href: '/admin/documentos/pedidos', label: '📮 Pedidos do Titular' },
    { href: '/admin/documentos/termos', label: '✍️ Termos Assinados' },
    { href: '/admin/documentos/consentimentos', label: '🔒 Consentimentos LGPD', active: true },
    { href: '/admin/documentos/voluntariado', label: '🤝 Serviços Voluntários' },
    { href: '/admin/documentos/auditoria', label: '🧭 Auditoria LGPD' },
  ];

  return (
    <div>
      <AdminPageTitleAdd title="Consentimentos LGPD" href="/admin/documentos/consentimentos/novo" label="Adicionar consentimento" />

      <div className="admin-card panel-accent-card">
        <p className="panel-note">
          Registre só o necessário para justificar o tratamento e facilitar revogação, se houver pedido do titular.
        </p>
      </div>

      <div className="module-grid grid-auto-220">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`module-card${tab.active ? ' module-card-accent' : ''}`}
          >
            <p className="module-title">{tab.label}</p>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        {consentimentoList.length === 0 ? (
          <div className="page-empty-state text-center-muted">
            <p>Nenhum consentimento registrado.</p>
            <Link href="/admin/documentos/consentimentos/novo" className="admin-btn admin-btn-primary mt-1">
              ➕ Registrar primeiro consentimento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Finalidade</th>
                  <th>Base Legal</th>
                  <th>Data Consentimento</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {consentimentoList.map((consentimento) => (
                  <tr key={consentimento.id}>
                    <td><strong>{consentimento.pessoas?.nome || '—'}</strong></td>
                    <td className="text-sm-muted">{consentimento.finalidade}</td>
                    <td className="text-xs-muted">{consentimento.base_legal || '—'}</td>
                    <td className="text-sm-muted">
                      {new Date(consentimento.data_consentimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <span className={consentimento.status === 'ativo' ? 'inline-status inline-status-success' : 'inline-status inline-status-danger'}>
                        {consentimento.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/documentos/consentimentos/${consentimento.id}`} className="admin-btn admin-btn-small">
                        ✏️ Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="page-pagination">
          {page > 1 && (
            <Link href={`/admin/documentos/consentimentos?page=${page - 1}`} className="admin-btn admin-btn-secondary">
              ← Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/documentos/consentimentos?page=${page + 1}`} className="admin-btn admin-btn-secondary">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ConsentimentosPage({ searchParams }: { searchParams: Promise<ConsentimentosSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ConsentimentosList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

