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
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let RemindersService = class RemindersService {
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
        if (filters?.isDone !== undefined)
            where.isDone = filters.isDone === 'true' || filters.isDone === true;
        return this.prisma.reminder.findMany({
            where,
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { select: { unit: { select: { suiteNumber: true } } } },
            },
            orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }],
        });
    }
    async findOne(id) {
        const reminder = await this.prisma.reminder.findUnique({
            where: { id },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { select: { unit: { select: { suiteNumber: true } } } },
            },
        });
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        return reminder;
    }
    async create(data) {
        return this.prisma.reminder.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.isDone && !data.completedAt) {
            data.completedAt = new Date();
        }
        return this.prisma.reminder.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.reminder.delete({ where: { id } });
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map