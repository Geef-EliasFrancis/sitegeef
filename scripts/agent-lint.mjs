#!/usr/bin/env node

const MODULES = {
  public: {
    title: "Public site",
    files: [
      "app/page.tsx",
      "app/[slug]/page.tsx",
      "components/site-shell.tsx",
      "components/site-header.tsx",
      "components/content-page.tsx",
      "styles/globals.css",
      "styles/site-header.css",
    ],
    layout: "app/layout.tsx -> components/site-shell.tsx",
    cache: "Public pages use short cache only where data is derived from Supabase.",
    owner: "site/public",
    mustInvalidate: ["public-escalas", "/escalas", "/minha-area", "/leitor"],
    css: ["styles/globals.css", "styles/site-header.css"],
    writeActions: [],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/INDEX.md", "docs/reference/THEME_SYSTEM.md"],
    notes: [
      "Use site-geef-ui-ux for visual changes.",
      "Keep light theme readable; avoid pure white cards.",
      "Do not pull admin auth/session logic into public shell.",
    ],
  },
  auth: {
    title: "Auth",
    files: [
      "app/login/page.tsx",
      "components/auth/login-form.tsx",
      "app/login/actions.ts",
      "app/auth/callback/route.ts",
      "components/user-menu.tsx",
    ],
    layout: "app/layout.tsx -> app/login/layout? none -> app/login/page.tsx",
    cache: "Login is request-time; do not cache auth state.",
    owner: "auth/login",
    mustInvalidate: ["/login", "/perfil", "/", "layout"],
    css: ["styles/globals.css"],
    writeActions: ["app/login/actions.ts", "app/auth/callback/route.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/integrations/GOOGLE_OAUTH_SETUP.md"],
    notes: [
      "Keep login compact and modal-like when possible.",
      "Preserve nextUrl redirects and OAuth callback sanitation.",
    ],
  },
  dashboard: {
    title: "Admin dashboard",
    files: [
      "app/admin/page.tsx",
      "lib/admin/dashboard.ts",
      "lib/admin/cache.ts",
      "app/admin/layout.tsx",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx",
    cache: "Dashboard uses lib/admin/dashboard.ts and lib/admin/cache.ts.",
    owner: "admin/dashboard",
    mustInvalidate: ["admin-dashboard", "/admin"],
    css: ["styles/admin.css", "styles/admin-sidebar.css"],
    writeActions: ["app/admin/pessoas/actions.ts", "app/admin/funcoes/actions.ts", "app/admin/escalas/actions.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md", "docs/archive/status/STATUS.md"],
    notes: [
      "Dashboard data should use short cache only.",
      "Invalidate dashboard on writes in pessoas, funcoes and escalas.",
    ],
  },
  biblioteca: {
    title: "Biblioteca",
    files: [
      "app/admin/biblioteca/page.tsx",
      "app/admin/biblioteca/actions.ts",
      "app/admin/biblioteca/emprestimos/actions.ts",
      "app/admin/biblioteca/reservas/actions.ts",
      "lib/admin/cache.ts",
      "app/admin/biblioteca/layout.tsx",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx -> app/admin/biblioteca/layout.tsx",
    cache: "List views use short cache. Form helpers stay request-time.",
    owner: "admin/biblioteca",
    mustInvalidate: ["admin-biblioteca", "/admin/biblioteca", "/admin/biblioteca/emprestimos", "/admin/biblioteca/reservas", "/minha-area", "/leitor"],
    css: ["styles/admin.css", "styles/admin-sidebar.css", "styles/globals.css"],
    writeActions: [
      "app/admin/biblioteca/actions.ts",
      "app/admin/biblioteca/emprestimos/actions.ts",
      "app/admin/biblioteca/reservas/actions.ts",
    ],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md", "docs/INDEX.md"],
    notes: [
      "Cache list views only; keep form helpers request-time.",
      "Invalidate on obra, exemplar, emprestimo and reserva writes.",
    ],
  },
  documentos: {
    title: "Documentos",
    files: [
      "app/admin/documentos/page.tsx",
      "app/admin/documentos/actions.ts",
      "lib/admin/cache.ts",
      "app/admin/documentos/layout.tsx",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx -> app/admin/documentos/layout.tsx",
    cache: "List views use short cache. Form selects stay request-time.",
    owner: "admin/documentos",
    mustInvalidate: ["admin-documentos", "/admin/documentos", "/admin/documentos/termos", "/admin/documentos/consentimentos", "/admin/documentos/voluntariado", "/minha-area"],
    css: ["styles/admin.css", "styles/admin-sidebar.css", "styles/globals.css"],
    writeActions: ["app/admin/documentos/actions.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md", "docs/operations/migrations/APPLY_MIGRATION.md"],
    notes: [
      "Cache list views only; keep selects for forms dynamic.",
      "Invalidate on modelo, termo, consentimento and servico writes.",
    ],
  },
  pessoas: {
    title: "Pessoas",
    files: [
      "app/admin/pessoas/page.tsx",
      "app/admin/pessoas/actions.ts",
      "lib/admin/cache.ts",
      "lib/areas/invalidate-user-area.ts",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx",
    cache: "Writes affect dashboard, biblioteca, documentos and user area.",
    owner: "cadastro/pessoas",
    mustInvalidate: ["admin-dashboard", "admin-biblioteca", "admin-documentos", "user-area", "/admin/pessoas"],
    css: ["styles/admin.css", "styles/admin-sidebar.css", "styles/globals.css"],
    writeActions: ["app/admin/pessoas/actions.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md", "docs/operations/testing/README_TESTES.md"],
    notes: [
      "Writes affect dashboard, biblioteca, documentos and user area.",
    ],
  },
  funcoes: {
    title: "Funcoes e temas",
    files: [
      "app/admin/funcoes/page.tsx",
      "app/admin/funcoes/actions.ts",
      "lib/admin/cache.ts",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx",
    cache: "Writes affect dashboard counters.",
    owner: "cadastro/funcoes",
    mustInvalidate: ["admin-dashboard", "/admin/funcoes", "/admin/funcoes/temas"],
    css: ["styles/admin.css", "styles/admin-sidebar.css"],
    writeActions: ["app/admin/funcoes/actions.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md"],
    notes: [
      "Writes affect dashboard counters.",
    ],
  },
  escalas: {
    title: "Escalas",
    files: [
      "app/admin/escalas/page.tsx",
      "app/admin/escalas/actions.ts",
      "app/escalas/page.tsx",
      "lib/escalas/public-escalas.ts",
      "lib/admin/cache.ts",
      "lib/areas/invalidate-user-area.ts",
    ],
    layout: "app/layout.tsx -> app/admin/layout.tsx",
    cache: "Public escalas uses lib/escalas/public-escalas.ts; admin writes invalidate tags.",
    owner: "operacao/escalas",
    mustInvalidate: ["public-escalas", "admin-dashboard", "user-area", "/escalas", "/admin/escalas"],
    css: ["styles/admin.css", "styles/admin-sidebar.css", "styles/globals.css"],
    writeActions: ["app/admin/escalas/actions.ts", "lib/escalas/public-escalas.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md", "docs/operations/migrations/MIGRATION_GUIDE.md"],
    notes: [
      "Public page uses cached helper with tag public-escalas.",
      "Writes invalidate public, admin and user-area views.",
    ],
  },
  theme: {
    title: "Theme and tokens",
    files: [
      "styles/theme.css",
      "styles/globals.css",
      "styles/admin.css",
      "styles/site-header.css",
      "lib/theme/colors.ts",
      "lib/theme/theme-provider.tsx",
    ],
    layout: "styles/theme.css -> styles/globals.css -> styles/admin.css",
    cache: "Theme is global; changing tokens can affect public and admin surfaces.",
    owner: "design/theme",
    mustInvalidate: ["all-surface-css"],
    css: ["styles/theme.css", "styles/globals.css", "styles/admin.css", "styles/site-header.css"],
    writeActions: [],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/INDEX.md", "docs/reference/THEME_SYSTEM.md"],
    notes: [
      "Prefer tokens over hardcoded colors.",
      "In light theme, avoid pure white surfaces when possible.",
    ],
  },
  supabase: {
    title: "Supabase plumbing",
    files: [
      "lib/supabase/server.ts",
      "lib/supabase/client.ts",
      "lib/supabase/service-role.ts",
      "lib/admin/cache.ts",
      "lib/areas/user-area.ts",
      "lib/areas/invalidate-user-area.ts",
    ],
    layout: "lib/supabase/server.ts | lib/supabase/service-role.ts",
    cache: "Server client is session-aware; service-role is for server-only cached reads.",
    owner: "infra/supabase",
    mustInvalidate: ["admin-dashboard", "admin-biblioteca", "admin-documentos", "user-area", "public-escalas"],
    css: [],
    writeActions: ["lib/admin/cache.ts", "lib/areas/invalidate-user-area.ts", "lib/escalas/public-escalas.ts", "lib/areas/user-area.ts"],
    docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/INDEX.md", "docs/operations/migrations/APPLY_MIGRATION.md", "docs/operations/migrations/MIGRATION_GUIDE.md"],
    notes: [
      "Server client is for session-aware reads.",
      "Service role is for cacheable server-only helpers.",
      "Do not expose service_role in browser code.",
    ],
  },
};

function normalize(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-");
}

function normalizePath(input) {
  return String(input || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^c:[/]/i, "")
    .toLowerCase();
}

function findModule(query) {
  const normalized = normalize(query);
  if (!normalized) return null;

  if (MODULES[normalized]) return { key: normalized, data: MODULES[normalized] };

  const entry = Object.entries(MODULES).find(([key, value]) => {
    const haystack = [key, value.title, ...value.files, ...value.notes].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });

  return entry ? { key: entry[0], data: entry[1] } : null;
}

function findModuleByPath(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized) return null;

  if (normalized.startsWith("app/admin/biblioteca/emprestimos")) {
    return { key: "biblioteca", data: MODULES.biblioteca };
  }

  if (normalized.startsWith("app/admin/biblioteca/reservas")) {
    return { key: "biblioteca", data: MODULES.biblioteca };
  }

  if (normalized.startsWith("app/admin/biblioteca")) {
    return { key: "biblioteca", data: MODULES.biblioteca };
  }

  if (normalized.startsWith("app/admin/documentos")) {
    return { key: "documentos", data: MODULES.documentos };
  }

  if (normalized.startsWith("app/admin/escalas") || normalized.startsWith("app/escalas")) {
    return { key: "escalas", data: MODULES.escalas };
  }

  if (normalized.startsWith("app/admin/pessoas")) {
    return { key: "pessoas", data: MODULES.pessoas };
  }

  if (normalized.startsWith("app/admin/funcoes")) {
    return { key: "funcoes", data: MODULES.funcoes };
  }

  if (normalized.startsWith("app/admin")) {
    const adminSection = normalized.split("/")[2] || "admin";
    const mapped = MODULES[adminSection];
    if (mapped) {
      return { key: adminSection, data: mapped };
    }
    return {
      key: adminSection,
      data: {
        title: `Admin module: ${adminSection}`,
        files: [filePath.replace(/\\/g, "/")],
        layout: "app/layout.tsx -> app/admin/layout.tsx",
        cache: "No dedicated helper mapped yet. Prefer adding a module cache helper in lib/admin/cache.ts or the domain folder.",
        css: ["styles/admin.css", "styles/admin-sidebar.css", "styles/globals.css"],
        writeActions: [],
        docs: ["HANDOFF.md", "docs/AGENT_PLAYBOOK.md", "docs/MODULE_MAP.md", "docs/baseerp.md"],
        notes: [
          "This admin area is not mapped explicitly yet.",
          "Check whether it should reuse dashboard, biblioteca, documentos, pessoas or escalas patterns.",
        ],
      },
    };
  }

  if (normalized.startsWith("app/login") || normalized.startsWith("components/auth") || normalized.startsWith("components/user-menu")) {
    return { key: "auth", data: MODULES.auth };
  }

  if (
    normalized.startsWith("app/page.tsx") ||
    normalized.startsWith("app/[slug]/page.tsx") ||
    normalized.startsWith("components/site-shell") ||
    normalized.startsWith("components/site-header") ||
    normalized.startsWith("components/content-page") ||
    normalized.startsWith("styles/globals.css") ||
    normalized.startsWith("styles/site-header.css")
  ) {
    return { key: "public", data: MODULES.public };
  }

  if (
    normalized.startsWith("styles/theme.css") ||
    normalized.startsWith("lib/theme/colors") ||
    normalized.startsWith("lib/theme/theme-provider")
  ) {
    return { key: "theme", data: MODULES.theme };
  }

  if (
    normalized.startsWith("lib/supabase/server") ||
    normalized.startsWith("lib/supabase/service-role") ||
    normalized.startsWith("lib/supabase/client")
  ) {
    return { key: "supabase", data: MODULES.supabase };
  }

  return null;
}

function inferLayoutChain(filePath, moduleKey) {
  const normalized = normalizePath(filePath);
  const chain = [];

  if (normalized.startsWith("app/")) {
    chain.push("app/layout.tsx");
  }

  if (normalized.startsWith("app/admin/")) {
    chain.push("app/admin/layout.tsx");
  }

  if (moduleKey === "biblioteca") {
    chain.push("app/admin/biblioteca/layout.tsx");
  } else if (moduleKey === "documentos") {
    chain.push("app/admin/documentos/layout.tsx");
  }

  if (normalized.startsWith("components/site-shell") || normalized.startsWith("components/site-header") || normalized.startsWith("components/content-page")) {
    chain.push("components/site-shell.tsx");
  }

  return [...new Set(chain)];
}

function inferRelatedFiles(filePath, moduleKey) {
  const normalized = normalizePath(filePath);
  const related = new Set();

  if (normalized.endsWith("/actions.ts")) {
    related.add(normalized.replace(/\/actions\.ts$/, "/page.tsx"));
  }

  if (normalized.endsWith("/page.tsx")) {
    related.add(normalized.replace(/\/page\.tsx$/, "/actions.ts"));
    related.add(normalized.replace(/\/page\.tsx$/, "/layout.tsx"));
  }

  if (normalized.includes("/novo")) {
    related.add(normalized.replace(/\/novo\/page\.tsx$/, "/page.tsx"));
  }

  if (normalized.includes("/editar")) {
    related.add(normalized.replace(/\/editar\/page\.tsx$/, "/page.tsx"));
  }

  if (moduleKey === "biblioteca") {
    related.add("app/admin/biblioteca/actions.ts");
    related.add("app/admin/biblioteca/emprestimos/actions.ts");
    related.add("app/admin/biblioteca/reservas/actions.ts");
  }

  if (moduleKey === "documentos") {
    related.add("app/admin/documentos/actions.ts");
  }

  if (moduleKey === "escalas") {
    related.add("app/admin/escalas/actions.ts");
    related.add("lib/escalas/public-escalas.ts");
  }

  if (moduleKey === "public") {
    related.add("components/site-shell.tsx");
    related.add("components/site-header.tsx");
    related.add("components/content-page.tsx");
  }

  return [...related].filter(Boolean);
}

function inferChecklist(moduleKey, filePath) {
  const base = [
    "Confirmar o arquivo raiz e o layout pai antes de editar.",
    "Checar se existe helper em lib/ antes de duplicar leitura.",
    "Validar se a mudanca afeta cache, paths ou permissao.",
    "Executar npm run build no final.",
  ];

  if (moduleKey === "public") {
    return [
      "Reusar site-geef-ui-ux para a mudanca visual.",
      "Revisar header, hero e cards antes de mexer em componentes locais.",
      "Evitar branco puro em cards e painéis.",
      ...base,
    ];
  }

  if (moduleKey === "dashboard") {
    return [
      "Ver se a stat vem de lib/admin/dashboard.ts.",
      "Confirmar qual write action invalida o dashboard.",
      "Checar se a pagina precisa continuar dinamica.",
      ...base,
    ];
  }

  if (moduleKey === "biblioteca") {
    return [
      "Separar listagem, emprestimo e reserva antes de editar.",
      "Verificar se o helper atual e listagem cacheada ou formulario request-time.",
      "Conferir se a escrita invalida biblioteca e area do usuario.",
      ...base,
    ];
  }

  if (moduleKey === "documentos") {
    return [
      "Distinguir lista principal de selects de formulario.",
      "Confirmar se a tela pode ser cacheada ou deve continuar dinamica.",
      "Conferir invalidateAdminDocumentosCache e invalidateUserAreaCache.",
      ...base,
    ];
  }

  if (moduleKey === "escalas") {
    return [
      "Separar rota publica de rota admin.",
      "Checar tag public-escalas e invalida da area do usuario.",
      "Conferir se a pagina precisa permanecer force-dynamic ou cacheada.",
      ...base,
    ];
  }

  return base;
}

function inferRecommendation(moduleKey, filePath) {
  const normalized = normalizePath(filePath);

  if (moduleKey === "public") {
    return {
      nextFile: "components/site-shell.tsx",
      risk: "Mudar layout publico sem alinhar tokens e header pode piorar contraste e hierarquia.",
    };
  }

  if (moduleKey === "auth") {
    return {
      nextFile: "components/auth/login-form.tsx",
      risk: "Ajustar login sem preservar nextUrl e callback pode quebrar redirecionamento.",
    };
  }

  if (moduleKey === "dashboard") {
    return {
      nextFile: "lib/admin/dashboard.ts",
      risk: "Mexer na pagina sem atualizar o helper cacheado pode causar dados inconsistentes.",
    };
  }

  if (moduleKey === "biblioteca") {
    if (normalized.includes("/emprestimos")) {
      return {
        nextFile: "app/admin/biblioteca/emprestimos/actions.ts",
        risk: "A listagem e o formulario podem divergir se a invalidacao nao cobrir emprestimos e reservas.",
      };
    }

    if (normalized.includes("/reservas")) {
      return {
        nextFile: "app/admin/biblioteca/reservas/actions.ts",
        risk: "Reservas dependem da fila e da situacao do exemplar, então a invalidacao precisa ser completa.",
      };
    }

    return {
      nextFile: "app/admin/biblioteca/actions.ts",
      risk: "Separar listagem e formularios evita cachear selects sensiveis por engano.",
    };
  }

  if (moduleKey === "documentos") {
    if (normalized.includes("/termos")) {
      return {
        nextFile: "app/admin/documentos/actions.ts",
        risk: "Termos mudam muito entre lista e detalhe; cache errado pode esconder revogacoes.",
      };
    }

    if (normalized.includes("/consentimentos")) {
      return {
        nextFile: "app/admin/documentos/actions.ts",
        risk: "Consentimentos precisam invalidar a area do usuario e o modulo inteiro ao mesmo tempo.",
      };
    }

    return {
      nextFile: "app/admin/documentos/actions.ts",
      risk: "Nao cachear selects de formulario evita build quebrando e inconsistencias em listas sensiveis.",
    };
  }

  if (moduleKey === "pessoas") {
    return {
      nextFile: "app/admin/pessoas/actions.ts",
      risk: "Pessoas impactam dashboard, biblioteca, documentos e area do usuario ao mesmo tempo.",
    };
  }

  if (moduleKey === "funcoes") {
    return {
      nextFile: "app/admin/funcoes/actions.ts",
      risk: "Funcoes e temas alimentam dashboard e escalas; cache local sem invalida pode atrasar a visibilidade.",
    };
  }

  if (moduleKey === "escalas") {
    return {
      nextFile: "app/admin/escalas/actions.ts",
      risk: "Escalas precisam sincronizar publico, admin e area do usuario; um cache parcial quebra a consistencia.",
    };
  }

  if (moduleKey === "theme") {
    return {
      nextFile: "styles/globals.css",
      risk: "Tokens globais impactam tudo; uma mudanca pequena pode degradar contraste em varias telas.",
    };
  }

  if (moduleKey === "supabase") {
    return {
      nextFile: "lib/admin/cache.ts",
      risk: "Trocar a estrategia de acesso sem separar sessão e service-role pode expor dados ou quebrar o SSR.",
    };
  }

  return {
    nextFile: MODULES[moduleKey]?.files?.[0] || null,
    risk: "Validar o modulo antes de refatorar evita misturar responsabilidades.",
    mustInvalidate: MODULES[moduleKey]?.mustInvalidate || [],
  };
}

function printHelp() {
  console.log("Uso: npm run agent:lint -- <modulo|caminho>");
  console.log("Ou:  npm run agent:lint -- --json <modulo|caminho>");
  console.log("");
  console.log("Modulos disponiveis:");
  for (const [key, value] of Object.entries(MODULES)) {
    console.log(`- ${key}: ${value.title}`);
  }
}

const args = process.argv.slice(2);
const jsonMode = args.includes("--json") || process.env.npm_config_json === "true";
const query = args.filter((arg) => arg !== "--json").join(" ");

if (!query) {
  printHelp();
  process.exit(0);
}

const match = query.includes("/") || query.includes("\\") ? findModuleByPath(query) : findModule(query);

if (!match) {
  console.log(`Nenhum modulo mapeado para: ${query}`);
  console.log("");
  printHelp();
  process.exit(1);
}

const { key, data } = match;
const relatedFiles = query.includes("/") || query.includes("\\")
  ? inferRelatedFiles(query, key)
  : data.files.slice(0, 4);
const layoutChain = query.includes("/") || query.includes("\\")
  ? inferLayoutChain(query, key)
  : [];

const output = {
  key,
  title: data.title,
  files: data.files,
  layout: data.layout || null,
  layoutChain,
  cache: data.cache || null,
  owner: data.owner || null,
  mustInvalidate: data.mustInvalidate || [],
  css: data.css || [],
  writeActions: data.writeActions || [],
  docs: data.docs || [],
  relatedFiles,
  checklist: inferChecklist(key, query),
  recommendation: inferRecommendation(key, query),
  notes: data.notes || [],
};

if (jsonMode) {
  process.stdout.write(JSON.stringify(output, null, 2));
  process.exit(0);
}

console.log(`# ${data.title}`);
console.log(`Chave: ${key}`);
console.log("");
console.log("Arquivos principais:");
for (const file of data.files) {
  console.log(`- ${file}`);
}
console.log("");
if (data.layout) {
  console.log(`Layout: ${data.layout}`);
  console.log("");
}
if (layoutChain.length > 0) {
  console.log("Layout pai inferido:");
  for (const item of layoutChain) {
    console.log(`- ${item}`);
  }
  console.log("");
}
if (data.cache) {
  console.log(`Cache / responsabilidade: ${data.cache}`);
  console.log("");
}
if (data.owner) {
  console.log(`Owner: ${data.owner}`);
  console.log("");
}
if (data.mustInvalidate && data.mustInvalidate.length > 0) {
  console.log("Must invalidate:");
  for (const item of data.mustInvalidate) {
    console.log(`- ${item}`);
  }
  console.log("");
}
if (data.css && data.css.length > 0) {
  console.log("CSS relevante:");
  for (const file of data.css) {
    console.log(`- ${file}`);
  }
  console.log("");
}
if (data.writeActions && data.writeActions.length > 0) {
  console.log("Acoes de escrita relacionadas:");
  for (const file of data.writeActions) {
    console.log(`- ${file}`);
  }
  console.log("");
}
if (relatedFiles.length > 0) {
  console.log("Arquivos provaveis de mexer:");
  for (const file of relatedFiles) {
    console.log(`- ${file}`);
  }
  console.log("");
}
console.log("Checklist rapido:");
for (const item of inferChecklist(key, query)) {
  console.log(`- ${item}`);
}
console.log("");
console.log("Observacoes:");
for (const note of data.notes) {
  console.log(`- ${note}`);
}

if (data.docs && data.docs.length > 0) {
  console.log("");
  console.log("Docs para ler antes de editar:");
  for (const file of data.docs) {
    console.log(`- ${file}`);
  }
}

const missingCacheHint =
  key.startsWith("admin-") && (!data.cache || data.cache.includes("No dedicated helper"));

if (missingCacheHint) {
  console.log("");
  console.log("Cache / invalidação sugeridos:");
  console.log("- Criar helper cacheado em lib/<dominio>/ ou lib/admin/");
  console.log("- Definir tag unica por dominio");
  console.log("- Invalida na action de escrita correspondente");
  console.log("- Se a tela precisar de sessão ou permissão forte, manter runtime dinamico");
}
