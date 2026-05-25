import { convexMutation } from "~~/server/utils/convexClient";
import { requireAuthUser } from "~~/server/utils/requestAuth";

export default defineEventHandler(async (event) => {
  requireAuthUser(event);

  const body = await readBody(event);
  const { title, description, priority, assigneeIds, tags } = body;

  if (!title || typeof title !== "string") {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }

  const taskId = await convexMutation("tasks:create", {
    title: String(title),
    description: String(description ?? ""),
    status: assigneeIds?.length ? "assigned" : "inbox",
    priority: String(priority ?? "medium"),
    assigneeIds: Array.isArray(assigneeIds) ? assigneeIds : [],
    tags: Array.isArray(tags) ? tags : [],
  });

  return { taskId };
});
