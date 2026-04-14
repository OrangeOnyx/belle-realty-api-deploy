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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const propertyId = filters?.propertyId;
        const [taxConfigs, chartOfAccounts] = await Promise.all([
            this.prisma.salesTaxConfig.findMany({ where: propertyId ? { propertyId } : {} }),
            this.prisma.chartOfAccount.findMany({ where: propertyId ? { propertyId } : {}, orderBy: { accountCode: 'asc' } }),
        ]);
        return { taxConfigs, chartOfAccounts };
    }
    async findOne(id) {
        return this.prisma.chartOfAccount.findUnique({ where: { id } });
    }
    async create(data) {
        if (data.type === 'TAX_CONFIG') {
            return this.prisma.salesTaxConfig.create({ data: data.payload });
        }
        return this.prisma.chartOfAccount.create({ data });
    }
    async update(id, data) {
        return this.prisma.chartOfAccount.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.chartOfAccount.delete({ where: { id } });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map