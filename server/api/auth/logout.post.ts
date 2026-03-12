import { convexMutation, convexQuery } from "~~/server/utils/convexClient";
import {
  getSessionCookieName,
  hashSessionToken,
} from "~~/server/utils/session";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, getSessionCookieName());

  if (token) {
    const session = await convexQuery<any>("sessions:findByTokenHash", {
      tokenHash: hashSessionToken(token),
    });

    if (session?._id) {
      await convexMutation("sessions:deleteById", {
        sessionId: session._id,
      });
    }
  }

  deleteCookie(event, getSessionCookieName(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });

  return { ok: true };
});
