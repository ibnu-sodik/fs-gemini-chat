export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Clear session cookie
    deleteCookie(event, "logto-session");

    // Get Logto config with fallback to environment variables
    const logtoEndpoint = config.public.logtoEndpoint || process.env.NUXT_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;
    const logtoAppId = config.public.logtoAppId || process.env.NUXT_LOGTO_APP_ID || process.env.LOGTO_APP_ID;

    if (!logtoEndpoint || !logtoAppId) {
      throw createError({
        statusCode: 500,
        statusMessage: "Logto configuration missing",
      });
    }

    // Generate sign out URL untuk Logto
    const baseUrl = getRequestURL(event).origin;
    const postLogoutRedirectUri = `${baseUrl}/`; // Redirect

    // Buat URL sign out dengan parameter yang diperlukan
    const signOutUrl =
      `${logtoEndpoint}/oidc/session/end?` +
      new URLSearchParams({
        client_id: logtoAppId,
        post_logout_redirect_uri: postLogoutRedirectUri,
      }).toString();

    return {
      success: true,
      signOutUrl,
    };
  } catch (error) {
    console.error("Auth signout error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error during sign out",
    });
  }
});
