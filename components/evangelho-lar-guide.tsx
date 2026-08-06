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

const phases: Record<Locale, Record<PhaseKey, Phase>> = {
  pt: {
    before: {
      label: "Antes",
      eyebrow: "Preparar",
      description: "Combine um momento possível e prepare o ambiente com simplicidade e serenidade.",
      steps: [
        { title: "Combine o dia", text: "Escolham um dia e horário que possam ser mantidos pela família, sem transformar a prática em obrigação.", visual: "calendar" },
        { title: "Prepare o espaço", text: "Organizem um lugar tranquilo, com água disponível e o livro que será utilizado no encontro.", visual: "home" },
        { title: "Convide com carinho", text: "Reúnam quem estiver em casa e acolham a participação de cada pessoa dentro de sua possibilidade.", visual: "water" },
      ],
    },
    during: {
      label: "Durante",
      eyebrow: "Viver o encontro",
      description: "Siga uma sequência breve, com prece, leitura, conversa fraterna e vibrações.",
      steps: [
        { title: "Comece com uma prece", text: "Façam uma prece simples e espontânea, pedindo amparo, equilíbrio e disposição para aprender.", visual: "prayer" },
        { title: "Leia e converse", text: "Leiam um trecho de O Evangelho segundo o Espiritismo e conversem sobre como vivê-lo no cotidiano.", visual: "book" },
        { title: "Faça as vibrações", text: "Encerrem a reflexão com pensamentos de paz, saúde e fraternidade, respeitando o momento de cada família.", visual: "heart" },
      ],
    },
    after: {
      label: "Depois",
      eyebrow: "Levar para a vida",
      description: "Finalize com gratidão e deixe que o ensinamento continue no cuidado cotidiano.",
      steps: [
        { title: "Agradeça e encerre", text: "Façam uma prece final de agradecimento e encerrem o encontro no horário combinado.", visual: "light" },
        { title: "Escolha uma atitude", text: "Guardem uma ideia prática para exercitar durante a semana, com leveza e perseverança.", visual: "plant" },
        { title: "Retome o compromisso", text: "Ao final, confirmem o próximo momento e ajustem a rotina quando for necessário.", visual: "path" },
      ],
    },
  },
  en: {
    before: {
      label: "Before",
      eyebrow: "Prepare",
      description: "Choose a realistic moment and prepare the space with simplicity and calm.",
      steps: [
        { title: "Choose the day", text: "Pick a day and time the family can keep without turning the practice into an obligation.", visual: "calendar" },
        { title: "Prepare the space", text: "Set up a quiet place, with water and the book that will be used during the gathering.", visual: "home" },
        { title: "Invite with care", text: "Welcome everyone at home and respect each person's way and availability to participate.", visual: "water" },
      ],
    },
    during: {
      label: "During",
      eyebrow: "Share the gathering",
      description: "Follow a brief sequence with prayer, reading, fraternal conversation and good thoughts.",
      steps: [
        { title: "Begin with prayer", text: "Offer a simple, spontaneous prayer for support, balance and openness to learn.", visual: "prayer" },
        { title: "Read and talk", text: "Read a passage from The Gospel According to Spiritism and discuss how to live it each day.", visual: "book" },
        { title: "Share good thoughts", text: "Close the reflection with thoughts of peace, health and fraternity, respecting each family.", visual: "heart" },
      ],
    },
    after: {
      label: "After",
      eyebrow: "Carry it into life",
      description: "Close with gratitude and let the teaching continue through daily care.",
      steps: [
        { title: "Give thanks", text: "Offer a closing prayer of gratitude and finish at the agreed time.", visual: "light" },
        { title: "Choose one attitude", text: "Keep one practical idea to exercise during the week, with lightness and perseverance.", visual: "plant" },
        { title: "Keep the rhythm", text: "Confirm the next gathering and adjust the routine whenever the family needs it.", visual: "path" },
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
  const phase = copy[phaseKey];
  const step = phase.steps[stepIndex];

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
      </div>
    </section>
  );
}
