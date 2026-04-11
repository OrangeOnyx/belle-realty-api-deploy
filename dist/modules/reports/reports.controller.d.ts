import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getRentRoll(propertyId: string, asOfDate?: string): Promise<any>;
    getArAging(propertyId: string): Promise<{
        asOfDate: string;
        summary: {
            current: number;
            days1to30: number;
            days31to60: number;
            days61to90: number;
            over90: number;
            total: number;
        };
        rows: any;
    }>;
    getFinancialSummary(propertyId: string, year: string): Promise<{
        year: number;
        totalBilled: number;
        totalCollected: number;
        parkingRevenue: number;
        totalRevenue: number;
        totalExpenses: number;
        noi: number;
        collectionRate: number;
    }>;
}
