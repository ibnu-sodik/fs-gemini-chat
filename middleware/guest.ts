export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, refreshAuth } = useAuth();

  // Force check auth status to get fresh data
  await refreshAuth();

  // Jika user sudah login, redirect ke chat
  if (isAuthenticated.value) {
    return navigateTo("/chat");
  }
});
