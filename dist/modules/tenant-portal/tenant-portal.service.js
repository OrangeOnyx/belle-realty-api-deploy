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
exports.TenantPortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
let TenantPortalService = class TenantPortalService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        const user = await this.prisma.tenantUser.findUnique({
            where: { email },
            include: { tenant: { select: { legalName: true, tradeName: true } } },
        });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.tenantUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        const payload = { sub: user.id, tenantId: user.tenantId, type: 'TENANT_USER' };
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: '24h' }),
            user: { id: user.id, name: user.name, email: user.email, tenantId: user.tenantId, tenantName: user.tenant.tradeName || user.tenant.legalName },
        };
    }
    async createTenantUser(data) {
        const existing = await this.prisma.tenantUser.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already registered');
        const passwordHash = await bcrypt.hash(data.password, 12);
        return this.prisma.tenantUser.create({
            data: { tenantId: data.tenantId, email: data.email, name: data.name, passwordHash, isActive: true, isVerified: true },
            select: { id: true, email: true, name: true, tenantId: true, createdAt: true },
        });
    }
    async getTenantDashboard(tenantUserId) {
        const user = await this.prisma.tenantUser.findUnique({ where: { id: tenantUserId } });
        if (!user)
            throw new common_1.NotFoundException('Tenant user not found');
        const [openInvoices, recentPayments, openMaintenance, activeLease] = await Promise.all([
            this.prisma.invoice.findMany({ where: { tenantId: user.tenantId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } }, orderBy: { dueDate: 'asc' }, take: 5 }),
            this.prisma.payment.findMany({ where: { tenantId: user.tenantId }, orderBy: { receivedAt: 'desc' }, take: 5 }),
            this.prisma.maintenanceRequest.findMany({ where: { tenantId: user.tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } }, orderBy: { createdAt: 'desc' }, take: 5 }),
            this.prisma.lease.findFirst({ where: { tenantId: user.tenantId, status: 'ACTIVE', deletedAt: null }, include: { unit: { select: { suiteNumber: true, gla: true } } } }),
        ]);
        const totalOwed = openInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
        return { tenantId: user.tenantId, openInvoices, recentPayments, openMaintenance, activeLease, totalOwed: parseFloat(totalOwed.toFixed(2)) };
    }
    async getTenantInvoices(tenantUserId, filters) {
        const user = await this.prisma.tenantUser.findUnique({ where: { id: tenantUserId } });
        if (!user)
            throw new common_1.NotFoundException('Tenant user not found');
        const where = { tenantId: user.tenantId };
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.invoice.findMany({ where, include: { lineItems: true, payments: { orderBy: { receivedAt: 'desc' } } }, orderBy: { periodStart: 'desc' } });
    }
    async submitMaintenanceRequest(tenantUserId, data) {
        const user = await this.prisma.tenantUser.findUnique({ where: { id: tenantUserId } });
        if (!user)
            throw new common_1.NotFoundException('Tenant user not found');
        const lease = await this.prisma.lease.findFirst({ where: { tenantId: user.tenantId, status: 'ACTIVE', deletedAt: null } });
        if (!lease)
            throw new common_1.BadRequestException('No active lease found');
        return this.prisma.maintenanceRequest.create({
            data: { propertyId: lease.propertyId, unitId: lease.unitId, leaseId: lease.id, tenantId: user.tenantId, title: data.title, description: data.description, category: data.category || 'GENERAL', priority: data.priority || 'MEDIUM', status: 'OPEN', submittedByTenant: true, reportedAt: new Date() },
        });
    }
    async getTenantMaintenanceRequests(tenantUserId) {
        const user = await this.prisma.tenantUser.findUnique({ where: { id: tenantUserId } });
        if (!user)
            throw new common_1.NotFoundException('Tenant user not found');
        return this.prisma.maintenanceRequest.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: 'desc' } });
    }
    findAll(filters) {
        const where = {};
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        return this.prisma.tenantUser.findMany({
            where,
            select: { id: true, email: true, name: true, tenantId: true, isActive: true, isVerified: true, lastLoginAt: true, createdAt: true, tenant: { select: { legalName: true, tradeName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.TenantPortalService = TenantPortalService;
exports.TenantPortalService = TenantPortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], TenantPortalService);
//# sourceMappingURL=tenant-portal.service.js.map