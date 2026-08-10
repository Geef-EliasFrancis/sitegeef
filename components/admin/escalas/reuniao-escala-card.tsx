import Link from 'next/link';

type Reuniao = {
  id: string;
  data: string;
  passe_quantidade?: number | null;
  escala_funcoes?: Array<{ id: string; funcoes?: { nome?: string | null } | null; pessoas?: { nome?: string | null } | null; substitutos?: { nome?: string | null } | null }>;
  escala_passe?: Array<{ id: string; posicao: number; pessoas?: { nome?: string | null } | null }>;
  escala_palestras?: Array<{
    id: string;
    palestrantes?: { nome?: string | null; cidade?: string | null } | null;
    expositores?: { nome?: string | null } | null;
    temas_doutrinarios?: { titulo?: string | null } | null;
    tema_livre?: string | null;
    cidade_origem?: string | null;
    status?: string | null;
  }>;
};

type FormAction = (formData: FormData) => Promise<void>;

export function ReuniaoEscalaCard({
  escalaId,
  status,
  reuniao,
  onPasseQuantity,
  onSortearPasse,
}: {
  escalaId: string;
  status: string;
  reuniao: Reuniao;
  onPasseQuantity: (formData: FormData, escalaId: string, reuniaoId: string) => Promise<void>;
  onSortearPasse: (escalaId: string, reuniaoId: string) => Promise<void>;
}) {
  return (
    <article className="area-panel-item">
      <h2 className="module-title">
        Quinta-feira, {new Date(`${reuniao.data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })}
      </h2>

      <div className="area-section-title"><h3>Funções</h3><p>Distribuição de titulares e substitutos.</p></div>
      {reuniao.escala_funcoes?.length ? (
        <div className="area-panel-grid">
          {reuniao.escala_funcoes.map((funcao) => (
            <div key={funcao.id} className="area-panel-item">
              <div className="tag-list"><span className="tag">{funcao.funcoes?.nome}</span></div>
              <p><strong>Titular:</strong> {funcao.pessoas?.nome}</p>
              <p><strong>Substituto:</strong> {funcao.substitutos?.nome || '—'}</p>
              <Link href={`/admin/escalas/${escalaId}/funcao/${funcao.id}`} className="profile-form-btn profile-form-btn-secondary">Editar</Link>
            </div>
          ))}
        </div>
      ) : <div className="area-empty">Nenhuma função escalada.</div>}
      <Link href={`/admin/escalas/${escalaId}/reuniao/${reuniao.id}/nova-funcao`} className="profile-form-btn profile-form-btn-secondary">Adicionar Função</Link>

      <div className="area-section-title"><h3>Passe</h3><p>Defina a quantidade e sorteie os aplicadores disponíveis.</p></div>
      <div className="area-panel-grid">
        <form action={((formData) => onPasseQuantity(formData, escalaId, reuniao.id)) as FormAction} className="admin-card">
          <label className="profile-form-field"><span>Quantidade de aplicadores</span><input type="number" name="passe_quantidade" min="0" max="50" defaultValue={reuniao.passe_quantidade || 0} className="profile-form-input" /></label>
          <button type="submit" className="profile-form-btn profile-form-btn-secondary">Salvar quantidade</button>
        </form>
        {status !== 'publicada' && (
          <form action={() => onSortearPasse(escalaId, reuniao.id)}><button type="submit" className="profile-form-btn profile-form-btn-primary">Sortear aplicadores</button></form>
        )}
      </div>
      {reuniao.escala_passe?.length ? (
        <div className="area-panel-grid">
          {[...reuniao.escala_passe].sort((a, b) => a.posicao - b.posicao).map((passe) => (
            <div key={passe.id} className="area-panel-item">
              <div className="tag-list"><span className="tag">#{passe.posicao}</span></div>
              <p><strong>Pessoa:</strong> {passe.pessoas?.nome}</p>
              <Link href={`/admin/escalas/${escalaId}/passe/${passe.id}`} className="profile-form-btn profile-form-btn-secondary">Editar</Link>
            </div>
          ))}
        </div>
      ) : <div className="area-empty">Nenhuma pessoa escalada para passe.</div>}
      <Link href={`/admin/escalas/${escalaId}/reuniao/${reuniao.id}/novo-passe`} className="profile-form-btn profile-form-btn-secondary">Adicionar Passe</Link>

      <div className="area-section-title"><h3>Palestra</h3><p>Registre expositor interno ou palestrante externo.</p></div>
      {reuniao.escala_palestras?.length ? (
        <div className="area-panel-grid">
          {reuniao.escala_palestras.map((palestra) => (
            <div key={palestra.id} className="area-panel-item">
              <div className="tag-list"><span className="tag">Palestrante</span></div>
              <p><strong>Expositor:</strong> {palestra.palestrantes?.nome || palestra.expositores?.nome || '—'}</p>
              <p><strong>Tema:</strong> {palestra.temas_doutrinarios?.titulo || palestra.tema_livre || '—'}</p>
              <p><strong>Origem:</strong> {palestra.palestrantes?.cidade || palestra.cidade_origem || '—'}</p>
              <p><strong>Status:</strong> {palestra.status || 'prevista'}</p>
              <Link href={`/admin/escalas/${escalaId}/palestra/${palestra.id}`} className="profile-form-btn profile-form-btn-secondary">Editar</Link>
            </div>
          ))}
        </div>
      ) : <div className="area-empty">Nenhuma palestra registrada.</div>}
      <div className="admin-actions">
        <Link href={`/admin/escalas/${escalaId}/reuniao/${reuniao.id}/nova-palestra`} className="profile-form-btn profile-form-btn-secondary">Registrar palestra</Link>
        <Link href="/admin/palestrantes" className="profile-form-btn profile-form-btn-secondary">Gerenciar palestrantes</Link>
      </div>
    </article>
  );
}
