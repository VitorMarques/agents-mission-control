import { ConvexHttpClient } from "convex/browser";

export function getServerConvexClient() {
  const config = useRuntimeConfig();
  const convexUrl = String(config.public.convexUrl ?? "");

  if (!convexUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_PUBLIC_CONVEX_URL is not configured",
    });
  }

  return new ConvexHttpClient(convexUrl);
}

export async function convexQuery<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
) {
  const client = getServerConvexClient();
  return (await client.query(name as any, args as any)) as T;
}

export async function convexMutation<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
) {
  const client = getServerConvexClient();
  return (await client.mutation(name as any, args as any)) as T;
}
