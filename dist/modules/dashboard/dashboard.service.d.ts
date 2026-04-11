import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMetrics(propertyId?: string): Promise<{
        propertyCount: any;
        totalUnits: any;
        occupiedUnits: any;
        occupancyRate: number;
        totalMonthlyRent: any;
        openMaintenanceRequests: any;
        expiredLeases: any;
        holdoverLeases: any;
        upcomingExpirations30: any;
        upcomingExpirations90: any;
        overdueInvoices: any;
        pendingCompliance: any;
        recentActivity: any;
        urgentAlerts: any[];
    }>;
    getOccupancyBreakdown(propertyId: string): Promise<any>;
}
