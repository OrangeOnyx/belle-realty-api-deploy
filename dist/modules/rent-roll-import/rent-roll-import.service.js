"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentRollImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const ExcelJS = require("exceljs");
const stream_1 = require("stream");
const COLUMN_ALIASES = {
    'suite': 'suiteNumber',
    'suite #': 'suiteNumber',
    'suite number': 'suiteNumber',
    'unit': 'suiteNumber',
    'unit #': 'suiteNumber',
    'unit number': 'suiteNumber',
    'space': 'suiteNumber',
    'gla': 'gla',
    'sf': 'gla',
    'sqft': 'gla',
    'sq ft': 'gla',
    'square feet': 'gla',
    'rentable sf': 'gla',
    'rsf': 'gla',
    'nra': 'gla',
    'tenant': 'legalName',
    'tenant name': 'legalName',
    'legal name': 'legalName',
    'dba': 'tradeName',
    'trade name': 'tradeName',
    'email': 'email',
    'phone': 'phone',
    'contact': 'contactName',
    'contact name': 'contactName',
    'lease type': 'leaseType',
    'type': 'leaseType',
    'status': 'leaseStatus',
    'lease status': 'leaseStatus',
    'lease start': 'leaseStart',
    'commencement': 'leaseStart',
    'start date': 'leaseStart',
    'lease end': 'leaseEnd',
    'expiration': 'leaseEnd',
    'end date': 'leaseEnd',
    'expiration date': 'leaseEnd',
    'rent commence': 'rentCommenceDate',
    'rent commencement': 'rentCommenceDate',
    'rent start': 'rentCommenceDate',
    'base rent': 'basePsf',
    'base psf': 'basePsf',
    'base rent psf': 'basePsf',
    'base': 'basePsf',
    'cam': 'camPsf',
    'cam psf': 'camPsf',
    'nnn': 'camPsf',
    'tax': 'taxPsf',
    'tax psf': 'taxPsf',
    'taxes psf': 'taxPsf',
    'ins': 'insPsf',
    'ins psf': 'insPsf',
    'insurance psf': 'insPsf',
    'term': 'statedTermMonths',
    'term months': 'statedTermMonths',
    'stated term': 'statedTermMonths',
    'construction months': 'constructionMonths',
    'construction': 'constructionMonths',
    'abatement months': 'abatementMonths',
    'abatement': 'abatementMonths',
    'free rent': 'abatementMonths',
};
const LEASE_TYPE_MAP = {
    'nnn': 'NNN', 'triple net': 'NNN', 'triple-net': 'NNN',
    'nn': 'NN', 'double net': 'NN',
    'modified gross': 'MODIFIED_GROSS', 'mg': 'MODIFIED_GROSS',
    'full service': 'FULL_SERVICE', 'gross': 'FULL_SERVICE',
    'percentage only': 'PERCENTAGE_ONLY',
};
const LEASE_STATUS_MAP = {
    'active': 'ACTIVE', 'current': 'ACTIVE',
    'draft': 'DRAFT',
    'expired': 'EXPIRED',
    'holdover': 'HOLDOVER', 'month to month': 'HOLDOVER', 'mtm': 'HOLDOVER',
    'terminated': 'TERMINATED',
};
function parseDate(val) {
    if (!val)
        return null;
    if (val instanceof Date)
        return isNaN(val.getTime()) ? null : val;
    const s = String(val).trim();
    if (!s)
        return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}
