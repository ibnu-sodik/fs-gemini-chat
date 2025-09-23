export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware pada halaman auth
  if (to.path.startsWith("/auth/")) {
    return;
  }

  // Periksa apakah user sudah terantentikasi
  const { isAuthenticated, checkAuth } = useAuth();

  // Check auth status if not already known
  if (!isAuthenticated.value) {
    await checkAuth();
  }

  if (!isAuthenticated.value) {
    // Store intended destination for redirect after login
    if (process.client) {
      sessionStorage.setItem("auth-redirect", to.fullPath);
    }
    // Redirect ke halaman login jika belum terantentikasi
    return navigateTo("/auth/sign-in");
  }
});
