import { Response } from 'express';
import { RentRollImportService, RentRollRow } from './rent-roll-import.service';
export declare class RentRollImportController {
    private readonly service;
    constructor(service: RentRollImportService);
    downloadTemplate(res: Response): Promise<void>;
    preview(file: Express.Multer.File): Promise<import("./rent-roll-import.service").ImportPreview>;
    commit(propertyId: string, body: {
        rows: RentRollRow[];
    }): Promise<import("./rent-roll-import.service").ImportResult>;
}
