<!-- Credito: Perfil Discord https://discord.com/users/1411202571804348507 -->

# Mission Tools

Bot Discord em TypeScript com painel web e aplicativo Windows para controlar missoes, limpeza, voz, Rich Presence, verificador de usernames e utilidades administrativas.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-14.x-5865F2?logo=discord&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Electron](https://img.shields.io/badge/Electron-desktop-47848F?logo=electron&logoColor=white)

## Recursos

| Recurso | Descricao |
|---|---|
| Bot Discord | Slash command `/mission-panel` e modulos administrativos |
| Painel web | Dashboard Next.js com login por token, rotas internas e componentes compartilhados |
| App Windows | Empacotamento Electron com instalador `.exe` |
| Missoes | Fila, execucao e status em tempo real |
| Rich Presence | Atividade configuravel com imagens, botoes e timestamps |
| Voz | Entrada automatica em canal de voz |
| Limpeza | Fluxos de limpeza de DM e utilidades administrativas |
| Usernames | Verificacao de disponibilidade de usernames |
| Persistencia local | Dados salvos em JSON, com tokens criptografados |

## Requisitos

- Node.js 18 ou superior
- npm
- Aplicativo criado no Discord Developer Portal
- Token valido do bot

## Instalacao

```bash
git clone https://github.com/luizpauloteam-dot/mission-tools.git
cd mission-tools
npm install
npm run web:install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

No PowerShell, tambem pode usar:

```powershell
Copy-Item .env.example .env
```

Depois preencha as variaveis principais:

```env
BOT_TOKEN=seu_token_do_bot
GUILD_ID=id_do_servidor
APPLICATION_ID=id_da_aplicacao
```

## Variaveis De Ambiente

| Variavel | Obrigatoria | Uso |
|---|---:|---|
| `BOT_TOKEN` | Sim | Token do bot Discord |
| `GUILD_ID` | Sim | Servidor principal usado pelo bot |
| `APPLICATION_ID` | Sim | ID da aplicacao Discord |
| `CLIENT_ID` | Nao | Alias para `APPLICATION_ID` em alguns modulos |
| `TOKEN_STORE_SECRET` | Recomendado | Criptografia dos tokens salvos pelo painel |
| `WEB_SESSION_SECRET` | Recomendado | Assinatura da sessao web |
| `WEB_BASE_URL` | Nao | URL base do painel web |
| `RICH_PRESENCE_APPLICATION_ID` | Nao | Aplicacao usada para assets do Rich Presence |
| `RICH_PRESENCE_ASSET_CHANNEL_ID` | Nao | Canal usado para assets do Rich Presence |
| `PANEL_STORE_PATH` | Nao | Caminho do JSON do painel do bot |
| `TOKEN_STORE_PATH` | Nao | Caminho do JSON de tokens criptografados |
| `WEB_LOG_STORE_PATH` | Nao | Caminho dos logs do painel web |
| `WEB_SETTINGS_STORE_PATH` | Nao | Caminho das configuracoes do painel web |
| `BASE_DELETE_DELAY_MS` | Nao | Delay base da limpeza de DMs |
| `DISCORD_CLEANUP_VERBOSE` | Nao | Logs detalhados da limpeza |
| `WHITELISTED_USERS` | Nao | IDs liberados, separados por virgula |
| `WHITELISTED_FRIENDSHIPS` | Nao | IDs de amizades liberadas, separados por virgula |

## Scripts

```bash
npm start                 # Inicia somente o bot
npm run dev               # Inicia o bot em desenvolvimento
npm run app               # Inicia bot e painel web juntos
npm run web:dev           # Inicia somente o painel web
npm run typecheck         # Verifica TypeScript do bot
npm run web:typecheck     # Verifica TypeScript do painel
npm run desktop:dev       # Abre o app Electron em modo local
npm run desktop:dist      # Gera o instalador .exe
```

## Painel Web

Para rodar o painel no navegador:

```bash
npm run web:dev
```

Abra:

```txt
http://localhost:3000
```

O painel usa login por token. O token e validado no Discord, salvo criptografado no servidor e nao e retornado para o frontend.

## App Windows `.exe`

Para gerar o instalador:

```bash
npm run desktop:dist
```

O arquivo final fica em:

```txt
dist-desktop/Mission Tools Setup 1.0.0.exe
```

O app desktop:

- abre o painel em uma janela propria;
- inicia o servidor Next.js interno automaticamente;
- usa o worker de missoes empacotado;
- salva dados locais em `%APPDATA%/Mission Tools`;
- carrega `.env` ao lado do `.exe` ou em `%APPDATA%/Mission Tools/.env`, quando existir.

O instalador e a pasta `dist-desktop/` sao artefatos gerados e nao devem ser commitados no Git. Para distribuir o `.exe`, prefira publicar em uma Release do GitHub.

## PWA

O painel tambem foi preparado como PWA. Depois de iniciar com:

```bash
npm run app
```

Abra `http://localhost:3000` e use a opcao de instalar do navegador ou o botao **Instalar** no topo do painel quando ele aparecer.

## Deploy Na Discloud

O projeto inclui `discloud.config`. Antes de enviar, confirme os campos principais:

```txt
MAIN=bot.ts
START=npm start
```

Depois envie pelo painel ou pela CLI da Discloud.

## Seguranca

- Nunca suba `.env`, tokens, secrets ou arquivos gerados em `data/`.
- Se um token foi commitado por engano, revogue e gere outro no Discord Developer Portal.
- Use `TOKEN_STORE_SECRET` e `WEB_SESSION_SECRET` fortes em ambientes reais.
- O `.gitignore` ja ignora `.env`, `data/`, `node_modules/`, builds do Next, `dist-desktop/` e o worker desktop gerado.

## Validacao Recomendada

Antes de publicar alteracoes:

```bash
npm run typecheck
npm run web:typecheck
npm run web:build
```

Para validar o instalador:

```bash
npm run desktop:dist
```

## Git

```bash
git add -A
git commit -m "feat: update mission tools desktop app"
git push -u origin main
```

## Licenca

Consulte o arquivo [LICENSE](./LICENSE).
