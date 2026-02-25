# Deploy no EasyPanel (VPS)

## 1) Pré-requisitos

- Projeto versionado e imagem Docker buildável.
- Variáveis configuradas:
  - `NUXT_PUBLIC_CONVEX_URL`
  - `CONVEX_DEPLOYMENT`
  - `SESSION_SECRET`
  - `NUXT_PUBLIC_APP_NAME`
  - `NUXT_PUBLIC_APP_ENV=production`

## 2) Criar app no EasyPanel

1. Criar novo serviço **App**.
2. Escolher deployment por **Docker Image** (registry privado).
3. Definir porta interna `3000`.
4. Configurar domínio público com TLS.

## 3) Configuração de runtime

- Command: `node .output/server/index.mjs`
- Healthcheck: `GET /`
- Restart policy: `unless-stopped`

## 4) Estratégia de release

- Publicar tags de imagem por versão (`vX.Y.Z`) e ambiente (`prod`).
- Rollback: selecionar tag anterior no EasyPanel e redeploy.

## 5) Pós-deploy

- Validar login (`/login`).
- Validar dashboard (`/`).
- Validar integração com Convex (queries básicas).
