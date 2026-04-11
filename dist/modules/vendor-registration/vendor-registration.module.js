"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRegistrationModule = void 0;
const common_1 = require("@nestjs/common");
const vendor_registration_controller_1 = require("./vendor-registration.controller");
const vendor_registration_service_1 = require("./vendor-registration.service");
let VendorRegistrationModule = class VendorRegistrationModule {
};
exports.VendorRegistrationModule = VendorRegistrationModule;
exports.VendorRegistrationModule = VendorRegistrationModule = __decorate([
    (0, common_1.Module)({
        controllers: [vendor_registration_controller_1.VendorRegistrationController],
        providers: [vendor_registration_service_1.VendorRegistrationService],
        exports: [vendor_registration_service_1.VendorRegistrationService],
    })
], VendorRegistrationModule);
//# sourceMappingURL=vendor-registration.module.js.map