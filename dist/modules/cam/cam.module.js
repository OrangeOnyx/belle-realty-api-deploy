"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamModule = void 0;
const common_1 = require("@nestjs/common");
const cam_controller_1 = require("./cam.controller");
const cam_service_1 = require("./cam.service");
let CamModule = class CamModule {
};
exports.CamModule = CamModule;
exports.CamModule = CamModule = __decorate([
    (0, common_1.Module)({
        controllers: [cam_controller_1.CamController],
        providers: [cam_service_1.CamService],
        exports: [cam_service_1.CamService],
    })
], CamModule);
//# sourceMappingURL=cam.module.js.map