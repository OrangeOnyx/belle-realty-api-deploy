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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const leases_service_1 = require("./leases.service");
let LeasesController = class LeasesController {
    constructor(leasesService) {
        this.leasesService = leasesService;
    }
    findAll(propertyId, status, unitId, tenantId) {
        return this.leasesService.findAll({ propertyId, status, unitId, tenantId });
    }
    getHoldover(propertyId) {
        return this.leasesService.getHoldoverLeases(propertyId);
    }
    findOne(id) {
        return this.leasesService.findOne(id);
    }
    create(body) {
        return this.leasesService.create(body);
    }
    update(id, body) {
        return this.leasesService.update(id, body);
    }
    validateScheduleG(body) {
        return this.leasesService.validateScheduleG(body);
    }
    renewalDefaults(id) {
        return this.leasesService.generateRenewalDefaults(id);
    }
};
exports.LeasesController = LeasesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List leases with filters' }),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('unitId')),
    __param(3, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('holdover'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all holdover and expired leases' }),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "getHoldover", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lease detail with Schedule G' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create lease — runs Schedule G validation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lease' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('validate-schedule-g'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate Schedule G without saving' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "validateScheduleG", null);
__decorate([
    (0, common_1.Get)(':id/renewal-defaults'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate renewal addendum defaults (RSF locked from unit)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeasesController.prototype, "renewalDefaults", null);
exports.LeasesController = LeasesController = __decorate([
    (0, swagger_1.ApiTags)('leases'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leases'),
    __metadata("design:paramtypes", [leases_service_1.LeasesService])
], LeasesController);
//# sourceMappingURL=leases.controller.js.map