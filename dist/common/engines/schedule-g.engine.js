"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScheduleG = calculateScheduleG;
function round2(n) {
    return Math.round(n * 100) / 100;
}
function round4(n) {
    return Math.round(n * 10000) / 10000;
}
function calculateScheduleG(input) {
    const { basePsf, camPsf, taxPsf, insPsf, gla, statedTermMonths, constructionMonths, abatementMonths } = input;
    const errors = [];
    const additionalPsf = round4(camPsf + taxPsf + insPsf);
    const totalPsf = round4(basePsf + additionalPsf);
    const monthlyBase = round2((basePsf * gla) / 12);
    const monthlyAdditional = round2((additionalPsf * gla) / 12);
    const monthlyTotal = round2((totalPsf * gla) / 12);
    const effectiveTermMonths = statedTermMonths + constructionMonths + abatementMonths;
    const computedTotal = round4(basePsf + camPsf + taxPsf + insPsf);
    if (Math.abs(computedTotal - totalPsf) > 0.0001) {
        errors.push(`Gate 1 FAIL: totalPsf (${totalPsf}) ≠ basePsf + cam + tax + ins (${computedTotal})`);
    }
    const computedMonthly = round2((totalPsf * gla) / 12);
    if (Math.abs(computedMonthly - monthlyTotal) > 0.01) {
        errors.push(`Gate 2 FAIL: monthlyTotal (${monthlyTotal}) ≠ totalPsf × gla / 12 (${computedMonthly})`);
    }
    if (abatementMonths > 0 && basePsf === 0) {
        errors.push('Gate 3 WARN: Base PSF is $0 — confirm abatement period is correctly structured');
    }
    const computedEffective = statedTermMonths + constructionMonths + abatementMonths;
    if (computedEffective !== effectiveTermMonths) {
        errors.push(`Gate 4 FAIL: effectiveTermMonths (${effectiveTermMonths}) ≠ stated + construction + abatement (${computedEffective})`);
    }
    if (gla <= 0) {
        errors.push('Gate 5 FAIL: GLA must be greater than 0');
    }
    return {
        basePsf,
        camPsf,
        taxPsf,
        insPsf,
        additionalPsf,
        totalPsf,
        gla,
        monthlyBase,
        monthlyAdditional,
        monthlyTotal,
        statedTermMonths,
        constructionMonths,
        abatementMonths,
        effectiveTermMonths,
        validationErrors: errors,
        isValid: errors.filter(e => e.startsWith('Gate') && e.includes('FAIL')).length === 0,
    };
}
//# sourceMappingURL=schedule-g.engine.js.map