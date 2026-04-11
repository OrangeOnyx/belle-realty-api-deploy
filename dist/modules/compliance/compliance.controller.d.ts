import { ComplianceService } from './compliance.service';
export declare class ComplianceController {
    private readonly complianceService;
    constructor(complianceService: ComplianceService);
    findAll(query: any): {
        message: string;
    };
    findOne(id: string): {
        message: string;
        id: string;
    };
    create(body: any): {
        message: string;
        data: any;
    };
    update(id: string, body: any): {
        message: string;
        id: string;
        data: any;
    };
    remove(id: string): {
        message: string;
        id: string;
    };
}
