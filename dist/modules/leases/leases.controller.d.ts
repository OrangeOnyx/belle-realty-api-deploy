import { LeasesService } from './leases.service';
export declare class LeasesController {
    private readonly leasesService;
    constructor(leasesService: LeasesService);
    findAll(propertyId?: string, status?: string, unitId?: string, tenantId?: string): Promise<any>;
    getHoldover(propertyId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    validateScheduleG(body: any): Promise<import("../../common/engines/schedule-g.engine").ScheduleGResult>;
    renewalDefaults(id: string): Promise<{
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
}
