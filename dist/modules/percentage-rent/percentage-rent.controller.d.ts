import { PercentageRentService } from './percentage-rent.service';
export declare class PercentageRentController {
    private readonly service;
    constructor(service: PercentageRentService);
    findAll(query: any): Promise<any>;
    findAllClauses(query: any): Promise<any>;
    findOneClause(id: string): Promise<any>;
    createClause(data: any): Promise<any>;
    updateClause(id: string, data: any): Promise<any>;
    removeClause(id: string): Promise<any>;
    findAllSalesReports(query: any): Promise<any>;
    submitSalesReport(data: any): Promise<{
        report: any;
        percentageRentDue: {
            percentageRentDue: number;
            message: string;
            leaseId?: undefined;
            tenantId?: undefined;
            suiteNumber?: undefined;
            reportingPeriod?: undefined;
            breakpointType?: undefined;
            breakpoint?: undefined;
            totalSales?: undefined;
            salesAboveBreakpoint?: undefined;
            percentageRate?: undefined;
        } | {
            leaseId: string;
            tenantId: any;
            suiteNumber: any;
            reportingPeriod: any;
            breakpointType: any;
            breakpoint: number;
            totalSales: number;
            salesAboveBreakpoint: number;
            percentageRate: number;
            percentageRentDue: number;
            message: string;
        };
    }>;
    calculateDue(leaseId: string, periodStart: string, periodEnd: string): Promise<{
        percentageRentDue: number;
        message: string;
        leaseId?: undefined;
        tenantId?: undefined;
        suiteNumber?: undefined;
        reportingPeriod?: undefined;
        breakpointType?: undefined;
        breakpoint?: undefined;
        totalSales?: undefined;
        salesAboveBreakpoint?: undefined;
        percentageRate?: undefined;
    } | {
        leaseId: string;
        tenantId: any;
        suiteNumber: any;
        reportingPeriod: any;
        breakpointType: any;
        breakpoint: number;
        totalSales: number;
        salesAboveBreakpoint: number;
        percentageRate: number;
        percentageRentDue: number;
        message: string;
    }>;
    generateInvoice(body: {
        leaseId: string;
        periodStart: string;
        periodEnd: string;
    }): Promise<{
        message: string;
        calculation: {
            percentageRentDue: number;
            message: string;
            leaseId?: undefined;
            tenantId?: undefined;
            suiteNumber?: undefined;
            reportingPeriod?: undefined;
            breakpointType?: undefined;
            breakpoint?: undefined;
            totalSales?: undefined;
            salesAboveBreakpoint?: undefined;
            percentageRate?: undefined;
        } | {
            leaseId: string;
            tenantId: any;
            suiteNumber: any;
            reportingPeriod: any;
            breakpointType: any;
            breakpoint: number;
            totalSales: number;
            salesAboveBreakpoint: number;
            percentageRate: number;
            percentageRentDue: number;
            message: string;
        };
        invoice?: undefined;
    } | {
        invoice: any;
        calculation: {
            percentageRentDue: number;
            message: string;
            leaseId?: undefined;
            tenantId?: undefined;
            suiteNumber?: undefined;
            reportingPeriod?: undefined;
            breakpointType?: undefined;
            breakpoint?: undefined;
            totalSales?: undefined;
            salesAboveBreakpoint?: undefined;
            percentageRate?: undefined;
        } | {
            leaseId: string;
            tenantId: any;
            suiteNumber: any;
            reportingPeriod: any;
            breakpointType: any;
            breakpoint: number;
            totalSales: number;
            salesAboveBreakpoint: number;
            percentageRate: number;
            percentageRentDue: number;
            message: string;
        };
        message?: undefined;
    }>;
}
