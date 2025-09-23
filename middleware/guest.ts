export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, checkAuth } = useAuth();

  // Check auth status jika belum diketahui
  if (!isAuthenticated.value) {
    await checkAuth();
  }

  // Jika user sudah login, redirect ke chat
  if (isAuthenticated.value) {
    return navigateTo("/chat");
  }
});
