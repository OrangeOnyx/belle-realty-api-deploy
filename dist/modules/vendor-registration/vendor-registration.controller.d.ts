import { VendorRegistrationService } from './vendor-registration.service';
export declare class VendorRegistrationController {
    private readonly vendorRegistrationService;
    constructor(vendorRegistrationService: VendorRegistrationService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
