"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HvacContractsModule = void 0;
const common_1 = require("@nestjs/common");
const hvac_contracts_controller_1 = require("./hvac-contracts.controller");
const hvac_contracts_service_1 = require("./hvac-contracts.service");
let HvacContractsModule = class HvacContractsModule {
};
exports.HvacContractsModule = HvacContractsModule;
exports.HvacContractsModule = HvacContractsModule = __decorate([
    (0, common_1.Module)({
        controllers: [hvac_contracts_controller_1.HvacContractsController],
        providers: [hvac_contracts_service_1.HvacContractsService],
        exports: [hvac_contracts_service_1.HvacContractsService],
    })
], HvacContractsModule);
//# sourceMappingURL=hvac-contracts.module.js.map