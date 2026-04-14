import { PrismaService } from '../../common/prisma/prisma.service';
export declare class UnitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
