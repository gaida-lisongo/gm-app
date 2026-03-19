import { NextResponse } from 'next/server';
import { testConnection } from '@/libs/mySql';

export async function GET() {
    try {
        const dbConnected = await testConnection();

        if (dbConnected) {
            return NextResponse.json({
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'OK',
                }
            }, { status: 200 });
        } else {
            return NextResponse.json({
                status: 'unhealthy',
                database: 'disconnected',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'FAILED - Unable to connect',
                }
            }, { status: 503 });
        }
    } catch (error: any) {
        console.error('Health check error:', error);
        return NextResponse.json({
            status: 'unhealthy',
            database: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
            checks: {
                database: `ERROR - ${error.message}`,
            }
        }, { status: 503 });
    }
}
