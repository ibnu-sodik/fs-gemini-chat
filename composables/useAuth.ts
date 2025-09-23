export const useAuth = () => {
  const isAuthenticated = ref(false);
  const user = ref(null);
  const isLoading = ref(false);

  const signIn = async () => {
    try {
      isLoading.value = true;
      const response = (await $fetch("/api/auth/signin", {
        method: "POST",
      })) as { signInUrl?: string };
      if (response.signInUrl) {
        // Redirect ke Logto sign in URL
        await navigateTo(response.signInUrl, { external: true });
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = async () => {
    try {
      isLoading.value = true;
      const response = (await $fetch("/api/auth/signout", {
        method: "POST",
      })) as { signOutUrl?: string };
      if (response.signOutUrl) {
        // Clear local state
        isAuthenticated.value = false;
        user.value = null;
        // Redirect ke Logto sign out URL
        await navigateTo(response.signOutUrl, { external: true });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      isLoading.value = true;
      const response = (await $fetch("/api/auth/me")) as {
        isAuthenticated: boolean;
        user: any;
      };
      isAuthenticated.value = response.isAuthenticated;
      user.value = response.user;
    } catch (error) {
      console.error("Auth check error:", error);
      isAuthenticated.value = false;
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-refresh auth state when returning to the app
  const refreshAuth = () => {
    checkAuth();
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    signIn,
    signOut,
    checkAuth,
    refreshAuth,
  };
};
