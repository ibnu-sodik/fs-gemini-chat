import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    const started = Date.now();
    const config = useRuntimeConfig();
    let dbOk = false;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch (error) {
        console.error("Health check DB error:", error);
        dbOk = false;
    }

    // Check Logto configuration
    const logtoEndpoint = config.public.logtoEndpoint || process.env.NUXT_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;
    const logtoAppId = config.public.logtoAppId || process.env.NUXT_LOGTO_APP_ID || process.env.LOGTO_APP_ID;
    const logtoAppSecret = config.logtoAppSecret || process.env.NUXT_LOGTO_APP_SECRET || process.env.LOGTO_APP_SECRET;

    return {
        ok: true,
        uptime: process.uptime(),
        ms: Date.now() - started,
        db: dbOk,
        logtoConfigured: Boolean(logtoEndpoint && logtoAppId && logtoAppSecret),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    };
});