function parseNum(val) {
    if (val === null || val === undefined || val === '')
        return null;
    const n = parseFloat(String(val).replace(/[$,\s]/g, ''));
    return isNaN(n) ? null : n;
}
function normalizeHeader(h) {
    return (h || '').toString().trim().toLowerCase();
}
let RentRollImportService = class RentRollImportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async parseFile(buffer, mimetype) {
        const rows = await this.extractRows(buffer, mimetype);
        return this.validateRows(rows);
    }
    async extractRows(buffer, mimetype) {
        const workbook = new ExcelJS.Workbook();
        if (mimetype === 'text/csv' || mimetype === 'application/csv') {
            const stream = stream_1.Readable.from(buffer.toString('utf-8'));
            await workbook.csv.read(stream);
        }
        else {
            await workbook.xlsx.load(buffer);
        }
        const worksheet = workbook.worksheets[0];
        if (!worksheet)
            throw new common_1.BadRequestException('No worksheet found in file');
        const rawRows = [];
        worksheet.eachRow((row) => {
            rawRows.push(row.values);
        });
        if (rawRows.length < 2)
            throw new common_1.BadRequestException('File must have at least a header row and one data row');
        const headerRow = rawRows[0].slice(1);
        const headers = headerRow.map(normalizeHeader);
        const fieldMap = {};
        headers.forEach((h, i) => {
            const field = COLUMN_ALIASES[h];
            if (field)
                fieldMap[i] = field;
        });
        const dataRows = rawRows.slice(1);
        return dataRows.map((row, idx) => {
            const values = row.slice(1);
            const obj = { _rowNum: idx + 2 };
            Object.entries(fieldMap).forEach(([colIdx, field]) => {
                obj[field] = values[Number(colIdx)];
            });
            return obj;
        });
    }
    validateRows(rawRows) {
        const rows = rawRows.map(r => {
            const errors = [];
            const warnings = [];
            if (!r.suiteNumber)
                errors.push('Suite number is required');
            if (!r.legalName)
                errors.push('Tenant legal name is required');
            if (!r.leaseStart)
                errors.push('Lease start date is required');
            if (!r.leaseEnd)
                errors.push('Lease end date is required');
            const gla = parseNum(r.gla);
            if (!gla || gla <= 0)
                errors.push('GLA/SF must be a positive number');
            const basePsf = parseNum(r.basePsf);
            if (basePsf === null)
                errors.push('Base PSF is required');
            const leaseStart = parseDate(r.leaseStart);
            const leaseEnd = parseDate(r.leaseEnd);
            if (r.leaseStart && !leaseStart)
                errors.push('Invalid lease start date');
            if (r.leaseEnd && !leaseEnd)
                errors.push('Invalid lease end date');
            if (leaseStart && leaseEnd && leaseEnd <= leaseStart)
                errors.push('Lease end must be after lease start');
            const leaseType = r.leaseType
                ? (LEASE_TYPE_MAP[normalizeHeader(r.leaseType)] || null)
                : 'NNN';
            if (r.leaseType && !leaseType)
                warnings.push(`Unknown lease type "${r.leaseType}" — will default to NNN`);
            const leaseStatus = r.leaseStatus
                ? (LEASE_STATUS_MAP[normalizeHeader(r.leaseStatus)] || null)
                : 'ACTIVE';
            if (r.leaseStatus && !leaseStatus)
                warnings.push(`Unknown status "${r.leaseStatus}" — will default to ACTIVE`);
            return {
                suiteNumber: String(r.suiteNumber || '').trim(),
                gla: gla || 0,
                legalName: String(r.legalName || '').trim(),
                tradeName: r.tradeName ? String(r.tradeName).trim() : undefined,
                email: r.email ? String(r.email).trim() : undefined,
                phone: r.phone ? String(r.phone).trim() : undefined,
                contactName: r.contactName ? String(r.contactName).trim() : undefined,
                leaseType: leaseType || 'NNN',
                leaseStatus: leaseStatus || 'ACTIVE',
                leaseStart: leaseStart ? leaseStart.toISOString() : '',
                leaseEnd: leaseEnd ? leaseEnd.toISOString() : '',
                rentCommenceDate: parseDate(r.rentCommenceDate)?.toISOString(),
                basePsf: basePsf || 0,
                camPsf: parseNum(r.camPsf) ?? 0,
                taxPsf: parseNum(r.taxPsf) ?? 0,
                insPsf: parseNum(r.insPsf) ?? 0,
                statedTermMonths: parseNum(r.statedTermMonths) ?? undefined,
                constructionMonths: parseNum(r.constructionMonths) ?? 0,
                abatementMonths: parseNum(r.abatementMonths) ?? 0,
                _rowNum: r._rowNum,
                _errors: errors,
                _warnings: warnings,
            };
        });
        const validRows = rows.filter(r => r._errors.length === 0).length;
        const errorRows = rows.filter(r => r._errors.length > 0).length;
        const columns = Object.values(COLUMN_ALIASES).filter((v, i, a) => a.indexOf(v) === i);
        return { rows, totalRows: rows.length, validRows, errorRows, columns };
    }
    async commitImport(propertyId, rows) {
        const validRows = rows.filter(r => !r._errors || r._errors.length === 0);
        const result = { imported: 0, skipped: 0, errors: [] };
        for (const row of validRows) {
            try {
                const unit = await this.prisma.unit.upsert({
                    where: { id: await this.findUnitId(propertyId, row.suiteNumber) || '__new__' },
                    create: {
                        propertyId,
                        suiteNumber: row.suiteNumber,
                        gla: row.gla,
                        isVacant: false,
                    },
                    update: {
                        gla: row.gla,
                        isVacant: false,
                    },
                });
                const tenant = await this.prisma.tenant.upsert({
                    where: { id: await this.findTenantId(propertyId, row.legalName) || '__new__' },
                    create: {
                        propertyId,
                        legalName: row.legalName,
                        tradeName: row.tradeName,
                        email: row.email,
                        phone: row.phone,
                        contactName: row.contactName,
                        isActive: true,
                    },
                    update: {
                        tradeName: row.tradeName || undefined,
                        email: row.email || undefined,
                        phone: row.phone || undefined,
                        contactName: row.contactName || undefined,
                    },
                });
                const gla = Number(unit.gla);
                const basePsf = row.basePsf;
                const camPsf = row.camPsf || 0;
                const taxPsf = row.taxPsf || 0;
                const insPsf = row.insPsf || 0;
                const additionalPsf = camPsf + taxPsf + insPsf;
                const totalPsf = basePsf + additionalPsf;
                const monthlyBase = Math.round((basePsf * gla / 12) * 100) / 100;
                const monthlyAdditional = Math.round((additionalPsf * gla / 12) * 100) / 100;
                const monthlyTotal = Math.round((totalPsf * gla / 12) * 100) / 100;
                const leaseStart = new Date(row.leaseStart);
                const leaseEnd = new Date(row.leaseEnd);
                const statedTermMonths = row.statedTermMonths ||
                    Math.round((leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                const constructionMonths = row.constructionMonths || 0;
                const abatementMonths = row.abatementMonths || 0;
                const effectiveTermMonths = statedTermMonths - constructionMonths - abatementMonths;
                const existingLease = await this.prisma.lease.findFirst({
                    where: { unitId: unit.id, status: { in: ['ACTIVE', 'HOLDOVER', 'DRAFT'] } },
                });
                const leaseData = {
                    propertyId,
                    unitId: unit.id,
                    tenantId: tenant.id,
                    leaseType: (row.leaseType || 'NNN'),
                    status: (row.leaseStatus || 'ACTIVE'),
                    leaseStart,
                    leaseEnd,
                    rentCommenceDate: row.rentCommenceDate ? new Date(row.rentCommenceDate) : leaseStart,
                    basePsf,
                    camPsf,
                    taxPsf,
                    insPsf,
                    additionalPsf,
                    totalPsf,
                    monthlyBase,
                    monthlyAdditional,
                    monthlyTotal,
                    statedTermMonths,
                    constructionMonths,
                    abatementMonths,
                    effectiveTermMonths,
                    holdoverRateMultiplier: 1.5,
                };
                if (existingLease) {
                    await this.prisma.lease.update({ where: { id: existingLease.id }, data: leaseData });
                }
                else {
                    await this.prisma.lease.create({ data: leaseData });
                }
                result.imported++;
            }
            catch (err) {
                result.errors.push({ row: row._rowNum || 0, message: err.message || 'Unknown error' });
                result.skipped++;
            }
        }
        result.skipped += rows.length - validRows.length;
        return result;
    }
    async findUnitId(propertyId, suiteNumber) {
        const unit = await this.prisma.unit.findFirst({ where: { propertyId, suiteNumber } });
        return unit?.id || null;
    }
    async findTenantId(propertyId, legalName) {
        const tenant = await this.prisma.tenant.findFirst({ where: { propertyId, legalName } });
        return tenant?.id || null;
    }
    async downloadTemplate() {
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Rent Roll');
        ws.columns = [
            { header: 'Suite Number', key: 'suiteNumber', width: 14 },
            { header: 'GLA (SF)', key: 'gla', width: 12 },
            { header: 'Legal Name', key: 'legalName', width: 28 },
            { header: 'Trade Name (DBA)', key: 'tradeName', width: 22 },
            { header: 'Email', key: 'email', width: 24 },
            { header: 'Phone', key: 'phone', width: 16 },
            { header: 'Contact Name', key: 'contactName', width: 20 },
            { header: 'Lease Type', key: 'leaseType', width: 14 },
            { header: 'Lease Status', key: 'leaseStatus', width: 14 },
            { header: 'Lease Start', key: 'leaseStart', width: 14 },
            { header: 'Lease End', key: 'leaseEnd', width: 14 },
            { header: 'Rent Commence Date', key: 'rentCommenceDate', width: 20 },
            { header: 'Base PSF', key: 'basePsf', width: 12 },
            { header: 'CAM PSF', key: 'camPsf', width: 12 },
            { header: 'Tax PSF', key: 'taxPsf', width: 12 },
            { header: 'Ins PSF', key: 'insPsf', width: 12 },
            { header: 'Stated Term (Months)', key: 'statedTermMonths', width: 22 },
            { header: 'Construction Months', key: 'constructionMonths', width: 22 },
            { header: 'Abatement Months', key: 'abatementMonths', width: 20 },
        ];
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getRow(1).height = 20;
        ws.addRow({
            suiteNumber: '101',
            gla: 1200,
            legalName: 'Example Tenant LLC',
            tradeName: 'The Example Shop',
            email: 'tenant@example.com',
            phone: '337-555-1234',
            contactName: 'Jane Smith',
            leaseType: 'NNN',
            leaseStatus: 'ACTIVE',
            leaseStart: '01/01/2024',
            leaseEnd: '12/31/2028',
            rentCommenceDate: '04/01/2024',
            basePsf: 18.00,
            camPsf: 4.50,
            taxPsf: 2.25,
            insPsf: 0.75,
            statedTermMonths: 60,
            constructionMonths: 2,
            abatementMonths: 1,
        });
        ws.addRow({});
        const notesRow = ws.addRow(['NOTES: Lease Type options: NNN, NN, MODIFIED_GROSS, FULL_SERVICE | Status options: ACTIVE, DRAFT, EXPIRED, HOLDOVER, TERMINATED']);
        notesRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' } };
        ws.mergeCells(`A${notesRow.number}:S${notesRow.number}`);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.RentRollImportService = RentRollImportService;
exports.RentRollImportService = RentRollImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RentRollImportService);
//# sourceMappingURL=rent-roll-import.service.js.map