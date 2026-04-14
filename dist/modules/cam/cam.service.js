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
exports.CamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CamService = class CamService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        if (filters?.year)
            where.reconcileYear = Number(filters.year);
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.camReconciliation.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { include: { unit: { select: { suiteNumber: true, gla: true } } } },
            },
            orderBy: [{ reconcileYear: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const rec = await this.prisma.camReconciliation.findUnique({
            where: { id },
            include: {
                tenant: true,
                lease: { include: { unit: true } },
                property: { select: { name: true, totalGla: true } },
            },
        });
        if (!rec)
            throw new common_1.NotFoundException('CAM reconciliation not found');
        return rec;
    }
    async calculateProRata(leaseId) {
        const lease = await this.prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                unit: true,
                property: true,
            },
        });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        const tenantGla = Number(lease.unit.gla);
        const totalGla = Number(lease.property.totalGla);
        if (totalGla === 0)
            throw new common_1.BadRequestException('Property totalGla is 0 — cannot compute pro-rata');
        const proRataShare = tenantGla / totalGla;
        const annualCamEstimate = Number(lease.camPsf) * tenantGla;
        return {
            leaseId,
            tenantId: lease.tenantId,
            suiteNumber: lease.unit.suiteNumber,
            tenantGla,
            totalGla,
            proRataShare: parseFloat(proRataShare.toFixed(6)),
            proRataPercent: parseFloat((proRataShare * 100).toFixed(4)),
            camPsf: Number(lease.camPsf),
            annualCamEstimate: parseFloat(annualCamEstimate.toFixed(2)),
            monthlyCamEstimate: parseFloat((annualCamEstimate / 12).toFixed(2)),
        };
    }
    async initiateYearEndTrueUp(propertyId, year) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);
        const camCategories = ['MAINTENANCE', 'INSURANCE', 'UTILITIES', 'MANAGEMENT', 'PROFESSIONAL', 'OTHER'];
        const totalExpenses = await this.prisma.expense.aggregate({
            where: {
                propertyId,
                expenseDate: { gte: yearStart, lte: yearEnd },
                category: { in: camCategories },
            },
            _sum: { amount: true },
        });
        const totalPropertyCamExpenses = Number(totalExpenses._sum.amount || 0);
        const leases = await this.prisma.lease.findMany({
            where: {
                propertyId,
                status: { in: ['ACTIVE', 'HOLDOVER'] },
                deletedAt: null,
            },
            include: { unit: true },
        });
        const totalGla = Number(property.totalGla);
        const results = [];
        for (const lease of leases) {
            const tenantGla = Number(lease.unit.gla);
            const proRataShare = totalGla > 0 ? tenantGla / totalGla : 0;
            const tenantActualCam = totalPropertyCamExpenses * proRataShare;
            const estimatedAnnualCam = Number(lease.camPsf) * tenantGla;
            const trueUpAmount = tenantActualCam - estimatedAnnualCam;
            const existing = await this.prisma.camReconciliation.findFirst({
                where: { leaseId: lease.id, reconcileYear: year },
            });
            if (existing) {
                const updated = await this.prisma.camReconciliation.update({
                    where: { id: existing.id },
                    data: {
                        totalPropertyCamExpenses,
                        tenantProRataShare: proRataShare,
                        tenantActualCam,
                        estimatedAnnualCam,
                        trueUpAmount,
                        status: 'DRAFT',
                    },
                });
                results.push(updated);
            }
            else {
                const rec = await this.prisma.camReconciliation.create({
                    data: {
                        propertyId,
                        leaseId: lease.id,
                        tenantId: lease.tenantId,
                        reconcileYear: year,
                        estimatedAnnualCam,
                        totalPropertyCamExpenses,
                        tenantProRataShare: proRataShare,
                        tenantActualCam,
                        trueUpAmount,
                        status: 'DRAFT',
                    },
                });
                results.push(rec);
            }
        }
        return {
            year,
            propertyId,
            totalPropertyCamExpenses,
            totalGla,
            leaseCount: leases.length,
            reconciliations: results,
        };
    }
    async generateTrueUpInvoice(reconciliationId) {
        const rec = await this.findOne(reconciliationId);
        if (rec.status === 'SETTLED')
            throw new common_1.BadRequestException('Reconciliation already settled');
        const trueUp = Number(rec.trueUpAmount);
        if (Math.abs(trueUp) < 0.01) {
            return { message: 'No true-up needed — amounts match within $0.01', reconciliation: rec };
        }
        const description = trueUp > 0
            ? `CAM True-Up ${rec.reconcileYear} — Balance Due (Actual CAM exceeded estimate by $${trueUp.toFixed(2)})`
            : `CAM True-Up ${rec.reconcileYear} — Credit (Estimate exceeded actual CAM by $${Math.abs(trueUp).toFixed(2)})`;
        const invNum = `CAM-${rec.reconcileYear}-${Date.now()}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const invoice = await this.prisma.invoice.create({
            data: {
                propertyId: rec.propertyId,
                tenantId: rec.tenantId,
                leaseId: rec.leaseId,
                invoiceNumber: invNum,
                status: 'SENT',
                periodStart: new Date(rec.reconcileYear, 0, 1),
                periodEnd: new Date(rec.reconcileYear, 11, 31),
                dueDate,
                subtotal: Math.abs(trueUp),
                taxAmount: 0,
                totalAmount: Math.abs(trueUp),
                paidAmount: 0,
                balanceDue: Math.abs(trueUp),
                notes: description,
                lineItems: {
                    create: [{
                            description,
                            chargeCode: 'CAM_TRUE_UP',
                            amount: trueUp,
                            quantity: 1,
                            unitPrice: trueUp,
                        }],
                },
            },
        });
        await this.prisma.camReconciliation.update({
            where: { id: reconciliationId },
            data: { status: 'SENT' },
        });
        return { invoice, reconciliation: rec };
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.camReconciliation.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.camReconciliation.delete({ where: { id } });
    }
};
exports.CamService = CamService;
exports.CamService = CamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CamService);
//# sourceMappingURL=cam.service.js.map