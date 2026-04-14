import { TenantPortalService } from './tenant-portal.service';
export declare class TenantPortalController {
    private readonly tenantPortalService;
    constructor(tenantPortalService: TenantPortalService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            tenantId: any;
            tenantName: any;
        };
    }>;
    createTenantUser(body: any): Promise<any>;
    findAll(query: any): any;
    getDashboard(tenantUserId: string): Promise<{
        tenantId: any;
        openInvoices: any;
        recentPayments: any;
        openMaintenance: any;
        activeLease: any;
        totalOwed: number;
    }>;
    getInvoices(tenantUserId: string, query: any): Promise<any>;
    submitMaintenance(tenantUserId: string, body: any): Promise<any>;
    getMaintenanceRequests(tenantUserId: string): Promise<any>;
}
