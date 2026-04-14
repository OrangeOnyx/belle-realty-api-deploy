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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let MaintenanceService = class MaintenanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        if (filters?.unitId)
            where.unitId = filters.unitId;
        return this.prisma.maintenanceRequest.findMany({
            where,
            include: {
                unit: { select: { suiteNumber: true } },
                tenant: { select: { legalName: true, tradeName: true } },
            },
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const req = await this.prisma.maintenanceRequest.findUnique({
            where: { id },
            include: {
                unit: true,
                tenant: { select: { legalName: true, tradeName: true, email: true, phone: true } },
                lease: { select: { id: true, status: true } },
            },
        });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        return req;
    }
    async create(data) {
        return this.prisma.maintenanceRequest.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.status === 'COMPLETED' && !data.completedAt) {
            data.completedAt = new Date();
        }
        return this.prisma.maintenanceRequest.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.maintenanceRequest.update({ where: { id }, data: { status: 'CANCELLED' } });
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map