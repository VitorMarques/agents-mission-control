import { ConvexHttpClient } from "convex/browser";

// Singleton client instance
let _client: ConvexHttpClient | null = null;

export function getServerConvexClient() {
  if (_client) return _client;

  const config = useRuntimeConfig();
  const convexUrl = String(config.public.convexUrl ?? "");

  if (!convexUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_PUBLIC_CONVEX_URL is not configured",
    });
  }

  // Custom fetch that strips Origin header to prevent "Invalid origin" errors.
  // The Convex API rejects requests with unrecognized Origin headers.
  // When a browser sends a request to our Nuxt server, the server-side Convex client
  // should NOT forward the browser's Origin to Convex.
  const strippedFetch: typeof globalThis.fetch = (input, init) => {
    const newInit: RequestInit = { ...init };
    if (newInit.headers) {
      const headers = new Headers(newInit.headers);
      headers.delete("origin");
      headers.delete("Origin");
      newInit.headers = headers;
    }
    return globalThis.fetch(input, newInit);
  };

  _client = new ConvexHttpClient(convexUrl, {
    fetch: strippedFetch,
  });

  return _client;
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
