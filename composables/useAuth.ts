// Global state to prevent multiple calls
const globalState = {
  isAuthenticated: ref(false),
  user: ref(null),
  isLoading: ref(false),
  isInitialized: ref(false),
  pendingPromise: null as Promise<void> | null, // Track ongoing request
};

export const useAuth = () => {
  const { isAuthenticated, user, isLoading, isInitialized, pendingPromise } =
    globalState;

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
        isInitialized.value = false;
        // Redirect ke Logto sign out URL
        await navigateTo(response.signOutUrl, { external: true });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async (forceCheck = false) => {
    // If there's already a pending request, wait for it
    if (globalState.pendingPromise && !forceCheck) {
      return globalState.pendingPromise;
    }

    // Prevent multiple simultaneous calls, but allow force check
    if (isLoading.value || (!forceCheck && isInitialized.value)) {
      return;
    }

    // Create promise and store it globally
    globalState.pendingPromise = (async () => {
      try {
        isLoading.value = true;
        const response = (await $fetch("/api/auth/me")) as {
          isAuthenticated: boolean;
          user: any;
        };
        isAuthenticated.value = response.isAuthenticated;
        user.value = response.user;
        isInitialized.value = true;
      } catch (error) {
        console.error("Auth check error:", error);
        isAuthenticated.value = false;
        user.value = null;
        isInitialized.value = true;
      } finally {
        isLoading.value = false;
        globalState.pendingPromise = null; // Clear pending promise
      }
    })();

    return globalState.pendingPromise;
  };

  // Auto-refresh auth state when returning to the app
  const refreshAuth = () => {
    isInitialized.value = false;
    globalState.pendingPromise = null; // Clear any pending request
    return checkAuth();
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    isInitialized,
    signIn,
    signOut,
    checkAuth,
    refreshAuth,
  };
};
