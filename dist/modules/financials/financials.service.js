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
exports.FinancialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let FinancialsService = class FinancialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        if (filters?.leaseId)
            where.leaseId = filters.leaseId;
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.invoice.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { select: { unit: { select: { suiteNumber: true } } } },
                lineItems: true,
                payments: { orderBy: { receivedAt: 'desc' } },
            },
            orderBy: [{ periodStart: 'desc' }],
        });
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                tenant: true,
                lease: { include: { unit: true } },
                lineItems: true,
                payments: { orderBy: { receivedAt: 'desc' } },
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async create(data) {
        const { lineItems, ...invoiceData } = data;
        return this.prisma.invoice.create({
            data: {
                ...invoiceData,
                lineItems: lineItems ? { create: lineItems } : undefined,
            },
            include: { lineItems: true },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.invoice.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.invoice.update({ where: { id }, data: { status: 'VOID', voidedAt: new Date() } });
    }
    async recordPayment(invoiceId, paymentData) {
        const invoice = await this.findOne(invoiceId);
        const payment = await this.prisma.payment.create({
            data: {
                propertyId: invoice.propertyId,
                tenantId: invoice.tenantId,
                leaseId: invoice.leaseId,
                invoiceId,
                amount: paymentData.amount,
                method: paymentData.method || 'CHECK',
                referenceNumber: paymentData.referenceNumber,
                receivedAt: paymentData.receivedAt ? new Date(paymentData.receivedAt) : new Date(),
                notes: paymentData.notes,
                postedById: paymentData.postedById,
            },
        });
        const agg = await this.prisma.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
        const paid = Number(agg._sum.amount || 0);
        const balance = Number(invoice.totalAmount) - paid;
        const newStatus = balance <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : invoice.status;
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { paidAmount: paid, balanceDue: Math.max(0, balance), status: newStatus, paidAt: balance <= 0 ? new Date() : null },
        });
        return payment;
    }
    async generateMonthlyInvoices(propertyId, month, year) {
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0);
        const dueDate = new Date(year, month - 1, 1);
        const activeLeases = await this.prisma.lease.findMany({
            where: { propertyId, status: { in: ['ACTIVE', 'HOLDOVER'] }, deletedAt: null },
            include: { unit: { select: { suiteNumber: true, gla: true } } },
        });
        const created = [];
        let invNum = Date.now();
        for (const lease of activeLeases) {
            const existing = await this.prisma.invoice.findFirst({ where: { leaseId: lease.id, periodStart } });
            if (existing)
                continue;
            const mult = lease.status === 'HOLDOVER' ? Number(lease.holdoverRateMultiplier) : 1;
            const base = Number(lease.monthlyBase) * mult;
            const additional = Number(lease.monthlyAdditional) * mult;
            const total = base + additional;
            const invoice = await this.prisma.invoice.create({
                data: {
                    propertyId,
                    tenantId: lease.tenantId,
                    leaseId: lease.id,
                    invoiceNumber: `INV-${year}${String(month).padStart(2, '0')}-${invNum++}`,
                    status: 'SENT',
                    periodStart,
                    periodEnd,
                    dueDate,
                    subtotal: total,
                    taxAmount: 0,
                    totalAmount: total,
                    paidAmount: 0,
                    balanceDue: total,
                    notes: lease.status === 'HOLDOVER' ? `Holdover rate (${mult}x)` : null,
                    lineItems: {
                        create: [
                            { description: `Base Rent — ${lease.unit.suiteNumber}`, chargeCode: 'BASE_RENT', amount: base, quantity: 1, unitPrice: base },
                            ...(additional > 0 ? [{ description: `NNN — ${lease.unit.suiteNumber}`, chargeCode: 'CAM', amount: additional, quantity: 1, unitPrice: additional }] : []),
                        ],
                    },
                },
            });
            created.push(invoice);
        }
        return { generated: created.length, month, year, invoices: created };
    }
};
exports.FinancialsService = FinancialsService;
exports.FinancialsService = FinancialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialsService);
//# sourceMappingURL=financials.service.js.map