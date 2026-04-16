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
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let WorkflowsService = class WorkflowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        if (filters?.triggerType)
            where.triggerType = filters.triggerType;
        return this.prisma.workflowDefinition.findMany({
            where,
            include: {
                actions: { orderBy: { order: 'asc' } },
                property: { select: { id: true, name: true } },
                runs: {
                    orderBy: { startedAt: 'desc' },
                    take: 5,
                    select: { id: true, status: true, startedAt: true, completedAt: true, error: true },
                },
            },
            orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        });
    }
    async findOne(id) {
        const wf = await this.prisma.workflowDefinition.findUnique({
            where: { id },
            include: {
                actions: { orderBy: { order: 'asc' } },
                property: { select: { id: true, name: true } },
                runs: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                    select: { id: true, status: true, startedAt: true, completedAt: true, error: true },
                },
            },
        });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        return wf;
    }
    async create(data) {
        const { actions, ...wfData } = data;
        return this.prisma.workflowDefinition.create({
            data: {
                ...wfData,
                actions: actions?.length ? {
                    create: actions.map((a, i) => ({ ...a, order: i })),
                } : undefined,
            },
            include: { actions: { orderBy: { order: 'asc' } } },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const { actions, ...wfData } = data;
        if (actions !== undefined) {
            await this.prisma.workflowAction.deleteMany({ where: { workflowDefinitionId: id } });
            if (actions.length > 0) {
                await this.prisma.workflowAction.createMany({
                    data: actions.map((a, i) => ({ ...a, workflowDefinitionId: id, order: i })),
                });
            }
        }
        return this.prisma.workflowDefinition.update({
            where: { id },
            data: wfData,
            include: { actions: { orderBy: { order: 'asc' } } },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.workflowDefinition.delete({ where: { id } });
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map