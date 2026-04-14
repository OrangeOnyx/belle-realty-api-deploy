import { HvacContractsService } from './hvac-contracts.service';
export declare class HvacContractsController {
    private readonly hvacContractsService;
    constructor(hvacContractsService: HvacContractsService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
