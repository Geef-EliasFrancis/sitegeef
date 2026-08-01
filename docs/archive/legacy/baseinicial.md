O site GEEF é o principal canal de divulgação da doutrina espírita do Grupo Espírita Elias Francis

Orientações do site sistema:

- Newsletter de divulgação da Doutrina - parte pública + parte interna para criação e publicação.
- Divulgação das atividades - espaços dedicados ao calendário de eventos, estudos e demais atividades da casa
- Organização interna - Cadastro de Tarefeiros(trabalhadores voluntários), termos de voluntariados,
- gestão das redes sociais - todas cadastradas e o conteúdo do site com controle para publicação simultâneo facebook/ instagram / youtube
- salas direcionadas - temos as reuniões públicas com palestras onde podemos ter o resumo, o vídeo embebed do youtube da palestra/evento, tela geral de busca e tela de detalhes.
- Dados gerais da instituição, estatuto, regulamentos, orientações, normas, departamentos, responsáveis por cada departamento, validade de cada chapa com os representantes e históricos de cada pasta(similar a um sistema de prefeito e secretarias)
- vínculos com organizações a agrupamentos de nível superior, GEEF faz parte do 45° CEU, ligado ao REUNIR II Serrana - CEERJ - FEB. Hierarquia da casa.
- Possibilidade de que outras casas espiritas possam usar o sistema;
- Sala de palestra ao vivo online - transmitida via youtube ou aplicativo como zoom, meeet, etc, uma aba do ao vivo com possibilidade de notificações, tempo para iniciar, informações do evento, etc.
- Cadastro de Palestrantes -
- Formulários de autorizações de imagem, som, vídeo e demais informações segundo LGPD;
- Avisos das atividades fixas e eventos esporádicos
- cadastro e organização das atividades fixas
- Cadastro das outras casas espíritas com link e redes sociais;
- cadastro de usuários para solicitar ajudas, auxílios, acompanhamento, etc.
- Seguir LGPD em toda estrutura.
- Organização financeira completa do centro- cadastro de contas, possibilidade de recebimento de doações, cadastro de entradas e saídas, centros de custo, etc.

contatos:
Youtube: www.youtube.com/@GrupoEspiritaEliasFrancis - marcador: @GrupoEspiritaEliasFrancis

Endereço: Rua Gwyer de Azevedo, 35, Centro, Santa Maria Madalena-RJ-Brasil

Email: contatogeef@gmail.com
telefone: (22) 99725-1807

Instagram: @grupoespiritaeliasfrancis
Facebook: @grupoespiritaeliasfrancis

Dados Registro BR

Domínio: geef.com.br
Status: Publicado
Data de criação:09/05/2026sábado, 9 de maio de 2026
Data de expiração: 09/05/2028

Fluxo

