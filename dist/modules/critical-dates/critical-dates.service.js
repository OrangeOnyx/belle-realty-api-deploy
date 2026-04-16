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
var CriticalDatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriticalDatesService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CriticalDatesService = CriticalDatesService_1 = class CriticalDatesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CriticalDatesService_1.name);
    }
    async runDailyAlertScan() {
        this.logger.log('Running daily critical dates scan...');
        await this.scanLeaseExpirations();
        await this.scanRenewalNoticeDeadlines();
        await this.scanHvacContractExpirations();
        await this.scanCoiExpirations();
        this.logger.log('Critical dates scan complete.');
    }
    async scanLeaseExpirations() {
        const thresholds = [90, 60, 30];
        const now = new Date();
        const created = [];
        const activeLeases = await this.prisma.lease.findMany({
            where: { status: { in: ['ACTIVE', 'HOLDOVER'] }, deletedAt: null },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                unit: { select: { suiteNumber: true } },
            },
        });
        for (const lease of activeLeases) {
            const daysUntilExpiry = Math.ceil((new Date(lease.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            for (const threshold of thresholds) {
                if (daysUntilExpiry <= threshold && daysUntilExpiry > threshold - 5) {
                    const tenantName = lease.tenant.tradeName || lease.tenant.legalName;
                    const alertTitle = `[${threshold}-Day Alert] Lease Expiration — ${tenantName} (Suite ${lease.unit.suiteNumber})`;
                    const existing = await this.prisma.reminder.findFirst({
                        where: { leaseId: lease.id, title: { contains: `[${threshold}-Day Alert] Lease Expiration` } },
                    });
                    if (existing)
                        continue;
                    const reminder = await this.prisma.reminder.create({
                        data: {
                            propertyId: lease.propertyId,
                            leaseId: lease.id,
                            tenantId: lease.tenantId,
                            title: alertTitle,
                            description: `Lease expires on ${new Date(lease.leaseEnd).toLocaleDateString()}. ${daysUntilExpiry} days remaining. Priority: ${threshold <= 30 ? 'HIGH' : threshold <= 60 ? 'MEDIUM' : 'LOW'}.`,
                            dueDate: lease.leaseEnd,
                        },
                    });
                    created.push(reminder);
                }
            }
        }
        return created;
    }
    async scanRenewalNoticeDeadlines() {
        const now = new Date();
        const created = [];
        const leasesWithRenewal = await this.prisma.lease.findMany({
            where: {
                status: 'ACTIVE',
                hasRenewalOption: true,
                renewalNoticeDueDays: { not: null },
                deletedAt: null,
            },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                unit: { select: { suiteNumber: true } },
            },
        });
        for (const lease of leasesWithRenewal) {
            if (!lease.renewalNoticeDueDays)
                continue;
            const noticeDeadline = new Date(lease.leaseEnd);
            noticeDeadline.setDate(noticeDeadline.getDate() - lease.renewalNoticeDueDays);
            const daysUntilDeadline = Math.ceil((noticeDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDeadline <= 60 && daysUntilDeadline > 0) {
                const tenantName = lease.tenant.tradeName || lease.tenant.legalName;
                const alertTitle = `[Renewal Notice] ${tenantName} — Deadline in ${daysUntilDeadline} Days (Suite ${lease.unit.suiteNumber})`;
                const existing = await this.prisma.reminder.findFirst({
                    where: { leaseId: lease.id, title: { contains: '[Renewal Notice]' } },
                });
                if (existing)
                    continue;
                const reminder = await this.prisma.reminder.create({
                    data: {
                        propertyId: lease.propertyId,
                        leaseId: lease.id,
                        tenantId: lease.tenantId,
                        title: alertTitle,
                        description: `Renewal notice must be sent by ${noticeDeadline.toLocaleDateString()} (${lease.renewalNoticeDueDays} days before lease end). Lease expires ${new Date(lease.leaseEnd).toLocaleDateString()}.`,
                        dueDate: noticeDeadline,
                    },
                });
                created.push(reminder);
            }
        }
        return created;
    }
    async scanHvacContractExpirations() {
        const thresholds = [60, 30];
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 90);
        const created = [];
        const contracts = await this.prisma.hvacMaintenanceContract.findMany({
            where: {
                endDate: { gte: now, lte: future },
                isActive: true,
            },
            include: { unit: { select: { suiteNumber: true, propertyId: true, id: true } } },
        });
        for (const contract of contracts) {
            const daysUntilExpiry = Math.ceil((new Date(contract.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            for (const threshold of thresholds) {
                if (daysUntilExpiry <= threshold && daysUntilExpiry > threshold - 5) {
                    const existing = await this.prisma.reminder.findFirst({
                        where: { title: { contains: `[HVAC] ${contract.vendorName}` } },
                    });
                    if (existing)
                        continue;
                    const propertyId = contract.unit?.propertyId;
                    if (!propertyId)
                        continue;
                    const reminder = await this.prisma.reminder.create({
                        data: {
                            propertyId,
                            title: `[HVAC] ${contract.vendorName} Contract Expiring — Suite ${contract.unit?.suiteNumber || 'Common Area'}`,
                            description: `${threshold}-day alert: HVAC contract expires ${new Date(contract.endDate).toLocaleDateString()}. Contract ID: ${contract.id}`,
                            dueDate: contract.endDate,
                        },
                    });
                    created.push(reminder);
                }
            }
        }
        return created;
    }
    async scanCoiExpirations() {
        const thresholds = [60, 30];
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 90);
        const created = [];
        const coiTasks = await this.prisma.complianceTask.findMany({
            where: {
                status: { not: 'COMPLETED' },
                dueDate: { gte: now, lte: future },
                OR: [
                    { title: { contains: 'COI', mode: 'insensitive' } },
                    { title: { contains: 'Insurance', mode: 'insensitive' } },
                    { title: { contains: 'Certificate of', mode: 'insensitive' } },
                ],
            },
            include: {
                tenant: { select: { id: true, legalName: true, tradeName: true } },
            },
        });
        for (const task of coiTasks) {
            const daysUntilExpiry = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            for (const threshold of thresholds) {
                if (daysUntilExpiry <= threshold && daysUntilExpiry > threshold - 5) {
                    const tenantName = task.tenant?.tradeName || task.tenant?.legalName || 'Unknown Tenant';
                    const existing = await this.prisma.reminder.findFirst({
                        where: { tenantId: task.tenantId, title: { contains: '[COI Expiring]' } },
                    });
                    if (existing)
                        continue;
                    const reminder = await this.prisma.reminder.create({
                        data: {
                            propertyId: task.propertyId,
                            tenantId: task.tenantId,
                            title: `[COI Expiring] ${tenantName}`,
                            description: `${threshold}-day alert: ${task.title} due ${new Date(task.dueDate).toLocaleDateString()}.`,
                            dueDate: task.dueDate,
                        },
                    });
                    created.push(reminder);
                }
            }
        }
        return created;
    }
    async getUpcomingCriticalDates(propertyId, days = 90) {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        const where = {
            isDone: false,
            dueDate: { gte: now, lte: future },
        };
        if (propertyId)
            where.propertyId = propertyId;
        return this.prisma.reminder.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { include: { unit: { select: { suiteNumber: true } } } },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getClauseConflictReport(propertyId) {
        const leases = await this.prisma.lease.findMany({
            where: { propertyId, status: 'ACTIVE', deletedAt: null },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                unit: { select: { suiteNumber: true } },
            },
        });
        const exclusivities = [];
        const permittedUses = [];
        for (const lease of leases) {
            const tenantName = lease.tenant.tradeName || lease.tenant.legalName;
            if (lease.exclusiveUseClause) {
                exclusivities.push({
                    tenantName,
                    suiteNumber: lease.unit.suiteNumber,
                    leaseId: lease.id,
                    clause: lease.exclusiveUseClause,
                });
            }
            if (lease.permittedUse) {
                permittedUses.push({
                    tenantName,
                    suiteNumber: lease.unit.suiteNumber,
                    leaseId: lease.id,
                    permittedUse: lease.permittedUse,
                });
            }
        }
        return {
            propertyId,
            exclusivities,
            permittedUses,
            summary: `${exclusivities.length} exclusive use clauses active across ${leases.length} leases. Review for conflicts before leasing any vacant suites.`,
        };
    }
    async runManualScan(propertyId) {
        const [expirations, renewals, hvac, coi] = await Promise.all([
            this.scanLeaseExpirations(),
            this.scanRenewalNoticeDeadlines(),
            this.scanHvacContractExpirations(),
            this.scanCoiExpirations(),
        ]);
        return {
            leaseExpirationAlerts: expirations.length,
            renewalNoticeAlerts: renewals.length,
            hvacAlerts: hvac.length,
            coiAlerts: coi.length,
            total: expirations.length + renewals.length + hvac.length + coi.length,
        };
    }
};
exports.CriticalDatesService = CriticalDatesService;
__decorate([
    (0, schedule_1.Cron)('0 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CriticalDatesService.prototype, "runDailyAlertScan", null);
exports.CriticalDatesService = CriticalDatesService = CriticalDatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CriticalDatesService);
//# sourceMappingURL=critical-dates.service.js.map