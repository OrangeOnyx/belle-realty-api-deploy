"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedAccountingModule = void 0;
const common_1 = require("@nestjs/common");
const automated_accounting_controller_1 = require("./automated-accounting.controller");
const automated_accounting_service_1 = require("./automated-accounting.service");
let AutomatedAccountingModule = class AutomatedAccountingModule {
};
exports.AutomatedAccountingModule = AutomatedAccountingModule;
exports.AutomatedAccountingModule = AutomatedAccountingModule = __decorate([
    (0, common_1.Module)({
        controllers: [automated_accounting_controller_1.AutomatedAccountingController],
        providers: [automated_accounting_service_1.AutomatedAccountingService],
        exports: [automated_accounting_service_1.AutomatedAccountingService],
    })
], AutomatedAccountingModule);
//# sourceMappingURL=automated-accounting.module.js.map