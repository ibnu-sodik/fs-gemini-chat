import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
    const started = Date.now();
    const config = useRuntimeConfig();
    let dbOk = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch {
        dbOk = false;
    }
    return {
        ok: true,
        uptime: process.uptime(),
        ms: Date.now() - started,
        db: dbOk,
        logtoConfigured: Boolean(config.public.logtoEndpoint && config.public.logtoAppId && config.logtoAppSecret),
    };
});
