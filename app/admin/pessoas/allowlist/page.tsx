import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createPessoaAllowlist, getPessoasAllowlist, togglePessoaAllowlistStatus } from '../actions';

export const metadata = { title: 'Allowlist de pessoas - Admin GEEF' };

async function createAllowlistEntry(formData: FormData) {
  'use server';
  const nome = String(formData.get('nome') ?? '').trim();
  if (nome) {
    await createPessoaAllowlist({
      nome,
      email: String(formData.get('email') ?? ''),
      cpf: String(formData.get('cpf') ?? ''),
      observacoes: String(formData.get('observacoes') ?? ''),
    });
  }
  redirect('/admin/pessoas/allowlist');
}

async function toggleEntry(id: string, ativo: boolean) {
  'use server';
  await togglePessoaAllowlistStatus(id, ativo);
}

export default async function PessoasAllowlistPage() {
  const entries = await getPessoasAllowlist(false);
  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div><span className="admin-dashboard-kicker">Controle de acesso</span><h1 className="admin-page-title">Allowlist</h1></div>
        <Link href="/admin/pessoas" className="admin-btn admin-btn-secondary">Pessoas</Link>
      </div>
      <section className="area-section"><div className="admin-card">
        <form action={createAllowlistEntry} className="module-grid">
          <label className="profile-form-field"><span>Nome autorizado *</span><input name="nome" required className="profile-form-input" /></label>
          <label className="profile-form-field"><span>Email</span><input name="email" type="email" className="profile-form-input" /></label>
          <label className="profile-form-field"><span>CPF</span><input name="cpf" className="profile-form-input" /></label>
          <label className="profile-form-field"><span>Observações</span><input name="observacoes" className="profile-form-input" /></label>
          <div><button type="submit" className="admin-btn admin-btn-primary">Adicionar autorização</button></div>
        </form>
      </div></section>
      <section className="area-section"><div className="admin-card table-surface">
        <table className="admin-table"><thead><tr><th>Nome</th><th>Email</th><th>CPF</th><th>Status</th><th>Ação</th></tr></thead><tbody>
          {entries.map((item) => <tr key={item.id}><td><strong>{item.nome}</strong></td><td>{item.email || '—'}</td><td>{item.cpf || '—'}</td><td>{item.ativo ? 'Ativa' : 'Inativa'}</td><td><form action={() => toggleEntry(item.id, !item.ativo)}><button type="submit" className="admin-btn admin-btn-small">{item.ativo ? 'Desativar' : 'Ativar'}</button></form></td></tr>)}
        </tbody></table>
      </div></section>
    </div>
  );
}
