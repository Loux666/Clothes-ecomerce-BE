import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as settingService from '../services/SettingService';

export const getHomepageSettings = async (req: Request, res: Response) => {
    const settings = await settingService.getSetting('homepage');
    res.status(200).json({ data: settings || {} });
};

export const getSettingAdmin = async (req: AuthRequest, res: Response) => {
    const settings = await settingService.getSetting(req.params.key as string);
    res.status(200).json({ data: settings || {} });
};

export const updateSettingAdmin = async (req: AuthRequest, res: Response) => {
    const setting = await settingService.updateSetting(req.params.key as string, req.body.value);
    res.status(200).json({ message: "Cập nhật cấu hình thành công", data: setting });
};
