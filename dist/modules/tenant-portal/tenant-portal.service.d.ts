import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class TenantPortalService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            tenantId: any;
            tenantName: any;
        };
    }>;
    createTenantUser(data: {
        tenantId: string;
        email: string;
        name: string;
        password: string;
    }): Promise<any>;
    getTenantDashboard(tenantUserId: string): Promise<{
        tenantId: any;
        openInvoices: any;
        recentPayments: any;
        openMaintenance: any;
        activeLease: any;
        totalOwed: number;
    }>;
    getTenantInvoices(tenantUserId: string, filters?: any): Promise<any>;
    submitMaintenanceRequest(tenantUserId: string, data: any): Promise<any>;
    getTenantMaintenanceRequests(tenantUserId: string): Promise<any>;
    findAll(filters?: any): any;
}
