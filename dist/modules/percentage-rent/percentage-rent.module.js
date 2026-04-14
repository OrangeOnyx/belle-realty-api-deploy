"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PercentageRentModule = void 0;
const common_1 = require("@nestjs/common");
const percentage_rent_controller_1 = require("./percentage-rent.controller");
const percentage_rent_service_1 = require("./percentage-rent.service");
let PercentageRentModule = class PercentageRentModule {
};
exports.PercentageRentModule = PercentageRentModule;
exports.PercentageRentModule = PercentageRentModule = __decorate([
    (0, common_1.Module)({
        controllers: [percentage_rent_controller_1.PercentageRentController],
        providers: [percentage_rent_service_1.PercentageRentService],
        exports: [percentage_rent_service_1.PercentageRentService],
    })
], PercentageRentModule);
//# sourceMappingURL=percentage-rent.module.js.map