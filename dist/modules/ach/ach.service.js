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
exports.AchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AchService = class AchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(filters) {
        const where = {};
        if (filters?.tenantId)
            where.tenantId = filters.tenantId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        return this.prisma.achForm.findMany({
            where,
            include: {
                tenant: { select: { id: true, legalName: true, contactName: true, email: true } },
            },
            orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const form = await this.prisma.achForm.findUnique({
            where: { id },
            include: {
                tenant: { select: { id: true, legalName: true, contactName: true, email: true } },
            },
        });
        if (!form)
            throw new common_1.NotFoundException('ACH form not found');
        return form;
    }
    create(data) {
        if (data.accountNumber && data.accountNumber.length > 4) {
            data.accountNumber = data.accountNumber.slice(-4);
        }
        return this.prisma.achForm.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.accountNumber && data.accountNumber.length > 4) {
            data.accountNumber = data.accountNumber.slice(-4);
        }
        return this.prisma.achForm.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.achForm.delete({ where: { id } });
    }
    async revoke(id) {
        await this.findOne(id);
        return this.prisma.achForm.update({
            where: { id },
            data: { isActive: false, revokedAt: new Date() },
        });
    }
};
exports.AchService = AchService;
exports.AchService = AchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchService);
//# sourceMappingURL=ach.service.js.map