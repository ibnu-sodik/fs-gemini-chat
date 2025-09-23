export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Clear session cookie
    deleteCookie(event, "logto-session");

    // Generate sign out URL untuk Logto
    const baseUrl = getRequestURL(event).origin;
    const postLogoutRedirectUri = `${baseUrl}/auth/sign-in`;

    // Buat URL sign out dengan parameter yang diperlukan
    const signOutUrl =
      `${config.public.logtoEndpoint}/oidc/session/end?` +
      new URLSearchParams({
        client_id: config.public.logtoAppId as string,
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
