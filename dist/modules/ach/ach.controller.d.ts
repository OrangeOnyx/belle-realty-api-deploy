import { AchService } from './ach.service';
export declare class AchController {
    private readonly achService;
    constructor(achService: AchService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    revoke(id: string): Promise<any>;
    remove(id: string): Promise<any>;
}
