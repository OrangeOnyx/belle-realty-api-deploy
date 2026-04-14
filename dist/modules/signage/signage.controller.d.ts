import { SignageService } from './signage.service';
export declare class SignageController {
    private readonly signageService;
    constructor(signageService: SignageService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
