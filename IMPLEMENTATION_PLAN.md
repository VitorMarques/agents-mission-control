# Mission Control — Plano de Implementação

## 1. Visão Geral

Dashboard centralizado para gerenciamento do squad de agentes AI (Hades, Poseidon, Minerva, Apollo). Baseado na arquitetura do Bhanu Teja (Mission Control), adaptado para nossa stack.

## 2. Nossos Agentes

| Agente | Emoji | Role | sessionKey |
|--------|-------|------|------------|
| Hades | ⚡ | Technical Specialist & Engineer | `hades` |
| Poseidon | 🌊 | Strategy & Product Lead | `poseidon` |
| Minerva | 🦉 | Research & Knowledge Manager | `minerva` |
| Apollo | 🔭 | SEO & Analytics Analyst | `apollo` |

## 3. Schema Convex (6 tabelas + users/sessions)

### agents
```
name, role, avatarEmoji, status (idle|active|blocked),
currentTaskId?, sessionKey, lastHeartbeatAt?, capabilities[]
```

### tasks
```
title, description, status (inbox|assigned|in_progress|review|blocked|done),
assigneeIds[], parentTaskId?, blockedReason?, tags[],
priority (low|medium|high|critical),
createdAt, updatedAt, dueDate?
```

### messages (comentários em threads)
```
taskId, fromAgentId (ou fromUserId), content, attachments[],
createdAt, type (comment|decision|status_update)
```

### activities (feed global)
```
type (task_created|message_sent|document_created|status_changed|agent_status_changed|decision|task_delegated),
agentId?, userId?, taskId?, message, createdAt
```

### documents
```
title, content (markdown), type (deliverable|research|protocol|report|audit),
taskId?, agentId?, createdAt, updatedAt
```

### notifications
```
mentionedAgentId, content, delivered, taskId?, createdAt
```

### + users (já existe)
### + sessions (já existe)
### + auditLogs (já existe)
### + mentions (já existe — extrair de @mentions nas mensagens)

## 4. Funcionalidades UI

### 4.1 Kanban Board (existe, melhorar)
- ✅ Colunas: Inbox → Assigned → In Progress → Review → Blocked → Done
- ✅ Drag & drop para mover status
- 🆕 Criar nova task inline
- 🆕 Indicador de prioridade no card
- 🆕 Filtro por agente assignado
- 🆕 Contador de tasks por coluna

### 4.2 Agent Management (existe, melhorar)
- ✅ Sidebar com status dos agentes
- 🆕 Card expandido com current task, última atividade
- 🆕 Botão para "acordar" agente (trigger heartbeat)

### 4.3 Task Detail Modal (existe, melhorar)
- ✅ Tabs: Messages, Activities, Documents, Notifications
- 🆕 Postar mensagem/comentário inline
- 🆕 Criar documento inline
- 🆕 Delegate task para agente
- 🆕 Mudar status inline
- 🆕 Thread subscriptions

### 4.4 Live Feed (existe, melhorar)
- ✅ Feed em tempo real
- ✅ Filtros por agente e tag
- 🆕 Filtro por tipo de atividade
- 🆕 "New" badge para atividades recentes

### 4.5 Documents Panel (novo)
- 🆕 Página dedicada para gerenciar documentos
- 🆕 Filtro por tipo (deliverable, research, protocol, report)
- 🆕 Visualização de conteúdo markdown

### 4.6 Gerenciamento de Agentes (novo)
- 🆕 Página dedicada com detalhes de cada agente
- 🆕 Histórico de atividades
- 🆕 Configuração de capabilities

## 5. Skill Global para Agentes

Local: `~/.openclaw/skills/mission-control/SKILL.md`

Comandos via `npx convex run`:
- Criar task
- Listar tasks assignados
- Postar comentário com @mention
- Criar documento
- Atualizar status de task
- Verificar notificações pendentes
- Registrar atividade

## 6. Testes

### 6.1 Unitários (Vitest) — já existe estrutura
- Schema validators
- Convex function logic
- Vue components
- Permission utils
- Session utils

### 6.2 Integration (Vitest)
- API endpoints (auth, mission, tasks)
- Convex queries/mutations
- Full auth flow

### 6.3 E2E (Cucumber + Playwright)
- Login → Dashboard
- Criar task → Ver no kanban
- Mover task entre colunas
- Postar comentário em task
- Criar documento em task
- Delegate task para agente
- Filtrar feed por agente
