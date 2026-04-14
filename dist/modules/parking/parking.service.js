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
exports.ParkingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ParkingService = class ParkingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        return this.prisma.parkingAgreement.findMany({
            where,
            include: {
                payments: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
            orderBy: [{ partyName: 'asc' }],
        });
    }
    async findOne(id) {
        const agreement = await this.prisma.parkingAgreement.findUnique({
            where: { id },
            include: {
                payments: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!agreement)
            throw new common_1.NotFoundException('Parking agreement not found');
        return agreement;
    }
    async create(data) {
        return this.prisma.parkingAgreement.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.parkingAgreement.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.parkingAgreement.update({ where: { id }, data: { isActive: false } });
    }
};
exports.ParkingService = ParkingService;
exports.ParkingService = ParkingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParkingService);
//# sourceMappingURL=parking.service.js.map