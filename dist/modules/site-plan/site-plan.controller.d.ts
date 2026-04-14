import { SitePlanService } from './site-plan.service';
export declare class SitePlanController {
    private readonly sitePlanService;
    constructor(sitePlanService: SitePlanService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
