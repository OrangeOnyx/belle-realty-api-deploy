import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any): any;
    update(id: string, data: any): {
        id: string;
        data: any;
    };
    remove(id: string): {
        id: string;
    };
}
