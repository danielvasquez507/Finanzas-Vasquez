import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') return res.status(405).end();

    const start = Date.now();
    const checks: any = {
        timestamp: new Date().toISOString(),
        database: 'checking...',
        env: {
            node_env: process.env.NODE_ENV,
            db_url_set: !!process.env.DATABASE_URL,
        }
    };

    try {
        // Try a very basic query
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'connected';
        checks.latency = `${Date.now() - start}ms`;

        // Optional: Get counts to ensure tables exist
        const [txCount, catCount] = await Promise.all([
            prisma.transaction.count(),
            prisma.category.count()
        ]);
        checks.counts = { transactions: txCount, categories: catCount };

        res.status(200).json({ status: 'healthy', ...checks });
    } catch (error: any) {
        console.error('Health check failed:', error);

        // Provide more detail about the error if possible
        let detailedError = error.message || 'Unknown error';
        if (error.code === 'P2021') detailedError = "Tables not found (Run migrations)";
        if (error.code === 'P1001') detailedError = "Cannot reach DB (Check host/port/firewall)";
        if (error.code === 'P1003') detailedError = "DB exists but unreachable";

        res.status(503).json({
            status: 'unhealthy',
            ...checks,
            error: detailedError,
            prismaError: error.code || 'No code'
        });
    }
}
