import { PrismaService } from '../../common/prisma/prisma.service';
export declare class MaintenanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): {
        message: string;
    };
    findOne(id: string): {
        message: string;
        id: string;
    };
    create(data: any): {
        message: string;
        data: any;
    };
    update(id: string, data: any): {
        message: string;
        id: string;
        data: any;
    };
    remove(id: string): {
        message: string;
        id: string;
    };
}
