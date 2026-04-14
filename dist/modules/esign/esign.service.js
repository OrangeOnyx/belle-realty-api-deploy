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
exports.EsignService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const crypto_1 = require("crypto");
let EsignService = class EsignService {
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
        return this.prisma.eSignRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: { select: { legalName: true, tradeName: true } },
                lease: { select: { leaseStart: true, leaseEnd: true, unit: { select: { suiteNumber: true } } } },
            },
        });
    }
    async findOne(id) {
        const req = await this.prisma.eSignRequest.findUnique({
            where: { id },
            include: {
                tenant: { select: { legalName: true, tradeName: true, email: true } },
                lease: { select: { leaseStart: true, leaseEnd: true, unit: { select: { suiteNumber: true } } } },
            },
        });
        if (!req)
            throw new common_1.NotFoundException('E-Sign request not found');
        return req;
    }
    async findByToken(token) {
        const req = await this.prisma.eSignRequest.findUnique({ where: { token } });
        if (!req)
            throw new common_1.NotFoundException('Signing link not found or expired');
        if (req.status === 'SIGNED')
            return { ...req, alreadySigned: true };
        if (req.status === 'DECLINED')
            return { ...req, alreadyDeclined: true };
        if (new Date() > req.expiresAt)
            throw new common_1.BadRequestException('This signing link has expired');
        if (!req.viewedAt) {
            await this.prisma.eSignRequest.update({ where: { id: req.id }, data: { viewedAt: new Date(), status: 'VIEWED' } });
        }
        return req;
    }
    async create(data) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (data.expiryDays || 30));
        return this.prisma.eSignRequest.create({
            data: {
                propertyId: data.propertyId || null,
                leaseId: data.leaseId || null,
                tenantId: data.tenantId || null,
                title: data.title,
                description: data.description || null,
                signerEmail: data.signerEmail,
                signerName: data.signerName,
                token,
                expiresAt,
                status: 'PENDING',
            },
        });
    }
    async send(id) {
        const req = await this.findOne(id);
        if (req.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already sent or completed');
        return this.prisma.eSignRequest.update({
            where: { id },
            data: { status: 'SENT', sentAt: new Date() },
        });
    }
    async sign(token, data) {
        const req = await this.prisma.eSignRequest.findUnique({ where: { token } });
        if (!req)
            throw new common_1.NotFoundException('Signing link not found');
        if (req.status === 'SIGNED')
            throw new common_1.BadRequestException('Document already signed');
        if (new Date() > req.expiresAt)
            throw new common_1.BadRequestException('Signing link expired');
        return this.prisma.eSignRequest.update({
            where: { id: req.id },
            data: { status: 'SIGNED', signedAt: new Date(), ipAddress: data.ipAddress, userAgent: data.userAgent },
        });
    }
    async decline(token, reason) {
        const req = await this.prisma.eSignRequest.findUnique({ where: { token } });
        if (!req)
            throw new common_1.NotFoundException('Signing link not found');
        if (req.status === 'SIGNED')
            throw new common_1.BadRequestException('Document already signed');
        return this.prisma.eSignRequest.update({
            where: { id: req.id },
            data: { status: 'DECLINED', declinedAt: new Date(), declineReason: reason },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.eSignRequest.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.eSignRequest.delete({ where: { id } });
    }
    async getStats(propertyId) {
        const where = propertyId ? { propertyId } : {};
        const [total, pending, sent, signed, declined] = await Promise.all([
            this.prisma.eSignRequest.count({ where }),
            this.prisma.eSignRequest.count({ where: { ...where, status: 'PENDING' } }),
            this.prisma.eSignRequest.count({ where: { ...where, status: { in: ['SENT', 'VIEWED'] } } }),
            this.prisma.eSignRequest.count({ where: { ...where, status: 'SIGNED' } }),
            this.prisma.eSignRequest.count({ where: { ...where, status: 'DECLINED' } }),
        ]);
        return { total, pending, sent, signed, declined };
    }
};
exports.EsignService = EsignService;
exports.EsignService = EsignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EsignService);
//# sourceMappingURL=esign.service.js.map