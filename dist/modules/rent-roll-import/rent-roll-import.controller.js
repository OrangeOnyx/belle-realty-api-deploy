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
exports.RentRollImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const rent_roll_import_service_1 = require("./rent-roll-import.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let RentRollImportController = class RentRollImportController {
    constructor(service) {
        this.service = service;
    }
    async downloadTemplate(res) {
        const buffer = await this.service.downloadTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="belle-realty-rent-roll-template.xlsx"');
        res.send(buffer);
    }
    async preview(file) {
        if (!file)
            throw new Error('No file uploaded');
        return this.service.parseFile(file.buffer, file.mimetype);
    }
    async commit(propertyId, body) {
        if (!body?.rows?.length)
            throw new Error('No rows provided');
        return this.service.commitImport(propertyId, body.rows);
    }
};
exports.RentRollImportController = RentRollImportController;
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RentRollImportController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 10 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RentRollImportController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('commit/:propertyId'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RentRollImportController.prototype, "commit", null);
exports.RentRollImportController = RentRollImportController = __decorate([
    (0, swagger_1.ApiTags)('rent-roll-import'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('rent-roll-import'),
    __metadata("design:paramtypes", [rent_roll_import_service_1.RentRollImportService])
], RentRollImportController);
//# sourceMappingURL=rent-roll-import.controller.js.map