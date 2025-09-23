export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware pada halaman auth tertentu (bukan sign-out)
  if (to.path.startsWith("/auth/") && to.path !== "/auth/sign-out") {
    return;
  }

  // Periksa apakah user sudah terantentikasi
  const { isAuthenticated, checkAuth } = useAuth();

  // Always check auth status to ensure fresh data
  await checkAuth();

  if (!isAuthenticated.value) {
    // Store intended destination for redirect after login
    if (process.client) {
      sessionStorage.setItem("auth-redirect", to.fullPath);
    }
    // Redirect ke halaman login jika belum terantentikasi
    return navigateTo("/auth/sign-in");
  }
});
