import { PrismaService } from '../../common/prisma/prisma.service';
export declare class FinancialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
    recordPayment(invoiceId: string, paymentData: any): Promise<any>;
    generateMonthlyInvoices(propertyId: string, month: number, year: number): Promise<{
        generated: number;
        month: number;
        year: number;
        invoices: any[];
    }>;
}
