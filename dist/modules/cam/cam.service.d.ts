import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CamService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<any>;
    calculateProRata(leaseId: string): Promise<{
        leaseId: string;
        tenantId: any;
        suiteNumber: any;
        tenantGla: number;
        totalGla: number;
        proRataShare: number;
        proRataPercent: number;
        camPsf: number;
        annualCamEstimate: number;
        monthlyCamEstimate: number;
    }>;
    initiateYearEndTrueUp(propertyId: string, year: number): Promise<{
        year: number;
        propertyId: string;
        totalPropertyCamExpenses: number;
        totalGla: number;
        leaseCount: any;
        reconciliations: any[];
    }>;
    generateTrueUpInvoice(reconciliationId: string): Promise<{
        message: string;
        reconciliation: any;
        invoice?: undefined;
    } | {
        invoice: any;
        reconciliation: any;
        message?: undefined;
    }>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
