import { convexMutation } from "~~/server/utils/convexClient";
import { requireRole } from "~~/server/utils/requestAuth";
import type { UserRole } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireRole(event, ["ADMIN", "MANAGER"] as UserRole[]);

  const taskId = getRouterParam(event, "taskId");
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "taskId é obrigatório." });
  }

  const body = await readBody<{ reason?: string }>(event);
  const reason = body.reason?.trim();

  if (!reason) {
    throw createError({
      statusCode: 400,
      statusMessage: "Motivo de bloqueio é obrigatório.",
    });
  }

  await convexMutation("tasks:markBlocked", {
    taskId,
    reason,
  });

  return { ok: true };
});
