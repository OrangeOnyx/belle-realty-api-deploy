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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters?.role)
            where.role = filters.role;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive === 'true' || filters.isActive === true;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true, email: true, name: true, role: true,
                isActive: true, mfaEnabled: true, lastLoginAt: true,
                createdAt: true, updatedAt: true,
            },
            orderBy: [{ role: 'asc' }, { name: 'asc' }],
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, name: true, role: true,
                isActive: true, mfaEnabled: true, lastLoginAt: true,
                createdAt: true, updatedAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.ConflictException('A user with this email already exists');
        const tempPassword = data.password || Math.random().toString(36).slice(-10) + 'A1!';
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role || 'READ_ONLY',
                passwordHash,
                isActive: true,
            },
            select: {
                id: true, email: true, name: true, role: true,
                isActive: true, createdAt: true,
            },
        });
        return { ...user, tempPassword };
    }
    async update(id, data) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.password)
            updateData.passwordHash = await bcrypt.hash(data.password, 12);
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true, email: true, name: true, role: true,
                isActive: true, updatedAt: true,
            },
        });
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map