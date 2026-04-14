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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ComplianceService = class ComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.complianceTask.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                actionType: { select: { name: true, category: true } },
            },
            orderBy: [{ dueDate: 'asc' }],
        });
    }
    async findOne(id) {
        const item = await this.prisma.complianceTask.findUnique({
            where: { id },
            include: {
                tenant: { select: { legalName: true, tradeName: true, email: true } },
                actionType: true,
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Compliance item not found');
        return item;
    }
    async create(data) {
        return this.prisma.complianceTask.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.status === 'APPROVED' && !data.completedAt) {
            data.completedAt = new Date();
        }
        return this.prisma.complianceTask.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.complianceTask.delete({ where: { id } });
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map