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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { legalName: { contains: filters.search, mode: 'insensitive' } },
                { tradeName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.tenant.findMany({
            where,
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'HOLDOVER'] }, deletedAt: null },
                    select: {
                        id: true,
                        status: true,
                        leaseStart: true,
                        leaseEnd: true,
                        monthlyTotal: true,
                        unit: { select: { suiteNumber: true, gla: true } },
                    },
                    take: 1,
                    orderBy: { leaseStart: 'desc' },
                },
            },
            orderBy: { legalName: 'asc' },
        });
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                leases: {
                    where: { deletedAt: null },
                    include: { unit: { select: { suiteNumber: true, gla: true } } },
                    orderBy: { leaseStart: 'desc' },
                },
                maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
                notices: { orderBy: { createdAt: 'desc' }, take: 10 },
                invoices: { orderBy: { periodStart: 'desc' }, take: 12 },
                payments: { orderBy: { receivedAt: 'desc' }, take: 12 },
                complianceItems: { orderBy: { expiresAt: 'asc' } },
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async create(data) {
        return this.prisma.tenant.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.tenant.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.tenant.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map