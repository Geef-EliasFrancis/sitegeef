# Integração do Jitsi Meet no GEEF

> Status: operacional
> Última atualização: 2026-08-04
> Escopo: `meet.geef.com.br` + módulo `reunioes_virtuais`

## Objetivo

Este documento define o padrão para conectar o site `www.geef.com.br` ao serviço Jitsi Meet hospedado pelo GEEF.

O site é a fonte de verdade para agenda, publicação e permissões. O Jitsi é a camada de videoconferência. Não devem ser criadas salas, credenciais ou regras paralelas em componentes de UI.

## Arquitetura atual

```text
www.geef.com.br
  -> Next.js do GEEF
  -> Supabase: reunioes_virtuais
  -> link ou IFrame para
https://meet.geef.com.br/<sala>
  -> Traefik/Coolify
  -> Jitsi Docker: web, Prosody, Jicofo e Videobridge
```

O Jitsi roda na VPS Hostinger junto do Coolify, mas em um stack isolado em `/opt/jitsi-geef`.

## Configuração de produção

### DNS e HTTPS

- DNS autoritativo: Cloudflare.
- Registro: `A meet.geef.com.br -> 78.142.242.236`.
- Proxy Cloudflare: desativado para este registro; o tráfego chega ao Traefik da VPS.
- HTTPS: certificado gerenciado pelo resolver `letsencrypt` do Traefik.
- URL pública obrigatória: `https://meet.geef.com.br`.

Não criar registros para `guest.meet.geef.com.br`, `conference.meet.geef.com.br` ou `internal-muc.meet.geef.com.br`. São domínios internos ao stack.

### Docker e proxy

Arquivos no servidor:

- `/opt/jitsi-geef/docker-compose.yml`: composição oficial.
- `/opt/jitsi-geef/docker-compose.coolify.yml`: override da rede e labels do Traefik.
- `/opt/jitsi-geef/.env`: configuração e credenciais; nunca copiar para o Git.
- `/opt/jitsi-geef/config/`: configuração persistente.

O web container participa da rede Docker externa `coolify` e é encaminhado pelo Traefik para a porta interna `8000`.

Binds auxiliares, somente em localhost:

- `127.0.0.1:18000 -> web:8000`
- `127.0.0.1:18443 -> web:8443`

A única mídia publicada diretamente é `10000/UDP -> jvb:10000/UDP`. Não publicar `80/443` diretamente pelo Jitsi.

### Variáveis essenciais

Senhas e segredos não fazem parte desta documentação.

```dotenv
JITSI_IMAGE_VERSION=stable-11146
PUBLIC_URL=https://meet.geef.com.br
HTTP_PORT=18000
HTTPS_PORT=18443
DISABLE_HTTPS=1
ENABLE_HTTP_REDIRECT=0
ENABLE_LETSENCRYPT=0
ENABLE_AUTH=1
ENABLE_GUESTS=1
AUTH_TYPE=internal
JVB_ADVERTISE_IPS=78.142.242.236
JVB_COLIBRI_PORT=18080
TZ=America/Sao_Paulo
XMPP_DOMAIN=meet.geef.com.br
XMPP_GUEST_DOMAIN=guest.meet.geef.com.br
XMPP_MUC_DOMAIN=conference.meet.geef.com.br
XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.geef.com.br
XMPP_SERVER=xmpp.meet.geef.com.br
```

Ao atualizar, usar release fixo e validar o Compose antes de reiniciar. Não usar `latest`.

## Autenticação e salas

A instalação usa autenticação interna do Prosody:

- usuários autenticados podem criar salas;
- convidados entram após a sala ser criada e liberada pelo anfitrião;
- usuário inicial: `anfitriao@meet.geef.com.br`;
- senha somente em `/root/jitsi-geef-anfitriao.txt`, com permissão `600`.

Para cadastrar outro anfitrião:

```bash
cd /opt/jitsi-geef
docker compose -f docker-compose.yml -f docker-compose.coolify.yml exec prosody /bin/bash
prosodyctl --config /run/prosody/config/prosody.cfg.lua register USUARIO meet.geef.com.br SENHA
```

