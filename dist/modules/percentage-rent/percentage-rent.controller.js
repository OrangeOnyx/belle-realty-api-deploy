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
exports.PercentageRentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const percentage_rent_service_1 = require("./percentage-rent.service");
let PercentageRentController = class PercentageRentController {
    constructor(service) {
        this.service = service;
    }
    findAll(query) {
        return this.service.findAllClauses(query);
    }
    findAllClauses(query) {
        return this.service.findAllClauses(query);
    }
    findOneClause(id) {
        return this.service.findOneClause(id);
    }
    createClause(data) {
        return this.service.createClause(data);
    }
    updateClause(id, data) {
        return this.service.updateClause(id, data);
    }
    removeClause(id) {
        return this.service.removeClause(id);
    }
    findAllSalesReports(query) {
        return this.service.findAllSalesReports(query);
    }
    submitSalesReport(data) {
        return this.service.submitSalesReport(data);
    }
    calculateDue(leaseId, periodStart, periodEnd) {
        return this.service.calculatePercentageRentDue(leaseId, periodStart, periodEnd);
    }
    generateInvoice(body) {
        return this.service.generatePercentageRentInvoice(body.leaseId, body.periodStart, body.periodEnd);
    }
};
exports.PercentageRentController = PercentageRentController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('clauses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "findAllClauses", null);
__decorate([
    (0, common_1.Get)('clauses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "findOneClause", null);
__decorate([
    (0, common_1.Post)('clauses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "createClause", null);
__decorate([
    (0, common_1.Patch)('clauses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "updateClause", null);
__decorate([
    (0, common_1.Delete)('clauses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "removeClause", null);
__decorate([
    (0, common_1.Get)('sales-reports'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "findAllSalesReports", null);
__decorate([
    (0, common_1.Post)('sales-reports'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "submitSalesReport", null);
__decorate([
    (0, common_1.Get)('calculate/:leaseId'),
    __param(0, (0, common_1.Param)('leaseId')),
    __param(1, (0, common_1.Query)('periodStart')),
    __param(2, (0, common_1.Query)('periodEnd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "calculateDue", null);
__decorate([
    (0, common_1.Post)('invoice'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PercentageRentController.prototype, "generateInvoice", null);
exports.PercentageRentController = PercentageRentController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('percentage-rent'),
    __metadata("design:paramtypes", [percentage_rent_service_1.PercentageRentService])
], PercentageRentController);
//# sourceMappingURL=percentage-rent.controller.js.map