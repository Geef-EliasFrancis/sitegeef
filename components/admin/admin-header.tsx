'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAdminShellArea } from '@/components/admin/use-admin-shell-area';
import { AdminUserMenu } from '@/components/admin/admin-user-menu';
import type { Locale } from '@/lib/multilingual';
import type { AdminShellArea } from '@/components/admin/use-admin-shell-area';

const contextMenus: Partial<Record<AdminShellArea, readonly { label: string; href: string }[]>> = {
  painel: [
    { label: 'Início', href: '/admin/painel' },
  ],
  perfil: [
    { label: 'Início', href: '/admin/perfil' },
    { label: 'Minha área', href: '/minha-area' },
  ],
  'reuniao-publica': [
    { label: 'Início', href: '/admin/reuniao-publica' },
    { label: 'Avisos', href: '/admin/reuniao-publica/avisos' },
    { label: 'Reunião', href: '/admin/reuniao-publica/reuniao' },
    { label: 'Música', href: '/admin/reuniao-publica/musica/inicio' },
    { label: 'Leitura', href: '/admin/reuniao-publica/leitura' },
    { label: 'Palestra', href: '/admin/reuniao-publica/palestra' },
    { label: 'Prece', href: '/admin/reuniao-publica/prece' },
  ],
  geef: [
    { label: 'Início', href: '/admin/geef' },
    { label: 'Instituição', href: '/admin/geef/instituicao' },
    { label: 'Identidade visual', href: '/admin/instituicao/identidade-visual' },
    { label: 'Descritivo', href: '/admin/instituicao/descritivo' },
    { label: 'Missão e valores', href: '/admin/instituicao/missao-valores' },
    { label: 'Documentos', href: '/admin/instituicao/documentos' },
    { label: 'Contatos', href: '/admin/instituicao/contatos' },
    { label: 'Dados', href: '/admin/geef/dados' },
    { label: 'Endereço', href: '/admin/geef/endereco' },
    { label: 'Agenda', href: '/admin/geef/agenda' },
    { label: 'Departamentos', href: '/admin/geef/departamentos' },
    { label: 'Contas', href: '/admin/geef/contas' },
  ],
  pessoas: [
    { label: 'Início', href: '/admin/pessoas/inicio' },
    { label: 'Pessoas', href: '/admin/pessoas/pessoas' },
    { label: 'Funções', href: '/admin/pessoas/funcoes' },
    { label: 'Usuários', href: '/admin/usuarios' },
    { label: 'Temas', href: '/admin/funcoes/temas' },
  ],
  governanca: [
    { label: 'Início', href: '/admin/governanca' },
    { label: 'Diretorias', href: '/admin/governanca/diretorias' },
    { label: 'Cargos', href: '/admin/governanca/cargos' },
    { label: 'Assembleias', href: '/admin/governanca/assembleias' },
    { label: 'Documentos', href: '/admin/governanca/documentos' },
  ],
  documentos: [
    { label: 'Início', href: '/admin/documentos' },
    { label: 'Modelos', href: '/admin/documentos' },
    { label: 'Pedidos', href: '/admin/documentos/pedidos' },
    { label: 'Termos', href: '/admin/documentos/termos' },
    { label: 'Consentimentos', href: '/admin/documentos/consentimentos' },
    { label: 'Voluntariado', href: '/admin/documentos/voluntariado' },
    { label: 'Auditoria', href: '/admin/documentos/auditoria' },
    { label: 'LGPD', href: '/admin/lgpd' },
  ],
  operacao: [
    { label: 'Início', href: '/admin/operacao' },
    { label: 'Escalas', href: '/admin/operacao/escalas' },
    { label: 'Atendimento', href: '/admin/operacao/atendimento' },
    { label: 'Recepção', href: '/admin/atendimento/recepcao' },
    { label: 'Fraterno', href: '/admin/atendimento/fraterno' },
    { label: 'Evangelho no lar', href: '/admin/atendimento/evangelhos-lar' },
    { label: 'Irradiação', href: '/admin/atendimento/irradiacao' },
    { label: 'Biblioteca', href: '/admin/operacao/biblioteca' },
    { label: 'Empréstimos', href: '/admin/biblioteca/emprestimos' },
    { label: 'Livraria', href: '/admin/operacao/livraria' },
    { label: 'Comunicação', href: '/admin/operacao/comunicacao' },
    { label: 'Estudos', href: '/admin/operacao/estudos' },
    { label: 'Cursos', href: '/admin/estudos/cursos' },
    { label: 'Turmas', href: '/admin/estudos/turmas' },
    { label: 'Evangelização', href: '/admin/operacao/evangelizacao' },
    { label: 'Crianças', href: '/admin/evangelizacao/criancas' },
    { label: 'Financeiro', href: '/admin/operacao/financeiro' },
    { label: 'Plano de contas', href: '/admin/financeiro/plano-contas' },
    { label: 'Lançamentos', href: '/admin/financeiro/lancamentos' },
    { label: 'DRE', href: '/admin/financeiro/dre' },
    { label: 'Patrimônio', href: '/admin/operacao/patrimonio' },
    { label: 'Planejamento', href: '/admin/operacao/planejamento' },
    { label: 'Notificações', href: '/admin/operacao/notificacoes' },
    { label: 'Relatórios', href: '/admin/operacao/relatorios' },
    { label: 'APSE', href: '/admin/operacao/apse' },
    { label: 'Famílias', href: '/admin/apse/familias' },
    { label: 'Campanhas', href: '/admin/apse/campanhas' },
    { label: 'Atendimentos APSE', href: '/admin/apse/atendimentos' },
    { label: 'Mediunidade', href: '/admin/operacao/mediunidade' },
    { label: 'Reuniões virtuais', href: '/admin/operacao/reunioes-virtuais' },
  ],
  sistema: [
    { label: 'Início', href: '/admin/sistema' },
    { label: 'Observabilidade', href: '/admin/sistema/observabilidade' },
    { label: 'Erros', href: '/admin/observability?tab=erros' },
    { label: 'Supabase', href: '/admin/observability?tab=supabase' },
    { label: 'LGPD', href: '/admin/observability?tab=lgpd' },
    { label: 'Fila', href: '/admin/observability?tab=fila' },
    { label: 'Migrações', href: '/admin/sistema/migrations' },
    { label: 'Idiomas', href: '/admin/sistema/idiomas' },
    { label: 'Fix Usuários', href: '/admin/sistema/fix-usuarios' },
  ],
};

