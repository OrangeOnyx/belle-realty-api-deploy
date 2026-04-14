import { CamService } from './cam.service';
export declare class CamController {
    private readonly camService;
    constructor(camService: CamService);
    findAll(query: any): Promise<any>;
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
    initiateYearEndTrueUp(body: {
        propertyId: string;
        year: number;
    }): Promise<{
        year: number;
        propertyId: string;
        totalPropertyCamExpenses: number;
        totalGla: number;
        leaseCount: any;
        reconciliations: any[];
    }>;
    generateTrueUpInvoice(id: string): Promise<{
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
