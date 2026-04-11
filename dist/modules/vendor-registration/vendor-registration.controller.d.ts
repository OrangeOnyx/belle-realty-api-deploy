import { VendorRegistrationService } from './vendor-registration.service';
export declare class VendorRegistrationController {
    private readonly vendorRegistrationService;
    constructor(vendorRegistrationService: VendorRegistrationService);
    findAll(query: any): {
        message: string;
    };
    findOne(id: string): {
        message: string;
        id: string;
    };
    create(body: any): {
        message: string;
        data: any;
    };
    update(id: string, body: any): {
        message: string;
        id: string;
        data: any;
    };
    remove(id: string): {
        message: string;
        id: string;
    };
}
