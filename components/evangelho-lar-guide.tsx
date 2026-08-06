"use client";

import { useState } from "react";
import type { Locale } from "@/lib/multilingual";

type PhaseKey = "before" | "during" | "after";

type GuideStep = {
  title: string;
  text: string;
  visual: "calendar" | "home" | "water" | "prayer" | "book" | "heart" | "plant" | "light" | "path";
};

type Phase = {
  label: string;
  eyebrow: string;
  description: string;
  steps: GuideStep[];
};

type ReadingSuggestion = {
  reference: string;
  title: string;
  purpose: string;
};

const readingSuggestions: Record<Locale, ReadingSuggestion[]> = {
  pt: [
    { reference: "Prefácio", title: "A proposta do Evangelho", purpose: "Comece pela apresentação da obra e conversem sobre estudar, sentir e praticar o ensino de Jesus." },
    { reference: "Capítulo I", title: "Não vim destruir a lei", purpose: "Reflitam sobre a continuidade da lei divina e escolham uma aplicação moral para a semana." },
    { reference: "Capítulo II", title: "Meu reino não é deste mundo", purpose: "Conversem sobre esperança, desapego e o modo de enfrentar as dificuldades com serenidade." },
    { reference: "Capítulo III", title: "Há muitas moradas na casa de meu Pai", purpose: "Reflitam sobre progresso, diversidade de situações e responsabilidade pelas próprias escolhas." },
  ],
  en: [
    { reference: "Preface", title: "The Gospel proposal", purpose: "Begin with the book's presentation and discuss studying, feeling and practicing Jesus' teaching." },
    { reference: "Chapter I", title: "I came not to destroy the law", purpose: "Reflect on the continuity of divine law and choose one moral application for the week." },
    { reference: "Chapter II", title: "My kingdom is not of this world", purpose: "Talk about hope, detachment and facing difficulties with serenity." },
    { reference: "Chapter III", title: "In my Father's house are many mansions", purpose: "Reflect on progress, different situations and responsibility for personal choices." },
  ],
};

