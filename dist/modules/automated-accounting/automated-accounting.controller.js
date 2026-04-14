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
exports.AutomatedAccountingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const automated_accounting_service_1 = require("./automated-accounting.service");
let AutomatedAccountingController = class AutomatedAccountingController {
    constructor(service) {
        this.service = service;
    }
    runLateFees(propertyId) {
        return this.service.runManualLateFeeCheck(propertyId);
    }
    runEscalations(propertyId) {
        return this.service.runManualEscalationCheck(propertyId);
    }
    findAllExpenses(query) {
        return this.service.findAllExpenses(query);
    }
    createExpense(data) {
        return this.service.createExpense(data);
    }
    updateExpense(id, data) {
        return this.service.updateExpense(id, data);
    }
    removeExpense(id) {
        return this.service.removeExpense(id);
    }
    getExpenseSummary(propertyId, year) {
        return this.service.getExpenseSummary(propertyId, Number(year) || new Date().getFullYear());
    }
};
exports.AutomatedAccountingController = AutomatedAccountingController;
__decorate([
    (0, common_1.Post)('late-fees/run'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "runLateFees", null);
__decorate([
    (0, common_1.Post)('escalations/run'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "runEscalations", null);
__decorate([
    (0, common_1.Get)('expenses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "findAllExpenses", null);
__decorate([
    (0, common_1.Post)('expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Patch)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "updateExpense", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "removeExpense", null);
__decorate([
    (0, common_1.Get)('expenses/summary'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AutomatedAccountingController.prototype, "getExpenseSummary", null);
exports.AutomatedAccountingController = AutomatedAccountingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [automated_accounting_service_1.AutomatedAccountingService])
], AutomatedAccountingController);
//# sourceMappingURL=automated-accounting.controller.js.map