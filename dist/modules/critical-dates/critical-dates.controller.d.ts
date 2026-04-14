import { CriticalDatesService } from './critical-dates.service';
export declare class CriticalDatesController {
    private readonly service;
    constructor(service: CriticalDatesService);
    getAll(propertyId: string, days: string): Promise<any>;
    getUpcoming(propertyId: string, days: string): Promise<any>;
    getClauseConflicts(propertyId: string): Promise<{
        propertyId: string;
        exclusivities: any[];
        permittedUses: any[];
        summary: string;
    }>;
    runManualScan(propertyId: string): Promise<{
        leaseExpirationAlerts: number;
        renewalNoticeAlerts: number;
        hvacAlerts: number;
        coiAlerts: number;
        total: number;
    }>;
}
