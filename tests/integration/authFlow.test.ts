import { describe, expect, it, vi } from 'vitest'

import { hashPassword, verifyPassword } from '../../server/utils/auth'

describe('auth flow primitives', () => {
  it('hashes and validates a password', async () => {
    const password = 'super-secret'
    const hash = await hashPassword(password)

    expect(hash).not.toEqual(password)
    expect(await verifyPassword(password, hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })

  it('is deterministic on validation for same hash', async () => {
    const hash = await hashPassword('abc123')
    const verifier = vi.fn(async () => verifyPassword('abc123', hash))

    const first = await verifier()
    const second = await verifier()

    expect(first).toBe(true)
    expect(second).toBe(true)
    expect(verifier).toHaveBeenCalledTimes(2)
  })
})
