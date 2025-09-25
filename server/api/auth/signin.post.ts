export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Generate sign in URL untuk Logto
    const baseUrl = getRequestURL(event).origin;
    const redirectUri = `${baseUrl}/auth/callback`;

    // Buat URL sign in dengan parameter yang diperlukan
    const signInUrl =
      `${config.public.logtoEndpoint}/oidc/auth?` +
      new URLSearchParams({
        client_id: config.public.logtoAppId as string,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        state: generateState(), // Generate random state untuk security
      }).toString();

    return {
      success: true,
      signInUrl,
    };
  } catch (error) {
    console.error("Auth signin error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error during sign in",
    });
  }
});

// Helper function untuk generate random state
function generateState() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
