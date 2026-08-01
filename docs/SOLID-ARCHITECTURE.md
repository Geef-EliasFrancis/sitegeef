# Organização SOLID do frontend GEEF

## Objetivo

Separar composição visual, regra de domínio, acesso a dados e navegação para que mudanças em uma tela não exijam editar várias telas não relacionadas.

## Responsabilidades

- `app/admin/**/page.tsx`: composição da rota e carregamento específico da tela.
- `components/admin/ui/`: primitives visuais sem regra de negócio.
- `components/admin/<dominio>/`: componentes especializados do domínio.
- `lib/<dominio>/`: consultas, transformações e regras de domínio reutilizáveis.
- `app/admin/**/actions.ts`: mutações server-side e invalidação de cache.
- `styles/identity-system.css`: tokens semânticos compartilhados.
- `styles/admin.css`: layout e estados transversais do admin.

## Aplicação dos princípios

- **Responsabilidade única:** um componente visual não consulta Supabase nem decide permissão.
- **Aberto/fechado:** novas variantes devem ser adicionadas por props/tokens, sem duplicar páginas inteiras.
- **Substituição:** componentes de domínio podem trocar a implementação visual mantendo o contrato de props.
- **Segregação de interfaces:** preferir props pequenas (`title`, `description`, `actions`) a objetos gigantes de página.
- **Inversão de dependência:** páginas dependem de funções de `lib/` e componentes de UI; não dependem diretamente de detalhes do banco.

## Fluxo recomendado

```text
rota -> lib/domínio -> dados
  └─> AdminPageHeader + AdminPanel + componente do domínio
                              └─> tokens e estados visuais
```

## Limites práticos

- Não extrair um componente apenas por reduzir linhas; extraia quando houver repetição ou contrato visual estável.
- Não transformar `AdminDashboardWorkspace` em um segundo roteador. Novos dashboards devem preferir componentes por contexto.
- Não mover actions para componentes client.
- Não criar CSS exclusivo quando um token ou variante existente resolve o caso.

## Próximas migrações

1. Migrar cabeçalhos de listas para `AdminPageHeader`.
2. Migrar superfícies repetidas para `AdminPanel`.
3. Catalogar tabelas e formulários por domínio.
4. Remover classes duplicadas somente após os consumidores usarem os primitives.
