# Agents Mission Control

Dashboard de controle de missão em Nuxt 4 com layout Kanban task-centric e backend de dados em Convex.

## Stack

- Nuxt 4 + Vue 3 + TypeScript strict
- TailwindCSS
- Convex (schema + functions)

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Ajuste pelo menos:

- `NUXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `SESSION_SECRET`

4. Rode o Convex dev (gera a pasta `convex/_generated` e sincroniza functions):

```bash
npx convex dev
```

5. Em outro terminal, rode a aplicação:

```bash
npm run dev
```

App disponível em `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Estrutura principal

- `app/`: frontend Nuxt (layout, componentes, composables)
- `convex/schema.ts`: schema das tabelas
- `convex/*.ts`: queries/mutations/actions por domínio

## Observações

- Nesta etapa, as funções Convex usam wrappers genéricos (`queryGeneric`/`mutationGeneric`) para permitir evolução mesmo antes da geração de tipos.
- Após executar `npx convex dev`, você pode migrar gradualmente para imports tipados de `convex/_generated/server`.