const musicContextMenuItems = [
  { label: 'Início', href: '/admin/reuniao-publica/musica/inicio' },
  { label: 'Catálogo', href: '/admin/reuniao-publica/musica/catalogo' },
  { label: 'Autores', href: '/admin/reuniao-publica/musica/autores' },
  { label: 'Sessões', href: '/admin/reuniao-publica/musica/sessoes' },
  { label: 'Versões', href: '/admin/reuniao-publica/musica/versoes' },
  { label: 'Controle', href: '/musicas/controle' },
  { label: 'Exibição pública', href: '/musicas/exibir' },
] as const;

interface AdminHeaderProps {
  locale: Locale;
  user: {
    email?: string;
    fullName?: string;
  };
}

export function AdminHeader({ locale, user }: AdminHeaderProps) {
  const displayName = user.fullName || user.email || 'Usuário';
  const { area, topAreas, routes } = useAdminShellArea();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contextMenuItems = contextMenus[area];
  const isMusicContext = area === 'reuniao-publica' && pathname.startsWith('/admin/reuniao-publica/musica');

  return (
    <div className="admin-header-shell">
      <header className="admin-header">
        <Link href="/admin/painel" className="admin-brand">
          <Image
            className="admin-brand-logo"
            src="/brand/logo-oficial-transparent.png"
            alt="GEEF"
            width={360}
            height={156}
            priority
          />
        </Link>

        <div className="admin-header-middle">
          <div className="admin-shell-tabs" aria-label="Seções do painel">
            {topAreas.map((item) => (
              <Link
                key={item.key}
                href={routes[item.key]}
                className={`admin-shell-tab ${area === item.key ? 'active' : ''}`}
                aria-current={area === item.key ? 'page' : undefined}
                aria-label={`${item.label}: ${item.note}`}
                title={`${item.label}: ${item.note}`}
              >
                <span className="admin-shell-tab-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-header-right">
          <AdminUserMenu locale={locale} email={user.email} fullName={displayName} />
        </div>
      </header>

      {contextMenuItems && (
        <nav className="admin-context-menu" aria-label={`Menu de contexto de ${area}`}>
          {contextMenuItems.map((item) => {
            const itemPath = item.href.split('?')[0];
            const isPathActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
            const isPrece = item.label === 'Prece';
            const isPalestra = item.label === 'Palestra';
            const isActive = isPathActive && (!isPrece && !isPalestra || (isPrece ? searchParams.get('categoria') === 'prece' : !searchParams.get('categoria')));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`admin-context-menu-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
      {isMusicContext && (
        <nav className="admin-context-menu admin-context-menu--nested" aria-label="Submenu de músicas">
          {musicContextMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`admin-context-menu-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
