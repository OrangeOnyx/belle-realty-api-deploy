import { FinancialsService } from './financials.service';
export declare class FinancialsController {
    private readonly financialsService;
    constructor(financialsService: FinancialsService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
    recordPayment(id: string, body: any): Promise<any>;
    generateMonthly(body: {
        propertyId: string;
        month: number;
        year: number;
    }): Promise<{
        generated: number;
        month: number;
        year: number;
        invoices: any[];
    }>;
}
