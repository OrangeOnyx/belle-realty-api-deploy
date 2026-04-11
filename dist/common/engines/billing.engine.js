"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLateFee = calculateLateFee;
exports.calculateHoldoverRent = calculateHoldoverRent;
exports.calculateHvacCostSplit = calculateHvacCostSplit;
exports.applyCamCap = applyCamCap;
exports.daysUntilExpiry = daysUntilExpiry;
exports.isInHoldover = isInHoldover;
const belle_realty_constants_1 = require("../constants/belle-realty.constants");
function round2(n) {
    return Math.round(n * 100) / 100;
}
function calculateLateFee(daysLate) {
    if (daysLate <= 0) {
        return { flatFee: 0, dailyFee: 0, daysLate: 0, daysPastGrace: 0, totalFee: 0 };
    }
    const daysPastGrace = Math.max(0, daysLate - belle_realty_constants_1.LATE_FEE_GRACE_DAYS);
    const flatFee = daysLate > 0 ? belle_realty_constants_1.LATE_FEE_FLAT : 0;
    const dailyFee = round2(daysPastGrace * belle_realty_constants_1.LATE_FEE_DAILY_RATE);
    const totalFee = round2(flatFee + dailyFee);
    return { flatFee, dailyFee, daysLate, daysPastGrace, totalFee };
}
function calculateHoldoverRent(originalMonthlyRent, leaseEndDate, asOfDate = new Date()) {
    const holdoverMonthlyRent = round2(originalMonthlyRent * belle_realty_constants_1.HOLDOVER_MULTIPLIER);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysInHoldover = Math.max(0, Math.floor((asOfDate.getTime() - leaseEndDate.getTime()) / msPerDay));
    const dailyRate = round2(holdoverMonthlyRent / 30.44);
    const accruedAmount = round2(dailyRate * daysInHoldover);
    return {
        originalMonthlyRent,
        holdoverMonthlyRent,
        multiplier: belle_realty_constants_1.HOLDOVER_MULTIPLIER,
        daysInHoldover,
        accruedAmount,
    };
}
function calculateHvacCostSplit(totalCost, isReplacement, tenantCapOverride, tenantPctOverride) {
    const tenantCap = tenantCapOverride ?? belle_realty_constants_1.HVAC_FIRST_CALL_TENANT_CAP;
    const tenantPct = tenantPctOverride ?? belle_realty_constants_1.HVAC_REPLACEMENT_TENANT_PCT;
    if (isReplacement) {
        const tenantShare = round2(totalCost * tenantPct);
        const landlordShare = round2(totalCost - tenantShare);
        return {
            totalCost,
            tenantShare,
            landlordShare,
            rule: `Tenant pays ${tenantPct * 100}% of replacement cost`,
            isFirstCall: false,
            isReplacement: true,
        };
    }
    else {
        const tenantShare = round2(Math.min(totalCost, tenantCap));
        const landlordShare = round2(Math.max(0, totalCost - tenantCap));
        return {
            totalCost,
            tenantShare,
            landlordShare,
            rule: `Tenant pays first $${tenantCap.toFixed(2)}, landlord pays remainder`,
            isFirstCall: true,
            isReplacement: false,
        };
    }
}
function applyCamCap(priorYearActual, currentYearBudget) {
    const capAmount = round2(priorYearActual * (1 + belle_realty_constants_1.CAM_ANNUAL_CAP_PCT));
    const cappedAmount = round2(Math.min(currentYearBudget, capAmount));
    return {
        priorYearActual,
        currentYearBudget,
        capAmount,
        cappedAmount,
        isCapped: currentYearBudget > capAmount,
    };
}
function daysUntilExpiry(leaseEndDate, asOfDate = new Date()) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((leaseEndDate.getTime() - asOfDate.getTime()) / msPerDay);
}
function isInHoldover(leaseEndDate, asOfDate = new Date()) {
    return asOfDate > leaseEndDate;
}
//# sourceMappingURL=billing.engine.js.map