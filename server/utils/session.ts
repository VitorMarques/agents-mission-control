import { createHash, randomBytes } from 'node:crypto'

const SESSION_COOKIE_NAME = 'amc_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getSessionExpiry() {
  return Date.now() + SESSION_TTL_MS
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
