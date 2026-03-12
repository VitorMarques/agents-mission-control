import type { H3Event } from "h3";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const RATE_STORE = new Map<string, { count: number; resetAt: number }>();

function getClientIp(event: H3Event) {
  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return event.node.req.socket.remoteAddress ?? "unknown";
}

function ensureRateLimit(event: H3Event) {
  const ip = getClientIp(event);
  const key = `${ip}:${event.method}:${event.path}`;
  const now = Date.now();
  const current = RATE_STORE.get(key);

  if (!current || current.resetAt <= now) {
    RATE_STORE.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }

  current.count += 1;
  if (current.count > RATE_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: "Rate limit exceeded.",
    });
  }
}

function ensureOriginForMutations(event: H3Event) {
  if (!MUTATING_METHODS.has(event.method)) return;

  const origin = getHeader(event, "origin");
  if (!origin) return; // allow non-browser clients

  const host = getHeader(event, "host");
  if (!host) return;

  const isTls = Boolean((event.node.req.socket as { encrypted?: boolean }).encrypted);
  const expectedOrigin = `${isTls ? "https" : "http"}://${host}`;
  if (origin !== expectedOrigin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid origin.",
    });
  }
}

export default defineEventHandler((event) => {
  setHeader(event, "X-Frame-Options", "DENY");
  setHeader(event, "X-Content-Type-Options", "nosniff");
  setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
  setHeader(event, "X-XSS-Protection", "1; mode=block");

  ensureRateLimit(event);
  ensureOriginForMutations(event);
});
