import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRentRoll(propertyId: string, asOfDate?: Date): Promise<any>;
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
    getFinancialSummary(propertyId: string, year: number): Promise<{
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
