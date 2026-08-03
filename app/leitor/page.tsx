import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCachedUserArea } from "@/lib/areas/user-area";
import { getRequestLocale } from "@/lib/multilingual/server";
import { createClient } from "@/lib/supabase/server";

type LeitorEmprestimo = {
  id: string;
  prazo_devolucao?: string | null;
  exemplares?: {
    codigo?: string | null;
    obra?: {
      titulo?: string | null;
      autor?: string | null;
    } | null;
  } | null;
};

type LeitorReserva = {
  id: string;
  criado_em?: string | null;
  posicao_fila?: number | null;
  obras?: {
    titulo?: string | null;
    autor?: string | null;
  } | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: locale === "en" ? "My Area | GEEF Library" : "Minha Área - Biblioteca GEEF",
    description:
      locale === "en"
        ? "Track your loans and reservations in the GEEF library."
        : "Acompanhe seus empréstimos e reservas na biblioteca do GEEF.",
  };
}

export default async function LeitorPage() {
  const locale = await getRequestLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const copy =
    locale === "en"
      ? {
          hello: "Hello",
          lead: "Track your loans and reservations in the library.",
          loansActive: "Active Loans",
          overdue: "Overdue",
          reservations: "Pending Reservations",
          userNotFound: "User not found. Please contact administration.",
          overdueBanner: (count: number) =>
            `You have ${count} overdue book${count === 1 ? "" : "s"}. Please contact the library to return them.`,
          loansTitle: "My Loans",
          dueIn: "Due in",
          day: "day",
          days: "days",
          noLoans: "You don't have any borrowed books right now.",
          visitLibrary: "View schedule",
          reservationsTitle: "My Reservations",
          queue: "Queue position",
          waiting: "ago",
          noReservations: "You don't have pending reservations.",
        }
      : {
          hello: "Olá",
          lead: "Acompanhe seus empréstimos e reservas na biblioteca.",
          loansActive: "Empréstimos Ativos",
          overdue: "Em Atraso",
          reservations: "Reservas Aguardando",
          userNotFound: "Usuário não encontrado. Entre em contato com a administração.",
          overdueBanner: (count: number) =>
            `Você tem ${count} livro${count === 1 ? "" : "s"} com prazo de devolução vencido. Entre em contato com a biblioteca para devolvê-los.`,
          loansTitle: "Meus Empréstimos",
          dueIn: "Devolve em",
          day: "dia",
          days: "dias",
          noLoans: "Você não tem livros emprestados no momento.",
          visitLibrary: "Visitar biblioteca",
          reservationsTitle: "Minhas Reservas",
          queue: "Posição na fila",
          waiting: "aguardando",
          noReservations: "Você não tem reservas pendentes.",
        };

  const area = await getCachedUserArea(user.id);
  const pessoa = area.pessoa;
  const emprestimos = (area.emprestimos as LeitorEmprestimo[]) ?? [];
  const reservas = (area.reservas as LeitorReserva[]) ?? [];

  if (!area.usuario) {
    return (
      <div className="area-page">
        <div className="area-empty"> {copy.userNotFound}</div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const emprestimosVencidos = emprestimos.filter((e) => (e.prazo_devolucao ?? "") < today);
  const emprestimosAtivos = emprestimos.filter((e) => (e.prazo_devolucao ?? "") >= today);

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="eyebrow">Biblioteca</p>
            <h1 className="area-hero-title">
              👋 {copy.hello}, {pessoa?.nome}!
            </h1>
            <p className="area-subtitle">{copy.lead}</p>
          </div>
        </div>

        <div className="stat-grid stat-grid-220">
          <div className="stat-card">
            <span>{copy.loansActive}</span>
            <strong>{emprestimosAtivos.length}</strong>
          </div>
          <div className="stat-card">
            <span>{copy.overdue}</span>
            <strong className={emprestimosVencidos.length > 0 ? "text-danger" : "text-success"}>
              {emprestimosVencidos.length}
            </strong>
          </div>
          <div className="stat-card">
            <span>{copy.reservations}</span>
            <strong>{reservas.length}</strong>
          </div>
        </div>
      </section>

      {emprestimosVencidos.length > 0 && (
        <section className="area-section">
          <div className="area-panel-item area-panel-error">
            <strong className="inline-status inline-status-danger">
              {copy.overdueBanner(emprestimosVencidos.length)}
            </strong>
            <div className="area-panel-grid area-panel-grid--mt">
              {emprestimosVencidos.map((e) => (
                <div key={e.id} className="area-panel-item">
                  <strong>{e.exemplares?.obra?.titulo}</strong>
                  <p>
                    {copy.dueIn}: {e.prazo_devolucao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="area-body">
        <div className="area-content">
          <section className="area-section">
            <h2 className="area-section-title">{copy.loansTitle}</h2>
            {emprestimosAtivos.length > 0 ? (
              <div className="area-panel-grid">
                {emprestimosAtivos.map((emp) => {
                  const diasRestantes = Math.ceil(
                    (new Date(`${emp.prazo_devolucao}T00:00:00`).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const dayLabel = diasRestantes === 1 ? copy.day : copy.days;

                  return (
                    <div key={emp.id} className="area-panel-item reader-loan-card">
                      <div>
                        <strong>{emp.exemplares?.obra?.titulo}</strong>
                        <p>{emp.exemplares?.obra?.autor && `${locale === "en" ? "by" : "por"} ${emp.exemplares.obra.autor}`}</p>
                        <p className="text-sm-muted">
                          {locale === "en" ? "Code" : "Código"}: {emp.exemplares?.codigo}
                        </p>
                      </div>
                      <div className="reader-meta-right">
                        <p className="text-sm-muted">{copy.dueIn}</p>
                        <strong className={diasRestantes <= 3 ? "text-warning" : "text-success"}>
                          {diasRestantes} {dayLabel}
                        </strong>
                        <p className="text-sm-muted">
                          {new Date(`${emp.prazo_devolucao}T00:00:00`).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="area-empty">
                <p>{copy.noLoans}</p>
                <Link href="/reuniao-publica/escalas" className="text-primary">
                  {copy.visitLibrary} →
                </Link>
              </div>
            )}
          </section>

          <section className="area-section">
            <h2 className="area-section-title">{copy.reservationsTitle}</h2>
            {reservas.length > 0 ? (
              <div className="area-panel-grid">
                {reservas.map((res) => {
                  const diasEsperando = Math.floor(
                    (new Date().getTime() - new Date(res.criado_em ?? new Date().toISOString()).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={res.id} className="area-panel-item reader-loan-card">
                      <div>
                        <strong>{res.obras?.titulo}</strong>
                        <p>{res.obras?.autor && `${locale === "en" ? "by" : "por"} ${res.obras.autor}`}</p>
                        <p className="text-sm-muted">{locale === "en" ? "Waiting for availability" : "Aguardando disponibilidade"}</p>
                      </div>
                      <div className="reader-meta-right">
                        <p className="text-sm-muted">{copy.queue}</p>
                        <strong className="text-primary">#{res.posicao_fila}</strong>
                        <p className="text-sm-muted">
                          {locale === "en"
                            ? `${diasEsperando} ${diasEsperando === 1 ? "day" : "days"} ${copy.waiting}`
                            : `há ${diasEsperando} dia${diasEsperando !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="area-empty">
                <p>{copy.noReservations}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
