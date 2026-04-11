"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignageModule = void 0;
const common_1 = require("@nestjs/common");
const signage_controller_1 = require("./signage.controller");
const signage_service_1 = require("./signage.service");
let SignageModule = class SignageModule {
};
exports.SignageModule = SignageModule;
exports.SignageModule = SignageModule = __decorate([
    (0, common_1.Module)({
        controllers: [signage_controller_1.SignageController],
        providers: [signage_service_1.SignageService],
        exports: [signage_service_1.SignageService],
    })
], SignageModule);
//# sourceMappingURL=signage.module.js.map