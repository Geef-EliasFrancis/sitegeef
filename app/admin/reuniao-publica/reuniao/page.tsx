import Link from "next/link";

export const metadata = {
  title: "Reunião - Admin GEEF",
};

export default function ReuniaoPublicaReuniaoPage() {
  return (
    <div className="area-page">
      <section className="area-hero" style={{ paddingBottom: "1.5rem" }}>
        <div className="area-hero-top">
          <div>
            <h1 className="area-hero-title" style={{ fontSize: "2rem" }}>
              Reunião
            </h1>
            <p className="area-subtitle">Atalhos para a operação de reuniões da área pública.</p>
          </div>
        </div>
      </section>

      <section className="area-section">
        <div className="stat-grid">
          <Link href="/admin/reunioes-virtuais" className="stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <span>Reuniões virtuais</span>
            <strong>Abrir</strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Agenda, edição e histórico</small>
          </Link>
          <Link href="/admin/reuniao-publica/musica/sessoes" className="stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <span>Sessões ao vivo</span>
            <strong>Controle</strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Exibição pública e troca de música</small>
          </Link>
        </div>
      </section>
    </div>
  );
}
