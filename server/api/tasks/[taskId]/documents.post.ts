import { convexMutation } from "~~/server/utils/convexClient";
import { requireAuthUser } from "~~/server/utils/requestAuth";

export default defineEventHandler(async (event) => {
  requireAuthUser(event);

  const taskId = getRouterParam(event, "taskId");
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "taskId is required" });
  }

  const body = await readBody(event);
  const { title, content, type, agentId } = body;

  if (!title || typeof title !== "string") {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }

  const documentId = await convexMutation("documents:create", {
    title: String(title),
    content: String(content ?? ""),
    type: String(type ?? "deliverable"),
    taskId,
    agentId: agentId || undefined,
  });

  return { documentId };
});
