import { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any, res: Response): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    refresh(req: any, res: Response): Promise<Response<any, Record<string, any>> | {
        accessToken: string;
    }>;
    logout(user: any, res: Response): Promise<{
        message: string;
    }>;
    me(user: any): any;
    changePassword(user: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
