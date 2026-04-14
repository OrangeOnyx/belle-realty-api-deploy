import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): {
        id: string;
        data: any;
    };
    remove(id: string): {
        id: string;
    };
}
