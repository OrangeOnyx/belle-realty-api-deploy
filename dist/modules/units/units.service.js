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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.isVacant !== undefined) {
            where.isVacant = filters.isVacant === 'true' || filters.isVacant === true;
        }
        return this.prisma.unit.findMany({
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
                        tenant: { select: { legalName: true, tradeName: true } },
                    },
                    take: 1,
                    orderBy: { leaseStart: 'desc' },
                },
            },
            orderBy: { suiteNumber: 'asc' },
        });
    }
    async findOne(id) {
        const unit = await this.prisma.unit.findUnique({
            where: { id },
            include: {
                leases: {
                    where: { deletedAt: null },
                    include: {
                        tenant: { select: { legalName: true, tradeName: true, email: true, phone: true } },
                    },
                    orderBy: { leaseStart: 'desc' },
                },
                maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        return unit;
    }
    async create(data) {
        return this.prisma.unit.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.unit.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.unit.delete({ where: { id } });
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map