const phases: Record<Locale, Record<PhaseKey, Phase>> = {
  pt: {
    before: {
      label: "Antes",
      eyebrow: "Preparação",
      description: "Converse com quem mora no lar, combine um momento semanal e prepare uma reunião acolhedora de aproximadamente 30 minutos.",
      steps: [
        { title: "Converse com a família", text: "Explique que será um momento de união, estudo e reflexão sobre os ensinamentos de Jesus, com respeito e harmonia.", visual: "home" },
        { title: "Escolha dia e horário", text: "Definam na semana um dia e horário em que todos possam estar presentes. A duração média sugerida é de cerca de 30 minutos.", visual: "calendar" },
        { title: "Acolha crianças e visitantes", text: "Crianças podem participar. Visitantes ocasionais também podem ser convidados; aos não espíritas, explique antes a finalidade do encontro.", visual: "heart" },
        { title: "Separe a leitura", text: "Utilize O evangelho segundo o espiritismo como obra básica. Também podem ser escolhidas obras evangélicas de apoio.", visual: "book" },
        { title: "Prepare água, se desejar", text: "Pode-se disponibilizar água para ser magnetizada ou fluidificada, explicando aos participantes como ela será utilizada.", visual: "water" },
      ],
    },
    during: {
      label: "Durante",
      eyebrow: "Roteiro FEB",
      description: "Siga a sequência sugerida com simplicidade: cada etapa prepara a próxima e todos podem participar.",
      steps: [
        { title: "1. Preparação", text: "Faça uma leitura breve de uma mensagem evangélica, sem comentários, apenas para harmonizar o ambiente.", visual: "light" },
        { title: "2. Prece inicial", text: "Inicie com uma prece simples e espontânea, buscando sintonia com a Espiritualidade e harmonização íntima.", visual: "prayer" },
        { title: "3. Leitura", text: "Leia um ou dois itens de O evangelho segundo o espiritismo, começando pelo prefácio, conforme a escolha do grupo.", visual: "book" },
        { title: "4. Comentários", text: "Conversem brevemente, com a participação dos presentes, destacando o ensino moral e sua aplicação nas situações do dia a dia.", visual: "heart" },
        { title: "5. Vibrações", text: "Mentalizem fraternidade, paz e equilíbrio para a Humanidade, os povos, os governantes, os lares e todos os que precisam de auxílio.", visual: "light" },
        { title: "6. Pedidos", text: "Incluam nas preces amigos, parentes e pessoas necessitadas, sem exposição indevida nem fórmulas obrigatórias.", visual: "water" },
        { title: "7. Encerramento", text: "Finalize com uma prece simples, sincera e espontânea, agradecendo a Deus, a Jesus e aos amigos espirituais.", visual: "path" },
      ],
    },
    after: {
      label: "Depois",
      eyebrow: "Vivência",
      description: "O encontro termina, mas o estudo deve ser levado para a vivência moral, com fé e perseverança.",
      steps: [
        { title: "Leve o ensino para a vida", text: "Escolham uma atitude possível para praticar durante a semana, sem transformar a reflexão em cobrança entre familiares.", visual: "plant" },
        { title: "Mantenha a perseverança", text: "Retomem o Evangelho no Lar no dia combinado. Se a rotina mudar, reorganizem o horário com serenidade.", visual: "calendar" },
        { title: "Lembrete importante", text: "Este momento não é uma reunião mediúnica. Intuições devem permanecer como comentário geral, dito de modo simples e oportuno.", visual: "home" },
      ],
    },
  },
  en: {
    before: {
      label: "Before",
      eyebrow: "Preparation",
      description: "Talk with the household, choose a weekly moment and prepare a welcoming gathering of about 30 minutes.",
      steps: [
        { title: "Talk with the household", text: "Explain that this is a moment of unity, study and reflection on Jesus' teachings, with respect and harmony.", visual: "home" },
        { title: "Choose the day and time", text: "Choose a weekly day and time when everyone can be present. The suggested average duration is about 30 minutes.", visual: "calendar" },
        { title: "Welcome children and guests", text: "Children may participate. Occasional guests may be invited; explain the purpose first to guests who are not Spiritists.", visual: "heart" },
        { title: "Choose the reading", text: "Use The Gospel According to Spiritism as the basic work. Other evangelical works may also support the study.", visual: "book" },
        { title: "Prepare water, if desired", text: "Water may be made available for magnetization or fluidification, with its use explained to the participants.", visual: "water" },
      ],
    },
    during: {
      label: "During",
      eyebrow: "FEB sequence",
      description: "Follow the suggested sequence simply: each step prepares the next and everyone may participate.",
      steps: [
        { title: "1. Preparation", text: "Read a brief evangelical message without comments, simply to harmonize the environment.", visual: "light" },
        { title: "2. Opening prayer", text: "Begin with a simple, spontaneous prayer, seeking spiritual attunement and inner harmony.", visual: "prayer" },
        { title: "3. Reading", text: "Read one or two items from The Gospel According to Spiritism, beginning with the preface, as chosen by the group.", visual: "book" },
        { title: "4. Comments", text: "Discuss briefly, with the participation of those present, highlighting the moral teaching and its daily application.", visual: "heart" },
        { title: "5. Good thoughts", text: "Think of fraternity, peace and balance for humanity, peoples, leaders, homes and everyone needing help.", visual: "light" },
        { title: "6. Requests", text: "Include friends, relatives and people in need in prayer, without exposure or mandatory formulas.", visual: "water" },
        { title: "7. Closing", text: "Close with a simple, sincere and spontaneous prayer, giving thanks to God, Jesus and spiritual friends.", visual: "path" },
      ],
    },
    after: {
      label: "After",
      eyebrow: "Living the teaching",
      description: "The gathering ends, but study should become moral practice through faith and perseverance.",
      steps: [
        { title: "Carry the teaching into life", text: "Choose one possible attitude to practice during the week, without turning reflection into pressure between relatives.", visual: "plant" },
        { title: "Keep persevering", text: "Return to the Gospel at home on the agreed day. If the routine changes, reorganize calmly.", visual: "calendar" },
        { title: "An important reminder", text: "This is not a mediumistic meeting. Intuitions should remain general comments, expressed simply at the right time.", visual: "home" },
      ],
    },
  },
};

