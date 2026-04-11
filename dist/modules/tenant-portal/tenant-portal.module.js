"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPortalModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_portal_controller_1 = require("./tenant-portal.controller");
const tenant_portal_service_1 = require("./tenant-portal.service");
let TenantPortalModule = class TenantPortalModule {
};
exports.TenantPortalModule = TenantPortalModule;
exports.TenantPortalModule = TenantPortalModule = __decorate([
    (0, common_1.Module)({
        controllers: [tenant_portal_controller_1.TenantPortalController],
        providers: [tenant_portal_service_1.TenantPortalService],
        exports: [tenant_portal_service_1.TenantPortalService],
    })
], TenantPortalModule);
//# sourceMappingURL=tenant-portal.module.js.map