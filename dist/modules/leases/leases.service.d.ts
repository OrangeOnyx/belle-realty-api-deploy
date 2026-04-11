import { PrismaService } from '../../common/prisma/prisma.service';
export declare class LeasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        propertyId?: string;
        status?: string;
        unitId?: string;
        tenantId?: string;
    }): Promise<any>;
    findOne(id: string): Promise<any>;
    validateScheduleG(input: any): Promise<import("../../common/engines/schedule-g.engine").ScheduleGResult>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    generateRenewalDefaults(leaseId: string): Promise<{
        leaseId: string;
        unitSuiteNumber: any;
        gla: number;
        glaSource: string;
        defaults: {
            basePsf: number;
            additionalPsf: number;
            totalPsf: number;
            camPsf: number;
            taxPsf: number;
            insPsf: number;
            statedTermMonths: number;
        };
        scheduleG: import("../../common/engines/schedule-g.engine").ScheduleGResult;
        note: string;
    }>;
    getHoldoverLeases(propertyId?: string): Promise<any>;
}
