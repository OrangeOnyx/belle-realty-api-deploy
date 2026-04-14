import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CriticalDatesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    runDailyAlertScan(): Promise<void>;
    scanLeaseExpirations(): Promise<any[]>;
    scanRenewalNoticeDeadlines(): Promise<any[]>;
    scanHvacContractExpirations(): Promise<any[]>;
    scanCoiExpirations(): Promise<any[]>;
    getUpcomingCriticalDates(propertyId?: string, days?: number): Promise<any>;
    getClauseConflictReport(propertyId: string): Promise<{
        propertyId: string;
        exclusivities: any[];
        permittedUses: any[];
        summary: string;
    }>;
    runManualScan(propertyId?: string): Promise<{
        leaseExpirationAlerts: number;
        renewalNoticeAlerts: number;
        hvacAlerts: number;
        coiAlerts: number;
        total: number;
    }>;
}
