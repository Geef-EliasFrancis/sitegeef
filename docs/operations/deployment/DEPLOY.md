# 🚀 Deploy Automático - GitHub Actions

O site GEEF usa GitHub Actions para validar e publicar automaticamente ao fazer push para `main`.

## Como funciona?

```mermaid
git push origin main
    ↓
1. GitHub Actions valida o build
    ↓
2. GitHub Actions faz o deploy via SSH para o VPS
    ↓
3. O VPS executa `deploy.sh`
    ↓
4. Build Docker / restart do container
    ↓
5. Healthcheck valida a aplicação
    ↓
✅ Site www.geef.com.br atualizado!
```

## Setup Necessário

### 1. Criar organização no GitHub

**IMPORTANTE:** O repositório DEVE estar em uma organização, não em conta pessoal.

- Crie organização em: [https://github.com/account/organizations/new](https://github.com/account/organizations/new)
- Mova repositório para lá
- Adicione você como **Owner/Proprietário**

### 2. Configurar DNS no Cloudflare

**Importante:** Deve apontar direto para o novo IP do VPS, não usar Cloudflare Tunnel.

1. Vá para: https://dash.cloudflare.com/
2. Selecione domínio `www.geef.com.br`
3. Vá para **DNS**
4. Crie/edite registro `A`:

| Campo | Valor |
| --- | --- |
| **Tipo** | `A` |
| **Nome** | `www.geef.com.br` |
| **Conteúdo** | `78.142.242.236` |
| **TTL** | Auto |
| **Proxy** | Cinza (DNS only) |

### 3. VPS Setup (78.142.242.236)

```bash
# SSH no VPS
ssh root@78.142.242.236

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Docker (para o VPS)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 4. Adicionar Secrets no GitHub Actions

No repositório, adicione os secrets usados pelo workflow:

```
NEXT_PUBLIC_SITE_URL=https://www.geef.com.br
NEXT_PUBLIC_SUPABASE_URL=https://nycgpokqlmrfzegjlrwa.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_jDq5SX_k4spHMCCPVvlsrQ_-ZZybt8e
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testando o Deploy

Após configurar tudo:

```bash
# 1. Faça uma mudança pequena
echo "# Deploy teste" >> README.md

# 2. Commit e push
git add README.md
git commit -m "test: verify GitHub Actions deployment"
git push origin main

# 3. Monitore no GitHub Actions
# Vá para: Actions → Build, Validate & Deploy

# 4. Verifique o site
# Acesse: https://www.geef.com.br
```

## Troubleshooting

### Site mostra erro 502/503

```bash
# SSH no VPS
ssh root@78.142.242.236

# Ver containers em execução
docker ps

# Ver logs do container
docker logs [container-id] -f

# Reiniciar container
docker restart [container-id]
```

### GitHub Actions não faz deploy ao fazer push

1. Verificar se o workflow `Build, Validate & Deploy` está ativo
2. Verificar se os secrets `GEEF_VPS_*` estão configurados
3. Verificar se o `deploy.sh` existe e está executável no VPS
4. Verificar logs na aba `Actions`

### Construção do Docker falha

```bash
# SSH no VPS
docker build -t sitegeef:latest .
```

Ver logs de erro e corrigir Dockerfile.

## Arquivos importantes

| Arquivo | Função |
| --- | --- |
| `Dockerfile` | Build e deploy da aplicação |
| `package.json` | Scripts: `build`, `start:standalone` |
| `.github/workflows/deploy.yml` | Workflow principal de validação e deploy |
| `deploy.sh` | Script executado no VPS pelo workflow |

## Segurança

✅ **Implementado:**
- Variáveis de ambiente em GitHub Secrets e no runtime do VPS
- Deploy controlado por GitHub Actions
- DNS direto (sem Cloudflare Tunnel)
- Healthcheck configurado

⚠️ **Atenção:**
- Variáveis públicas (`NEXT_PUBLIC_*`) são visíveis no código
- Service role key é privada, mantém segura!
- Não commitar `.env` ou `.env.local`

## IP do VPS

- **Antigo (offline)**: 204.216.166.12 (Oracle Cloud)
- **Novo (ativo)**: 78.142.242.236 (Hetzner ou similar)

**IMPORTANTE:** Sempre atualize o DNS quando mudar de VPS!

---

**Última atualização**: 2026-05-16  
**Status**: ✅ Totalmente operacional com GitHub Actions
