import { TenantPortalService } from './tenant-portal.service';
export declare class TenantPortalController {
    private readonly tenantPortalService;
    constructor(tenantPortalService: TenantPortalService);
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
