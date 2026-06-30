import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as addressService from '../services/AddressService';

export const getMyAddresses = async (req: AuthRequest, res: Response) => {
    try {
        const addresses = await addressService.getMyAddresses(req.user!.id);
        res.status(200).json({ data: addresses });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
    try {
        const address = await addressService.createAddress(req.user!.id, req.body);
        res.status(201).json({ message: "Thêm địa chỉ thành công", data: address });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
    try {
        const address = await addressService.updateAddress(req.params.id, req.user!.id, req.body);
        res.status(200).json({ message: "Cập nhật địa chỉ thành công", data: address });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    try {
        await addressService.deleteAddress(req.params.id, req.user!.id);
        res.status(200).json({ message: "Xóa địa chỉ thành công" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
