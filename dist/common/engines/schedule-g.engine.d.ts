export interface ScheduleGInput {
    basePsf: number;
    camPsf: number;
    taxPsf: number;
    insPsf: number;
    gla: number;
    statedTermMonths: number;
    constructionMonths: number;
    abatementMonths: number;
}
export interface ScheduleGResult {
    basePsf: number;
    camPsf: number;
    taxPsf: number;
    insPsf: number;
    additionalPsf: number;
    totalPsf: number;
    gla: number;
    monthlyBase: number;
    monthlyAdditional: number;
    monthlyTotal: number;
    statedTermMonths: number;
    constructionMonths: number;
    abatementMonths: number;
    effectiveTermMonths: number;
    validationErrors: string[];
    isValid: boolean;
}
export declare function calculateScheduleG(input: ScheduleGInput): ScheduleGResult;
