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

  // Use a custom fetch that strips the Origin header to prevent
  // "Invalid origin" errors when Convex receives requests proxied
  // from the Nuxt server with the browser's origin header
  const customFetch: typeof globalThis.fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.delete("origin");
    headers.delete("Origin");
    return globalThis.fetch(input, { ...init, headers });
  };

  return new ConvexHttpClient(convexUrl, {
    fetch: customFetch,
    logger: false,
  });
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
