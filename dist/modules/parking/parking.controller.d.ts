import { ParkingService } from './parking.service';
export declare class ParkingController {
    private readonly parkingService;
    constructor(parkingService: ParkingService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
