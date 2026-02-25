import { convexVue } from "convex-vue";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const convexUrl = String(config.public.convexUrl ?? "");

  if (!convexUrl) {
    console.warn(
      "[convex] NUXT_PUBLIC_CONVEX_URL is not defined; Convex plugin was not initialized.",
    );
    return;
  }

  nuxtApp.vueApp.use(
    convexVue as any,
    {
      url: convexUrl,
      server: false,
    } as any,
  );
});
