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
exports.CamController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const cam_service_1 = require("./cam.service");
let CamController = class CamController {
    constructor(camService) {
        this.camService = camService;
    }
    findAll(query) {
        return this.camService.findAll(query);
    }
    findOne(id) {
        return this.camService.findOne(id);
    }
    calculateProRata(leaseId) {
        return this.camService.calculateProRata(leaseId);
    }
    initiateYearEndTrueUp(body) {
        return this.camService.initiateYearEndTrueUp(body.propertyId, body.year);
    }
    generateTrueUpInvoice(id) {
        return this.camService.generateTrueUpInvoice(id);
    }
    update(id, data) {
        return this.camService.update(id, data);
    }
    remove(id) {
        return this.camService.remove(id);
    }
};
exports.CamController = CamController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('pro-rata/:leaseId'),
    __param(0, (0, common_1.Param)('leaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "calculateProRata", null);
__decorate([
    (0, common_1.Post)('true-up'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "initiateYearEndTrueUp", null);
__decorate([
    (0, common_1.Post)(':id/invoice'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "generateTrueUpInvoice", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CamController.prototype, "remove", null);
exports.CamController = CamController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cam'),
    __metadata("design:paramtypes", [cam_service_1.CamService])
], CamController);
//# sourceMappingURL=cam.controller.js.map