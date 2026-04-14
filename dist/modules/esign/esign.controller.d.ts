import { EsignService } from './esign.service';
export declare class EsignController {
    private readonly esignService;
    constructor(esignService: EsignService);
    findAll(query: any): Promise<any>;
    getStats(propertyId?: string): Promise<{
        total: any;
        pending: any;
        sent: any;
        signed: any;
        declined: any;
    }>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    send(id: string): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
    getByToken(token: string): Promise<any>;
    sign(token: string, req: any): Promise<any>;
    decline(token: string, body: {
        reason: string;
    }): Promise<any>;
}
