import Link from 'next/link';
import { getTemasDourinarios } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Temas Doutrinários - Admin GEEF',
};

async function TemasList() {
  const temas = await getTemasDourinarios();

  return (
    <div>
      <AdminPageTitleAdd title="Temas Doutrinários" href="/admin/funcoes/temas/novo" />

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
        <Link href="/admin/funcoes" style={{ paddingBottom: '0.5rem', color: 'var(--muted)', textDecoration: 'none' }}>
          ⚙️ Funções
        </Link>
        <Link href="/admin/funcoes/temas" style={{ paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          📚 Temas Doutrinários
        </Link>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {temas.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p>Nenhum tema doutrinário cadastrado.</p>
            <Link href="/admin/funcoes/temas/novo" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
              ➕ Criar primeiro tema
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {temas.map((tema: any) => (
                <tr key={tema.id}>
                  <td style={{ fontWeight: 500 }}>{tema.titulo}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.35rem 0.7rem',
                      backgroundColor:
                        tema.categoria === 'palestra' ? 'rgba(59, 130, 246, 0.1)' :
                        tema.categoria === 'evangelizacao' ? 'rgba(168, 85, 247, 0.1)' :
                        tema.categoria === 'estudo' ? 'rgba(34, 197, 94, 0.1)' :
                        'rgba(107, 114, 128, 0.1)',
                      color:
                        tema.categoria === 'palestra' ? 'var(--primary)' :
                        tema.categoria === 'evangelizacao' ? '#a855f7' :
                        tema.categoria === 'estudo' ? '#22c55e' :
                        '#6b7280',
                      borderRadius: '0.4rem',
                      fontSize: '0.85rem',
                    }}>
                      {tema.categoria}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/funcoes/temas/${tema.id}`} className="admin-btn admin-btn-small">
                      ✏️ Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function TemasPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <TemasList />
    </Suspense>
  );
}
