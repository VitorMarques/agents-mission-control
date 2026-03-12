import { randomUUID } from "node:crypto";

export default defineEventHandler((event) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  event.context.requestId = requestId;
  setHeader(event, "x-request-id", requestId);

  const { method } = event.node.req;
  const path = event.path;

  event.node.res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const statusCode = event.node.res.statusCode;

    console.log(
      JSON.stringify({
        level: "info",
        msg: "http.request",
        requestId,
        method,
        path,
        statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
      }),
    );
  });
});
