import { convexMutation } from "~~/server/utils/convexClient";
import { requireRole } from "~~/server/utils/requestAuth";
import type { UserRole } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireRole(event, ["ADMIN", "MANAGER"] as UserRole[]);

  const taskId = getRouterParam(event, "taskId");
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "taskId é obrigatório." });
  }

  const body = await readBody<{
    title?: string;
    description?: string;
    assigneeIds?: string[];
    tags?: string[];
  }>(event);

  if (!body.title || !body.description || !body.assigneeIds?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "title, description e assigneeIds são obrigatórios.",
    });
  }

  const subtaskId = await convexMutation("tasks:createSubtask", {
    parentTaskId: taskId,
    title: body.title,
    description: body.description,
    assigneeIds: body.assigneeIds,
    tags: body.tags ?? ["delegated"],
  });

  return { ok: true, subtaskId };
});
