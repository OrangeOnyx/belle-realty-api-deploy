import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getOccupancy(propertyId: string): Promise<any>;
}
