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
exports.VendorRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let VendorRegistrationService = class VendorRegistrationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.category)
            where.category = filters.category;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        if (filters?.isPreferred !== undefined)
            where.isPreferred = filters.isPreferred === 'true' || filters.isPreferred === true;
        if (filters?.search) {
            where.OR = [
                { companyName: { contains: filters.search, mode: 'insensitive' } },
                { contactName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.vendor.findMany({
            where,
            orderBy: [{ isPreferred: 'desc' }, { companyName: 'asc' }],
        });
    }
    async findOne(id) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id },
            include: {
                maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
                hvacContracts: { orderBy: { startDate: 'desc' }, take: 5 },
            },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async create(data) {
        return this.prisma.vendor.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.vendor.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.vendor.update({ where: { id }, data: { isActive: false } });
    }
};
exports.VendorRegistrationService = VendorRegistrationService;
exports.VendorRegistrationService = VendorRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorRegistrationService);
//# sourceMappingURL=vendor-registration.service.js.map