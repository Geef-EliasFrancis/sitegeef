import Link from 'next/link';
import { getPalestrantes } from './actions';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = { title: 'Palestrantes - Admin GEEF' };

export default async function PalestrantesPage() {
  const palestrantes = await getPalestrantes();
  return (
    <div>
      <AdminPageTitleAdd title="Palestrantes" href="/admin/palestrantes/novo" />
      <p className="admin-page-subtitle" style={{ marginBottom: '1rem' }}>
        Cadastre expositores externos ou vincule uma pessoa já cadastrada.
      </p>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {palestrantes.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p>Nenhum palestrante cadastrado.</p>
            <Link href="/admin/palestrantes/novo" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
              Criar primeiro palestrante
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Nome</th><th>Origem</th><th>Contato</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
              {palestrantes.map((palestrante: any) => (
                <tr key={palestrante.id}>
                  <td style={{ fontWeight: 500 }}>{palestrante.nome}</td>
                  <td>{palestrante.pessoas?.nome ? `Pessoa: ${palestrante.pessoas.nome}` : palestrante.cidade || 'Externo'}</td>
                  <td>{palestrante.contato || '—'}</td>
                  <td>{palestrante.ativo ? 'Ativo' : 'Inativo'}</td>
                  <td><Link href={`/admin/palestrantes/${palestrante.id}`} className="admin-btn admin-btn-small">Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
