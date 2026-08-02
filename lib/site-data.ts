export type NavItem = {
  href: string;
  label: string;
  labelEn?: string;
  icon?: "user";
  primary?: boolean;
  group?: "institucional";
};

export type FeatureCard = {
  href: string;
  title: string;
  description: string;
  icon: "group" | "calendar" | "heart" | "live" | "book" | "mail" | "user";
};

export type ScheduleItem = {
  title: string;
  when: string;
  description: string;
};

export type PageSection = {
  heading: string;
  text: string;
  bullets?: string[];
};

export type ContentPage = {
  title: string;
  summary: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  sections: PageSection[];
};

const publicCacheVersion = "20260510";

export const site = {
  name: "Grupo Espírita Elias Francis",
  shortName: "GEEF",
  address: "Rua Gwyer de Azevedo, 35, Centro, Santa Maria Madalena-RJ, Brasil",
  email: "contatogeef@gmail.com",
  phone: "(22) 99725-1807",
  youtube: "www.youtube.com/@GrupoEspiritaEliasFrancis",
  instagram: "@grupoespiritaeliasfrancis",
  facebook: "@grupoespiritaeliasfrancis",
};

export function publicHref(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const [pathname, hash = ""] = path.split("#", 2);
  const separator = pathname.includes("?") ? "&" : "?";
  const query = `v=${publicCacheVersion}`;
  return `${pathname}${separator}${query}${hash ? `#${hash}` : ""}`;
}

export const navItems: NavItem[] = [
  // Primary navigation (visible in header bar on desktop)
  { href: "/quem-somos", label: "Quem somos", labelEn: "About us", primary: true },
  { href: "/agenda", label: "Agenda", labelEn: "Schedule", primary: true },
  { href: "/atividades", label: "Atividades", labelEn: "Activities", primary: true },
  { href: "/evangelizacao", label: "Evangelização", labelEn: "Evangelization", primary: true },
  { href: "/atendimento-fraterno", label: "Atendimento fraterno", labelEn: "Fraternal care", primary: true },

  // Institutional group (in "Mais" dropdown, ordered by relevance)
  { href: "/institucional", label: "Credibilidade e Filiações", labelEn: "Credibility and affiliations", group: "institucional" },
  { href: "/identidade-visual", label: "Identidade visual", labelEn: "Visual identity", group: "institucional" },
  { href: "/escalas", label: "Escalas", labelEn: "Shifts", group: "institucional" },
  { href: "/ao-vivo", label: "Ao vivo", labelEn: "Live", group: "institucional" },
  { href: "/estudos", label: "Estudos", labelEn: "Studies", group: "institucional" },
  { href: "/musicas", label: "Músicas", labelEn: "Songs", group: "institucional" },
  { href: "/doacoes", label: "Doações", labelEn: "Donations", group: "institucional" },
  { href: "/lgpd", label: "Privacidade", labelEn: "Privacy", group: "institucional" },
  { href: "/cookies", label: "Cookies", labelEn: "Cookies", group: "institucional" },

  // User profile (hidden from nav, used by site-header for button)
  { href: "/perfil", label: "Perfil do usuário", labelEn: "User profile", icon: "user" },
];

export const featureCards: FeatureCard[] = [
  {
    href: publicHref("/quem-somos"),
    title: "Quem somos",
    description: "Missão, valores e história da casa.",
    icon: "group",
  },
  {
    href: publicHref("/agenda"),
    title: "Agenda",
    description: "Reuniões públicas, estudos e eventos.",
    icon: "calendar",
  },
  {
    href: publicHref("/atendimento-fraterno"),
    title: "Atendimento fraterno",
    description: "Escuta, acolhimento e orientação.",
    icon: "heart",
  },
  {
    href: publicHref("/ao-vivo"),
    title: "Ao vivo",
    description: "Transmissões e gravações no YouTube.",
    icon: "live",
  },
  {
    href: publicHref("/estudos"),
    title: "Estudos",
    description: "Evangelho, doutrina e formação contínua.",
    icon: "book",
  },
  {
    href: publicHref("/contato"),
    title: "Contato",
    description: "Endereço, telefone e redes sociais.",
    icon: "mail",
  },
  {
    href: publicHref("/perfil"),
    title: "Perfil do usuário",
    description: "Base profissional para login, sessão e preferências.",
    icon: "user",
  },
];

export const schedule: ScheduleItem[] = [
  {
    title: "Estudo doutrinário",
    when: "Terças, 19h30",
    description: "Leitura, conversa e reflexão sobre a Doutrina Espírita.",
  },
  {
    title: "Palestra pública",
    when: "Quintas-feiras, 19h00",
    description: "Palestra pública, acolhimento e encerramento com prece.",
  },
  {
    title: "Atendimento fraterno",
    when: "Sob agendamento",
    description: "Escuta individual para quem busca apoio e orientação.",
  },
  {
    title: "Evangelização",
    when: "jovens, quinta 16h30 - infantil, 19h00",
    description: "Atividades e estudo voltados para crianças e jovens.",
  },
];

