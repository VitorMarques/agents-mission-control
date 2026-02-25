#!/usr/bin/env npx tsx
/**
 * Script para criação manual de usuários no Convex.
 *
 * Uso:
 *   npx tsx scripts/create-user.ts --name "Nome" --email "email@example.com" --password "senha" --role ADMIN|MANAGER|VIEWER
 *
 * Requer:
 *   - Variável CONVEX_URL no ambiente (ou .env / .env.local)
 *   - Dependência: tsx (npm install -D tsx)
 */

import { ConvexHttpClient } from 'convex/browser'
import { hash } from 'bcryptjs'

const SALT_ROUNDS = 12

type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER'

function parseArgs(): { name: string; email: string; password: string; role: UserRole } {
  const args = process.argv.slice(2)
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const name = get('--name')
  const email = get('--email')
  const password = get('--password')
  const role = (get('--role') ?? 'VIEWER').toUpperCase() as UserRole

  if (!name || !email || !password) {
    console.error('Uso: npx tsx scripts/create-user.ts --name "Nome" --email "email@example.com" --password "senha" [--role ADMIN|MANAGER|VIEWER]')
    process.exit(1)
  }

  if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(role)) {
    console.error('Role inválida. Use: ADMIN, MANAGER ou VIEWER')
    process.exit(1)
  }

  return { name, email, password, role }
}

async function main() {
  const convexUrl = process.env.CONVEX_URL || process.env.NUXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    console.error('Variável CONVEX_URL ou NUXT_PUBLIC_CONVEX_URL não definida.')
    process.exit(1)
  }

  const { name, email, password, role } = parseArgs()
  const normalizedEmail = email.trim().toLowerCase()

  const client = new ConvexHttpClient(convexUrl)

  // Verificar se usuário já existe
  const existing = await client.query('users:findByEmail' as any, { email: normalizedEmail })
  if (existing) {
    console.error(`Erro: Já existe um usuário com o email "${normalizedEmail}".`)
    process.exit(1)
  }

  // Hash da senha
  const passwordHash = await hash(password, SALT_ROUNDS)

  // Criar usuário
  const userId = await client.mutation('users:create' as any, {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  })

  console.log(`✓ Usuário criado com sucesso!`)
  console.log(`  ID: ${userId}`)
  console.log(`  Nome: ${name}`)
  console.log(`  Email: ${normalizedEmail}`)
  console.log(`  Role: ${role}`)
}

main().catch((err) => {
  console.error('Erro ao criar usuário:', err.message)
  process.exit(1)
})
