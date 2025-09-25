// Temporary signin endpoint that reads directly from environment variables
export default defineEventHandler(async (event) => {
    try {
        // Read directly from environment variables, bypassing runtime config
        const logtoEndpoint = process.env.NUXT_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;
        const logtoAppId = process.env.NUXT_LOGTO_APP_ID || process.env.LOGTO_APP_ID;

        console.log('Direct env signin - NUXT_LOGTO_ENDPOINT:', !!process.env.NUXT_LOGTO_ENDPOINT);
        console.log('Direct env signin - NUXT_LOGTO_APP_ID:', !!process.env.NUXT_LOGTO_APP_ID);
        console.log('Direct env signin - final logtoEndpoint:', !!logtoEndpoint);
        console.log('Direct env signin - final logtoAppId:', !!logtoAppId);

        if (!logtoEndpoint || !logtoAppId) {
            console.error('Direct env signin - Missing Logto config:', {
                envEndpoint: !!process.env.NUXT_LOGTO_ENDPOINT,
                envAppId: !!process.env.NUXT_LOGTO_APP_ID,
                finalEndpoint: !!logtoEndpoint,
                finalAppId: !!logtoAppId
            });
            throw createError({
                statusCode: 500,
                statusMessage: 'Missing Logto configuration. Environment variables not found.',
            });
        }

        // Generate sign in URL untuk Logto
        const baseUrl = getRequestURL(event).origin;
        const redirectUri = `${baseUrl}/auth/callback`;

        // Generate random state
        const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Buat URL sign in dengan parameter yang diperlukan
        const signInUrl =
            `${logtoEndpoint}/oidc/auth?` +
            new URLSearchParams({
                client_id: logtoAppId,
                redirect_uri: redirectUri,
                response_type: "code",
                scope: "openid profile email",
                state: state,
            }).toString();

        return {
            success: true,
            signInUrl,
            debug: {
                endpointUsed: "direct-env",
                logtoEndpoint: logtoEndpoint,
                logtoAppId: logtoAppId
            }
        };
    } catch (error) {
        console.error("Direct env signin error:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error during sign in",
        });
    }
});