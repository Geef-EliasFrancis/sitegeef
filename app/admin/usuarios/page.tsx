import Link from 'next/link';
import { Suspense } from 'react';
import { getUsuarios } from './actions';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Usuários - Admin GEEF',
};

type UsuarioItem = {
  id: string;
  nome?: string | null;
  email?: string | null;
  perfil?: string | null;
  pessoas?: { email?: string | null } | null;
  pode_escalas?: boolean | null;
  pode_biblioteca?: boolean | null;
  pode_livraria?: boolean | null;
  pode_financeiro?: boolean | null;
  pode_pessoas?: boolean | null;
  pode_publicar?: boolean | null;
  pode_mediunidade?: boolean | null;
  pode_atendimento?: boolean | null;
  pode_apse?: boolean | null;
};

type UsuariosSearchParams = {
  page?: string;
};

function resolvePerfilChipClass(perfil?: string | null) {
  switch (perfil) {
    case 'administrador':
    case 'diretoria':
    case 'patrimonio':
      return 'perfil-chip perfil-chip--accent';
    case 'financeiro':
    case 'livraria':
      return 'perfil-chip perfil-chip--warning';
    case 'secretaria':
    case 'comunicacao':
    case 'pessoas':
      return 'perfil-chip perfil-chip--info';
    case 'bibliotecario':
    case 'leitor':
      return 'perfil-chip perfil-chip--success';
    case 'evangelizador':
    case 'coord_juventude':
    case 'coord_estudos':
    case 'coord_atendimento':
    case 'coord_passe':
    case 'coord_apse':
      return 'perfil-chip perfil-chip--leaf';
    default:
      return 'perfil-chip perfil-chip--neutral';
  }
}

async function UsuariosList({ searchParams }: { searchParams: UsuariosSearchParams }) {
  const page = Number.parseInt(searchParams.page || '1', 10);
  const { usuarios, total, pageSize, erro } = await getUsuarios(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const usuarioList = usuarios as UsuarioItem[];

  const isPermissionLabel = (value: string | boolean | null | undefined): value is string => Boolean(value);

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Usuários e Permissões" href="/admin/usuarios/novo" />

      <div className="admin-card table-surface">
        {erro ? <div className="area-empty">{erro}</div> : null}
        {usuarioList.length === 0 ? (
          <div className="text-center-muted page-empty-state">
            <p>Nenhum usuário cadastrado.</p>
            <Link href="/admin/usuarios/novo" className="admin-btn admin-btn-primary mt-1">
              ➕ Criar primeiro usuário
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Permissões</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {usuarioList.map((usuario) => {
                const perms = [
                  usuario.pode_escalas && 'Escalas',
                  usuario.pode_biblioteca && 'Biblioteca',
                  usuario.pode_livraria && 'Livraria',
                  usuario.pode_financeiro && 'Financeiro',
                  usuario.pode_pessoas && 'Pessoas',
                  usuario.pode_publicar && 'Publicar',
                  usuario.pode_mediunidade && 'Mediunidade',
                  usuario.pode_atendimento && 'Atendimento',
                  usuario.pode_apse && 'APSE',
                ].filter(isPermissionLabel);

                return (
                  <tr key={usuario.id}>
                    <td>
                      <strong>{usuario.nome || usuario.email || 'N/A'}</strong>
                    </td>
                    <td className="text-sm-muted">{usuario.email || usuario.pessoas?.email || '—'}</td>
                    <td>
                      <span className={`${resolvePerfilChipClass(usuario.perfil)} status-pill`}>
                        {usuario.perfil}
                      </span>
                    </td>
                    <td className="text-xs-muted">
                      {perms.length > 0 ? (
                        <div className="tag-list">
                          {perms.slice(0, 3).map((p) => (
                            <span key={p} className="tag">
                              {p}
                            </span>
                          ))}
                          {perms.length > 3 && <span className="text-xs-muted">+{perms.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-sm-muted">—</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/usuarios/${usuario.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="page-pagination">
          {page > 1 && (
            <Link href={`/admin/usuarios?page=${page - 1}`} className="admin-btn admin-btn-secondary">
              ← Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/usuarios?page=${page + 1}`} className="admin-btn admin-btn-secondary">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<UsuariosSearchParams> }) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <UsuariosList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
