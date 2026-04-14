import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AutomatedAccountingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    runDailyLateFeeCheck(): Promise<void>;
    runMonthlyEscalationCheck(): Promise<void>;
    applyLateFees(propertyId?: string): Promise<{
        applied: number;
        details: any[];
    }>;
    applyRentEscalations(propertyId?: string): Promise<{
        applied: number;
        details: any[];
    }>;
    runManualLateFeeCheck(propertyId?: string): Promise<{
        applied: number;
        details: any[];
    }>;
    runManualEscalationCheck(propertyId?: string): Promise<{
        applied: number;
        details: any[];
    }>;
    findAllExpenses(filters?: any): Promise<any>;
    createExpense(data: any): Promise<any>;
    updateExpense(id: string, data: any): Promise<any>;
    removeExpense(id: string): Promise<any>;
    getExpenseSummary(propertyId: string, year: number): Promise<{
        year: number;
        propertyId: string;
        total: number;
        byCategory: any;
    }>;
}
