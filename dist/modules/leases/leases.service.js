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
exports.LeasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const schedule_g_engine_1 = require("../../common/engines/schedule-g.engine");
const billing_engine_1 = require("../../common/engines/billing.engine");
const belle_realty_constants_1 = require("../../common/constants/belle-realty.constants");
let LeasesService = class LeasesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters.propertyId)
            where.propertyId = filters.propertyId;
        if (filters.status)
            where.status = filters.status;
        if (filters.unitId)
            where.unitId = filters.unitId;
        if (filters.tenantId)
            where.tenantId = filters.tenantId;
        const leases = await this.prisma.lease.findMany({
            where,
            include: {
                unit: { select: { suiteNumber: true, gla: true } },
                tenant: { select: { legalName: true, tradeName: true, email: true, phone: true } },
            },
            orderBy: [{ status: 'asc' }, { leaseEnd: 'asc' }],
        });
        return leases.map(l => ({
            ...l,
            daysUntilExpiry: (0, billing_engine_1.daysUntilExpiry)(l.leaseEnd),
            isHoldover: l.status === 'HOLDOVER',
            holdoverMonthlyRent: l.status === 'HOLDOVER' ? Number(l.monthlyTotal) * Number(l.holdoverRateMultiplier) : null,
        }));
    }
    async findOne(id) {
        const lease = await this.prisma.lease.findUnique({
            where: { id },
            include: {
                unit: true,
                tenant: true,
                property: true,
                reminders: { orderBy: { dueDate: 'asc' } },
                notices: { orderBy: { createdAt: 'desc' } },
                documents: true,
                invoices: { orderBy: { periodStart: 'desc' }, take: 12 },
                payments: { orderBy: { receivedAt: 'desc' }, take: 12 },
                tiAllowances: true,
                percentageRentClauses: true,
            },
        });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        return {
            ...lease,
            daysUntilExpiry: (0, billing_engine_1.daysUntilExpiry)(lease.leaseEnd),
            scheduleG: (0, schedule_g_engine_1.calculateScheduleG)({
                basePsf: Number(lease.basePsf),
                camPsf: Number(lease.camPsf),
                taxPsf: Number(lease.taxPsf),
                insPsf: Number(lease.insPsf),
                gla: Number(lease.unit.gla),
                statedTermMonths: lease.statedTermMonths,
                constructionMonths: lease.constructionMonths,
                abatementMonths: lease.abatementMonths,
            }),
        };
    }
    async validateScheduleG(input) {
        return (0, schedule_g_engine_1.calculateScheduleG)(input);
    }
    async create(data) {
        const unit = await this.prisma.unit.findUnique({ where: { id: data.unitId } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        const scheduleG = (0, schedule_g_engine_1.calculateScheduleG)({
            basePsf: data.basePsf,
            camPsf: data.camPsf || 0,
            taxPsf: data.taxPsf || 0,
            insPsf: data.insPsf || 0,
            gla: Number(unit.gla),
            statedTermMonths: data.statedTermMonths,
            constructionMonths: data.constructionMonths || 0,
            abatementMonths: data.abatementMonths || 0,
        });
        if (!scheduleG.isValid) {
            throw new common_1.BadRequestException({
                message: 'Schedule G validation failed',
                errors: scheduleG.validationErrors,
            });
        }
        return this.prisma.lease.create({
            data: {
                ...data,
                additionalPsf: scheduleG.additionalPsf,
                totalPsf: scheduleG.totalPsf,
                monthlyBase: scheduleG.monthlyBase,
                monthlyAdditional: scheduleG.monthlyAdditional,
                monthlyTotal: scheduleG.monthlyTotal,
                effectiveTermMonths: scheduleG.effectiveTermMonths,
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.lease.update({ where: { id }, data });
    }
    async generateRenewalDefaults(leaseId) {
        const lease = await this.findOne(leaseId);
        const unit = await this.prisma.unit.findUnique({ where: { id: lease.unitId } });
        const gla = Number(unit.gla);
        const scheduleG = (0, schedule_g_engine_1.calculateScheduleG)({
            basePsf: belle_realty_constants_1.RENEWAL_DEFAULT_BASE_PSF,
            camPsf: 3.50,
            taxPsf: 0.75,
            insPsf: 0.75,
            gla,
            statedTermMonths: 36,
            constructionMonths: 0,
            abatementMonths: 0,
        });
        return {
            leaseId,
            unitSuiteNumber: unit.suiteNumber,
            gla,
            glaSource: 'UNIT_RECORD_LOCKED',
            defaults: {
                basePsf: belle_realty_constants_1.RENEWAL_DEFAULT_BASE_PSF,
                additionalPsf: belle_realty_constants_1.RENEWAL_DEFAULT_ADDITIONAL_PSF,
                totalPsf: belle_realty_constants_1.RENEWAL_DEFAULT_TOTAL_PSF,
                camPsf: 3.50,
                taxPsf: 0.75,
                insPsf: 0.75,
                statedTermMonths: 36,
            },
            scheduleG,
            note: 'Override any field before generating the renewal addendum. RSF is locked from the unit record.',
        };
    }
    async getHoldoverLeases(propertyId) {
        const where = { status: { in: ['HOLDOVER', 'EXPIRED'] } };
        if (propertyId)
            where.propertyId = propertyId;
        const leases = await this.prisma.lease.findMany({
            where,
            include: {
                unit: { select: { suiteNumber: true, gla: true } },
                tenant: { select: { legalName: true, tradeName: true, email: true, phone: true } },
            },
            orderBy: { leaseEnd: 'asc' },
        });
        return leases.map(l => {
            const days = Math.abs((0, billing_engine_1.daysUntilExpiry)(l.leaseEnd));
            const holdoverMonthly = Number(l.monthlyTotal) * Number(l.holdoverRateMultiplier);
            return {
                ...l,
                daysExpired: days,
                holdoverMonthlyRent: Math.round(holdoverMonthly * 100) / 100,
                holdoverAccrued: Math.round((holdoverMonthly / 30.44) * days * 100) / 100,
            };
        });
    }
};
exports.LeasesService = LeasesService;
exports.LeasesService = LeasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeasesService);
//# sourceMappingURL=leases.service.js.map