function GuideIllustration({ kind }: { kind: GuideStep["visual"] }) {
  return (
    <svg className={`evangelho-guide-illustration is-${kind}`} viewBox="0 0 360 220" role="img" aria-label="Ilustração da etapa">
      <circle className="evangelho-guide-sun" cx="285" cy="48" r="30" />
      <path className="evangelho-guide-cloud" d="M42 64c12-18 39-18 49 0 18-14 49-2 48 21H35c-3-8 0-16 7-21Z" />
      <path className="evangelho-guide-horizon" d="M0 158c55-36 106-25 154-4 51 23 91-8 206-6v72H0Z" />
      {kind === "calendar" && <><rect x="102" y="66" width="128" height="106" rx="12" /><path d="M102 96h128M132 53v28M200 53v28M126 119h18M158 119h18M190 119h18M126 143h18M158 143h18" /></>}
      {kind === "home" && <><path d="m86 130 92-76 96 76" /><path d="M111 116v65h135v-65M163 181v-43h32v43" /><circle cx="221" cy="88" r="9" /></>}
      {kind === "water" && <><path d="M133 72h86l-9 105h-68Z" /><path d="M145 82h62M145 108h62M145 134h62" /><path d="M112 60c-14 19-14 34 0 42 14-8 14-23 0-42Z" /></>}
      {kind === "prayer" && <><path d="M116 172c2-42 18-65 39-65 16 0 25 14 25 31 0-17 9-31 25-31 21 0 37 23 39 65Z" /><path d="M180 105V73M165 88h30" /><circle cx="180" cy="63" r="9" /></>}
      {kind === "book" && <><path d="M74 82c38-17 72-13 106 6v90c-34-19-68-23-106-6Z" /><path d="M286 82c-38-17-72-13-106 6v90c34-19 68-23 106-6Z" /><path d="M103 108c23-7 43-4 63 7M257 108c-23-7-43-4-63 7" /></>}
      {kind === "heart" && <><path d="M180 174S86 120 86 81c0-24 31-34 50-14l44 44 44-44c19-20 50-10 50 14 0 39-94 93-94 93Z" /><path d="M180 48v-24M162 34h36" /></>}
      {kind === "plant" && <><path d="M180 180v-68M180 137c-30-20-46-42-38-65 27 4 43 23 38 65ZM180 151c31-20 48-42 40-65-27 4-44 23-40 65Z" /><path d="M144 180h72" /></>}
      {kind === "light" && <><path d="M180 172c-29-23-43-40-43-64 0-31 24-53 43-53s43 22 43 53c0 24-14 41-43 64Z" /><path d="M160 181h40M166 193h28M180 32V15M125 48 113 36M235 48l12-12" /></>}
      {kind === "path" && <><path d="M92 194c39-51 49-87 41-130M268 194c-39-51-49-87-41-130" /><path d="M180 194v-18M180 151v-18M180 108V90" /><circle cx="180" cy="65" r="18" /></>}
    </svg>
  );
}

