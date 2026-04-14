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
var AutomatedAccountingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedAccountingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AutomatedAccountingService = AutomatedAccountingService_1 = class AutomatedAccountingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AutomatedAccountingService_1.name);
    }
    async runDailyLateFeeCheck() {
        this.logger.log('Running daily late fee check...');
        const result = await this.applyLateFees();
        this.logger.log(`Late fee check complete. Applied ${result.applied} late fees.`);
    }
    async runMonthlyEscalationCheck() {
        this.logger.log('Running monthly rent escalation check...');
        const result = await this.applyRentEscalations();
        this.logger.log(`Escalation check complete. Applied ${result.applied} escalations.`);
    }
    async applyLateFees(propertyId) {
        const now = new Date();
        const applied = [];
        const where = {
            status: { in: ['SENT', 'PARTIAL'] },
            dueDate: { lt: now },
        };
        if (propertyId)
            where.propertyId = propertyId;
        const overdueInvoices = await this.prisma.invoice.findMany({
            where,
            include: {
                lease: { select: { id: true } },
                lineItems: true,
            },
        });
        for (const invoice of overdueInvoices) {
            if (!invoice.lease)
                continue;
            const gracePeriod = 5;
            const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysOverdue <= gracePeriod)
                continue;
            const existingLateFee = invoice.lineItems.find((li) => li.chargeCode === 'LATE_FEE');
            if (existingLateFee)
                continue;
            const percentFee = Number(invoice.balanceDue) * 0.05;
            const flatFee = 150;
            let lateFeeAmount = Math.max(percentFee, flatFee);
            if (lateFeeAmount <= 0)
                continue;
            await this.prisma.invoiceLineItem.create({
                data: {
                    invoiceId: invoice.id,
                    description: `Late Fee — ${daysOverdue} days overdue (grace period: ${gracePeriod} days)`,
                    chargeCode: 'LATE_FEE',
                    amount: lateFeeAmount,
                    quantity: 1,
                    unitPrice: lateFeeAmount,
                },
            });
            const newTotal = Number(invoice.totalAmount) + lateFeeAmount;
            const newBalance = Number(invoice.balanceDue) + lateFeeAmount;
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    totalAmount: newTotal,
                    balanceDue: newBalance,
                    notes: `Late fee applied on ${now.toLocaleDateString()} — ${daysOverdue} days overdue`,
                },
            });
            applied.push({ invoiceId: invoice.id, lateFeeAmount, daysOverdue });
        }
        return { applied: applied.length, details: applied };
    }
    async applyRentEscalations(propertyId) {
        const now = new Date();
        const applied = [];
        const where = {
            status: 'ACTIVE',
            escalationType: { in: ['FIXED', 'CPI'] },
            nextEscalationDate: { lte: now },
            deletedAt: null,
        };
        if (propertyId)
            where.propertyId = propertyId;
        const leasesForEscalation = await this.prisma.lease.findMany({
            where,
            include: { unit: true, tenant: { select: { legalName: true, tradeName: true } } },
        });
        for (const lease of leasesForEscalation) {
            const currentBasePsf = Number(lease.basePsf);
            const escalationRate = Number(lease.escalationRate || 0.03);
            const newBasePsf = currentBasePsf * (1 + escalationRate);
            const gla = Number(lease.unit.gla);
            const newMonthlyBase = (newBasePsf * gla) / 12;
            const newTotalPsf = newBasePsf + Number(lease.camPsf) + Number(lease.taxPsf) + Number(lease.insPsf) + Number(lease.additionalPsf);
            const newMonthlyTotal = (newTotalPsf * gla) / 12;
            const nextEscalation = new Date(lease.nextEscalationDate);
            nextEscalation.setFullYear(nextEscalation.getFullYear() + 1);
            await this.prisma.lease.update({
                where: { id: lease.id },
                data: {
                    basePsf: newBasePsf,
                    totalPsf: newTotalPsf,
                    monthlyBase: newMonthlyBase,
                    monthlyTotal: newMonthlyTotal,
                    nextEscalationDate: nextEscalation,
                },
            });
            const tenantName = lease.tenant.tradeName || lease.tenant.legalName;
            applied.push({
                leaseId: lease.id,
                tenantName,
                suiteNumber: lease.unit.suiteNumber,
                oldBasePsf: currentBasePsf,
                newBasePsf: parseFloat(newBasePsf.toFixed(4)),
                escalationRate: `${(escalationRate * 100).toFixed(1)}%`,
                effectiveDate: now.toLocaleDateString(),
            });
        }
        return { applied: applied.length, details: applied };
    }
    async runManualLateFeeCheck(propertyId) {
        return this.applyLateFees(propertyId);
    }
    async runManualEscalationCheck(propertyId) {
        return this.applyRentEscalations(propertyId);
    }
    async findAllExpenses(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.category)
            where.category = filters.category;
        if (filters?.year) {
            where.expenseDate = {
                gte: new Date(Number(filters.year), 0, 1),
                lte: new Date(Number(filters.year), 11, 31),
            };
        }
        return this.prisma.expense.findMany({
            where,
            orderBy: { expenseDate: 'desc' },
        });
    }
    async createExpense(data) {
        return this.prisma.expense.create({ data });
    }
    async updateExpense(id, data) {
        return this.prisma.expense.update({ where: { id }, data });
    }
    async removeExpense(id) {
        return this.prisma.expense.delete({ where: { id } });
    }
    async getExpenseSummary(propertyId, year) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);
        const expenses = await this.prisma.expense.groupBy({
            by: ['category'],
            where: {
                propertyId,
                expenseDate: { gte: yearStart, lte: yearEnd },
            },
            _sum: { amount: true },
            _count: { id: true },
        });
        const total = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);
        return {
            year,
            propertyId,
            total: parseFloat(total.toFixed(2)),
            byCategory: expenses.map(e => ({
                category: e.category || 'UNCATEGORIZED',
                total: parseFloat(Number(e._sum.amount || 0).toFixed(2)),
                count: e._count.id,
            })),
        };
    }
};
exports.AutomatedAccountingService = AutomatedAccountingService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomatedAccountingService.prototype, "runDailyLateFeeCheck", null);
__decorate([
    (0, schedule_1.Cron)('0 6 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomatedAccountingService.prototype, "runMonthlyEscalationCheck", null);
exports.AutomatedAccountingService = AutomatedAccountingService = AutomatedAccountingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomatedAccountingService);
//# sourceMappingURL=automated-accounting.service.js.map