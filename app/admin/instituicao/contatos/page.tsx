import Link from "next/link";
import { Suspense } from "react";
import { getContatos } from "../actions";
import ContatosDeleteButton from "@/components/admin/instituicao/contatos-delete-button";

export const metadata = { title: "Contatos - Instituição - Admin GEEF" };

const contactFields = [
  ["telefone", "☎"], ["whatsapp", "◉"], ["email", "@"], ["instagram", "◎"],
  ["facebook", "f"], ["youtube", "▶"], ["site", "↗"],
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
                <div key={tipo} className={`area-panel-item instituicao-contato-card${tipo === "WhatsApp" && !registros.some((contato) => contato.telefone || contato.whatsapp) ? " instituicao-contato-card--untitled" : ""}`}>
                  {!(tipo === "WhatsApp" && !registros.some((contato) => contato.telefone || contato.whatsapp)) && <strong>{tipo}</strong>}
                  <div className="instituicao-contato-records">
                    {registros.map((contato) => (
                      <div key={contato.id} className="instituicao-contato-record">
                        <div className="instituicao-contato-fields">
                          {contactFields.map(([field, icon]) => contato[field] && (
                            <span key={field} className="instituicao-contato-field">
                              <span className="instituicao-contato-field-icon" aria-hidden="true">{icon}</span>
                              <span>{contato[field]}</span>
                            </span>
                          ))}
                          {contato.pessoas?.nome && <span className="instituicao-contato-field">{contato.pessoas.nome}</span>}
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
