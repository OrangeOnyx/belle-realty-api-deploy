import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: string): Promise<any>;
    create(data: any): any;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
