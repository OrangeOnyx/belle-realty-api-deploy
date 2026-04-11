export interface LateFeeResult {
    flatFee: number;
    dailyFee: number;
    daysLate: number;
    daysPastGrace: number;
    totalFee: number;
}
export interface HvacCostSplitResult {
    totalCost: number;
    tenantShare: number;
    landlordShare: number;
    rule: string;
    isFirstCall: boolean;
    isReplacement: boolean;
}
export interface HoldoverResult {
    originalMonthlyRent: number;
    holdoverMonthlyRent: number;
    multiplier: number;
    daysInHoldover: number;
    accruedAmount: number;
}
export interface CamCapResult {
    priorYearActual: number;
    currentYearBudget: number;
    capAmount: number;
    cappedAmount: number;
    isCapped: boolean;
}
export declare function calculateLateFee(daysLate: number): LateFeeResult;
export declare function calculateHoldoverRent(originalMonthlyRent: number, leaseEndDate: Date, asOfDate?: Date): HoldoverResult;
export declare function calculateHvacCostSplit(totalCost: number, isReplacement: boolean, tenantCapOverride?: number, tenantPctOverride?: number): HvacCostSplitResult;
export declare function applyCamCap(priorYearActual: number, currentYearBudget: number): CamCapResult;
export declare function daysUntilExpiry(leaseEndDate: Date, asOfDate?: Date): number;
export declare function isInHoldover(leaseEndDate: Date, asOfDate?: Date): boolean;
