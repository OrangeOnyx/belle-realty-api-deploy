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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let EmailService = class EmailService {
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
        return this.prisma.emailLog.findMany({
            where,
            orderBy: { sentAt: 'desc' },
            take: filters?.limit ? parseInt(filters.limit) : 50,
        });
    }
    async findOne(id) {
        return this.prisma.emailLog.findUnique({ where: { id } });
    }
    async create(data) {
        return this.prisma.emailLog.create({ data });
    }
    async update(id, data) {
        return this.prisma.emailLog.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.emailLog.delete({ where: { id } });
    }
    async getTemplates(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.category)
            where.category = filters.category;
        return this.prisma.emailTemplate.findMany({ where, orderBy: { name: 'asc' } });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map