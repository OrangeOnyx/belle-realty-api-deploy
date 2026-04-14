"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PercentageRentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PercentageRentService = class PercentageRentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllClauses(filters) {
        const where = {};
        if (filters?.leaseId)
            where.leaseId = filters.leaseId;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        return this.prisma.percentageRentClause.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { include: { unit: { select: { suiteNumber: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneClause(id) {
        const clause = await this.prisma.percentageRentClause.findUnique({
            where: { id },
            include: {
                tenant: true,
                lease: { include: { unit: true } },
            },
        });
        if (!clause)
            throw new common_1.NotFoundException('Percentage rent clause not found');
        return clause;
    }
    async createClause(data) {
        return this.prisma.percentageRentClause.create({ data });
    }
    async updateClause(id, data) {
        await this.findOneClause(id);
        return this.prisma.percentageRentClause.update({ where: { id }, data });
    }
    async removeClause(id) {
        await this.findOneClause(id);
        return this.prisma.percentageRentClause.delete({ where: { id } });
    }
    async findAllSalesReports(filters) {
        const where = {};
        if (filters?.leaseId)
            where.leaseId = filters.leaseId;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        return this.prisma.tenantSalesReport.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { include: { unit: { select: { suiteNumber: true } } } },
            },
            orderBy: { periodStart: 'desc' },
        });
    }
    async submitSalesReport(data) {
        const { leaseId, tenantId, periodStart, periodEnd, grossSales } = data;
        const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        const existing = await this.prisma.tenantSalesReport.findFirst({
            where: {
                leaseId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
            },
        });
        if (existing)
            throw new common_1.BadRequestException('Sales report already submitted for this period');
        const report = await this.prisma.tenantSalesReport.create({
            data: {
                leaseId,
                tenantId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                grossSales,
                submittedAt: new Date(),
                source: data.source || 'SELF_REPORTED',
            },
        });
        const percentageRentDue = await this.calculatePercentageRentDue(leaseId, periodStart, periodEnd);
        return { report, percentageRentDue };
    }
    async calculatePercentageRentDue(leaseId, periodStart, periodEnd) {
        const clause = await this.prisma.percentageRentClause.findFirst({
            where: { leaseId },
        });
        if (!clause)
            return { percentageRentDue: 0, message: 'No percentage rent clause on this lease' };
        const lease = await this.prisma.lease.findUnique({
            where: { id: leaseId },
            include: { unit: true },
        });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        const queryStart = clause.reportingPeriod === 'ANNUAL'
            ? new Date(start.getFullYear(), 0, 1)
            : start;
        const queryEnd = clause.reportingPeriod === 'ANNUAL'
            ? new Date(start.getFullYear(), 11, 31)
            : end;
        const salesAgg = await this.prisma.tenantSalesReport.aggregate({
            where: {
                leaseId,
                periodStart: { gte: queryStart },
                periodEnd: { lte: queryEnd },
            },
            _sum: { grossSales: true },
        });
        const totalSales = Number(salesAgg._sum.grossSales || 0);
        let breakpoint;
        if (clause.breakpointType === 'NATURAL') {
            const annualBaseRent = Number(lease.monthlyBase) * 12;
            const rate = Number(clause.percentageRate);
            breakpoint = rate > 0 ? annualBaseRent / rate : Infinity;
        }
        else {
            breakpoint = Number(clause.stipulatedBreakpoint || 0);
        }
        const salesAboveBreakpoint = Math.max(0, totalSales - breakpoint);
        const percentageRentDue = salesAboveBreakpoint * Number(clause.percentageRate);
        return {
            leaseId,
            tenantId: lease.tenantId,
            suiteNumber: lease.unit.suiteNumber,
            reportingPeriod: clause.reportingPeriod,
            breakpointType: clause.breakpointType,
            breakpoint: parseFloat(breakpoint.toFixed(2)),
            totalSales: parseFloat(totalSales.toFixed(2)),
            salesAboveBreakpoint: parseFloat(salesAboveBreakpoint.toFixed(2)),
            percentageRate: Number(clause.percentageRate),
            percentageRentDue: parseFloat(percentageRentDue.toFixed(2)),
            message: percentageRentDue > 0
                ? `Percentage rent of $${percentageRentDue.toFixed(2)} is due`
                : `Sales of $${totalSales.toFixed(2)} have not exceeded the $${breakpoint.toFixed(2)} breakpoint`,
        };
    }
    async generatePercentageRentInvoice(leaseId, periodStart, periodEnd) {
        const calc = await this.calculatePercentageRentDue(leaseId, periodStart, periodEnd);
        if (!calc.percentageRentDue || calc.percentageRentDue <= 0) {
            return { message: 'No percentage rent due for this period', calculation: calc };
        }
        const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const invNum = `PCT-${Date.now()}`;
        const invoice = await this.prisma.invoice.create({
            data: {
                propertyId: lease.propertyId,
                tenantId: lease.tenantId,
                leaseId,
                invoiceNumber: invNum,
                status: 'SENT',
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                dueDate,
                subtotal: calc.percentageRentDue,
                taxAmount: 0,
                totalAmount: calc.percentageRentDue,
                paidAmount: 0,
                balanceDue: calc.percentageRentDue,
                notes: `Percentage Rent — ${calc.percentageRate * 100}% of $${calc.salesAboveBreakpoint.toFixed(2)} above $${calc.breakpoint.toFixed(2)} breakpoint`,
                lineItems: {
                    create: [{
                            description: `Percentage Rent — ${new Date(periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                            chargeCode: 'PERCENTAGE_RENT',
                            amount: calc.percentageRentDue,
                            quantity: 1,
                            unitPrice: calc.percentageRentDue,
                        }],
                },
            },
        });
        return { invoice, calculation: calc };
    }
};
exports.PercentageRentService = PercentageRentService;
exports.PercentageRentService = PercentageRentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PercentageRentService);
//# sourceMappingURL=percentage-rent.service.js.map