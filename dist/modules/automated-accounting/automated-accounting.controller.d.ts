import { AutomatedAccountingService } from './automated-accounting.service';
export declare class AutomatedAccountingController {
    private readonly service;
    constructor(service: AutomatedAccountingService);
    runLateFees(propertyId: string): Promise<{
        applied: number;
        details: any[];
    }>;
    runEscalations(propertyId: string): Promise<{
        applied: number;
        details: any[];
    }>;
    findAllExpenses(query: any): Promise<any>;
    createExpense(data: any): Promise<any>;
    updateExpense(id: string, data: any): Promise<any>;
    removeExpense(id: string): Promise<any>;
    getExpenseSummary(propertyId: string, year: string): Promise<{
        year: number;
        propertyId: string;
        total: number;
        byCategory: any;
    }>;
}
