import { contentPages, publicHref, type ContentPage } from "@/lib/site-data";
import type { Locale } from "./constants";

type LocalizedContent = Record<string, ContentPage>;

const englishContentPages: LocalizedContent = {
  "quem-somos": {
    title: "About us",
    summary: "Learn about the house history, mission, values and way of working.",
    intro:
      "Grupo Espírita Elias Francis is a place for study, welcome and fraternal service. Our work prioritizes simplicity, respect, charity and the continuity of a story marked by presence and service.",
    ctaLabel: "View schedule",
    ctaHref: publicHref("/agenda"),
    sections: [
      {
        heading: "Our mission",
        text: "Welcome, study and serve, offering a safe reference for those seeking spiritual guidance and fraternal fellowship.",
      },
      {
        heading: "Our history",
        text: "The house preserves the memory of a spiritual work born from fraternal dedication and consolidated as a meeting point for study, assistance and evangelization.",
        bullets: [
          "Origin linked to the work of Elias Francis.",
          "A path sustained by continuity and simplicity.",
          "Commitment to fraternal presence and service to the community.",
        ],
      },
      {
        heading: "Our values",
        text: "All house communication should reflect serenity, clarity and respect for the institution's trajectory.",
        bullets: [
          "Charity without ostentation.",
          "Study with discipline and humility.",
          "Welcome without bureaucracy.",
          "Clear and reliable communication.",
        ],
      },
      {
        heading: "How we work",
        text: "We value reading, gospel practice and human care without complicating access to the house.",
        bullets: [
          "Open public meetings.",
          "Regular studies.",
          "Fraternal care with listening.",
          "Evangelization and fellowship for different age groups.",
        ],
      },
    ],
  },
  agenda: {
    title: "Schedule",
    summary: "Initial schedule of public activities.",
    intro:
      "The schedule below is a simple base for the public site. It can later be maintained manually or integrated into the administrative flow.",
    ctaLabel: "Contact the house",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Weekly program",
        text: "The program was designed to be clear on mobile and useful for first-time visitors.",
        bullets: [
          "Study session - Tuesdays, 7:30 PM",
          "Public meeting - Thursdays, 7:00 PM",
          "Fraternal care - by appointment",
          "Evangelization - youth and children meetings",
        ],
      },
      {
        heading: "Notes",
        text: "Special events, commemorative dates and live streams can be highlighted on the home page.",
      },
    ],
  },
  atividades: {
    title: "Activities",
    summary: "House activities and public meetings.",
    intro:
      "Activities organize the house flow and help visitors quickly understand what happens in each time slot.",
    ctaLabel: "View studies",
    ctaHref: publicHref("/estudos"),
    sections: [
      {
        heading: "What we offer",
        text: "The initial base covers study, public meeting, evangelization, care and welcome actions.",
        bullets: [
          "Lectures and doctrinal study.",
          "Evangelization for children and youth.",
          "Fraternal care and welcome.",
          "Gospel at home for family study and fellowship.",
          "Live streams when there is an event.",
        ],
      },
      {
        heading: "Gospel at home",
        text: "A regular family gathering, held on an agreed day and time, to cultivate Gospel study, fellowship and peace at home.",
        bullets: [
          "Begin with a simple, spontaneous prayer.",
          "Read a passage from The Gospel According to Spiritism.",
          "Briefly discuss how the moral teaching applies to daily life.",
          "Close with fraternal thoughts and an ending prayer.",
          "The house can guide families interested in starting this practice.",
        ],
      },
    ],
  },
  estudos: {
    title: "Studies",
    summary: "Readings and continuing formation meetings.",
    intro:
      "Studies sustain the life of the house and allow people to grow with method, serenity and discipline.",
    ctaLabel: "Go to evangelization",
    ctaHref: publicHref("/evangelizacao"),
    sections: [
      {
        heading: "Study lines",
        text: "The site is ready to inform topics, series and special meetings.",
        bullets: [
          "Gospel at home.",
          "Spiritist doctrine study.",
          "Guided readings.",
        ],
      },
    ],
  },
  evangelizacao: {
    title: "Evangelization",
    summary: "Formation and fellowship space for children and youth.",
    intro:
      "Evangelization is one of the most important areas of moral and social formation within a Spiritist house.",
    ctaLabel: "Talk to care",
    ctaHref: publicHref("/atendimento-fraterno"),
    sections: [
      {
        heading: "Proposal",
        text: "Organize simple, welcoming and consistent meetings for children, youth and families.",
      },
    ],
  },
  "atendimento-fraterno": {
    title: "Fraternal care",
    summary: "Guidance and welcome with respect and simplicity.",
    intro:
      "Fraternal care is a space for human listening and initial guidance. The site makes that visible without bureaucracy.",
    ctaLabel: "Get in touch",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "How it works",
        text: "Visitors find an open door to request a conversation and welcome at an agreed time.",
        bullets: [
          "Respectful listening.",
          "Initial guidance.",
          "Referral to studies or appropriate support.",
        ],
      },
    ],
  },
  doacoes: {
    title: "Donations",
    summary: "Simple and transparent support for the maintenance of the house.",
    intro:
      "The donations page starts as informative. When there is an operational decision, it can gain a more complete flow.",
    ctaLabel: "Go to contact",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Use of contributions",
        text: "House maintenance, support for activities and small operational costs of the routine.",
      },
    ],
  },
  "ao-vivo": {
    title: "Live",
    summary: "Live streams and video recordings.",
    intro:
      "Live events and recordings can be displayed here with a direct link to the YouTube channel.",
    ctaLabel: "Open YouTube",
    ctaHref: `https://www.youtube.com/@GrupoEspiritaEliasFrancis`,
    sections: [
      {
        heading: "Channel",
        text: "Use this page as a simple showcase for streams, lectures and relevant meeting recordings.",
      },
    ],
  },
  contato: {
    title: "Contact",
    summary: "Official channels, social links and message form for the house.",
    intro:
      "Contact flows should come from the institutional record and keep address, channels and internal receipt in one place.",
    ctaLabel: "Send message",
    ctaHref: publicHref("/contato#mensagem"),
    sections: [
      {
        heading: "Official information",
        text: "Phone, email, address and visible social channels are gathered from the institution record.",
      },
    ],
  },
  lgpd: {
    title: "LGPD",
    summary: "Public privacy center, data subject rights and data handling.",
    intro:
      "Here are the essential points about how GEEF handles personal data, what may be collected, how long it is kept and how you can request correction, access or revocation.",
    ctaLabel: "Open privacy",
    ctaHref: publicHref("/privacidade"),
    sections: [
      {
        heading: "What we process",
        text: "We collect only what is necessary for contact, site access, care, consents, volunteering, documents and authorized administrative areas.",
        bullets: [
          "Registration and contact data.",
          "Access and authentication data.",
          "Consents and signed terms.",
          "Operational and audit records.",
        ],
      },
      {
        heading: "Your rights",
        text: "You can request confirmation, access, correction, deletion when applicable, information about sharing and consent revocation.",
        bullets: [
          "Request a copy or review of your data.",
          "Correct outdated data.",
          "Revoke granted consents.",
          "Ask how the data was used.",
        ],
      },
      {
        heading: "Security and retention",
        text: "We keep access restricted, use data only for the stated purpose and delete or archive according to operational and legal needs.",
        bullets: [
          "Access limited by profile and function.",
          "Sensitive data gets stronger review.",
          "Logs and audit stay separate from core content.",
          "Relevant incidents follow a formal response flow.",
        ],
      },
      {
        heading: "LGPD contact",
        text: "If you want to exercise a right or clarify the use of personal data, contact the house through the official channel.",
        bullets: [
          "Email: contatogeef@gmail.com",
          "Phone: (22) 99725-1807",
          "Address: Rua Gwyer de Azevedo, 35, Centro, Santa Maria Madalena-RJ",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    summary: "Cookie preferences, categories and visitor choices.",
    intro:
      "Here we explain which cookies are necessary for the site to work and which depend on an active visitor choice.",
    ctaLabel: "Manage preferences",
    ctaHref: publicHref("/cookies"),
    sections: [
      {
        heading: "Categories",
        text: "Essential cookies remain active for browsing, login, security and access to restricted areas. The others depend on consent.",
        bullets: [
          "Essential: session, security and basic preferences.",
          "Marketing: communications and campaigns.",
          "Analytics: non-essential measurement.",
          "Tracking: remarketing and campaign attribution.",
        ],
      },
      {
        heading: "How to control",
        text: "On first access, visitors can accept all, reject the non-essential ones or choose category by category.",
        bullets: [
          "Accept all.",
          "Reject non-essential.",
          "Manage preferences at any time.",
        ],
      },
      {
        heading: "Updates",
        text: "If new purposes are added, the policy and the banner will be updated before use.",
      },
      {
        heading: "Contact",
        text: "Questions about cookies and privacy can be sent through the house's official channels.",
        bullets: [
          "Email: contatogeef@gmail.com",
          "Phone: (22) 99725-1807",
        ],
      },
    ],
  },
  privacidade: {
    title: "Privacy",
    summary: "Privacy guidelines, consent and data care.",
    intro:
      "This page details how the public site handles your personal data and when GEEF may record user consent, contact or preference.",
    ctaLabel: "View LGPD center",
    ctaHref: publicHref("/lgpd"),
    sections: [
      {
        heading: "Principles",
        text: "Collect the minimum necessary, explain how the data is used and keep contact channels simple.",
        bullets: [
          "Data used only for contact and care.",
          "No unnecessary collection on the public site.",
          "Clear consent and purpose when forms exist.",
        ],
      },
      {
        heading: "How we use data",
        text: "The site uses data for login, password recovery, user area display and consent records when there is an explicit flow.",
        bullets: [
          "Login and password recovery.",
          "User area and preferences.",
          "Consents and signed terms.",
          "Audit and security records.",
        ],
      },
      {
        heading: "What we do not do",
        text: "We do not use data for hidden purposes or expose unnecessary personal information on public pages.",
        bullets: [
          "We do not sell data.",
          "We do not publish sensitive content without basis and authorization.",
          "We do not keep data indefinitely without reason.",
        ],
      },
      {
        heading: "Contact channel",
        text: "If you want to review, correct or revoke consent, use the official contact or the authenticated user area.",
        bullets: [
          "View the LGPD center.",
          "Access the user area.",
          "Contact the house by official email.",
        ],
      },
    ],
  },
};

export function getLocalizedContentPage(slug: string, locale: Locale): ContentPage | null {
  if (locale === "en" && englishContentPages[slug]) {
    return englishContentPages[slug];
  }

  return contentPages[slug] ?? null;
}
