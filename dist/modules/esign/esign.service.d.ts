import { PrismaService } from '../../common/prisma/prisma.service';
export declare class EsignService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<any>;
    findByToken(token: string): Promise<any>;
    create(data: any): Promise<any>;
    send(id: string): Promise<any>;
    sign(token: string, data: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<any>;
    decline(token: string, reason: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
    getStats(propertyId?: string): Promise<{
        total: any;
        pending: any;
        sent: any;
        signed: any;
        declined: any;
    }>;
}
