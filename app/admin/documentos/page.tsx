import Link from "next/link";
import { getModelosDocumentos } from "./actions";
import { Suspense } from "react";
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: "Documentos e LGPD - Admin GEEF",
};

type ModeloDocumentoItem = {
  id: string;
  tipo: string;
  titulo: string;
  versao?: string | null;
  conteudo?: string | null;
};

async function ModelosList() {
  const modelos = await getModelosDocumentos();
  const modeloList = modelos as ModeloDocumentoItem[];

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Documentos e LGPD" href="/admin/documentos/novo" label="Adicionar modelo de documento" />

      <section className="area-section">
        <div className="area-panel-item">
          <strong>Nota rápida</strong>
          <p className="mt-035">
            Antes de registrar ou revogar consentimento, confirme finalidade, base legal e necessidade real do dado.
          </p>
        </div>
      </section>

      <section className="area-section">
        <div className="table-surface">
          {modeloList.length === 0 ? (
            <div className="area-empty">
              <p>Nenhum modelo de documento cadastrado.</p>
              <Link href="/admin/documentos/novo" className="profile-form-btn profile-form-btn-primary mt-1">Criar primeiro modelo</Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Versão</th>
                  <th>Conteúdo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {modeloList.map((modelo) => (
                  <tr key={modelo.id}>
                    <td><span className="tag">{modelo.tipo}</span></td>
                    <td><strong>{modelo.titulo}</strong></td>
                    <td className="text-sm-muted">{modelo.versao || "—"}</td>
                    <td className="text-sm-muted">{modelo.conteudo ? "Sim" : "—"}</td>
                    <td>
                      <Link href={`/admin/documentos/${modelo.id}`} className="profile-form-btn profile-form-btn-secondary">Editar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ModelosList />
    </Suspense>
  );
}
