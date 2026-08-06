"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/multilingual";
import { evangelhoReferences, EVANGELHO_REFERENCE_COUNT, EVANGELHO_REFERENCE_SOURCE, type EvangelhoReference } from "@/lib/evangelho-references";

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

function randomReferenceIndex(currentIndex?: number) {
  if (evangelhoReferences.length < 2) return 0;
  let nextIndex = Math.floor(Math.random() * evangelhoReferences.length);
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * evangelhoReferences.length);
  }
  return nextIndex;
}

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

export function GuideIllustration({ kind }: { kind: GuideStep["visual"] }) {
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
  const phase = copy[phaseKey];
  const step = phase.steps[stepIndex];
  const reading: EvangelhoReference = evangelhoReferences[readingIndex];

  useEffect(() => {
    setReadingIndex(randomReferenceIndex());
  }, []);

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
          <h2>{english ? "Gospel at home, step by step" : "Evangelho no Lar, passo a passo"}</h2>
        </div>
        <div className="evangelho-guide-facts" aria-label={english ? "Guide summary" : "Resumo do guia"}>
          <span><strong>≈ 30</strong><small>{english ? "minutes" : "minutos"}</small></span>
          <span><strong>15</strong><small>{english ? "steps" : "etapas"}</small></span>
          <span><strong>1</strong><small>{english ? "family rhythm" : "ritmo familiar"}</small></span>
        </div>
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
        <button type="button" onClick={() => setReadingIndex((currentIndex) => randomReferenceIndex(currentIndex))}>
          {english ? "Another suggestion" : "Outra sugestão"}
        </button>
        <small className="evangelho-guide-reading-count">
          {english ? `${EVANGELHO_REFERENCE_COUNT} numbered references` : `${EVANGELHO_REFERENCE_COUNT} referências numeradas`}
        </small>
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

      <div className="evangelho-guide-note">
        <strong>{english ? "Keep it welcoming" : "Mantenha o acolhimento"}</strong>
        <span>{english ? "There is no need to make the gathering long or complicated. Consistency and sincerity matter most." : "Não é preciso tornar o encontro longo ou complicado. A constância e a sinceridade são o mais importante."}</span>
        <a href={EVANGELHO_REFERENCE_SOURCE} target="_blank" rel="noreferrer">{english ? "FEB reference" : "Referência FEB"}</a>
      </div>
    </section>
  );
}

function formatGuideTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function EvangelhoLarSession({ locale }: Readonly<{ locale: Locale }>) {
  const english = locale === "en";
  const copy = phases[locale];
  const guidedSteps = (Object.keys(copy) as PhaseKey[]).flatMap((phaseKey) => copy[phaseKey].steps.map((step) => ({ ...step, phaseKey })));
  const studyStartIndex = copy.before.steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [studyStarted, setStudyStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const current = guidedSteps[stepIndex];

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setElapsedSeconds((currentSeconds) => currentSeconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function moveStep(direction: number) {
    setStepIndex((currentIndex) => {
      const nextIndex = (currentIndex + direction + guidedSteps.length) % guidedSteps.length;
      if (guidedSteps[nextIndex].phaseKey === "during" && !studyStarted) {
        setStudyStarted(true);
        setElapsedSeconds(0);
        setRunning(true);
      }
      return nextIndex;
    });
  }

  function startStudy() {
    setStepIndex(studyStartIndex);
    setElapsedSeconds(0);
    setStudyStarted(true);
    setRunning(true);
  }

  return (
    <main className="evangelho-session">
      <section className="evangelho-session-header">
        <div className="evangelho-session-heading">
          <Link href="/evangelho-no-lar" className="evangelho-session-back">← {english ? "Back to overview" : "Voltar para a visão geral"}</Link>
          <p className="eyebrow">{english ? "A guided family moment" : "Um momento guiado em família"}</p>
          <h1>{english ? "Let's do it together" : "Vamos fazer juntos"}</h1>
          <p>{english ? "Follow one slide at a time. The clock is only a reference: there is no alarm and no saved session." : "Siga um slide por vez. O contador é apenas uma referência: não há alarme nem registro da sessão."}</p>
        </div>
        <div className="evangelho-session-timer" aria-label={english ? "Reference timer" : "Contador de referência"}>
          <span>{english ? "Reference time" : "Tempo de referência"}</span>
          <strong>{formatGuideTime(elapsedSeconds)}</strong>
          <small>{studyStarted
            ? (english ? "study time · suggested: about 30 minutes" : "tempo de estudo · sugerido: cerca de 30 minutos")
            : (english ? "preparation is not counted" : "a preparação não é contabilizada")}</small>
          <div className="evangelho-session-timer-actions">
            {!studyStarted ? (
              <button type="button" onClick={startStudy}>{english ? "Everything is ready · start study" : "Já preparei tudo · começar estudo"}</button>
            ) : (
              <>
                <button type="button" onClick={() => setRunning((currentRunning) => !currentRunning)}>{running ? (english ? "Pause" : "Pausar") : (english ? "Resume" : "Continuar")}</button>
                <button type="button" onClick={() => { setElapsedSeconds(0); setRunning(true); }}>{english ? "Restart" : "Reiniciar"}</button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="evangelho-session-progress" aria-label={english ? "Guided sequence progress" : "Progresso da sequência guiada"}>
        <div className="evangelho-session-progress-top">
          <span>{copy[current.phaseKey].label}</span>
          <strong>{stepIndex + 1} / {guidedSteps.length}</strong>
        </div>
        <div className="evangelho-session-progress-track" aria-hidden="true"><span style={{ width: `${((stepIndex + 1) / guidedSteps.length) * 100}%` }} /></div>
      </section>

      <section className="evangelho-session-slide" aria-live="polite">
        <div className="evangelho-session-art"><GuideIllustration kind={current.visual} /></div>
        <div className="evangelho-session-slide-copy">
          <p className="evangelho-guide-phase">{copy[current.phaseKey].eyebrow}</p>
          <p className="evangelho-session-step-label">{english ? `Step ${stepIndex + 1}` : `Etapa ${stepIndex + 1}`}</p>
          <h2>{current.title}</h2>
          <p>{current.text}</p>
          <div className="evangelho-session-tip"><strong>{english ? "Take your time" : "Faça com calma"}</strong><span>{english ? "When your family is ready, move to the next slide." : "Quando a família estiver pronta, avance para o próximo slide."}</span></div>
        </div>
      </section>

      <nav className="evangelho-session-controls" aria-label={english ? "Guided slide controls" : "Controles do slide guiado"}>
        <button type="button" className="evangelho-guide-arrow" onClick={() => moveStep(-1)} aria-label={english ? "Previous step" : "Etapa anterior"}>←</button>
        <div className="evangelho-session-step-list" aria-hidden="true">{guidedSteps.map((item, index) => <span key={`${item.title}-${index}`} className={index === stepIndex ? "is-active" : index < stepIndex ? "is-done" : ""} />)}</div>
        <button type="button" className="evangelho-guide-arrow" onClick={() => moveStep(1)} aria-label={english ? "Next step" : "Próxima etapa"}>→</button>
      </nav>
    </main>
  );
}
