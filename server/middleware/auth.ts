import { convexQuery } from "~~/server/utils/convexClient";
import { hashSessionToken } from "~~/server/utils/session";
import { sanitizeUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, "amc_session");
  (event.context as any).authUser = null;

  if (!sessionToken) {
    return;
  }

  const session = await convexQuery<any>("sessions:findByTokenHash", {
    tokenHash: hashSessionToken(sessionToken),
  });

  if (!session || session.expiresAt <= Date.now()) {
    return;
  }

  const user = await convexQuery<any>("users:findById", {
    userId: session.userId,
  });

  if (!user || !user.isActive) {
    return;
  }

  (event.context as any).authUser = sanitizeUser(user);
});
