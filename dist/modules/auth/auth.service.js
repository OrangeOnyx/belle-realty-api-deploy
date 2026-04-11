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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive)
            return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            return null;
        return user;
    }
    async login(user, ipAddress, userAgent) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const jti = (0, uuid_1.v4)();
        const family = (0, uuid_1.v4)();
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
        const refreshToken = this.jwtService.sign({ sub: user.id, jti, family }, { secret: refreshSecret, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash, jti, family, expiresAt },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                userEmail: user.email,
                action: 'LOGIN',
                entityType: 'USER',
                entityId: user.id,
                ipAddress,
                userAgent,
            },
        });
        return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }
    async refresh(refreshToken) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const stored = await this.prisma.refreshToken.findUnique({ where: { jti: payload.jti } });
        if (!stored || stored.revokedAt) {
            await this.prisma.refreshToken.updateMany({
                where: { family: payload.family },
                data: { revokedAt: new Date() },
            });
            throw new common_1.UnauthorizedException('Refresh token reuse detected — please log in again');
        }
        const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('User not found');
        const newPayload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(newPayload);
        const newJti = (0, uuid_1.v4)();
        const newRefreshToken = this.jwtService.sign({ sub: user.id, jti: newJti, family: payload.family }, { secret: refreshSecret, expiresIn: '7d' });
        const tokenHash = await bcrypt.hash(newRefreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash, jti: newJti, family: payload.family, expiresAt },
        });
        return { accessToken, refreshToken: newRefreshToken };
    }
    async logout(userId, jti) {
        if (jti) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, jti },
                data: { revokedAt: new Date() },
            });
        }
        else {
            await this.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map