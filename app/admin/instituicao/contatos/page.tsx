import Link from "next/link";
import { Suspense } from "react";
import { getContatos } from "../actions";
import ContatosDeleteButton from "@/components/admin/instituicao/contatos-delete-button";

export const metadata = { title: "Contatos - Instituição - Admin GEEF" };

const contactFields = [
  ["telefone", "Telefone"], ["email", "E-mail"], ["instagram", "Instagram"],
  ["facebook", "Facebook"], ["youtube", "YouTube"], ["site", "Site"],
] as const;

async function ContatosContent() {
  const contatos = await getContatos();
  const groupedContatos = Array.from(
    contatos.reduce((groups: Map<string, any[]>, contato: any) => {
      const key = contato.tipo || "Contato";
      groups.set(key, [...(groups.get(key) || []), contato]);
      return groups;
    }, new Map<string, any[]>()),
    ([tipo, registros]) => ({ tipo, registros }),
  );

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <h1 className="area-hero-title">Contatos</h1>
          <Link href="/admin/instituicao/contatos/editar" className="profile-form-btn profile-form-btn-primary instituicao-contatos-add" aria-label="Adicionar contato" title="Adicionar contato">+</Link>
        </div>
      </section>

      <section className="area-section">
        <div className="table-surface">
          {contatos.length === 0 ? <div className="area-empty">Nenhum contato registrado.</div> : (
            <div className="instituicao-contatos-list">
              {groupedContatos.map(({ tipo, registros }) => (
                <div key={tipo} className={`area-panel-item instituicao-contato-card${tipo === "WhatsApp" ? " instituicao-contato-card--untitled" : ""}`}>
                  {tipo !== "WhatsApp" && <strong>{tipo}</strong>}
                  <div className="instituicao-contato-table instituicao-contato-table--group-head" role="row">
                    <span role="columnheader">Canal</span>
                    <span role="columnheader">Informação</span>
                  </div>
                  <div className="instituicao-contato-records">
                    {registros.map((contato) => (
                      <div key={contato.id} className="instituicao-contato-record">
                        <div className="instituicao-contato-table" role="table" aria-label={`Dados de ${tipo}`}>
                          {contactFields.map(([field, label]) => contato[field] && (
                            <div key={field} className="instituicao-contato-table-row" role="row">
                              <span role="cell">{label}</span>
                              <span role="cell">{contato[field]}</span>
                            </div>
                          ))}
                          {contato.pessoas?.nome && (
                            <div className="instituicao-contato-table-row" role="row">
                              <span role="cell">Responsável</span>
                              <span role="cell">{contato.pessoas.nome}</span>
                            </div>
                          )}
                        </div>
                        <ContatosDeleteButton contatoId={contato.id} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ContatosPage() {
  return <Suspense fallback={<div className="area-loading">Carregando...</div>}><ContatosContent /></Suspense>;
}
