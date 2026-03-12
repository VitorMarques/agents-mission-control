import type { AuthUser, UserRole } from "~~/server/utils/auth";
import type { H3Event } from "h3";
import { hasPermission, type Permission } from "~~/server/utils/permissions";

export function requireAuthUser(event: H3Event): AuthUser {
  const authUser = (event.context as any).authUser as AuthUser | null;
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: "Não autenticado." });
  }
  return authUser;
}

export function requireRole(event: H3Event, roles: UserRole[]): AuthUser {
  const authUser = requireAuthUser(event);
  if (!roles.includes(authUser.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Sem permissão para esta ação.",
    });
  }
  return authUser;
}

export function requirePermission(event: H3Event, permission: Permission): AuthUser {
  const authUser = requireAuthUser(event);
  if (!hasPermission(authUser.role, permission)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Sem permissão para esta ação.",
    });
  }
  return authUser;
}
