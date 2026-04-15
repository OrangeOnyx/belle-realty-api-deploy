import { PrismaService } from '../../common/prisma/prisma.service';
export interface RentRollRow {
    suiteNumber: string;
    gla: number;
    legalName: string;
    tradeName?: string;
    email?: string;
    phone?: string;
    contactName?: string;
    leaseType?: string;
    leaseStatus?: string;
    leaseStart: string;
    leaseEnd: string;
    rentCommenceDate?: string;
    basePsf: number;
    camPsf?: number;
    taxPsf?: number;
    insPsf?: number;
    statedTermMonths?: number;
    constructionMonths?: number;
    abatementMonths?: number;
    _rowNum?: number;
    _errors?: string[];
    _warnings?: string[];
}
export interface ImportPreview {
    rows: (RentRollRow & {
        _rowNum: number;
        _errors: string[];
        _warnings: string[];
    })[];
    totalRows: number;
    validRows: number;
    errorRows: number;
    columns: string[];
}
export interface ImportResult {
    imported: number;
    skipped: number;
    errors: {
        row: number;
        message: string;
    }[];
}
export declare class RentRollImportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    parseFile(buffer: Buffer<ArrayBufferLike>, mimetype: string): Promise<ImportPreview>;
    private extractRows;
    private validateRows;
    commitImport(propertyId: string, rows: RentRollRow[]): Promise<ImportResult>;
    private findUnitId;
    private findTenantId;
    downloadTemplate(): Promise<Buffer>;
}