Projeto feito no vscode - ligado via Git e GitHub(https://github.com/Geef-EliasFrancis/sitegeef) para deploy CI/CD, Hospedagem na vps oracle geef, armazenamento de dados frios na oracle drive, backend supabase
-projeto de bigbluebutton em outra vps adequada(incorporação futura)

Fazer as conexões mcp com:

- supabase - backend
- oracle vps geff e drive geff : criar e manter os dados do sistema
- github: organização de projetos e segredos (.env)
- cloudflare: organizar proxies e segurança e demais necessidades.
- wwww.geef.com.br

projetos com conteúdo útil para aproveitar se necessário:

https://github.com/JeanMRocha/crompressor-orquestrador

https://github.com/JeanMRocha/Autoreflex

https://github.com/JeanMRocha/opensquad

importante observar para seguir:

# Oracle Geef VPS reference

ORACLE_GEEF_ID=node_oracle_geef
ORACLE_GEEF_NAME=Oracle Geef
ORACLE_GEEF_ROLE=external
ORACLE_GEEF_PROVIDER=Oracle Cloud
ORACLE_GEEF_DOMAIN=geef.com.br
ORACLE_GEEF_HOST=204.216.166.12
ORACLE_GEEF_HOSTNAME=vpsgeef
ORACLE_GEEF_IPV4=204.216.166.12
ORACLE_GEEF_PRIVATE_IPV4=
ORACLE_GEEF_IPV6=
ORACLE_GEEF_REGION=
ORACLE_GEEF_OS=Ubuntu 24.04 Oracle kernel
ORACLE_GEEF_PLAN=geef.com.br dedicated VPS
ORACLE_GEEF_SSH_USER=ubuntu
ORACLE_GEEF_SSH_PORT=22
ORACLE_GEEF_PANEL_URL=https://cloud.oracle.com/
ORACLE_GEEF_SSH_PRIVATE_KEY_PATH=.secrets/ssh/oracle_geef/vps_geef/ssh-key-geefvps-2026-05-09.key
ORACLE_GEEF_SSH_KNOWN_HOSTS_PATH=.secrets/ssh/known_hosts
ORACLE_GEEF_CONSOLE_METHOD=Cloud console + SSH
ORACLE_GEEF_BACKUP_TARGET=
ORACLE_GEEF_SAFE_CHECKS=ssh,porta 22,painel do provedor,DNS geef.com.br,SSL geef.com.br
ORACLE_GEEF_NOTES=Usar diretamente geef.com.br.

# Oracle Geef Drive instance reference

ORACLE_GEEF_DRIVE_ID=node_oracle_geef_drive
ORACLE_GEEF_DRIVE_NAME=Oracle Geef Drive
ORACLE_GEEF_DRIVE_ROLE=external
ORACLE_GEEF_DRIVE_PROVIDER=Oracle Cloud
ORACLE_GEEF_DRIVE_DOMAIN=geef.com.br
ORACLE_GEEF_DRIVE_HOST=157.151.13.219
ORACLE_GEEF_DRIVE_HOSTNAME=geefdrive
ORACLE_GEEF_DRIVE_IPV4=157.151.13.219
ORACLE_GEEF_DRIVE_PRIVATE_IPV4=
ORACLE_GEEF_DRIVE_IPV6=
ORACLE_GEEF_DRIVE_REGION=
ORACLE_GEEF_DRIVE_OS=Ubuntu 24.04 Oracle kernel
ORACLE_GEEF_DRIVE_PLAN=geef.com.br drive support
ORACLE_GEEF_DRIVE_SSH_USER=ubuntu
ORACLE_GEEF_DRIVE_SSH_PORT=22
ORACLE_GEEF_DRIVE_PANEL_URL=https://cloud.oracle.com/
ORACLE_GEEF_DRIVE_SSH_PRIVATE_KEY_PATH=.secrets/ssh/oracle_geef/vps_drive_geef/ssh-key-geefdrive-2026-05-09.key
ORACLE_GEEF_DRIVE_SSH_KNOWN_HOSTS_PATH=.secrets/ssh/known_hosts
ORACLE_GEEF_DRIVE_CONSOLE_METHOD=Cloud console + SSH
ORACLE_GEEF_DRIVE_BACKUP_TARGET=
ORACLE_GEEF_DRIVE_SAFE_CHECKS=ssh,porta 22,painel do provedor,DNS geef.com.br,SSL geef.com.br
ORACLE_GEEF_DRIVE_NOTES=Suporte drive para geef.com.br.

supabase:
projectname: sitegeef
mcp add supabase --url https://mcp.supabase.com/mcp?project\_ref=nycgpokqlmrfzegjlrwa

Credenciais, tokens, senhas e chaves devem ficar somente em `.secrets/`, no gerenciador de segredos da plataforma ou em variaveis de ambiente locais nao versionadas.
As chaves anteriormente registradas neste documento devem ser consideradas expostas e precisam ser rotacionadas antes do uso em producao ou antes de qualquer push publico.

Conceito ideal
Estrutura geral

1. Site Público (acolhimento e comunicação)

Foco:

simplicidade;
leveza;
confiança;
acesso rápido;
boa leitura no celular.

Visual:

moderno;
limpo;
muito espaço em branco;
tipografia elegante;
poucas cores;
navegação extremamente clara.

Referências visuais:

Apple;
Notion;
Nextcloud;
GOV.BR moderno;
sites institucionais minimalistas.
Estrutura recomendada do site
Página inicial

Hero simples:

“Estudo, acolhimento e vivência do Evangelho à luz da Doutrina Espírita.”

Botões principais:

Participar de reunião
Atendimento fraterno
Agenda
Estudos
Evangelização
Doações
Área do trabalhador
Seções principais
Quem somos

Baseado no estatuto e diretrizes FEB.

Subseções:

História
Missão
Princípios
Equipe
Regimento interno
Transparência
Agenda Inteligente

Muito importante.

Funções:

calendário semanal;
filtros;
presencial/online;
inscrição automática;
integração Google Calendar;
Zoom/Jitsi/BBB;
lembrete por WhatsApp e e-mail.
Atendimento Fraterno

Inspirado nas diretrizes do atendimento espiritual

Fluxo:

pessoa solicita ajuda;
escolhe horário;
recebe acolhimento;
sistema registra acompanhamento;
equipe acompanha evolução.

Com:

sigilo;
LGPD;
histórico protegido;
área reservada.
Estudos Doutrinários

Inspirado na Área de Estudo do Espiritismo

Módulos:

ESDE;
EADE;
EOB;
Introdução;
cursos livres.

Funções:

trilhas de aprendizado;
progresso;
frequência;
materiais;
biblioteca;
videoaulas;
fórum;
certificados.
Evangelização Infantil e Juventude

Baseado nas diretrizes da infância e juventude

Separado em:

infância;
mocidade;
família.

Funções:

turmas;
cadastro familiar;
autorização de imagem;
presença;
materiais;
comunicados;
integração com pais.
Comunicação Social

Baseado na orientação de comunicação social espírita

Módulos:

notícias;
artigos;
podcast;
rádio web;
vídeos;
transmissões ao vivo;
galeria;
biblioteca digital;
campanhas.
Biblioteca e Livraria

Inspirado no documento de sustentabilidade do livro espírita

Funções:

catálogo;
reserva;
empréstimo;
ebooks;
venda online;
controle de estoque;
arrecadação.
Área Social / APSE

Inspirado na APSE

Funções:

cadastro de famílias;
acompanhamento;
campanhas;
cestas;
voluntários;
visitas;
relatórios;
indicadores sociais.
Plataforma administrativa (o diferencial)

Aqui está o verdadeiro valor.

Dashboard interno

Painel moderno com:

agenda;
frequência;
estudos;
financeiro;
voluntários;
reuniões;
evangelização;
atendimento;
transmissão ao vivo.

Tudo modular.

Arquitetura recomendada
Frontend
Vue/Nuxt ou Next.js
Tailwind
Shadcn UI
PWA responsivo
Backend
Golang ou Node
PostgreSQL/Supabase
Redis
Docker
Comunicação
N8N
WhatsApp
E-mail
Telegram
Vídeo

Para o modelo que você comentou de palestrante + plateia:

Melhor opção:
BigBlueButton

Porque:

já possui:
moderador;
levantar mão;
permissões;
breakout rooms;
gravação;
chat;
apresentações;
controle de câmera/microfone.

Ele encaixa exatamente no conceito:

anfitrião;
palestrante;
convidados;
plateia silenciosa.

Muito mais adequado que Zoom comum.

Estrutura modular ideal
Núcleo base
usuários;
permissões;
agenda;
notificações;
uploads;
LGPD.
Módulos plugáveis
estudos;
mediunidade;
evangelização;
APSE;
livraria;
financeiro;
comunicação;
eventos;
streaming;
biblioteca.

Você ativa apenas o que precisar.

O maior erro que normalmente cometem

Misturar:

site;
gestão;
evangelização;
comunicação;
financeiro;
reuniões;
inscrições;

em algo único e engessado.

O correto é:

Core + módulos independentes

Isso permite:

expansão futura;
manutenção simples;
equipes separadas;
atualização sem quebrar tudo.
Sugestão visual moderna
Layout
Topbar fina
logo;
agenda;
estudos;
atendimento;
ao vivo;
doar;
login.
Home em blocos

Estilo:

cards grandes;
ícones suaves;
animação discreta;
poucos textos;
CTA claros.
Diferencial importante
Área “Ao Vivo”

Página dedicada:

palestras;
reuniões;
transmissões;
salas virtuais;
chat moderado;
lista de presença;
materiais da reunião.

Integrando:

BigBlueButton;
Jitsi;
YouTube;
OBS.

Estrutura
Público
Nuxt/Next
Painel
app separado
Banco
Supabase
Automação
N8N
Reuniões
BBB auto hospedado
Streaming
OBS + YouTube
Auth
Supabase Auth

Caminho correto de construção
Fase 1
identidade visual;
site público;
agenda;
comunicação.
Fase 2
login;
estudos;
evangelização.
Fase 3
APSE;
atendimento;
voluntários.
Fase 4
BBB;
streaming;
biblioteca;
financeiro.
O que eu considero essencial

O sistema precisa transmitir:

serenidade;
organização;
acolhimento;
clareza;
confiança.

Não pode parecer:

ERP frio;
sistema comercial;
site poluído;
portal antigo.

O maior diferencial será:

simplicidade externa + profundidade interna.

Módulo Financeiro / Tesouraria

Baseado no Manual de Administração, que prevê tesouraria, livro caixa, balancete mensal, plano de contas, balanço financeiro, balanço patrimonial e inventário de bens

Funções principais
Cadastro de contas
banco;
caixa físico;
carteira Pix;
conta poupança;
aplicações;
contas específicas por campanha.
Entradas
doações avulsas;
doações recorrentes;
contribuições de associados;
eventos;
livraria;
bazar;
campanhas;
reembolsos.
Saídas
água, luz, internet;
manutenção;
material de limpeza;
material doutrinário;
assistência social;
eventos;
obras;
serviços contábeis;
despesas bancárias.
Centros de custo
Administração;
Atendimento Espiritual;
Estudos;
Evangelização Infantil;
Juventude;
APSE;
Comunicação;
Livraria;
Eventos;
Manutenção patrimonial.
Doações online
Pix copia e cola;
QR Code Pix;
cartão;
boleto;
recibo automático;
identificação do doador;
doação anônima;
campanha específica.
Prestação de contas
livro caixa;
balancete mensal;
demonstrativo anual;
relatório por centro de custo;
comprovantes anexados;
aprovação por tesouraria/conselho;
exportação PDF/Excel.
Governança
lançamento por tesoureiro;
conferência por presidente;
parecer do conselho fiscal;
trilha de auditoria;
bloqueio de edição após fechamento mensal.
Como fica no sistema
Painel interno

Adicionar no menu:

Financeiro
├── Visão geral
├── Contas
├── Entradas
├── Saídas
├── Doações
├── Centros de custo
├── Campanhas
├── Comprovantes
├── Conciliação bancária
├── Balancetes
├── Prestação de contas
└── Conselho fiscal
Regra importante

O financeiro deve conversar com outros módulos:

doação para APSE → entra no centro de custo APSE;
venda de livro → entra em Livraria;
evento beneficente → entra em Eventos;
campanha de reforma → entra em Campanhas;
despesa de evangelização → sai em Evangelização.
Ajuste na proposta geral

A plataforma passa a ter estes grandes blocos:

Site público
Agenda e atividades
Estudos doutrinários
Atendimento espiritual
Evangelização infantil e juventude
Comunicação social
APSE
Voluntários/tarefeiros
Documentos e governança
Financeiro completo / Tesouraria
Biblioteca/livraria
Reuniões virtuais e transmissões

Esse módulo financeiro é essencial. Sem ele, o sistema ficaria bonito, mas incompleto.

1. Patrimônio e Infraestrutura

Muito importante para centros maiores.

Funções
cadastro de bens;
cadeiras;
mesas;
equipamentos de som;
projetores;
notebooks;
livros;
móveis;
veículos;
instrumentos musicais;
manutenção preventiva;
histórico de manutenção;
controle de salas;
inventário anual;
patrimônio por setor.
Exemplo
Patrimônio
├── Bens
├── Inventário
├── Manutenções
├── Ambientes
├── Reservas de salas
└── Histórico 2. Biblioteca / Acervo Doutrinário

Você citou livraria parcialmente, mas biblioteca é outro universo.

Inclusive alinhado com a forte tradição espírita do estudo.

Funções
catálogo de livros;
empréstimos;
devoluções;
reservas;
livros digitais;
obras básicas;
controle de exemplares;
histórico de leitura;
biblioteca infantil;
biblioteca para evangelização;
integração com livraria. 3. Gestão de Membros / Frequentadores

Não apenas tarefeiros.

Importante

Grande parte das casas não sabe:

quem frequenta;
há quanto tempo;
quais estudos participa;
quais atividades recebe;
quem desapareceu;
quem precisa de acolhimento.
Funções
cadastro de frequentadores;
histórico de participação;
presença;
acompanhamento fraterno;
interesse em voluntariado;
acompanhamento familiar;
grupos por afinidade;
comunicação segmentada. 4. Integração e Presença

Muito útil para eventos e estudos.

Funções
check-in QR Code;
lista de presença;
certificado;
controle de frequência;
confirmação de presença;
integração com WhatsApp/email;
emissão de crachá. 5. Área de Formação de Trabalhadores

Muito alinhado aos documentos da FEB sobre formação continuada.

Funções
trilhas de formação;
cursos internos;
capacitação;
vídeos;
avaliações;
acompanhamento de formação;
estágio para tarefeiros;
documentos obrigatórios;
aceite de normas internas. 6. Gestão Jurídica e LGPD

Você comentou LGPD, mas ela merece módulo próprio.

Funções
consentimentos;
aceite de termos;
gestão documental;
retenção de dados;
anonimização;
auditoria;
exportação de dados;
controle de acesso;
política de privacidade;
registro de incidentes. 7. Aplicativo Mobile / Área do Frequentador

Não é prioridade inicial, mas deve existir na arquitetura.

Funções
agenda;
notificações;
evangelho no lar;
estudos;
transmissão ao vivo;
inscrição em eventos;
doações;
carteira digital de participante;
presença. 8. CRM Social / Acompanhamento Fraterno

Esse módulo é extremamente útil e quase nenhuma casa possui.

Funções
acompanhamento espiritual;
visitas fraternas;
retornos;
pedidos de oração;
acompanhamento social;
encaminhamentos;
histórico confidencial;
responsáveis por atendimento;
alertas de acompanhamento. 9. BI / Indicadores

Muito útil para presidência e coordenação.

Indicadores
frequência mensal;
crescimento;
evasão;
doações;
atividades mais frequentadas;
participação da juventude;
livros distribuídos;
engajamento digital;
voluntários ativos;
custos por área. 10. Multi-instituição (Muito importante)

Você já comentou, mas isso muda toda a arquitetura.

Isso significa:

O sistema precisa nascer:

multi-centro;
multi-permissão;
multi-administração;
multi-identidade visual;
multi-unidade.

Na prática:

uma única plataforma;
várias casas espíritas;
cada uma isolada;
mas vinculáveis hierarquicamente:
GEEF;
45º CEU;
REUNIR;
CEERJ;
FEB. 11. Gestão Federativa

Esse é avançado, mas estratégico.

Funções
vinculação entre casas;
relatórios federativos;
eventos regionais;
envio de documentos;
comunicação oficial;
homologações;
censos espíritas;
estatísticas regionais. 12. Memorial / História da Casa

Poucas instituições fazem isso direito.

Funções
ex-presidentes;
atas históricas;
fotos;
eventos marcantes;
linha do tempo;
documentos antigos;
vídeos;
fundadores;
patrimônio histórico;
depoimentos.
Os módulos mais estratégicos que normalmente são esquecidos

Se eu tivesse que destacar os mais negligenciados, seriam:

CRM fraterno
Formação de trabalhadores
Gestão patrimonial
Biblioteca
Multi-instituição
LGPD real
Histórico/memorial
BI e indicadores

Esses são os módulos que diferenciam:

um simples site,
de:
uma plataforma institucional séria e duradoura.
