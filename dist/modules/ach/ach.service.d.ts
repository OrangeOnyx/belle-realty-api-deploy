import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): any;
    findOne(id: string): Promise<any>;
    create(data: any): any;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
    revoke(id: string): Promise<any>;
}
