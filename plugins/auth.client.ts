export default defineNuxtPlugin(async () => {
  // Auto-check authentication status when app starts
  if (process.client) {
    const { checkAuth } = useAuth();
    await checkAuth();
  }
});
