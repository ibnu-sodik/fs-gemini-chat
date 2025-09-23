export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware pada halaman auth tertentu (bukan sign-out)
  if (to.path.startsWith("/auth/") && to.path !== "/auth/sign-out") {
    return;
  }

  // For server-side rendering, check cookie directly
  if (process.server) {
    try {
      const logtoSession = useCookie("logto-session", {
        default: () => null,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      if (!logtoSession.value) {
        // Store intended destination for redirect after login
        return navigateTo("/auth/sign-in");
      }
    } catch (error) {
      // If cookie access fails, let client-side handle the auth check
      console.warn("Server-side cookie access failed:", error);
    }
    // If cookie exists or access failed, let client-side handle the rest
    return;
  }

  // Client-side: Use composable
  const { isAuthenticated, checkAuth, isLoading } = useAuth();

  // Wait for auth check to complete
  await checkAuth();

  // Only redirect if definitely not authenticated and not loading
  if (!isAuthenticated.value && !isLoading.value) {
    // Store intended destination for redirect after login
    if (process.client) {
      sessionStorage.setItem("auth-redirect", to.fullPath);
    }
    // Redirect ke halaman login jika belum terantentikasi
    return navigateTo("/auth/sign-in");
  }
});
