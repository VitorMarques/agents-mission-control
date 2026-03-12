import { convexMutation, convexQuery } from "~~/server/utils/convexClient";
import {
  getSessionCookieName,
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "~~/server/utils/session";
import { sanitizeUser, verifyPassword } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email e senha são obrigatórios.",
    });
  }

  const email = body.email.trim().toLowerCase();
  const user = await convexQuery<any>("users:findByEmail", { email });

  if (!user || !user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: "Credenciais inválidas.",
    });
  }

  const isValidPassword = await verifyPassword(
    body.password,
    user.passwordHash,
  );
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Credenciais inválidas.",
    });
  }

  const sessionToken = createSessionToken();
  const expiresAt = getSessionExpiry();

  await convexMutation("sessions:create", {
    userId: user._id,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt,
  });

  setCookie(event, getSessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });

  return { user: sanitizeUser(user) };
});