export function EvangelhoLarGuide({ locale }: Readonly<{ locale: Locale }>) {
  const english = locale === "en";
  const copy = phases[locale];
  const [phaseKey, setPhaseKey] = useState<PhaseKey>("before");
  const [stepIndex, setStepIndex] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const phase = copy[phaseKey];
  const step = phase.steps[stepIndex];
  const reading = readingSuggestions[locale][readingIndex];
  const guidedSteps = (Object.keys(copy) as PhaseKey[]).flatMap((key) => copy[key].steps.map((guidedStep) => ({ ...guidedStep, phaseKey: key })));
  const guidedStep = guidedSteps[guidedIndex];

  function changePhase(nextPhase: PhaseKey) {
    setPhaseKey(nextPhase);
    setStepIndex(0);
  }

  function moveStep(direction: number) {
    setStepIndex((current) => (current + direction + phase.steps.length) % phase.steps.length);
  }

  return (
    <section className="evangelho-guide" aria-label={english ? "Gospel at home guide" : "Guia do Evangelho no Lar"}>
      <div className="evangelho-guide-intro">
        <div>
          <p className="eyebrow">{english ? "A simple family rhythm" : "Um ritmo familiar simples"}</p>
          <h2>{english ? "Three moments for the gathering" : "Três momentos para o encontro"}</h2>
        </div>
        <p>{english ? "Move through the guide at your own pace. The practice should bring peace, study and fellowship to the home." : "Navegue pelo guia no ritmo da família. A prática deve trazer paz, estudo e convivência para o lar."}</p>
      </div>

      <div className="evangelho-guide-toggle" role="tablist" aria-label={english ? "Gospel at home moments" : "Momentos do Evangelho no Lar"}>
        {(Object.keys(copy) as PhaseKey[]).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={phaseKey === key} className={phaseKey === key ? "is-active" : ""} onClick={() => changePhase(key)}>
            <span>{copy[key].label}</span>
            <small>{copy[key].eyebrow}</small>
          </button>
        ))}
      </div>

      <article className="evangelho-guide-reading">
        <div>
          <p className="eyebrow">{english ? "Reading suggestion" : "Sugestão de leitura"}</p>
          <h3>{reading.reference}: {reading.title}</h3>
          <p>{reading.purpose}</p>
        </div>
        <button type="button" onClick={() => setReadingIndex((current) => (current + 1) % readingSuggestions[locale].length)}>
          {english ? "Another suggestion" : "Outra sugestão"}
        </button>
      </article>

      <div className="evangelho-guide-stage">
        <div className="evangelho-guide-stage-copy">
          <p className="evangelho-guide-phase">{phase.eyebrow}</p>
          <h3>{phase.label}</h3>
          <p>{phase.description}</p>
          <div className="evangelho-guide-controls">
            <button type="button" className="evangelho-guide-arrow" onClick={() => moveStep(-1)} aria-label={english ? "Previous step" : "Etapa anterior"}>←</button>
            <span aria-live="polite">{stepIndex + 1} / {phase.steps.length}</span>
            <button type="button" className="evangelho-guide-arrow" onClick={() => moveStep(1)} aria-label={english ? "Next step" : "Próxima etapa"}>→</button>
          </div>
          <button type="button" className="evangelho-guide-present-button" onClick={() => setGuidedOpen((current) => !current)} aria-expanded={guidedOpen}>
            {guidedOpen ? (english ? "Close guided mode" : "Fechar modo guiado") : (english ? "Open guided mode" : "Abrir modo guiado")}
          </button>
        </div>

        <article className="evangelho-guide-slide" aria-live="polite">
          <div className="evangelho-guide-art"><GuideIllustration kind={step.visual} /></div>
          <div className="evangelho-guide-slide-copy">
            <p className="eyebrow">{english ? `Step ${stepIndex + 1}` : `Etapa ${stepIndex + 1}`}</p>
            <h4>{step.title}</h4>
            <p>{step.text}</p>
          </div>
        </article>
      </div>

      {guidedOpen && (
        <section className="evangelho-guide-presentation" aria-label={english ? "Guided presentation" : "Apresentação guiada"}>
          <div className="evangelho-guide-presentation-heading">
            <div>
              <p className="eyebrow">{english ? "Follow together" : "Acompanhe em família"}</p>
              <h3>{english ? "Guided meeting" : "Encontro guiado"}</h3>
            </div>
            <span>{guidedIndex + 1} / {guidedSteps.length}</span>
          </div>
          <div className="evangelho-guide-progress" aria-hidden="true"><span style={{ width: `${((guidedIndex + 1) / guidedSteps.length) * 100}%` }} /></div>
          <div className="evangelho-guide-presentation-slide">
            <div className="evangelho-guide-presentation-art"><GuideIllustration kind={guidedStep.visual} /></div>
            <div>
              <p className="evangelho-guide-phase">{copy[guidedStep.phaseKey].label}</p>
              <h4>{guidedStep.title}</h4>
              <p>{guidedStep.text}</p>
            </div>
          </div>
          <div className="evangelho-guide-presentation-actions">
            <button type="button" className="evangelho-guide-arrow" onClick={() => setGuidedIndex((current) => (current - 1 + guidedSteps.length) % guidedSteps.length)} aria-label={english ? "Previous guided slide" : "Slide guiado anterior"}>←</button>
            <button type="button" className="evangelho-guide-presentation-next" onClick={() => setGuidedIndex((current) => (current + 1) % guidedSteps.length)}>
              {guidedIndex === guidedSteps.length - 1 ? (english ? "Restart" : "Recomeçar") : (english ? "Next slide" : "Próximo slide")} →
            </button>
          </div>
        </section>
      )}

      <div className="evangelho-guide-dots" role="tablist" aria-label={english ? "Steps in this moment" : "Etapas deste momento"}>
        {phase.steps.map((item, index) => (
          <button key={item.title} type="button" role="tab" aria-selected={stepIndex === index} className={stepIndex === index ? "is-active" : ""} onClick={() => setStepIndex(index)}>
            <span className="sr-only">{item.title}</span>
          </button>
        ))}
      </div>

      <div className="evangelho-guide-note">
        <strong>{english ? "Keep it welcoming" : "Mantenha o acolhimento"}</strong>
        <span>{english ? "There is no need to make the gathering long or complicated. Consistency and sincerity matter most." : "Não é preciso tornar o encontro longo ou complicado. A constância e a sinceridade são o mais importante."}</span>
        <a href="https://www.febnet.org.br/aij/wp-content/uploads/2023/03/3-_-Orientacao-ao-Centro-Espirita.pdf" target="_blank" rel="noreferrer">{english ? "FEB reference" : "Referência FEB"}</a>
      </div>
    </section>
  );
}
