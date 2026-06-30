import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as settingService from '../services/SettingService';

export const getHomepageSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingService.getSetting('homepage');
        res.status(200).json({ data: settings || {} });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSettingAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const settings = await settingService.getSetting(req.params.key);
        res.status(200).json({ data: settings || {} });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettingAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const setting = await settingService.updateSetting(req.params.key, req.body.value);
        res.status(200).json({ message: "Cập nhật cấu hình thành công", data: setting });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
