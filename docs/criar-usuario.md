# Criação Manual de Usuários

O registro público de usuários está **desabilitado**. Apenas o primeiro usuário (ADMIN inicial) pode ser criado via interface web. Usuários subsequentes devem ser criados:

1. Por um **ADMIN autenticado** via API `/api/auth/register`
2. Via **script CLI** (recomendado para setup inicial)

---

## Pré-requisitos

- Node.js 18+
- Dependência `tsx` instalada:
  ```bash
  npm install -D tsx
  ```
- Variável de ambiente `CONVEX_URL` ou `NUXT_PUBLIC_CONVEX_URL` configurada

---

## Uso do Script

```bash
npx tsx scripts/create-user.ts \
  --name "Nome do Usuário" \
  --email "email@exemplo.com" \
  --password "senha-segura" \
  --role ADMIN
```

### Parâmetros

| Parâmetro    | Obrigatório | Descrição                              |
|--------------|-------------|----------------------------------------|
| `--name`     | Sim         | Nome completo do usuário               |
| `--email`    | Sim         | Email (será normalizado para minúsculo)|
| `--password` | Sim         | Senha em texto plano (será hasheada)   |
| `--role`     | Não         | `ADMIN`, `MANAGER` ou `VIEWER` (padrão)|

### Roles disponíveis

- **ADMIN**: Acesso total, pode criar outros usuários
- **MANAGER**: Gerencia tasks e agentes
- **VIEWER**: Apenas visualização

---

## Exemplos

### Criar administrador

```bash
CONVEX_URL=https://seu-deployment.convex.cloud \
npx tsx scripts/create-user.ts \
  --name "Admin Principal" \
  --email "admin@empresa.com" \
  --password "SenhaForte123!" \
  --role ADMIN
```

### Criar visualizador

```bash
npx tsx scripts/create-user.ts \
  --name "João Silva" \
  --email "joao@empresa.com" \
  --password "senha123" \
  --role VIEWER
```

---

## Usando arquivo .env

Se você tiver um arquivo `.env` ou `.env.local` com `NUXT_PUBLIC_CONVEX_URL`, pode carregar automaticamente:

```bash
# Carregar variáveis e executar
source .env && npx tsx scripts/create-user.ts --name "Teste" --email "teste@test.com" --password "123456"
```

Ou use `dotenv-cli`:

```bash
npm install -g dotenv-cli
dotenv -e .env -- npx tsx scripts/create-user.ts --name "Teste" --email "teste@test.com" --password "123456"
```

---

## Saída esperada

```
✓ Usuário criado com sucesso!
  ID: jh72abc123...
  Nome: Admin Principal
  Email: admin@empresa.com
  Role: ADMIN
```

---

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `CONVEX_URL não definida` | Variável de ambiente ausente | Exportar `CONVEX_URL` ou usar `.env` |
| `Já existe um usuário com o email` | Email duplicado | Usar outro email |
| `Role inválida` | Role não reconhecida | Usar `ADMIN`, `MANAGER` ou `VIEWER` |
