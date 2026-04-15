"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const properties_module_1 = require("./modules/properties/properties.module");
const units_module_1 = require("./modules/units/units.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const leases_module_1 = require("./modules/leases/leases.module");
const leads_module_1 = require("./modules/leads/leads.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const compliance_module_1 = require("./modules/compliance/compliance.module");
const reminders_module_1 = require("./modules/reminders/reminders.module");
const notices_module_1 = require("./modules/notices/notices.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const financials_module_1 = require("./modules/financials/financials.module");
const audit_module_1 = require("./modules/audit/audit.module");
const settings_module_1 = require("./modules/settings/settings.module");
const parking_module_1 = require("./modules/parking/parking.module");
const tenant_portal_module_1 = require("./modules/tenant-portal/tenant-portal.module");
const vendor_registration_module_1 = require("./modules/vendor-registration/vendor-registration.module");
const site_plan_module_1 = require("./modules/site-plan/site-plan.module");
const signage_module_1 = require("./modules/signage/signage.module");
const ach_module_1 = require("./modules/ach/ach.module");
const hvac_contracts_module_1 = require("./modules/hvac-contracts/hvac-contracts.module");
const reports_module_1 = require("./modules/reports/reports.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const workflows_module_1 = require("./modules/workflows/workflows.module");
const email_module_1 = require("./modules/email/email.module");
const esign_module_1 = require("./modules/esign/esign.module");
const cam_module_1 = require("./modules/cam/cam.module");
const percentage_rent_module_1 = require("./modules/percentage-rent/percentage-rent.module");
const critical_dates_module_1 = require("./modules/critical-dates/critical-dates.module");
const automated_accounting_module_1 = require("./modules/automated-accounting/automated-accounting.module");
const rent_roll_import_module_1 = require("./modules/rent-roll-import/rent-roll-import.module");
const health_controller_1 = require("./common/health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            properties_module_1.PropertiesModule,
            units_module_1.UnitsModule,
            tenants_module_1.TenantsModule,
            leases_module_1.LeasesModule,
            leads_module_1.LeadsModule,
            maintenance_module_1.MaintenanceModule,
            compliance_module_1.ComplianceModule,
            reminders_module_1.RemindersModule,
            notices_module_1.NoticesModule,
            dashboard_module_1.DashboardModule,
            financials_module_1.FinancialsModule,
            audit_module_1.AuditModule,
            settings_module_1.SettingsModule,
            parking_module_1.ParkingModule,
            tenant_portal_module_1.TenantPortalModule,
            vendor_registration_module_1.VendorRegistrationModule,
            site_plan_module_1.SitePlanModule,
            signage_module_1.SignageModule,
            ach_module_1.AchModule,
            hvac_contracts_module_1.HvacContractsModule,
            reports_module_1.ReportsModule,
            tasks_module_1.TasksModule,
            workflows_module_1.WorkflowsModule,
            email_module_1.EmailModule,
            esign_module_1.ESignModule,
            cam_module_1.CamModule,
            percentage_rent_module_1.PercentageRentModule,
            critical_dates_module_1.CriticalDatesModule,
            automated_accounting_module_1.AutomatedAccountingModule,
            rent_roll_import_module_1.RentRollImportModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map