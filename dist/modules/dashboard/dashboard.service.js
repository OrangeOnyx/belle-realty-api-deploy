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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const billing_engine_1 = require("../../common/engines/billing.engine");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics(propertyId) {
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const propFilter = propertyId ? { propertyId } : {};
        const [properties, totalUnits, occupiedUnits] = await Promise.all([
            this.prisma.property.count({ where: { isActive: true } }),
            this.prisma.unit.count({ where: { ...propFilter } }),
            this.prisma.unit.count({ where: { ...propFilter, isVacant: false, isOwnerOccupied: false } }),
        ]);
        const activeLeases = await this.prisma.lease.findMany({
            where: { ...propFilter, status: 'ACTIVE' },
            select: { monthlyTotal: true, leaseEnd: true },
        });
        const totalMonthlyRent = activeLeases.reduce((sum, l) => sum + Number(l.monthlyTotal), 0);
        const [expiredLeases, holdoverLeases] = await Promise.all([
            this.prisma.lease.count({ where: { ...propFilter, status: 'EXPIRED' } }),
            this.prisma.lease.count({ where: { ...propFilter, status: 'HOLDOVER' } }),
        ]);
        const [exp30, exp90] = await Promise.all([
            this.prisma.lease.count({
                where: { ...propFilter, status: 'ACTIVE', leaseEnd: { lte: in30, gte: now } },
            }),
            this.prisma.lease.count({
                where: { ...propFilter, status: 'ACTIVE', leaseEnd: { lte: in90, gte: now } },
            }),
        ]);
        const openMaintenance = await this.prisma.maintenanceRequest.count({
            where: { ...propFilter, status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING_PARTS'] } },
        });
        const pendingCompliance = await this.prisma.complianceTask.count({
            where: { ...propFilter, status: { in: ['PENDING', 'SUBMITTED'] }, dueDate: { lte: in30 } },
        });
        const overdueInvoices = await this.prisma.invoice.count({
            where: { ...propFilter, status: 'OVERDUE' },
        });
        const urgentAlerts = [];
        const holdoverLeasesData = await this.prisma.lease.findMany({
            where: { ...propFilter, status: 'HOLDOVER' },
            include: { tenant: true, unit: true },
            take: 10,
        });
        for (const l of holdoverLeasesData) {
            const days = Math.abs((0, billing_engine_1.daysUntilExpiry)(l.leaseEnd));
            urgentAlerts.push({
                type: 'HOLDOVER',
                entityId: l.id,
                entityType: 'LEASE',
                message: `${l.tenant.tradeName || l.tenant.legalName} (Suite ${l.unit.suiteNumber}) — holdover ${days} days, 200% rent applies`,
                severity: 'HIGH',
                daysOverdue: days,
            });
        }
        const expiredLeasesData = await this.prisma.lease.findMany({
            where: { ...propFilter, status: 'EXPIRED' },
            include: { tenant: true, unit: true },
            take: 10,
        });
        for (const l of expiredLeasesData) {
            const days = Math.abs((0, billing_engine_1.daysUntilExpiry)(l.leaseEnd));
            urgentAlerts.push({
                type: 'EXPIRED_LEASE',
                entityId: l.id,
                entityType: 'LEASE',
                message: `${l.tenant.tradeName || l.tenant.legalName} (Suite ${l.unit.suiteNumber}) — lease expired ${days} days ago`,
                severity: 'HIGH',
                daysOverdue: days,
            });
        }
        const recentActivity = await this.prisma.activityLog.findMany({
            where: propFilter,
            orderBy: { timestamp: 'desc' },
            take: 20,
            select: {
                id: true,
                action: true,
                entityType: true,
                entityId: true,
                entityLabel: true,
                userId: true,
                userEmail: true,
                timestamp: true,
            },
        });
        const occupancyRate = totalUnits > 0 ? occupiedUnits / totalUnits : 0;
        return {
            propertyCount: properties,
            totalUnits,
            occupiedUnits,
            occupancyRate,
            totalMonthlyRent,
            openMaintenanceRequests: openMaintenance,
            expiredLeases,
            holdoverLeases,
            upcomingExpirations30: exp30,
            upcomingExpirations90: exp90,
            overdueInvoices,
            pendingCompliance,
            recentActivity,
            urgentAlerts: urgentAlerts.sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0)),
        };
    }
    async getOccupancyBreakdown(propertyId) {
        const units = await this.prisma.unit.findMany({
            where: { propertyId },
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'HOLDOVER'] } },
                    include: { tenant: true },
                    take: 1,
                    orderBy: { leaseStart: 'desc' },
                },
            },
        });
        return units.map(u => ({
            id: u.id,
            suiteNumber: u.suiteNumber,
            gla: Number(u.gla),
            isVacant: u.isVacant,
            isOwnerOccupied: u.isOwnerOccupied,
            tenant: u.leases[0]?.tenant?.tradeName || u.leases[0]?.tenant?.legalName || null,
            leaseStatus: u.leases[0]?.status || null,
            monthlyRent: u.leases[0] ? Number(u.leases[0].monthlyTotal) : 0,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map