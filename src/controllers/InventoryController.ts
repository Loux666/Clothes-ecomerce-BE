import { Request, Response } from 'express';
import * as inventoryService from '../services/InventoryService';

export const getInventoryLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const variantId = req.query.variantId as string | undefined;

        const result = await inventoryService.getInventoryLogs(page, limit, variantId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const manualRestock = async (req: Request, res: Response) => {
    try {
        const { variantId, quantity, note } = req.body;
        const result = await inventoryService.manualRestock(variantId, Number(quantity), note);
        res.status(200).json({ message: "Điều chỉnh kho thành công", data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
