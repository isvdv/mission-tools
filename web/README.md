# Painel Web Mission Tools

Painel Next.js usado pelo Mission Tools para controlar os modulos do bot pelo navegador, PWA ou app desktop.

## Recursos

- Login por token do Discord.
- Armazenamento criptografado dos tokens no servidor local.
- Sessao HTTP-only assinada.
- Dashboard para missoes, limpeza, voz, Rich Presence, usernames, logs e configuracoes.
- Rotas internas de API com respostas padronizadas.
- Logs salvos em `data/web-logs.json`.

## Rodar Localmente

Na raiz do projeto:

```bash
npm run app
```

Esse comando inicia o bot e o painel web juntos.

Para abrir somente o painel:

```bash
npm run web:install
npm run web:dev
```

Depois acesse:

```txt
http://localhost:3000
```

Para iniciar somente o bot:

```bash
npm start
```

## App Windows

Para gerar o instalador:

```bash
npm run desktop:dist
```

O instalador fica em:

```txt
dist-desktop/Mission Tools Setup 1.0.0.exe
```

O app desktop inicia o servidor interno do Next.js automaticamente e salva os dados locais em `%APPDATA%/Mission Tools`.

## PWA

O painel tambem pode ser instalado pelo navegador. Inicie o projeto, abra `http://localhost:3000` e use a opcao de instalacao do navegador ou o botao **Instalar** no topo do painel.

## Ambiente

Crie um `.env` na raiz do projeto a partir do `.env.example` e preencha as variaveis necessarias.

Variaveis importantes para o painel:

- `TOKEN_STORE_SECRET`: criptografa os tokens enviados pelo painel.
- `WEB_SESSION_SECRET`: assina as sessoes do navegador.
- `WEB_BASE_URL`: define a URL base usada em redirects.

## Seguranca

- O painel aceita somente login por token.
- O token enviado e validado em `/users/@me`.
- Tokens ficam criptografados no servidor e nao sao retornados ao frontend.
- APIs sensiveis validam sessao assinada e token salvo antes de executar acoes.
- Rotas ligadas a servidor verificam permissoes quando um `guildId` e informado.
