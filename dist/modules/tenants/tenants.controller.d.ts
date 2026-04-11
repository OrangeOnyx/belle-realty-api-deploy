import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
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
