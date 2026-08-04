import Link from 'next/link';
import { getTermosAssinados } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Termos Assinados - Admin GEEF',
};

type TermoItem = {
  id: string;
  status?: string | null;
  validade?: string | null;
  data_assinatura?: string | null;
  pessoas?: { nome?: string | null } | null;
  documentos_modelo?: { tipo?: string | null } | null;
};

type TermosSearchParams = {
  page?: string;
};

async function TermosList({ searchParams }: { searchParams: TermosSearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);

  const { termos, total, pageSize } = await getTermosAssinados(page);
  const termoList = termos as TermoItem[];
  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { href: '/admin/documentos', label: '📄 Modelos' },
    { href: '/admin/documentos/pedidos', label: '📮 Pedidos do Titular' },
    { href: '/admin/documentos/termos', label: '✍️ Termos Assinados', active: true },
    { href: '/admin/documentos/consentimentos', label: '🔒 Consentimentos LGPD' },
    { href: '/admin/documentos/voluntariado', label: '🤝 Serviços Voluntários' },
    { href: '/admin/documentos/auditoria', label: '🧭 Auditoria LGPD' },
  ];

  return (
    <div>
      {/* Header */}
      <AdminPageTitleAdd title="Termos Assinados" href="/admin/documentos/termos/novo" label="Adicionar termo" />

      <div className="admin-card panel-accent-card">
        <p className="panel-note">
          Use o modelo correto, guarde só o essencial e confirme a validade antes de assinar.
        </p>
      </div>

      <div className="module-grid grid-auto-220 mb-2">
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
        {termoList.length === 0 ? (
          <div className="area-empty">
            <p>Nenhum termo assinado registrado.</p>
            <Link href="/admin/documentos/termos/novo" className="admin-btn admin-btn-primary mt-1">
              ➕ Registrar primeiro termo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Documento</th>
                  <th>Data Assinatura</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {termoList.map((termo) => {
                  const hoje = new Date().toISOString().split('T')[0];
                  const vencido = termo.validade && termo.validade < hoje;

                  return (
                    <tr key={termo.id}>
                      <td><strong>{termo.pessoas?.nome || '—'}</strong></td>
                      <td><span className="tag">{termo.documentos_modelo?.tipo || '—'}</span></td>
                      <td className="text-sm-muted">
                        {termo.data_assinatura ? new Date(termo.data_assinatura + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className={vencido ? 'text-danger' : 'text-sm-muted'}>
                        {termo.validade ? new Date(termo.validade + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        {vencido && ' (vencido)'}
                      </td>
                      <td>
                        <span className={termo.status === 'ativo' ? 'inline-status inline-status-success' : termo.status === 'revogado' ? 'inline-status inline-status-danger' : 'inline-status inline-status-neutral'}>
                          {termo.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/documentos/termos/${termo.id}`} className="admin-btn admin-btn-small">
                          ✏️ Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="page-pagination">
          {page > 1 && (
            <Link href={`/admin/documentos/termos?page=${page - 1}`} className="admin-btn admin-btn-secondary">
              ← Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/documentos/termos?page=${page + 1}`} className="admin-btn admin-btn-secondary">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function TermosPage({ searchParams }: { searchParams: Promise<TermosSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <TermosList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

