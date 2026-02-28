export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const publicRoutes = ["/login"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  try {
    const headers = useRequestHeaders(["cookie"]);
    await $fetch("/api/auth/me", { headers });
  } catch {
    return navigateTo("/login");
  }
});
