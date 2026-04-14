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
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let NoticesService = class NoticesService {
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
        if (filters?.type)
            where.type = filters.type;
        return this.prisma.notice.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { select: { unit: { select: { suiteNumber: true } } } },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const notice = await this.prisma.notice.findUnique({
            where: { id },
            include: {
                tenant: { select: { legalName: true, tradeName: true, email: true, phone: true } },
                lease: { include: { unit: { select: { suiteNumber: true, gla: true } } } },
            },
        });
        if (!notice)
            throw new common_1.NotFoundException('Notice not found');
        return notice;
    }
    async create(data) {
        return this.prisma.notice.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.notice.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.notice.delete({ where: { id } });
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NoticesService);
//# sourceMappingURL=notices.service.js.map