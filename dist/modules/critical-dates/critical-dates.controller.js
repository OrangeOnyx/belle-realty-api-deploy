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
exports.CriticalDatesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const critical_dates_service_1 = require("./critical-dates.service");
let CriticalDatesController = class CriticalDatesController {
    constructor(service) {
        this.service = service;
    }
    getAll(propertyId, days) {
        return this.service.getUpcomingCriticalDates(propertyId, days ? Number(days) : 90);
    }
    getUpcoming(propertyId, days) {
        return this.service.getUpcomingCriticalDates(propertyId, days ? Number(days) : 90);
    }
    getClauseConflicts(propertyId) {
        return this.service.getClauseConflictReport(propertyId);
    }
    runManualScan(propertyId) {
        return this.service.runManualScan(propertyId);
    }
};
exports.CriticalDatesController = CriticalDatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CriticalDatesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CriticalDatesController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)('clause-conflicts/:propertyId'),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CriticalDatesController.prototype, "getClauseConflicts", null);
__decorate([
    (0, common_1.Post)('scan'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CriticalDatesController.prototype, "runManualScan", null);
exports.CriticalDatesController = CriticalDatesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('critical-dates'),
    __metadata("design:paramtypes", [critical_dates_service_1.CriticalDatesService])
], CriticalDatesController);
//# sourceMappingURL=critical-dates.controller.js.map