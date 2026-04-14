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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let LeadsService = class LeadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.unitId)
            where.unitId = filters.unitId;
        return this.prisma.lead.findMany({
            where,
            include: {
                unit: { select: { suiteNumber: true, gla: true } },
            },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                unit: { select: { suiteNumber: true, gla: true } },
                property: { select: { name: true, address: true } },
            },
        });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return lead;
    }
    async create(data) {
        return this.prisma.lead.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.status === 'LOST' && !data.lostAt)
            data.lostAt = new Date();
        return this.prisma.lead.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map