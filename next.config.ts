import type { NextConfig } from "next";

function getSupabaseImageHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const supabaseImageHost = getSupabaseImageHost();

const contextualRouteRewrites = [
  { source: "/admin/geef/instituicao", destination: "/admin/instituicao" },
  { source: "/admin/geef/dados", destination: "/admin/instituicao/identificacao" },
  { source: "/admin/geef/endereco", destination: "/admin/instituicao/endereco" },
  { source: "/admin/geef/agenda", destination: "/admin/reunioes-virtuais" },
  { source: "/admin/geef/departamentos", destination: "/admin/departamentos" },
  { source: "/admin/geef/contas", destination: "/admin/instituicao/contas" },
  { source: "/admin/pessoas/pessoas", destination: "/admin/pessoas" },
  { source: "/admin/pessoas/funcoes", destination: "/admin/funcoes" },
  { source: "/admin/reuniao-publica/leitura", destination: "/reuniao-publica/leitura" },
  { source: "/admin/reuniao-publica/palestra", destination: "/admin/funcoes/temas" },
  { source: "/admin/reuniao-publica/prece", destination: "/admin/funcoes/temas?categoria=prece" },
  { source: "/admin/sistema/observabilidade", destination: "/admin/observability" },
  { source: "/admin/sistema/migrations", destination: "/admin/migrations" },
  { source: "/admin/sistema/idiomas", destination: "/admin/idiomas" },
  { source: "/admin/sistema/fix-usuarios", destination: "/admin/fix-usuarios" },
  ...[
    "atendimento",
    "apse",
    "biblioteca",
    "comunicacao",
    "escalas",
    "estudos",
    "evangelizacao",
    "financeiro",
    "juventude",
    "livraria",
    "mediunidade",
    "notificacoes",
    "patrimonio",
    "planejamento",
    "relatorios",
    "reunioes-virtuais",
  ].map((submenu) => ({
    source: `/admin/operacao/${submenu}/:path*`,
    destination: `/admin/${submenu}/:path*`,
  })),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
  experimental: {
    devtoolSegmentExplorer: false,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async rewrites() {
    return {
      beforeFiles: contextualRouteRewrites,
    };
  },
  async redirects() {
    return [
      {
        source: "/leitor",
        destination: "/biblioteca/leitor",
        permanent: true,
      },
      {
        source: "/programacao",
        destination: "/reuniao-publica/programacao",
        permanent: true,
      },
      {
        source: "/musicas",
        destination: "/reuniao-publica/musicas",
        permanent: true,
      },
      {
        source: "/musicas/:path*",
        destination: "/reuniao-publica/musicas/:path*",
        permanent: true,
      },
      {
        source: "/doacoes",
        destination: "/participe/doacoes",
        permanent: true,
      },
      {
        source: "/admin/reuniao-publica/musicas",
        destination: "/admin/reuniao-publica/musica",
        permanent: true,
      },
      {
        source: "/admin/reuniao-publica/musicas/:path*",
        destination: "/admin/reuniao-publica/musica/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: supabaseImageHost
      ? [
          {
            protocol: "https",
            hostname: supabaseImageHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
