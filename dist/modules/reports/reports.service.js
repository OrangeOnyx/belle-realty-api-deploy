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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const billing_engine_1 = require("../../common/engines/billing.engine");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRentRoll(propertyId, asOfDate) {
        const date = asOfDate || new Date();
        const leases = await this.prisma.lease.findMany({
            where: {
                propertyId,
                status: { in: ['ACTIVE', 'HOLDOVER', 'EXPIRED'] },
            },
            include: {
                unit: { select: { suiteNumber: true, gla: true } },
                tenant: { select: { legalName: true, tradeName: true } },
            },
            orderBy: [{ unit: { suiteNumber: 'asc' } }],
        });
        return leases.map(l => {
            const days = (0, billing_engine_1.daysUntilExpiry)(l.leaseEnd, date);
            return {
                suiteNumber: l.unit.suiteNumber,
                tenantLegalName: l.tenant.legalName,
                tenantTradeName: l.tenant.tradeName || '',
                leaseType: l.leaseType,
                leaseStart: l.leaseStart.toISOString().split('T')[0],
                leaseEnd: l.leaseEnd.toISOString().split('T')[0],
                leaseStatus: l.status,
                gla: Number(l.unit.gla),
                basePsf: Number(l.basePsf),
                camPsf: Number(l.camPsf),
                taxPsf: Number(l.taxPsf),
                insPsf: Number(l.insPsf),
                additionalPsf: Number(l.additionalPsf),
                totalPsf: Number(l.totalPsf),
                monthlyBase: Number(l.monthlyBase),
                monthlyAdditional: Number(l.monthlyAdditional),
                monthlyTotal: Number(l.monthlyTotal),
                annualRent: Math.round(Number(l.monthlyTotal) * 12 * 100) / 100,
                securityDepositHeld: Number(l.securityDepositHeld),
                daysUntilExpiry: days,
                nextEscalationDate: l.nextEscalationDate?.toISOString().split('T')[0] || null,
                isHoldover: l.status === 'HOLDOVER',
                holdoverMonthlyRent: l.status === 'HOLDOVER'
                    ? Math.round(Number(l.monthlyTotal) * Number(l.holdoverRateMultiplier) * 100) / 100
                    : null,
            };
        });
    }
    async getArAging(propertyId) {
        const now = new Date();
        const invoices = await this.prisma.invoice.findMany({
            where: {
                propertyId,
                status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
                balanceDue: { gt: 0 },
            },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                unit: false,
            },
        });
        const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
        const rows = invoices.map(inv => {
            const daysOverdue = Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)));
            const balance = Number(inv.balanceDue);
            if (daysOverdue === 0)
                buckets.current += balance;
            else if (daysOverdue <= 30)
                buckets.days30 += balance;
            else if (daysOverdue <= 60)
                buckets.days60 += balance;
            else if (daysOverdue <= 90)
                buckets.days90 += balance;
            else
                buckets.over90 += balance;
            return {
                invoiceNumber: inv.invoiceNumber,
                tenantName: inv.tenant.tradeName || inv.tenant.legalName,
                dueDate: inv.dueDate.toISOString().split('T')[0],
                daysOverdue,
                totalAmount: Number(inv.totalAmount),
                paidAmount: Number(inv.paidAmount),
                balanceDue: balance,
                bucket: daysOverdue === 0 ? 'CURRENT' : daysOverdue <= 30 ? '1-30' : daysOverdue <= 60 ? '31-60' : daysOverdue <= 90 ? '61-90' : '90+',
            };
        });
        return {
            asOfDate: now.toISOString().split('T')[0],
            summary: {
                current: Math.round(buckets.current * 100) / 100,
                days1to30: Math.round(buckets.days30 * 100) / 100,
                days31to60: Math.round(buckets.days60 * 100) / 100,
                days61to90: Math.round(buckets.days90 * 100) / 100,
                over90: Math.round(buckets.over90 * 100) / 100,
                total: Math.round((buckets.current + buckets.days30 + buckets.days60 + buckets.days90 + buckets.over90) * 100) / 100,
            },
            rows,
        };
    }
    async getFinancialSummary(propertyId, year) {
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31`);
        const [invoices, payments, expenses, parkingPayments] = await Promise.all([
            this.prisma.invoice.findMany({
                where: { propertyId, periodStart: { gte: start, lte: end } },
                select: { totalAmount: true, paidAmount: true, status: true, periodStart: true },
            }),
            this.prisma.payment.findMany({
                where: { propertyId, receivedAt: { gte: start, lte: end } },
                select: { amount: true, receivedAt: true },
            }),
            this.prisma.expense.findMany({
                where: { propertyId, expenseDate: { gte: start, lte: end } },
                select: { amount: true, category: true, expenseDate: true },
            }),
            this.prisma.parkingPayment.findMany({
                where: { agreement: { propertyId }, periodYear: year },
                select: { amount: true, periodMonth: true },
            }),
        ]);
        const totalBilled = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
        const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);
        const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
        const parkingRevenue = parkingPayments.reduce((s, p) => s + Number(p.amount), 0);
        const noi = totalCollected + parkingRevenue - totalExpenses;
        return {
            year,
            totalBilled: Math.round(totalBilled * 100) / 100,
            totalCollected: Math.round(totalCollected * 100) / 100,
            parkingRevenue: Math.round(parkingRevenue * 100) / 100,
            totalRevenue: Math.round((totalCollected + parkingRevenue) * 100) / 100,
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            noi: Math.round(noi * 100) / 100,
            collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 10000) / 100 : 0,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map