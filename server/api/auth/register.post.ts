import { convexMutation, convexQuery } from "~~/server/utils/convexClient";
import { hashPassword, type UserRole } from "~~/server/utils/auth";
import { requirePermission } from "~~/server/utils/requestAuth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  }>(event);

  if (!body.name || !body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nome, email e senha são obrigatórios.",
    });
  }

  const usersCount = await convexQuery<number>("users:count");

  // Registro público desabilitado: apenas o primeiro usuário (ADMIN) pode ser criado via API.
  // Usuários subsequentes devem ser criados via script CLI ou por um ADMIN autenticado.
  if (usersCount > 0) {
    requirePermission(event, "user:create");
  }

  const normalizedEmail = body.email.trim().toLowerCase();

  const existingUser = await convexQuery<any>("users:findByEmail", {
    email: normalizedEmail,
  });
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Já existe um usuário com este email.",
    });
  }

  let role: UserRole = "VIEWER";
  if (usersCount === 0) {
    role = "ADMIN";
  } else {
    role = body.role ?? "VIEWER";
  }

  const passwordHash = await hashPassword(body.password);

  const userId = await convexMutation("users:create", {
    name: body.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return { userId, role };
});
