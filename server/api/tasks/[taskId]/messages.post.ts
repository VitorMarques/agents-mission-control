import { convexMutation, convexQuery } from "~~/server/utils/convexClient";
import { requireAuthUser } from "~~/server/utils/requestAuth";

export default defineEventHandler(async (event) => {
  requireAuthUser(event);

  const taskId = getRouterParam(event, "taskId");
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "taskId is required" });
  }

  const body = await readBody(event);
  const { content, fromAgentId } = body;

  if (!content || typeof content !== "string") {
    throw createError({ statusCode: 400, statusMessage: "content is required" });
  }

  const messageId = await convexMutation("messages:create", {
    taskId,
    content: String(content),
    fromAgentId: fromAgentId || undefined,
    type: "comment",
  });

  return { messageId };
});
