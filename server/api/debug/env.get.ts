// Debug endpoint to check environment variables - REMOVE IN PRODUCTION
export default defineEventHandler(async (event) => {
    // Only allow this in development or with special query parameter
    const query = getQuery(event);
    if (process.env.NODE_ENV === 'production' && query.debug !== 'allow') {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not found'
        });
    }

    // Filter and show only Logto-related env variables (without exposing secrets)
    const relevantEnvs = Object.keys(process.env)
        .filter(key => key.includes('LOGTO') || key.includes('NUXT'))
        .reduce((acc, key) => {
            // Don't expose secret values, just show if they exist
            if (key.includes('SECRET') || key.includes('KEY')) {
                acc[key] = process.env[key] ? '[SET]' : '[NOT SET]';
            } else {
                acc[key] = process.env[key] || '[NOT SET]';
            }
            return acc;
        }, {} as Record<string, string>);

    const config = useRuntimeConfig();

    return {
        environmentVariables: relevantEnvs,
        runtimeConfigPublic: {
            logtoEndpoint: config.public.logtoEndpoint || '[NOT SET]',
            logtoAppId: config.public.logtoAppId || '[NOT SET]',
        },
        runtimeConfigPrivate: {
            logtoAppSecret: config.logtoAppSecret ? '[SET]' : '[NOT SET]',
            logtoCookieEncryptionKey: config.logtoCookieEncryptionKey ? '[SET]' : '[NOT SET]',
        }
    };
});