Não armazenar senha de anfitrião na tabela pública nem em URL. O campo legado `senha` de `reunioes_virtuais` não deve ser exibido para visitantes.

### Padrão de nome de sala

Usar identificador não previsível, estável e sem dados pessoais:

```text
geef-<slug-do-evento>-<sufixo-aleatorio>
```

Exemplo: `https://meet.geef.com.br/geef-estudo-iee-a8f4c2`.

Regras:

- somente letras minúsculas, números e hífen;
- não usar CPF, e-mail ou nome completo;
- não reutilizar a sala para eventos diferentes;
- gerar o sufixo no servidor com fonte aleatória segura;
- validar tamanho e caracteres antes de persistir.

## Contrato recomendado no site

A tabela atual possui `titulo`, `plataforma`, `link`, `senha`, `anfitriao_id`, `data_hora`, `checklist` e `status`. Para integração completa, adicionar em uma migração:

```sql
alter table public.reunioes_virtuais
  add column if not exists sala text,
  add column if not exists publicado boolean not null default false,
  add column if not exists url_publica text;

create unique index if not exists reunioes_virtuais_sala_unique
  on public.reunioes_virtuais (sala)
  where sala is not null;
```

Leitura pública:

- somente `plataforma = 'jitsi'`;
- somente `publicado = true`;
- somente reuniões futuras ou em andamento;
- retornar título, data/hora, descrição pública e `url_publica`;
- nunca retornar `senha`, checklist ou dados internos.

Mutação administrativa:

- gerar `sala` e `url_publica` no server action ou domínio;
- validar permissão antes de criar/publicar;
- registrar auditoria;
- invalidar o cache público após a alteração.

## Integração por link

É o padrão recomendado inicialmente:

```tsx
<a
  href={reuniao.url_publica}
  target="_blank"
  rel="noopener noreferrer"
  className="admin-btn admin-btn-primary"
>
  Participar da reunião
</a>
```

Renderizar somente quando o registro estiver publicado e informar que o navegador solicitará câmera e microfone.

## Integração embutida por IFrame API

Usar a API do próprio servidor, nunca `meet.jit.si`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function JitsiMeeting({ roomName }: { roomName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.geef.com.br/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      new window.JitsiMeetExternalAPI("meet.geef.com.br", {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: 720,
        userInfo: { displayName: "Participante GEEF" },
      });
    };

    document.body.appendChild(script);
    return () => script.remove();
  }, [roomName]);

  return <div ref={containerRef} className="jitsi-meeting-frame" />;
}
```

Requisitos:

- `roomName` deve vir do banco após validação server-side;
- não aceitar nome arbitrário da URL sem validação;
- manter layout responsivo e altura mínima;
- não colocar segredos na configuração do IFrame;
- validar câmera, microfone, lobby e saída em desktop e celular.

## Operação e manutenção

```bash
cd /opt/jitsi-geef
docker compose -f docker-compose.yml -f docker-compose.coolify.yml ps
docker compose -f docker-compose.yml -f docker-compose.coolify.yml config >/dev/null
curl -fsS https://meet.geef.com.br/
curl -fsS https://meet.geef.com.br/config.js
ss -lntup | grep -E ':10000|:18000|:18443'
```

Critérios mínimos:

- DNS resolve para a VPS;
- HTTPS e `config.js` retornam `200`;
- web, Prosody, Jicofo e Videobridge estão ativos;
- `10000/UDP` está escutando;
- anfitrião cria uma sala;
- convidado entra após autorização;
- áudio, vídeo e compartilhamento funcionam em desktop e celular.

## Limites conhecidos

A VPS possui 2 CPUs e 8 GB de RAM. É adequada para reuniões pequenas e médias. Eventos maiores, gravação, transmissão ou múltiplas salas simultâneas exigem capacidade dedicada.

## Referências oficiais

- [Jitsi Meet no Docker](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/)
- [Autenticação interna e JWT](https://jitsi.github.io/handbook/docs/devops-guide/authentication/)
- [IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)
- [Repositório oficial docker-jitsi-meet](https://github.com/jitsi/docker-jitsi-meet)