export const contentPages: Record<string, ContentPage> = {
  "quem-somos": {
    title: "Quem somos",
    summary: "Conheça a história, a missão, os valores e a forma de trabalho da casa.",
    intro:
      "O Grupo Espírita Elias Francis é uma casa de estudo, acolhimento e serviço fraterno. Nossa atuação prioriza a simplicidade, o respeito, a caridade e a continuidade de uma história marcada por presença e serviço.",
    ctaLabel: "Ver agenda",
    ctaHref: publicHref("/agenda"),
    sections: [
      {
        heading: "Nossa missão",
        text: "Acolher, estudar e servir, oferecendo uma referência segura para quem busca orientação espiritual e convivência fraterna.",
      },
      {
        heading: "Nossa história",
        text: "A casa preserva a memória de um trabalho espiritual que nasceu da dedicação fraterna e se consolidou como ponto de encontro para estudo, assistência e evangelização.",
        bullets: [
          "Origem ligada ao trabalho de Elias Francis.",
          "Caminho sustentado por continuidade e simplicidade.",
          "Compromisso com presença fraterna e serviço à comunidade.",
        ],
      },
      {
        heading: "Nossos valores",
        text: "Toda a comunicação da casa deve refletir serenidade, clareza e respeito pela trajetória da instituição.",
        bullets: [
          "Caridade sem ostentação.",
          "Estudo com disciplina e humildade.",
          "Acolhimento sem burocracia.",
          "Comunicação clara e confiável.",
        ],
      },
      {
        heading: "Como trabalhamos",
        text: "Valorizamos a leitura, a prática do evangelho e o atendimento humano, sem complicar o acesso à casa.",
        bullets: [
          "Reuniões públicas abertas.",
          "Estudos regulares.",
          "Atendimento fraterno com escuta.",
          "Evangelização e convivência para diferentes faixas etárias.",
        ],
      },
    ],
  },
  agenda: {
    title: "Agenda",
    summary: "Agenda inicial das atividades públicas.",
    intro:
      "A agenda abaixo é uma base simples para o site público. Ela pode depois ser mantida manualmente ou integrada ao fluxo administrativo.",
    ctaLabel: "Falar com a casa",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Programação semanal",
        text: "A programação foi pensada para ser clara no celular e útil para o visitante que chega pela primeira vez.",
        bullets: schedule.map((item) => `${item.title} - ${item.when}`),
      },
      {
        heading: "Observações",
        text: "Eventos especiais, datas comemorativas e transmissões ao vivo podem ser destacados na página inicial.",
      },
    ],
  },
  atividades: {
    title: "Atividades",
    summary: "Atividades fixas e encontros públicos da casa.",
    intro:
      "As atividades organizam o fluxo da casa e ajudam o visitante a entender rapidamente o que acontece em cada horário.",
    ctaLabel: "Ver estudos",
    ctaHref: publicHref("/estudos"),
    sections: [
      {
        heading: "O que oferecemos",
        text: "A base inicial contempla estudo, reunião pública, evangelização, atendimento e ações de acolhimento.",
        bullets: [
          "Palestras e estudo da doutrina.",
          "Evangelização de crianças e jovens.",
          "Atendimento fraterno e acolhimento.",
          "Transmissões ao vivo quando houver evento.",
        ],
      },
    ],
  },
  estudos: {
    title: "Estudos",
    summary: "Leituras e encontros de formação contínua.",
    intro:
      "Os estudos sustentam a vida da casa e permitem crescer com método, serenidade e disciplina.",
    ctaLabel: "Ir para evangelização",
    ctaHref: publicHref("/evangelizacao"),
    sections: [
      {
        heading: "Linhas de estudo",
        text: "O site já fica preparado para informar temas, séries e encontros especiais.",
        bullets: [
          "Evangelho no lar.",
          "Estudo da doutrina espírita.",
          "Leituras orientadas.",
        ],
      },
    ],
  },
  evangelizacao: {
    title: "Evangelização",
    summary: "Espaço de formação e convivência para crianças e jovens.",
    intro:
      "A evangelização é uma das frentes mais importantes da formação moral e social dentro da casa espírita.",
    ctaLabel: "Falar com atendimento",
    ctaHref: publicHref("/atendimento-fraterno"),
    sections: [
      {
        heading: "Proposta",
        text: "Organizar encontros simples, acolhedores e consistentes para crianças, jovens e famílias.",
      },
    ],
  },
  "atendimento-fraterno": {
    title: "Atendimento fraterno",
    summary: "Orientação e acolhimento com respeito e simplicidade.",
    intro:
      "O atendimento fraterno é um espaço de escuta humana e orientação inicial. O site já deixa isso visível sem burocracia.",
    ctaLabel: "Entrar em contato",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Como funciona",
        text: "O visitante encontra uma porta aberta para solicitar conversa e acolhimento em horário combinado.",
        bullets: [
          "Escuta respeitosa.",
          "Orientação inicial.",
          "Encaminhamento para estudos ou apoio apropriado.",
        ],
      },
    ],
  },
  "reuniao-publica": {
    title: "Reunião pública",
    summary: "Programação, música, leitura e acolhimento em uma mesma experiência.",
    intro: "A reunião pública organiza os momentos de estudo, reflexão e convivência da casa para quem chega presencialmente ou acompanha à distância.",
    ctaLabel: "Ver programação",
    ctaHref: publicHref("/agenda"),
    sections: [
      {
        heading: "Acompanhe a reunião",
        text: "Consulte a agenda, as músicas e as leituras relacionadas a cada encontro.",
        bullets: ["Programação pública.", "Músicas e leituras.", "Transmissões quando disponíveis."],
      },
    ],
  },
  biblioteca: {
    title: "Biblioteca e conteúdos",
    summary: "Materiais para leitura, estudo e formação espírita.",
    intro: "A biblioteca reúne conteúdos que ajudam a casa a estudar com serenidade, continuidade e acesso simples.",
    ctaLabel: "Abrir área do leitor",
    ctaHref: publicHref("/leitor"),
    sections: [
      {
        heading: "Conteúdos disponíveis",
        text: "Encontre leituras, músicas e estudos organizados para consulta pública.",
        bullets: ["Área do leitor.", "Catálogo de músicas.", "Estudos e materiais de apoio."],
      },
    ],
  },
  participe: {
    title: "Participe",
    summary: "Encontre a casa, acompanhe a agenda e fale conosco.",
    intro: "A participação começa com informação clara: veja a agenda, conheça as formas de apoio e encontre os canais oficiais.",
    ctaLabel: "Falar com a casa",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Como participar",
        text: "Escolha uma atividade, acompanhe a programação ou entre em contato com a equipe.",
        bullets: ["Agenda pública.", "Doações.", "Contato e acolhimento."],
      },
    ],
  },
  doacoes: {
    title: "Doações",
    summary: "Apoio simples e transparente à manutenção da casa.",
    intro:
      "A página de doações começa informativa. Quando houver decisão operacional, ela pode ganhar fluxo mais completo.",
    ctaLabel: "Ir para contato",
    ctaHref: publicHref("/contato"),
    sections: [
      {
        heading: "Uso das contribuições",
        text: "Manutenção da casa, apoio às atividades e pequenos custos operacionais da rotina.",
      },
    ],
  },
  "ao-vivo": {
    title: "Ao vivo",
    summary: "Transmissões e gravações em vídeo.",
    intro:
      "Eventos ao vivo e gravações podem ser divulgados aqui com link direto para o canal do YouTube.",
    ctaLabel: "Abrir YouTube",
    ctaHref: `https://www.youtube.com/@GrupoEspiritaEliasFrancis`,
    sections: [
      {
        heading: "Canal",
        text: "Use esta página como vitrine simples para transmissões, palestras e gravações de encontros relevantes.",
      },
    ],
  },
  contato: {
    title: "Contato",
    summary: "Como falar com a casa e chegar até o espaço físico.",
    intro:
      "O contato inicial deve ser fácil, claro e disponível no primeiro clique.",
    ctaLabel: "Ver LGPD",
    ctaHref: publicHref("/lgpd"),
    sections: [
      {
        heading: "Informações",
        text: "Telefone, e-mail, endereço e redes sociais estão reunidos abaixo para uso rápido.",
      },
    ],
  },
  lgpd: {
    title: "LGPD",
    summary: "Central pública de privacidade, direitos do titular e tratamento de dados.",
    intro:
      "Aqui estão os pontos essenciais sobre como o GEEF trata dados pessoais, o que pode ser coletado, por quanto tempo fica guardado e como você pode pedir correção, acesso ou revogação.",
    ctaLabel: "Abrir privacidade",
    ctaHref: publicHref("/privacidade"),
    sections: [
      {
        heading: "O que tratamos",
        text: "Coletamos apenas o necessário para contato, acesso ao site, atendimento, consentimentos, voluntariado, documentos e áreas administrativas autorizadas.",
        bullets: [
          "Dados de cadastro e contato.",
          "Dados de acesso e autenticação.",
          "Consentimentos e termos assinados.",
          "Registros operacionais e de auditoria.",
        ],
      },
      {
        heading: "Seus direitos",
        text: "Você pode pedir confirmação, acesso, correção, eliminação quando cabível, informação sobre compartilhamentos e revogação de consentimento.",
        bullets: [
          "Solicitar cópia ou revisão dos seus dados.",
          "Corrigir dados desatualizados.",
          "Revogar consentimentos concedidos.",
          "Perguntar como os dados foram usados.",
        ],
      },
      {
        heading: "Segurança e retenção",
        text: "Mantemos acesso restrito, usamos os dados só para a finalidade informada e eliminamos ou arquivamos conforme a necessidade operacional e legal.",
        bullets: [
          "Acesso limitado por perfil e função.",
          "Dados sensíveis passam por revisão reforçada.",
          "Logs e auditoria ficam separados do conteúdo principal.",
          "Incidentes relevantes seguem fluxo formal de resposta.",
        ],
      },
      {
        heading: "Contato LGPD",
        text: "Se você quiser exercer um direito ou esclarecer o uso de um dado pessoal, fale com a casa pelo canal oficial de contato.",
        bullets: [
          "E-mail: contatogeef@gmail.com",
          "Telefone: (22) 99725-1807",
          "Endereço: Rua Gwyer de Azevedo, 35, Centro, Santa Maria Madalena-RJ",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    summary: "Preferências de cookies, categorias e escolhas do visitante.",
    intro:
      "Aqui explicamos quais cookies são necessários para o funcionamento do site e quais dependem de escolha ativa do visitante.",
    ctaLabel: "Gerenciar preferências",
    ctaHref: publicHref("/cookies"),
    sections: [
      {
        heading: "Categorias",
        text: "Cookies essenciais permanecem ativos para navegação, login, segurança e acesso às áreas restritas. Os demais dependem de consentimento.",
        bullets: [
          "Essenciais: sessão, segurança e preferências básicas.",
          "Marketing: comunicações e campanhas.",
          "Analytics: medição não essencial.",
          "Rastreamento: remarketing e atribuição de campanhas.",
        ],
      },
      {
        heading: "Como controlar",
        text: "No primeiro acesso, o visitante pode aceitar todos, rejeitar os não essenciais ou escolher categoria por categoria.",
        bullets: [
          "Aceitar todos.",
          "Rejeitar não essenciais.",
          "Gerenciar preferências a qualquer momento.",
        ],
      },
      {
        heading: "Atualizações",
        text: "Se novas finalidades forem adicionadas, a política e o banner serão atualizados antes do uso.",
      },
      {
        heading: "Contato",
        text: "Dúvidas sobre cookies e privacidade podem ser encaminhadas pelos canais oficiais da casa.",
        bullets: [
          "E-mail: contatogeef@gmail.com",
          "Telefone: (22) 99725-1807",
        ],
      },
    ],
  },
  privacidade: {
    title: "Privacidade",
    summary: "Diretrizes de privacidade, consentimento e cuidado com dados.",
    intro:
      "Esta página detalha como o site público trata seus dados pessoais e quando o GEEF pode registrar consentimento, contato ou preferência do usuário.",
    ctaLabel: "Ver central LGPD",
    ctaHref: publicHref("/lgpd"),
    sections: [
      {
        heading: "Princípios",
        text: "Coletar o mínimo necessário, explicar o uso dos dados e manter canais de contato simples.",
        bullets: [
          "Dados usados apenas para contato e atendimento.",
          "Sem coleta desnecessária no site público.",
          "Consentimento e finalidade claros quando houver formulários.",
        ],
      },
      {
        heading: "Como usamos os dados",
        text: "O site usa dados para login, recuperação de acesso, exibição da área do usuário e registro de consentimentos quando houver fluxo explícito.",
        bullets: [
          "Login e recuperação de senha.",
          "Área do usuário e preferências.",
          "Consentimentos e termos assinados.",
          "Registros de auditoria e segurança.",
        ],
      },
      {
        heading: "O que não fazemos",
        text: "Não usamos os dados para finalidades ocultas nem exibimos informação pessoal desnecessária em páginas públicas.",
        bullets: [
          "Não vendemos dados.",
          "Não publicamos conteúdo sensível sem base e autorização.",
          "Não mantemos dado por prazo indefinido sem motivo.",
        ],
      },
      {
        heading: "Canal de atendimento",
        text: "Se quiser revisar, corrigir ou revogar consentimento, use o contato oficial ou a área autenticada do usuário.",
        bullets: [
          "Ver a central LGPD.",
          "Acessar a área do usuário.",
          "Falar com a casa pelo e-mail oficial.",
        ],
      },
    ],
  },
};

export const publicSlugs = Object.keys(contentPages);
