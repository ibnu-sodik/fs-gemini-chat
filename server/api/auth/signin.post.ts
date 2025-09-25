export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Fallback to environment variables if runtimeConfig doesn't work
    const logtoEndpoint = config.public.logtoEndpoint || process.env.NUXT_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;
    const logtoAppId = config.public.logtoAppId || process.env.NUXT_LOGTO_APP_ID || process.env.LOGTO_APP_ID;

    // Debug: Log the actual values
    console.log('Debug signin - config.public.logtoEndpoint:', !!config.public.logtoEndpoint);
    console.log('Debug signin - config.public.logtoAppId:', !!config.public.logtoAppId);
    console.log('Debug signin - process.env.NUXT_LOGTO_ENDPOINT:', !!process.env.NUXT_LOGTO_ENDPOINT);
    console.log('Debug signin - process.env.NUXT_LOGTO_APP_ID:', !!process.env.NUXT_LOGTO_APP_ID);
    console.log('Debug signin - final logtoEndpoint:', !!logtoEndpoint);
    console.log('Debug signin - final logtoAppId:', !!logtoAppId);

    if (!logtoEndpoint || !logtoAppId) {
      console.error('Missing Logto config:', {
        configEndpoint: !!config.public.logtoEndpoint,
        configAppId: !!config.public.logtoAppId,
        envEndpoint: !!process.env.NUXT_LOGTO_ENDPOINT,
        envAppId: !!process.env.NUXT_LOGTO_APP_ID,
        finalEndpoint: !!logtoEndpoint,
        finalAppId: !!logtoAppId
      });
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Logto configuration (NUXT_LOGTO_ENDPOINT / NUXT_LOGTO_APP_ID). Please set Fly secrets and redeploy.',
      });
    }

    // Generate sign in URL untuk Logto
    const baseUrl = getRequestURL(event).origin;
    const redirectUri = `${baseUrl}/auth/callback`;

    // Buat URL sign in dengan parameter yang diperlukan
    const signInUrl =
      `${logtoEndpoint}/oidc/auth?` +
      new URLSearchParams({
        client_id: logtoAppId as string,
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
