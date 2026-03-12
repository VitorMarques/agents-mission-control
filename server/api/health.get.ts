import { convexQuery } from "~~/server/utils/convexClient";

export default defineEventHandler(async (event) => {
  const startedAt = Date.now();

  try {
    await convexQuery<number>("users:count");
    return {
      status: "ok",
      requestId: (event.context as any).requestId ?? null,
      dependencies: {
        convex: "ok",
      },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    setResponseStatus(event, 503);
    return {
      status: "degraded",
      requestId: (event.context as any).requestId ?? null,
      dependencies: {
        convex: "error",
      },
      error: error instanceof Error ? error.message : "unknown error",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  }
});
