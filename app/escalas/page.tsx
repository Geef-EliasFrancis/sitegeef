import type { Metadata } from "next";
import { schedule } from "@/lib/site-data";
import { getPublicEscalas } from "@/lib/escalas/public-escalas";
import { getRequestLocale } from "@/lib/multilingual/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: locale === "en" ? "Schedules | GEEF" : "Escalas do GEEF",
    description:
      locale === "en"
        ? "Public schedule of GEEF activities and meetings."
        : "Agenda pública base das atividades e reuniões do GEEF.",
  };
}

function getMonthName(mes: number, locale: "pt" | "en"): string {
  const months =
    locale === "en"
      ? [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
      : [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ];

  return months[mes - 1] ?? (locale === "en" ? "Invalid month" : "Mês inválido");
}

function PublicFallback({ locale }: { locale: "pt" | "en" }) {
  return (
    <section style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
      {schedule.map((item) => (
        <article
          key={item.title}
          style={{
            padding: "1rem",
            borderRadius: "18px",
            border: "1px solid rgba(225, 212, 238, 0.92)",
            background:
              "linear-gradient(180deg, rgba(249, 242, 255, 0.98), rgba(236, 223, 248, 0.96))",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
              {locale === "en"
                ? item.title === "Estudo doutrinário"
                  ? "Doctrinal study"
                  : item.title === "Palestra pública"
                    ? "Public lecture"
                    : item.title === "Atendimento fraterno"
                      ? "Fraternal care"
                      : item.title === "Evangelização"
                        ? "Evangelization"
                        : item.title
                : item.title}
            </h3>
            <span
              style={{
                padding: "0.3rem 0.65rem",
                borderRadius: "999px",
                background: "rgba(138, 0, 90, 0.08)",
                color: "var(--uva-700)",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {locale === "en"
                ? item.when
                    .replace("Terças", "Tuesdays")
                    .replace("Quintas-feiras", "Thursdays")
                    .replace("Sob agendamento", "By appointment")
                    .replace("Quintas-feiras, 19h00–20h00", "Thursdays, 7:00 PM–8:00 PM")
                : item.when}
            </span>
          </div>
          <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
            {locale === "en"
              ? item.description
                  .replace("Leitura, conversa e reflexão sobre a Doutrina Espírita.", "Reading, conversation and reflection on Spiritist Doctrine.")
                  .replace("Palestra, acolhimento e encerramento com prece.", "Lecture, welcome and closing prayer.")
                  .replace("Escuta individual para quem busca apoio e orientação.", "One-on-one listening for those seeking support and guidance.")
                  .replace("Atividades e estudo voltados para crianças e jovens.", "Activities and study aimed at children and youth.")
              : item.description}
          </p>
        </article>
      ))}
    </section>
  );
}

export default async function EscalasPage() {
  const locale = await getRequestLocale();
  let escalas: Awaited<ReturnType<typeof getPublicEscalas>>["escalas"] = [];

  try {
    const result = await getPublicEscalas();
    escalas = result.escalas;
  } catch (error) {
    console.error("Falha ao carregar escalas públicas:", error);
  }

  return (
    <main
      style={{
        width: "min(1080px, calc(100% - 1.5rem))",
        margin: "0 auto",
        padding: "1rem 0 2rem",
      }}
    >
      <section
        style={{
          padding: "1.35rem",
          borderRadius: "28px",
          border: "1px solid rgba(225, 212, 238, 0.92)",
          background:
            "linear-gradient(180deg, rgba(248, 240, 255, 0.98), rgba(236, 223, 248, 0.96))",
          boxShadow: "0 20px 48px rgba(124, 63, 163, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            display: "inline-flex",
            padding: "0.35rem 0.7rem",
            borderRadius: "999px",
            background: "rgba(138, 0, 90, 0.1)",
            color: "var(--uva-700)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "0.76rem",
            fontWeight: 700,
          }}
        >
          {locale === "en" ? "Schedules" : "Escalas"}
        </p>
        <h1
          style={{
            margin: "0.75rem 0 0",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
          }}
        >
          {locale === "en" ? "Public activity schedule" : "Agenda pública de atividades"}
        </h1>
        <p style={{ margin: "0.65rem 0 0", color: "var(--muted)", maxWidth: "44rem", lineHeight: 1.6 }}>
          {locale === "en"
            ? "The content comes from Supabase with local cache. When the ERP updates a schedule, the public page is invalidated and reloads the new version without losing performance."
            : "O conteúdo vem do Supabase com cache local. Quando o ERP atualizar uma escala, a página pública é invalidada e recarrega a versão nova sem perder desempenho."}
        </p>
      </section>

      {escalas.length > 0 ? (
        <section style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
          {escalas.map((escala) => (
            <article
              key={escala.id}
              style={{
                padding: "1rem",
                borderRadius: "22px",
                border: "1px solid rgba(225, 212, 238, 0.92)",
                background: "rgba(247, 239, 252, 0.98)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.2rem",
                  color: "var(--text)",
                }}
              >
                {getMonthName(escala.mes, locale)} {locale === "en" ? "of" : "de"} {escala.ano}
              </h2>

              <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {escala.reunioes?.map((reuniao) => (
                  <div
                    key={reuniao.id}
                    style={{
                      padding: "1rem",
                      borderRadius: "18px",
                      border: "1px solid rgba(225, 212, 238, 0.92)",
                      background:
                        "linear-gradient(180deg, rgba(249, 242, 255, 0.98), rgba(236, 223, 248, 0.96))",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 0.85rem",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {locale === "en"
                        ? new Date(`${reuniao.data}T00:00:00`).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : `Quinta-feira, ${new Date(`${reuniao.data}T00:00:00`).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}`}
                    </h3>

                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      {(reuniao.escala_funcoes ?? []).slice(0, 3).map((ef) => (
                        <div
                          key={String(ef.id ?? `${ef.funcao_id}-${ef.pessoa_id}`)}
                          style={{
                            display: "grid",
                            gap: "0.25rem",
                            gridTemplateColumns: "minmax(130px, 0.7fr) 1fr 1fr",
                            padding: "0.8rem",
                            borderRadius: "14px",
                            background: "rgba(247, 239, 252, 0.98)",
                          }}
                        >
                          <strong>{ef.funcoes?.nome ?? (locale === "en" ? "Role" : "Função")}</strong>
                          <span>{ef.pessoas?.nome ?? (locale === "en" ? "Unnamed" : "Sem nome")}</span>
                          <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                            {ef.substitutos?.nome ? `${locale === "en" ? "Sub" : "Sub"}: ${ef.substitutos.nome}` : ""}
                          </span>
                        </div>
                      ))}

                      {(reuniao.escala_passe ?? []).slice(0, 3).map((ep) => (
                        <div
                          key={String(ep.id ?? `${ep.posicao}-${ep.pessoa_id}`)}
                          style={{
                            display: "grid",
                            gap: "0.25rem",
                            gridTemplateColumns: "60px 1fr",
                            padding: "0.8rem",
                            borderRadius: "14px",
                            background: "rgba(247, 239, 252, 0.98)",
                          }}
                        >
                          <strong>#{ep.posicao}</strong>
                          <span>{ep.pessoas?.nome ?? (locale === "en" ? "Unnamed" : "Sem nome")}</span>
                        </div>
                      ))}

                      {(reuniao.escala_evangelizacao ?? []).slice(0, 3).map((ee) => (
                        <div
                          key={String(ee.id ?? `${ee.pessoa_id}-${ee.tema_id}`)}
                          style={{
                            display: "grid",
                            gap: "0.25rem",
                            gridTemplateColumns: "1fr 1fr 120px",
                            padding: "0.8rem",
                            borderRadius: "14px",
                            background: "rgba(247, 239, 252, 0.98)",
                          }}
                        >
                          <span>{ee.pessoas?.nome ?? (locale === "en" ? "Unnamed" : "Sem nome")}</span>
                          <span>{ee.temas_doutrinarios?.titulo ?? ee.tema_livre ?? (locale === "en" ? "Topic" : "Tema")}</span>
                          <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                            {ee.turma ? `(${ee.turma})` : ""}
                          </span>
                        </div>
                      ))}

                      {(reuniao.escala_palestras ?? []).slice(0, 3).map((ep) => (
                        <div
                          key={String(ep.id ?? `${ep.expositor_id}-${ep.tema_id}`)}
                          style={{
                            display: "grid",
                            gap: "0.25rem",
                            gridTemplateColumns: "120px 1fr 1fr",
                            padding: "0.8rem",
                            borderRadius: "14px",
                            background: "rgba(247, 239, 252, 0.98)",
                          }}
                        >
                          <strong>{ep.palestrantes?.nome ?? ep.expositores?.nome ?? (locale === "en" ? "Speaker" : "Expositor")}</strong>
                          <span>{ep.temas_doutrinarios?.titulo ?? ep.tema_livre ?? (locale === "en" ? "Topic" : "Tema")}</span>
                          <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                            {ep.palestrantes?.cidade ?? ep.cidade_origem ?? ep.tipo_palestra ?? ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <PublicFallback locale={locale} />
      )}
    </main>
  );
}
