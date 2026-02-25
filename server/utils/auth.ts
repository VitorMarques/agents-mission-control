import bcrypt from 'bcryptjs'

export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER'

export type AuthUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}

const BCRYPT_ROUNDS = 12

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return await bcrypt.compare(password, passwordHash)
}

export function sanitizeUser(user: any): AuthUser {
  return {
    _id: String(user._id),
    name: String(user.name),
    email: String(user.email),
    role: user.role as UserRole,
    isActive: Boolean(user.isActive),
  }
}

export function assertRole(role: UserRole, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
}
